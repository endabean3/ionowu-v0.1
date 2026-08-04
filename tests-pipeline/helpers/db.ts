import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHmac } from "node:crypto";
import postgres from "postgres";

/**
 * `.env.local` dibaca otomatis oleh proses server Next.js (dev/start),
 * tapi TIDAK oleh proses Playwright test itu sendiri — jadi query
 * langsung ke database dari sini butuh env-nya dimuat manual.
 * Parser sengaja sederhana (bukan `dotenv`): cukup untuk baris
 * `KUNCI=nilai`, komentar `#`, dan baris kosong, sesuai isi `.env.local` proyek ini.
 */
function loadEnvLocal(): void {
  const path = resolve(__dirname, "../../.env.local");
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL kosong di .env.local — tests-pipeline butuh database sungguhan (lihat playwright.pipeline.config.ts).",
  );
}

export const testSql = postgres(process.env.DATABASE_URL, {
  max: 3,
  ssl: process.env.DATABASE_SSL === "disable" ? false : "require",
  prepare: false,
});

/** Hapus semua jejak satu lead uji (lead, audit log, outbox event) supaya
 * database tidak terus menumpuk data palsu tiap kali tes dijalankan. */
export async function cleanupLeadByRequestId(requestId: string): Promise<void> {
  const leads = await testSql<{ id: string }[]>`
    SELECT id FROM leads WHERE request_id = ${requestId}
  `;
  for (const lead of leads) {
    await testSql`DELETE FROM audit_logs WHERE entity_id = ${lead.id}`;
    await testSql`DELETE FROM outbox_events WHERE payload->>'lead_id' = ${lead.id}`;
    await testSql`DELETE FROM leads WHERE id = ${lead.id}`;
  }
}

/** Sama persis dengan privateKey() di src/lib/leads/rate-limit.ts — kuncinya
 * di-hash HMAC, jadi tidak bisa dicari lewat LIKE pada teks aslinya. */
export function emailRateLimitKey(email: string): string {
  const secret = process.env.RATE_LIMIT_SECRET ?? process.env.CRON_SECRET;
  if (!secret) throw new Error("RATE_LIMIT_SECRET/CRON_SECRET kosong.");
  const hash = createHmac("sha256", secret)
    .update(email.trim().toLowerCase())
    .digest("hex");
  return `contact:email:${hash}`;
}

export async function cleanupRateLimitKey(key: string): Promise<void> {
  await testSql`DELETE FROM rate_limit_buckets WHERE key = ${key}`;
}
