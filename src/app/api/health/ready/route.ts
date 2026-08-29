import { NextResponse } from "next/server";
import { sqlClientRaw } from "@/db/client";

/* Standar Ionowu RUN-08 — readiness.
   Menjawab: layanan ini siap MENERIMA TRAFIK?
   Berbeda dari liveness, probe ini memang menyentuh dependensi kritis —
   inilah yang dipakai Swarm untuk memutuskan kapan kontainer baru boleh
   menggantikan yang lama pada rolling update start-first (DEP-07).

   Koneksi database menuju PgBouncer, bukan Postgres langsung (DAT-09). */

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TIMEOUT_MS = 3000;

export async function GET() {
  const started = Date.now();

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { status: "not_ready", reason: "DATABASE_URL belum diisi" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    await Promise.race([
      sqlClientRaw`select 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`database tidak menjawab dalam ${TIMEOUT_MS}ms`)), TIMEOUT_MS),
      ),
    ]);
  } catch (error) {
    return NextResponse.json(
      {
        status: "not_ready",
        reason: error instanceof Error ? error.message : "database tidak terjangkau",
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.json(
    { status: "ready", checks: { database: "ok" }, latency_ms: Date.now() - started },
    { headers: { "cache-control": "no-store" } },
  );
}
