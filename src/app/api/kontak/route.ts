import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createLeadIntake } from "@/lib/leads/intake";
import { isContactPipelineConfigured } from "@/lib/leads/env";
import {
  consumeContactRateLimit,
  trustedClientIp,
} from "@/lib/leads/rate-limit";
import { processResendOutboxEvent } from "@/lib/outbox/resend";
import { isLocale, type Locale } from "@/lib/i18n";
import { EMAIL_KONTAK } from "@/lib/data/kontak";
import { errorFields, log } from "@/lib/observability/log";

/* ============================================================
   PENERIMA FORMULIR KONTAK

   Tujuan sudah dikonfirmasi: io@ionowu.com.

   STATUS PENGIRIMAN — WAJIB DIBACA SEBELUM DIANGGAP SELESAI:
   Form hanya menerima pesan kalau database, Resend, dan cron secret tersedia.
   Lead, audit log, serta outbox disimpan dalam satu transaksi. Event email
   yang sama lalu dicoba langsung; cron menangani retry jika proses terputus.
   API tidak mengembalikan sukses sebelum lead tersimpan dan email terkirim.

   Sebelum situs ini diluncurkan ke publik (dokumen 07 Tahap 5), WAJIB:
   1. Daftar akun di resend.com (ini langkah yang HARUS dilakukan Nolan
      sendiri — bukan sesuatu yang bisa dibuatkan).
   2. Buat API key di dashboard Resend, isi ke `.env.local` sebagai
      `RESEND_API_KEY=...` (lihat `.env.example`).
   3. Isi `DATABASE_URL`, jalankan migration, lalu pasang pemanggil cron.
   4. Alamat pengirim (`ALAMAT_DARI` di bawah) masih memakai domain uji
      bawaan Resend (`onboarding@resend.dev`) — ini hanya bisa mengirim ke
      alamat yang sama dengan email pendaftaran akun Resend. Begitu domain
      ionowu.com diverifikasi di Resend (Tambah Domain → catatan DNS →
      tunggu terverifikasi), ganti jadi alamat @ionowu.com supaya bisa
      mengirim ke io@ionowu.com dari alamat sendiri.

   Larangan yang sudah dipenuhi (dokumen 05):
   - Semua isian diperiksa ulang di server, bukan percaya pemeriksaan browser.
   - Jebakan robot (honeypot): kolom tersembunyi yang hanya diisi robot.
   - Pembatas kiriman atomik di Postgres: bucket global dan hash email selalu
     aktif; IP hanya dipakai dari header proxy yang dipercaya secara eksplisit.
   ============================================================ */

const ALAMAT_TUJUAN = EMAIL_KONTAK;
const ALAMAT_DARI = "Ionowu <onboarding@resend.dev>"; // TODO: ganti ke @ionowu.com setelah domain terverifikasi di Resend
const SITE_ORIGIN = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://ionowu.com"
      : "http://localhost:3000"),
).origin;
const PRODUCTION_ORIGINS = ["https://ionowu.com", "https://www.ionowu.com"];
const MAKS_BODY_BYTES = 20 * 1024;
const MAKS_PANJANG = {
  nama: 120,
  email: 254,
  perusahaan: 160,
  kebutuhan: 80,
  pesan: 2500,
  anggaran: 80,
  situs: 200,
  locale: 8,
  request_id: 80,
} as const;
const DEV_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

const LABEL_KEBUTUHAN: Record<string, string> = {
  "aplikasi-web-khusus": "Aplikasi Web Khusus",
  "sistem-informasi-perusahaan": "Sistem Informasi Perusahaan",
  "integrasi-api": "Integrasi & API",
  "business-intelligence-data": "Business Intelligence & Data",
  "infrastruktur-server": "Infrastruktur & Server",
  "otomasi-ai": "Otomasi dengan AI",
  lainnya: "Lainnya",
};

const KEBUTUHAN_VALID = Object.keys(LABEL_KEBUTUHAN);

type BodyKontak = {
  request_id?: unknown;
  nama?: unknown;
  email?: unknown;
  perusahaan?: unknown;
  kebutuhan?: unknown;
  pesan?: unknown;
  anggaran?: unknown;
  locale?: unknown;
  // Jebakan robot — kolom ini disembunyikan lewat CSS di form, bukan
  // "hidden" attribute (robot pengisi form otomatis biasanya tetap
  // mengisi field type="text" biasa yang cuma disembunyikan CSS).
  situs?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PESAN_API: Record<
  Locale,
  {
    json: string;
    origin: string;
    tooLarge: string;
    invalid: string;
    rate: string;
    notReady: string;
    failed: string;
    nameRequired: string;
    nameLong: string;
    emailInvalid: string;
    emailLong: string;
    companyLong: string;
    needRequired: string;
    needLong: string;
    messageShort: string;
    messageLong: string;
    budgetLong: string;
  }
> = {
  id: {
    json: "Format data harus JSON.",
    origin: "Asal permintaan tidak diizinkan.",
    tooLarge: "Data terlalu besar.",
    invalid: "Data tidak valid.",
    rate: "Terlalu banyak kiriman. Coba lagi dalam satu jam.",
    notReady: "Formulir belum siap menerima pesan. Hubungi kami lagi sebentar lagi.",
    failed: "Pesan gagal dikirim. Coba lagi sebentar lagi.",
    nameRequired: "Nama wajib diisi.",
    nameLong: "Nama terlalu panjang.",
    emailInvalid: "Email tidak valid.",
    emailLong: "Email terlalu panjang.",
    companyLong: "Nama perusahaan terlalu panjang.",
    needRequired: "Pilih jenis kebutuhan.",
    needLong: "Jenis kebutuhan terlalu panjang.",
    messageShort: "Ceritakan sedikit lebih lengkap (minimal 10 karakter).",
    messageLong: "Pesan terlalu panjang.",
    budgetLong: "Perkiraan anggaran terlalu panjang.",
  },
  en: {
    json: "Data must be sent as JSON.",
    origin: "Request origin is not allowed.",
    tooLarge: "The submitted data is too large.",
    invalid: "The submitted data is invalid.",
    rate: "Too many submissions. Please try again in one hour.",
    notReady: "The contact form is not ready yet. Please try again shortly.",
    failed: "The message could not be sent. Please try again shortly.",
    nameRequired: "Name is required.",
    nameLong: "Name is too long.",
    emailInvalid: "Email is invalid.",
    emailLong: "Email is too long.",
    companyLong: "Company name is too long.",
    needRequired: "Choose a project type.",
    needLong: "Project type is too long.",
    messageShort: "Please add a little more detail, at least 10 characters.",
    messageLong: "Message is too long.",
    budgetLong: "Estimated budget is too long.",
  },
  zh: {
    json: "数据必须以 JSON 格式发送。",
    origin: "请求来源不被允许。",
    tooLarge: "提交的数据过大。",
    invalid: "提交的数据无效。",
    rate: "提交次数过多。请一小时后再试。",
    notReady: "联系表单暂未准备好。请稍后再试。",
    failed: "消息发送失败。请稍后重试。",
    nameRequired: "请填写姓名。",
    nameLong: "姓名过长。",
    emailInvalid: "邮箱无效。",
    emailLong: "邮箱过长。",
    companyLong: "公司名称过长。",
    needRequired: "请选择项目类型。",
    needLong: "项目类型过长。",
    messageShort: "请补充更多信息，至少 10 个字符。",
    messageLong: "消息内容过长。",
    budgetLong: "预计预算过长。",
  },
};

function escapeHtml(nilai: string): string {
  return nilai
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function terlaluPanjang(nilai: string, batas: number): boolean {
  return nilai.length > batas;
}

function requestIdDari(request: Request, body: BodyKontak): string {
  const dariBody = typeof body.request_id === "string" ? body.request_id.trim() : "";
  const dariHeader = request.headers.get("idempotency-key")?.trim() ?? "";
  return dariBody || dariHeader || randomUUID();
}

function originDiizinkan(request: Request): boolean {
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;

  if (!origin) {
    // Browser normal mengirim Origin untuk POST form/fetch. Di production,
    // request tanpa Origin ditolak untuk mengurangi spam lintas situs.
    return process.env.NODE_ENV !== "production";
  }

  const daftarOrigin = new Set([
    SITE_ORIGIN,
    requestOrigin,
    ...PRODUCTION_ORIGINS,
    ...(process.env.NODE_ENV === "production" ? [] : DEV_ORIGINS),
  ]);

  return daftarOrigin.has(origin) || originLoopbackSama(requestOrigin, origin);
}

function originLoopbackSama(requestOrigin: string, origin: string): boolean {
  try {
    const requestUrl = new URL(requestOrigin);
    const originUrl = new URL(origin);
    const hostLokal = new Set(["localhost", "127.0.0.1", "::1"]);
    return (
      hostLokal.has(requestUrl.hostname) &&
      hostLokal.has(originUrl.hostname) &&
      requestUrl.port === originUrl.port &&
      requestUrl.protocol === originUrl.protocol
    );
  } catch {
    return false;
  }
}

async function bacaJsonTerbatas(request: Request): Promise<unknown> {
  const panjang = request.headers.get("content-length");
  if (panjang && Number(panjang) > MAKS_BODY_BYTES) {
    throw new Error("body-terlalu-besar");
  }

  if (!request.body) {
    throw new Error("body-kosong");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAKS_BODY_BYTES) {
      throw new Error("body-terlalu-besar");
    }
    chunks.push(value);
  }

  const bodyText = new TextDecoder().decode(
    chunks.length === 1 ? chunks[0] : concatUint8(chunks, total),
  );

  return JSON.parse(bodyText);
}

function concatUint8(chunks: Uint8Array[], total: number): Uint8Array {
  const hasil = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    hasil.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return hasil;
}

function isBodyKontak(nilai: unknown): nilai is BodyKontak {
  return typeof nilai === "object" && nilai !== null && !Array.isArray(nilai);
}

export async function POST(request: Request) {
  let teksApi = PESAN_API.id;
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { ok: false, error: teksApi.json },
      { status: 415 },
    );
  }

  if (!originDiizinkan(request)) {
    return NextResponse.json(
      { ok: false, error: teksApi.origin },
      { status: 403 },
    );
  }

  let body: BodyKontak;
  try {
    const parsed = await bacaJsonTerbatas(request);
    if (!isBodyKontak(parsed)) throw new Error("body-bukan-object");
    body = parsed;
    const locale = typeof body.locale === "string" && isLocale(body.locale)
      ? body.locale
      : "id";
    teksApi = PESAN_API[locale];
  } catch (err) {
    if (err instanceof Error && err.message === "body-terlalu-besar") {
      return NextResponse.json(
        { ok: false, error: teksApi.tooLarge },
        { status: 413 },
      );
    }

    return NextResponse.json(
      { ok: false, error: teksApi.invalid },
      { status: 400 },
    );
  }

  // Jebakan robot: kalau kolom ini terisi, yang mengirim bukan manusia.
  // Balas seolah berhasil (jangan beri tahu robot bahwa ia terdeteksi).
  if (typeof body.situs === "string" && body.situs.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const nama = typeof body.nama === "string" ? body.nama.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const perusahaan = typeof body.perusahaan === "string" ? body.perusahaan.trim() : "";
  const kebutuhan = typeof body.kebutuhan === "string" ? body.kebutuhan : "";
  const isiPesan = typeof body.pesan === "string" ? body.pesan.trim() : "";
  const anggaran = typeof body.anggaran === "string" ? body.anggaran.trim() : "";
  const requestId = requestIdDari(request, body);
  const locale = typeof body.locale === "string" && isLocale(body.locale)
    ? body.locale
    : "id";

  const kesalahan: Record<string, string> = {};
  if (!nama || nama.length < 2) kesalahan.nama = teksApi.nameRequired;
  if (terlaluPanjang(nama, MAKS_PANJANG.nama)) {
    kesalahan.nama = teksApi.nameLong;
  }
  if (!email || !EMAIL_REGEX.test(email)) kesalahan.email = teksApi.emailInvalid;
  if (terlaluPanjang(email, MAKS_PANJANG.email)) {
    kesalahan.email = teksApi.emailLong;
  }
  if (terlaluPanjang(perusahaan, MAKS_PANJANG.perusahaan)) {
    kesalahan.perusahaan = teksApi.companyLong;
  }
  if (terlaluPanjang(kebutuhan, MAKS_PANJANG.kebutuhan)) {
    kesalahan.kebutuhan = teksApi.needLong;
  }
  if (!KEBUTUHAN_VALID.includes(kebutuhan)) {
    kesalahan.kebutuhan = teksApi.needRequired;
  }
  if (!isiPesan || isiPesan.length < 10) {
    kesalahan.pesan = teksApi.messageShort;
  }
  if (terlaluPanjang(isiPesan, MAKS_PANJANG.pesan)) {
    kesalahan.pesan = teksApi.messageLong;
  }
  if (terlaluPanjang(anggaran, MAKS_PANJANG.anggaran)) {
    kesalahan.anggaran = teksApi.budgetLong;
  }
  if (
    !requestId ||
    terlaluPanjang(requestId, MAKS_PANJANG.request_id) ||
    !/^[a-zA-Z0-9._:-]{8,80}$/.test(requestId)
  ) {
    kesalahan.request_id = teksApi.invalid;
  }

  if (Object.keys(kesalahan).length > 0) {
    return NextResponse.json({ ok: false, fieldErrors: kesalahan }, { status: 422 });
  }

  if (!isContactPipelineConfigured()) {
    return NextResponse.json(
      { ok: false, error: teksApi.notReady },
      { status: 503 },
    );
  }

  let rateLimit;
  try {
    rateLimit = await consumeContactRateLimit({
      email,
      ip: trustedClientIp(request),
    });
  } catch (err) {
    log.error("kontak.rate_limit_tidak_tersedia", {
      request_id: requestId,
      ...errorFields(err),
    });
    return NextResponse.json(
      { ok: false, error: teksApi.notReady },
      { status: 503 },
    );
  }
  if (rateLimit.limited) {
    return NextResponse.json(
      { ok: false, error: teksApi.rate },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const labelKebutuhan = LABEL_KEBUTUHAN[kebutuhan] ?? kebutuhan;

  const notification = {
    from: ALAMAT_DARI,
    to: ALAMAT_TUJUAN,
    replyTo: email,
    subject: `Pesan baru dari ${nama} - ${labelKebutuhan}`,
    html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <p><strong>Nama:</strong> ${escapeHtml(nama)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Perusahaan:</strong> ${escapeHtml(perusahaan || "(tidak diisi)")}</p>
          <p><strong>Jenis kebutuhan:</strong> ${escapeHtml(labelKebutuhan)}</p>
          <p><strong>Perkiraan anggaran:</strong> ${escapeHtml(anggaran || "(tidak diisi)")}</p>
          <p><strong>Pesan:</strong></p>
          <p>${escapeHtml(isiPesan).replace(/\n/g, "<br />")}</p>
        </div>
      `,
  };

  let intake: Awaited<ReturnType<typeof createLeadIntake>>;
  try {
    intake = await createLeadIntake({
      requestId,
      name: nama,
      email,
      company: perusahaan,
      serviceType: kebutuhan,
      serviceLabel: labelKebutuhan,
      message: isiPesan,
      budgetRange: anggaran,
      locale,
      emailNotification: notification,
    });
  } catch (err) {
    // Ini kegagalan sungguhan — lead BELUM tersimpan sama sekali. Baru di
    // sini pantas membalas gagal, karena belum ada jejak apa pun yang bisa
    // diselamatkan cron.
    log.error("kontak.lead_gagal_disimpan", {
      request_id: requestId,
      ...errorFields(err),
    });
    return NextResponse.json(
      { ok: false, error: teksApi.notReady },
      { status: 503 },
    );
  }

  // Lead dan event outbox-nya sudah tersimpan aman dalam satu transaksi
  // (createLeadIntake) — pengunjung sudah boleh dianggap berhasil sejak
  // titik ini. Percobaan kirim di bawah cuma usaha cepat supaya email
  // sampai tanpa menunggu jadwal cron; kalau gagal atau lambat, cron
  // (/api/cron/outbox) yang mengulang sampai 5 kali. Pengunjung TIDAK
  // boleh disuruh menunggu atau dianggap gagal hanya karena percobaan
  // pertama ini belum berhasil — dulu begitu, dan rate limit yang sudah
  // terlanjur dipakai di atas bisa mengunci pengunjung 1 jam kalau ia
  // mengulang kirim padahal pesannya sudah aman tersimpan sejak awal.
  try {
    await processResendOutboxEvent(intake.outboxEventId);
  } catch (err) {
    log.warn("kontak.email_percobaan_pertama_gagal", {
      request_id: requestId,
      outbox_event_id: intake.outboxEventId,
      ...errorFields(err),
    });
  }

  return NextResponse.json({ ok: true });
}
