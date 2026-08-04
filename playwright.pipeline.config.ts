import { defineConfig } from "@playwright/test";

/* ============================================================
   CONFIG TERPISAH — Bug 15 (dokumen 08-laporan-bug.md).

   playwright.config.ts UTAMA sengaja mengosongkan DATABASE_URL /
   RESEND_API_KEY / CRON_SECRET, supaya QA visual tetap cepat dan
   tidak butuh database sungguhan — itu menguji jalur "pipeline
   belum dikonfigurasi".

   Config INI kebalikannya: server dijalankan TANPA menimpa env,
   jadi `.env.local` (DATABASE_URL Neon + RESEND_API_KEY + CRON_SECRET
   sungguhan) terbaca apa adanya. Menguji jalur "pipeline benar-benar
   jalan" — lead tersimpan, rate limit, jebakan robot, retry outbox.

   Jalankan lewat `npm run qa:pipeline`. Butuh `.env.local` terisi
   dan build produksi terbaru (`npm run build`) — kalau tidak ada,
   testDir ini akan gagal start server, bukan diam-diam terlewat.
   ============================================================ */

const PORT = Number(process.env.QA_PIPELINE_PORT ?? 3003);
const BASE_URL = process.env.QA_PIPELINE_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests-pipeline",
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report/pipeline" }],
  ],
  outputDir: "test-results/pipeline",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `NEXT_PUBLIC_SITE_URL=${BASE_URL} npm run start -- --hostname 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
