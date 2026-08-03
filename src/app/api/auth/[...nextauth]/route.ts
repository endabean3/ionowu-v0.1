import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthConfigured } from "@/lib/admin/env";

export const runtime = "nodejs";

function adminAuthBelumSiap() {
  return NextResponse.json(
    { ok: false, error: "admin_auth_not_configured" },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return adminAuthBelumSiap();
  }

  const { handlers } = await import("@/auth");
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return adminAuthBelumSiap();
  }

  const { handlers } = await import("@/auth");
  return handlers.POST(request);
}
