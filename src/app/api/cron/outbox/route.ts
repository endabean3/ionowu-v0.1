import { NextResponse } from "next/server";
import { processResendOutbox } from "@/lib/outbox/resend";

export const runtime = "nodejs";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";

  return Boolean(secret) && header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 10;

  try {
    const result = await processResendOutbox(Number.isFinite(limit) ? limit : 10);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[outbox] gagal memproses batch:", {
      code: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
