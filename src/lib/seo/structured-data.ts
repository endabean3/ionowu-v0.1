import { copy, withLocale, type Locale } from "@/lib/i18n";

/**
 * Data terstruktur schema.org.
 *
 * ATURAN ISI — sama dengan aturan konten situs ini: tidak ada angka,
 * testimoni, nama klien, alamat, atau legalitas yang dikarang. Setiap nilai di
 * bawah berasal dari data yang memang sudah ada di repo. Karena itu tidak ada
 * `address`, `telephone`, `foundingDate`, `aggregateRating`, maupun `sameAs`:
 * bukan lupa, tetapi karena datanya belum ada. Menaruh data palsu di sini
 * lebih berbahaya daripada mengosongkannya — Google memakainya untuk rich
 * result, dan salah data di sana terbaca sebagai perusahaan yang tidak jujur.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://ionowu.com"
    : "http://localhost:3000");

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Alamat yang sudah dipakai publik di formulir kontak. */
const CONTACT_EMAIL = "office@ionowu.com";

export function organizationSchema(locale: Locale = "id") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Ionowu",
    url: SITE_URL,
    description: copy[locale].metadata.description,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/brand/ionowu-mark-full-color.svg`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: CONTACT_EMAIL,
      availableLanguage: ["id", "en", "zh"],
    },
  };
}

export function websiteSchema(locale: Locale = "id") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "Ionowu",
    url: SITE_URL,
    description: copy[locale].metadata.description,
    inLanguage: ["id", "en", "zh"],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function serviceSchema(input: {
  slug: string;
  judul: string;
  deskripsi: string;
  locale: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.judul,
    description: input.deskripsi,
    url: `${SITE_URL}${withLocale(`/layanan/${input.slug}`, input.locale)}`,
    serviceType: input.judul,
    provider: { "@id": ORGANIZATION_ID },
    // `areaServed` sengaja tidak diisi: cakupan wilayah layanan resmi belum
    // pernah ditetapkan, dan menebaknya akan menyesatkan hasil pencarian lokal.
  };
}

export function caseStudySchema(input: {
  slug: string;
  nama: string;
  ringkasan: string;
  bidang: string;
  teknologi: string[];
  locale: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.nama,
    description: input.ringkasan,
    url: `${SITE_URL}${withLocale(`/karya/${input.slug}`, input.locale)}`,
    about: input.bidang,
    keywords: input.teknologi.join(", "),
    creator: { "@id": ORGANIZATION_ID },
    inLanguage: input.locale,
    // Tidak ada `datePublished`: tanggal pengerjaan tiap karya belum tercatat
    // di data, dan tanggal karangan akan salah dibaca sebagai konten basi.
  };
}

/**
 * Layanan dengan cakupan wilayah — untuk halaman lokal.
 *
 * Memakai `ProfessionalService`, BUKAN `LocalBusiness`, dan itu keputusan
 * sadar: `LocalBusiness` menuntut `address` yang sungguhan, sementara alamat
 * kantor Ionowu masih `[BELUM ADA]`. Mengarang alamat demi rich result adalah
 * cara tercepat kehilangan kepercayaan Google sekaligus kepercayaan pembaca.
 * `areaServed` menyatakan wilayah layanan tanpa mengklaim lokasi fisik.
 */
export function localServiceSchema(input: {
  nama: string;
  deskripsi: string;
  path: string;
  wilayah: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: input.nama,
    description: input.deskripsi,
    url: `${SITE_URL}${input.path}`,
    parentOrganization: { "@id": ORGANIZATION_ID },
    email: CONTACT_EMAIL,
    areaServed: input.wilayah.map((nama) => ({
      "@type": "AdministrativeArea",
      name: nama,
    })),
    knowsLanguage: ["id", "en", "zh"],
  };
}

/** Jejak navigasi — membuat Google menampilkan jalur, bukan URL mentah. */
export function breadcrumbSchema(
  trail: { name: string; path: string }[],
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${withLocale(item.path, locale)}`,
    })),
  };
}

export function itemListSchema(
  input: { name: string; path: string }[],
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: input.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}${withLocale(item.path, locale)}`,
    })),
  };
}
