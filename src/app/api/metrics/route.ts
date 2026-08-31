import { sql } from "drizzle-orm";

import { db } from "@/db/client";
import { errorFields, log } from "@/lib/observability/log";

/**
 * Metrik outbox dalam format teks Prometheus.
 *
 * KENAPA ADA: pada 30 Agustus 2026 seluruh notifikasi lead gagal permanen
 * selama berhari-hari tanpa ada yang tahu. Lead tetap tersimpan, jadi tidak
 * ada data yang hilang -- tetapi tidak ada satu pun sinyal yang memberi tahu
 * bahwa emailnya tidak pernah sampai. Kegagalan itu baru ketahuan karena
 * kebetulan diperiksa manual.
 *
 * Endpoint ini menutup celah itu: antrean outbox jadi terlihat dari luar,
 * sehingga Prometheus bisa membunyikan alarm ketika ada event yang mentok di
 * `failed` atau tertahan terlalu lama di `pending`. Yang diperbaiki di sini
 * bukan satu kejadian, tapi kelasnya -- kegagalan pengiriman apa pun sekarang
 * punya jalan untuk terlihat.
 *
 * Dilindungi bearer token karena jumlah lead adalah angka bisnis; bukan
 * rahasia besar, tetapi juga bukan konsumsi publik.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BarisStatus = { status: string; jumlah: number };

function tidakBerwenang() {
  return new Response("unauthorized\n", {
    status: 401,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function berwenang(request: Request) {
  // METRICS_TOKEN dipisah supaya token pemantauan bisa dirotasi tanpa ikut
  // mematikan worker cron. Kalau belum diisi, CRON_SECRET dipakai sebagai
  // cadangan agar endpoint ini tidak pernah terbuka tanpa autentikasi.
  const rahasia = process.env.METRICS_TOKEN || process.env.CRON_SECRET;
  if (!rahasia) return false;
  return (request.headers.get("authorization") ?? "") === `Bearer ${rahasia}`;
}

export async function GET(request: Request) {
  if (!berwenang(request)) return tidakBerwenang();

  if (!process.env.DATABASE_URL) {
    return new Response("# database belum dikonfigurasi\n", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const statusRows = (await db.execute(sql`
      select status::text as status, count(*)::int as jumlah
      from outbox_events
      group by status
    `)) as unknown as BarisStatus[];

    const [tertua] = (await db.execute(sql`
      select coalesce(
        extract(epoch from (now() - min(created_at))),
        0
      )::int as detik
      from outbox_events
      where status in ('pending', 'retry_wait', 'processing')
    `)) as unknown as { detik: number }[];

    const [lead] = (await db.execute(sql`
      select count(*)::int as jumlah from leads
    `)) as unknown as { jumlah: number }[];

    // Seluruh status disebut eksplisit walau nilainya nol. Deret yang hilang
    // sama sekali membuat ekspresi alert seperti `> 0` diam ketika justru
    // tidak ada data -- diam yang terbaca persis seperti "aman".
    const semuaStatus = [
      "pending",
      "processing",
      "retry_wait",
      "sent",
      "failed",
    ];
    const hitung = new Map(semuaStatus.map((s) => [s, 0]));
    for (const row of statusRows) {
      hitung.set(row.status, Number(row.jumlah));
    }

    const baris = [
      "# HELP ionowu_outbox_events Jumlah event outbox per status.",
      "# TYPE ionowu_outbox_events gauge",
      ...[...hitung.entries()].map(
        ([status, jumlah]) =>
          `ionowu_outbox_events{status="${status}"} ${jumlah}`,
      ),
      "# HELP ionowu_outbox_oldest_unsent_age_seconds Umur event tertua yang belum terkirim.",
      "# TYPE ionowu_outbox_oldest_unsent_age_seconds gauge",
      `ionowu_outbox_oldest_unsent_age_seconds ${Number(tertua?.detik ?? 0)}`,
      "# HELP ionowu_leads Jumlah lead tersimpan.",
      "# TYPE ionowu_leads gauge",
      `ionowu_leads ${Number(lead?.jumlah ?? 0)}`,
      "",
    ].join("\n");

    return new Response(baris, {
      status: 200,
      headers: {
        "content-type": "text/plain; version=0.0.4; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    log.error("metrics.gagal_membaca_outbox", errorFields(err));
    return new Response("# gagal membaca metrik\n", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
