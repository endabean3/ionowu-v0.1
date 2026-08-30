import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://ionowu.com"
    : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // `/health/` ikut ditutup: endpoint probe tidak punya nilai bagi
      // pembaca, dan hasil pencarian yang memuat JSON status hanya membuang
      // anggaran perayapan.
      disallow: ["/admin", "/admin/", "/api/", "/dev/", "/health/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
