import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.QA_PORT ?? 3002);
const BASE_URL = process.env.QA_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `DATABASE_URL= RESEND_API_KEY= CRON_SECRET= NEXT_PUBLIC_SITE_URL=${BASE_URL} npm run start -- --hostname 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 20_000,
  },
  projects: [
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1100 },
      },
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
});
