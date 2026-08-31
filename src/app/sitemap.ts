import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, hreflangLanguages, withLocale } from "@/lib/i18n";
import { DAFTAR_LAYANAN } from "@/lib/data/layanan";
import { DAFTAR_KARYA } from "@/lib/data/karya";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://ionowu.com"
    : "http://localhost:3000");

/* Waktu build dipakai sebagai `lastModified`.
   Konten situs ini datang dari berkas TypeScript di src/lib/data, bukan dari
   CMS bertanggal, jadi tidak ada tanggal ubah per halaman yang bisa dipakai.
   Waktu build adalah perkiraan paling jujur yang tersedia: ia bergerak persis
   ketika isinya benar-benar mungkin berubah, yaitu saat rilis baru. */
const lastModified = new Date();

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${withLocale(path, "id")}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        // Kode bahasanya WAJIB sama persis dengan tag <link rel="alternate">
        // di halaman — dua sumber yang menyebut kode berbeda untuk bahasa yang
        // sama membuat anotasi hreflang dianggap bertentangan.
        ...Object.fromEntries(
          Object.entries(hreflangLanguages(path)).map(([code, url]) => [
            code,
            `${siteUrl}${url}`,
          ]),
        ),
        "x-default": `${siteUrl}${withLocale(path, DEFAULT_LOCALE)}`,
      },
    },
  };
}

/* Halaman yang HANYA punya versi Indonesia. Sengaja tidak memakai `entry()`:
   helper itu selalu memasang anotasi hreflang untuk ketiga bahasa, dan
   menunjuk /en maupun /zh yang tidak ada hanya akan menghasilkan 404 di mata
   perayap. */
function entryIdSaja(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
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

  const halamanLokal: MetadataRoute.Sitemap = [
    entryIdSaja("/programmer-trenggalek", "monthly", 0.7),
  ];

  return [...halamanUtama, ...halamanLokal, ...halamanLayanan, ...halamanKarya];
}
