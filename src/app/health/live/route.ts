import { NextResponse } from "next/server";

import { SERVICE_NAME, SERVICE_VERSION } from "@/lib/observability/service";

/**
 * RUN-08 — liveness probe.
 *
 * Sengaja TIDAK menyentuh database, Resend, atau dependensi lain. Liveness
 * hanya menjawab satu pertanyaan: apakah proses ini masih waras dan perlu
 * dibiarkan hidup? Kalau probe ini ikut memeriksa dependensi, database yang
 * sedang down akan membuat orkestrator membunuh dan me-restart aplikasi yang
 * sebenarnya sehat — persis kebalikan dari yang kita mau.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      uptime_seconds: Math.round(process.uptime()),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
