import { NextResponse } from "next/server";

/* Standar Ionowu RUN-08 — liveness.
   Menjawab satu pertanyaan saja: proses ini hidup dan bisa melayani HTTP?
   TIDAK boleh menyentuh dependensi eksternal. Kalau probe ini ikut gagal
   saat database mati, orkestrator akan me-restart kontainer yang sebenarnya
   sehat — memperburuk insiden, bukan memperbaikinya. */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  return NextResponse.json(
    { status: "live", uptime: Math.round(process.uptime()) },
    { headers: { "cache-control": "no-store" } },
  );
}
