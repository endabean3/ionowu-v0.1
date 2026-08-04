import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
  cleanupLeadByRequestId,
  cleanupRateLimitKey,
  emailRateLimitKey,
  testSql,
} from "./helpers/db";

/* ============================================================
   Bug 15 (document/08-laporan-bug.md): jalur "berhasil" formulir
   kontak, rate limit, jebakan robot, dan retry outbox belum pernah
   diuji — playwright.config.ts UTAMA sengaja mengosongkan
   DATABASE_URL/RESEND_API_KEY/CRON_SECRET, jadi 46 tes lama hanya
   pernah membuktikan jalur "pipeline belum dikonfigurasi".

   Tes di sini jalan lewat playwright.pipeline.config.ts, terhadap
   database Neon dan kunci Resend SUNGGUHAN. Setiap request_id/email
   yang dibuat tes didaftarkan lewat trackLead()/trackRateLimitEmail()
   dan dibersihkan di afterEach TANPA SYARAT — supaya tes yang gagal
   atau timeout di tengah jalan tidak meninggalkan data palsu
   menumpuk di database (ini pernah terjadi persis begitu saat
   menyusun tes ini: satu percobaan gagal karena timeout terlalu
   ketat, dan 5 lead ujinya baru ketahuan tertinggal lewat pemeriksaan
   manual, bukan lewat tes itu sendiri).
   ============================================================ */

const ORIGIN = process.env.QA_PIPELINE_BASE_URL ?? "http://127.0.0.1:3003";

function payload(overrides: Record<string, unknown> = {}) {
  return {
    request_id: randomUUID(),
    nama: "QA Pipeline Test",
    email: `qa-pipeline-${randomUUID()}@ionowu.com`,
    perusahaan: "Ionowu QA",
    kebutuhan: "aplikasi-web-khusus",
    pesan: "Pesan uji otomatis dari tests-pipeline, aman dihapus.",
    anggaran: "",
    locale: "id",
    situs: "",
    ...overrides,
  };
}

let trackedRequestIds: string[] = [];
let trackedRateLimitEmails: string[] = [];

function trackLead(requestId: string): void {
  trackedRequestIds.push(requestId);
}

function trackRateLimitEmail(email: string): void {
  trackedRateLimitEmails.push(email);
}

test.afterEach(async () => {
  for (const id of trackedRequestIds) {
    await cleanupLeadByRequestId(id);
  }
  for (const email of trackedRateLimitEmails) {
    await cleanupRateLimitKey(emailRateLimitKey(email));
  }
  trackedRequestIds = [];
  trackedRateLimitEmails = [];
});

test.afterAll(async () => {
  await testSql.end();
});

test.describe("contact pipeline (database + Resend + cron secret sungguhan)", () => {
  test("kiriman valid menyimpan lead walau Resend sandbox menolak pengiriman", async ({
    request,
  }) => {
    const body = payload();
    trackLead(body.request_id);

    const res = await request.post("/api/kontak", {
      headers: { origin: ORIGIN },
      data: body,
    });
    expect(res.status()).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true });

    const leads = await testSql<
      { name: string; email: string; service_type: string; status: string }[]
    >`SELECT name, email, service_type, status FROM leads WHERE request_id = ${body.request_id}`;
    expect(leads).toHaveLength(1);
    expect(leads[0].name).toBe(body.nama);
    expect(leads[0].email).toBe(body.email);
    expect(leads[0].status).toBe("new");

    const outbox = await testSql<
      { status: string; last_error_code: string | null }[]
    >`SELECT status, last_error_code FROM outbox_events WHERE payload->>'request_id' = ${body.request_id}`;
    expect(outbox).toHaveLength(1);
    // 'failed' berarti benar-benar rusak (5x percobaan habis). 'sent'/'retry_wait'
    // keduanya bukti sistem bekerja — beda cuma apakah Resend sudah menerima.
    expect(["sent", "retry_wait"]).toContain(outbox[0].status);
  });

  test("request_id yang sama dikirim dua kali tidak membuat lead ganda", async ({
    request,
  }) => {
    const body = payload();
    trackLead(body.request_id);

    const first = await request.post("/api/kontak", {
      headers: { origin: ORIGIN },
      data: body,
    });
    expect(first.status()).toBe(200);

    const second = await request.post("/api/kontak", {
      headers: { origin: ORIGIN },
      data: body,
    });
    expect(second.status()).toBe(200);

    const leads = await testSql<{ id: string }[]>`
      SELECT id FROM leads WHERE request_id = ${body.request_id}
    `;
    expect(leads).toHaveLength(1);
  });

  test("jebakan robot membalas seolah berhasil tanpa membuat lead", async ({
    request,
  }) => {
    const body = payload({ situs: "http://spam.example" });
    trackLead(body.request_id);

    const res = await request.post("/api/kontak", {
      headers: { origin: ORIGIN },
      data: body,
    });
    expect(res.status()).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true });

    const leads = await testSql<{ id: string }[]>`
      SELECT id FROM leads WHERE request_id = ${body.request_id}
    `;
    expect(leads).toHaveLength(0);
  });

  test("batas kiriman per-email mengunci setelah 5 kali dalam sejam", async ({
    request,
  }) => {
    // 5 kiriman berurutan, masing-masing menunggu percobaan pengiriman
    // Resend (rejection sandbox tetap butuh round-trip network) sebelum
    // membalas — timeout default 30 detik tidak cukup untuk semuanya.
    test.setTimeout(120_000);
    const email = `qa-ratelimit-${randomUUID()}@ionowu.com`;
    trackRateLimitEmail(email);

    for (let i = 0; i < 5; i += 1) {
      const body = payload({ email });
      trackLead(body.request_id);
      const res = await request.post("/api/kontak", {
        headers: { origin: ORIGIN },
        data: body,
      });
      expect(res.status(), `kiriman ke-${i + 1} dari 5 harus berhasil`).toBe(200);
    }

    const sixthBody = payload({ email });
    const sixth = await request.post("/api/kontak", {
      headers: { origin: ORIGIN },
      data: sixthBody,
    });
    expect(sixth.status()).toBe(429);
    expect(sixth.headers()["retry-after"]).toBeTruthy();
    await expect(sixth.json()).resolves.toMatchObject({ ok: false });
  });

  test("endpoint cron outbox menolak permintaan tanpa CRON_SECRET yang benar", async ({
    request,
  }) => {
    const res = await request.post("/api/cron/outbox", {
      headers: { origin: ORIGIN },
    });
    expect(res.status()).toBe(401);
  });

  test("endpoint cron outbox menerima CRON_SECRET yang benar dan membalas ringkasan", async ({
    request,
  }) => {
    const secret = process.env.CRON_SECRET;
    expect(secret, "CRON_SECRET harus terisi di .env.local").toBeTruthy();

    const res = await request.post("/api/cron/outbox", {
      headers: { origin: ORIGIN, authorization: `Bearer ${secret}` },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(typeof json.claimed).toBe("number");
  });
});
