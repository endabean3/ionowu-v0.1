import type { MetadataRoute } from "next";
import { LOCALES, withLocale } from "@/lib/i18n";
import { DAFTAR_LAYANAN } from "@/lib/data/layanan";
import { DAFTAR_KARYA } from "@/lib/data/karya";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://ionowu.com"
    : "http://localhost:3000");

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${withLocale(path, "id")}`,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [locale, `${siteUrl}${withLocale(path, locale)}`]),
      ),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const halamanUtama: MetadataRoute.Sitemap = [
    entry("/", "monthly", 1),
    entry("/layanan", "monthly", 0.8),
    entry("/karya", "monthly", 0.8),
    entry("/tentang", "yearly", 0.6),
    entry("/kontak", "yearly", 0.6),
  ];

  const halamanLayanan = DAFTAR_LAYANAN.map((layanan) =>
    entry(`/layanan/${layanan.slug}`, "yearly", 0.6),
  );

  const halamanKarya = DAFTAR_KARYA.map((karya) =>
    entry(`/karya/${karya.slug}`, "yearly", 0.5),
  );

  return [...halamanUtama, ...halamanLayanan, ...halamanKarya];
}
