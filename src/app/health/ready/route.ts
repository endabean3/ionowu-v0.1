import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db/client";
import { isAdminAuthConfigured } from "@/lib/admin/env";
import { isContactPipelineConfigured } from "@/lib/leads/env";
import { errorFields, log } from "@/lib/observability/log";
import { SERVICE_NAME, SERVICE_VERSION } from "@/lib/observability/service";

/**
 * RUN-08 — readiness probe.
 *
 * Berbeda dari liveness: probe ini BOLEH gagal saat dependensi belum siap,
 * karena hasilnya dipakai untuk menahan trafik (dan menahan rollout) sampai
 * instance benar-benar bisa melayani. Yang diperiksa hanya dependensi yang
 * tanpanya permintaan pengunjung pasti gagal.
 *
 * Balasan tidak pernah memuat rahasia atau string koneksi — hanya nama
 * pemeriksaan dan status lulus/gagal, supaya endpoint ini aman dipanggil
 * orkestrator dan reverse proxy.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 3000;

type Check = { name: string; ok: boolean; detail?: string };

async function checkDatabase(): Promise<Check> {
  if (!process.env.DATABASE_URL) {
    return { name: "database", ok: false, detail: "DATABASE_URL belum diisi" };
  }

  try {
    await Promise.race([
      db.execute(sql`select 1`),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`query melewati ${DB_TIMEOUT_MS}ms`)),
          DB_TIMEOUT_MS,
        ),
      ),
    ]);
    return { name: "database", ok: true };
  } catch (err) {
    log.error("health.ready.database_gagal", errorFields(err));
    return { name: "database", ok: false, detail: "tidak bisa dihubungi" };
  }
}

export async function GET() {
  const checks: Check[] = [
    await checkDatabase(),
    {
      name: "contact_pipeline",
      ok: isContactPipelineConfigured(),
      detail: "DATABASE_URL, RESEND_API_KEY, dan CRON_SECRET wajib terisi",
    },
    {
      name: "admin_auth",
      ok: isAdminAuthConfigured(),
      detail: "konfigurasi Auth.js/OIDC admin belum lengkap",
    },
  ];

  const ready = checks.every((check) => check.ok);

  return NextResponse.json(
    {
      status: ready ? "ready" : "not_ready",
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      checks: checks.map(({ name, ok, detail }) => ({
        name,
        ok,
        ...(ok ? {} : { detail }),
      })),
    },
    {
      status: ready ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
