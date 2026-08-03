import "server-only";

/** Semua bagian yang dibutuhkan agar lead tersimpan dan notifikasi dapat diulang. */
export function isContactPipelineConfigured() {
  return Boolean(
    process.env.DATABASE_URL &&
      process.env.RESEND_API_KEY &&
      process.env.CRON_SECRET,
  );
}
