import "server-only";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import type postgres from "postgres";
import { sqlClientRaw } from "@/db/client";

type BucketPolicy = {
  key: string;
  limit: number;
  windowMs: number;
};

type BucketRow = {
  count: number;
  expires_at: Date;
};

export type ContactRateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
};

const HOUR_MS = 60 * 60 * 1000;
const GLOBAL_LIMIT = 300;
const EMAIL_LIMIT = 5;
const IP_LIMIT = 20;
const TRUSTED_IP_HEADERS = new Set([
  "cf-connecting-ip",
  "true-client-ip",
  "x-real-ip",
]);

function rateLimitSecret() {
  const secret = process.env.RATE_LIMIT_SECRET ?? process.env.CRON_SECRET;
  if (!secret) throw new Error("rate-limit-secret-missing");
  return secret;
}

function privateKey(namespace: string, value: string) {
  return `${namespace}:${createHmac("sha256", rateLimitSecret())
    .update(value)
    .digest("hex")}`;
}

export function trustedClientIp(request: Request): string | null {
  const configuredHeader = process.env.CONTACT_TRUSTED_IP_HEADER
    ?.trim()
    .toLowerCase();

  if (!configuredHeader || !TRUSTED_IP_HEADERS.has(configuredHeader)) {
    return null;
  }

  const value = request.headers.get(configuredHeader)?.trim() ?? "";
  return isIP(value) ? value : null;
}

async function consumeBucket(
  tx: postgres.TransactionSql,
  policy: BucketPolicy,
): Promise<ContactRateLimitResult> {
  // String ISO, BUKAN objek Date mentah: lewat tagged template `postgres`
  // yang dibundel Turbopack, objek Date gagal diserialisasi ("argument
  // must be of type string... Received an instance of Date") — ketahuan
  // lewat uji kirim formulir sungguhan, tidak muncul saat query yang sama
  // dijalankan lewat Node polos di luar Next.js. Postgres menerima string
  // ISO 8601 langsung sebagai literal timestamptz, jadi ini bukan akal-akalan,
  // cuma menghindari jalur serialisasi yang bermasalah.
  const expiresAt = new Date(Date.now() + policy.windowMs).toISOString();
  const rows = await tx<BucketRow[]>`
    INSERT INTO rate_limit_buckets (
      key,
      count,
      window_started_at,
      expires_at,
      updated_at
    )
    VALUES (${policy.key}, 1, now(), ${expiresAt}, now())
    ON CONFLICT (key) DO UPDATE
    SET count = CASE
          WHEN rate_limit_buckets.expires_at <= now() THEN 1
          ELSE rate_limit_buckets.count + 1
        END,
        window_started_at = CASE
          WHEN rate_limit_buckets.expires_at <= now() THEN now()
          ELSE rate_limit_buckets.window_started_at
        END,
        expires_at = CASE
          WHEN rate_limit_buckets.expires_at <= now() THEN EXCLUDED.expires_at
          ELSE rate_limit_buckets.expires_at
        END,
        updated_at = now()
    RETURNING count, expires_at
  `;
  const row = rows[0];
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((new Date(row.expires_at).getTime() - Date.now()) / 1000),
  );

  return {
    limited: row.count > policy.limit,
    retryAfterSeconds,
  };
}

export async function consumeContactRateLimit(input: {
  email: string;
  ip: string | null;
}): Promise<ContactRateLimitResult> {
  return sqlClientRaw.begin(async (tx) => {
    await tx`
      DELETE FROM rate_limit_buckets
      WHERE expires_at < now() - interval '1 day'
    `;

    const policies: BucketPolicy[] = [
      { key: "contact:global", limit: GLOBAL_LIMIT, windowMs: HOUR_MS },
      {
        key: privateKey("contact:email", input.email.trim().toLowerCase()),
        limit: EMAIL_LIMIT,
        windowMs: HOUR_MS,
      },
    ];

    if (input.ip) {
      policies.push({
        key: privateKey("contact:ip", input.ip),
        limit: IP_LIMIT,
        windowMs: HOUR_MS,
      });
    }

    for (const policy of policies) {
      const result = await consumeBucket(tx, policy);
      if (result.limited) return result;
    }

    return { limited: false, retryAfterSeconds: 0 };
  });
}
