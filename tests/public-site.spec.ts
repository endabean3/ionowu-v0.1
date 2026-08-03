import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", locale: "id", marker: "Kami bangun software" },
  { path: "/layanan", locale: "id", marker: "Layanan untuk sistem" },
  { path: "/karya", locale: "id", marker: "Pekerjaan yang sudah" },
  { path: "/tentang", locale: "id", marker: "Software house yang bekerja" },
  { path: "/kontak", locale: "id", marker: "Ceritakan kebutuhan Anda" },
  { path: "/en", locale: "en", marker: "We build software" },
  { path: "/en/layanan", locale: "en", marker: "Services for systems" },
  { path: "/en/karya", locale: "en", marker: "Work we have handled" },
  { path: "/en/tentang", locale: "en", marker: "A software house" },
  { path: "/en/kontak", locale: "en", marker: "Tell us what you need" },
  { path: "/zh", locale: "zh-CN", marker: "我们打造" },
  { path: "/zh/layanan", locale: "zh-CN", marker: "真实业务使用" },
  { path: "/zh/karya", locale: "zh-CN", marker: "我们处理过的项目" },
  { path: "/zh/tentang", locale: "zh-CN", marker: "真实运营问题" },
  { path: "/zh/kontak", locale: "zh-CN", marker: "告诉我们您的需求" },
] as const;

test.describe("public route QA", () => {
  for (const route of routes) {
    test(`${route.path} renders localized content and metadata`, async ({ page }, testInfo) => {
      await page.goto(route.path);

      await expect(page.getByText(route.marker).first()).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", route.locale);
      await expect(page.locator("main")).toBeVisible();

      const title = await page.title();
      expect(title).toContain("Ionowu");

      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="id"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveCount(1);

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(hasHorizontalOverflow).toBe(false);

      await page.screenshot({
        fullPage: true,
        path: `test-results/screenshots/${testInfo.project.name}${route.path.replace(/\//g, "-") || "-home"}.png`,
      });
    });
  }
});

test("contact form wires server field errors into controls", async ({ page }) => {
  await page.goto("/kontak");
  await page.getByRole("button", { name: "Kirim pesan" }).click();

  await expect(page.getByText("Nama wajib diisi.")).toBeVisible();
  await expect(page.getByText("Email tidak valid.")).toBeVisible();
  await expect(page.getByText("Pilih jenis kebutuhan.")).toBeVisible();
  await expect(page.getByText("Ceritakan sedikit lebih lengkap")).toBeVisible();
  await expect(page.locator("#nama")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#kebutuhan")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#pesan")).toHaveAttribute("aria-invalid", "true");
});

test("contact API never reports success without the durable pipeline", async ({ request }) => {
  const response = await request.post("/api/kontak", {
    headers: {
      origin: new URL(process.env.QA_BASE_URL ?? "http://127.0.0.1:3002").origin,
    },
    data: {
      request_id: "qa-missing-pipeline-001",
      nama: "QA Ionowu",
      email: "qa@example.com",
      perusahaan: "Ionowu QA",
      kebutuhan: "aplikasi-web-khusus",
      pesan: "Pesan valid untuk memastikan API tidak memberi sukses palsu.",
      anggaran: "",
      locale: "id",
      situs: "",
    },
  });

  expect(response.status()).toBe(503);
  await expect(response.json()).resolves.toMatchObject({ ok: false });
});

test("contact API accepts valid manual submissions without client request id", async ({ request }) => {
  const response = await request.post("/api/kontak", {
    headers: {
      origin: new URL(process.env.QA_BASE_URL ?? "http://127.0.0.1:3002").origin,
    },
    data: {
      nama: "Manual QA Ionowu",
      email: "manual-qa@example.com",
      perusahaan: "Ionowu QA",
      kebutuhan: "aplikasi-web-khusus",
      pesan: "Pesan valid dari klien manual tanpa request id dari browser.",
      anggaran: "",
      locale: "id",
      situs: "",
    },
  });

  expect(response.status()).toBe(503);
  await expect(response.json()).resolves.toMatchObject({ ok: false });
});

test("PWA manifest follows the default light browser chrome", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);

  await expect(response.json()).resolves.toMatchObject({
    background_color: "#f4f8fb",
    theme_color: "#f4f8fb",
  });
});

test("production responses include independent security headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["strict-transport-security"]).toContain(
    "max-age=31536000",
  );
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()["content-security-policy"]).toContain(
    "object-src 'none'",
  );
});

test("document keeps CSP restrictions when an upstream proxy rewrites headers", async ({ page }) => {
  await page.goto("/");
  const policy = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute("content");
  expect(policy).toContain("script-src 'self'");
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("base-uri 'self'");
});

test("reduced motion keeps the site usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByLabel("Ionowu, beranda")).toBeVisible();
});

test("production-only routes and locale fallbacks stay closed", async ({ page }) => {
  const idRoute = await page.goto("/id");
  expect(idRoute?.status()).toBe(404);

  const foundationRoute = await page.goto("/dev/fondasi");
  expect(foundationRoute?.status()).toBe(404);
});
