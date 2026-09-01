import type { Locale } from "@/lib/i18n";

/**
 * Produk Ionowu sendiri — beda dari `karya.ts`.
 *
 * `karya.ts` adalah pekerjaan UNTUK klien, dan nama kliennya belum boleh
 * disebut (dokumen 03). Produk di berkas ini MILIK Ionowu sendiri, jadi
 * namanya boleh disebut apa adanya — tidak ada kerahasiaan yang perlu dijaga.
 *
 * Diperiksa langsung sebelum ditulis (1 September 2026), bukan diasumsikan:
 * - JalinTani: jalintani.ionowu.com dan api.jalintani.ionowu.com/health
 *   diuji langsung, keduanya hidup. Badge "Purwarupa tahap pilot" di
 *   beranda produk itu sendiri -- statusnya dikutip, bukan dihaluskan.
 * - Warung Wangi: dibaca dari README repo (bukan situs publik, karena
 *   memang belum ada). README-nya sendiri menulis "Phase 1 is complete"
 *   tapi mendaftar tiga hal WAJIB sebelum go-live: alamat & jam buka asli,
 *   nomor WhatsApp asli, dan katalog asli (tiga-tiganya masih placeholder
 *   di kode). Karena itu TIDAK diberi tautan publik di sini -- menautkan
 *   ke sesuatu yang belum ada isinya lebih buruk daripada tidak menautkan.
 * - ionowu sweet (UMKM Intelligence & POS Ecosystem): dibaca dari
 *   00-product/ROADMAP.md dan riwayat commit di repo terpisah, BUKAN dari
 *   situs publik -- domain rencananya (api.ionowu.com, app.ionowu.com) diuji
 *   dan gagal resolve DNS sama sekali, belum terdaftar. Statusnya jauh di
 *   belakang Warung Wangi: roadmap-nya sendiri masih di "Fase 0 -- Fondasi
 *   Bisa Berjualan (MVP)", dan commit terakhir berbunyi "fondasi backend Go
 *   + skeleton PWA offline-first" -- kata kuncinya fondasi dan skeleton,
 *   belum toko percontohan. Karena itu diberi status ketiga, "pengembangan",
 *   bukan disamakan dengan "dibangun" -- menyamakan keduanya akan melebih-
 *   lebihkan progres yang sebenarnya masih tahap awal.
 */

export type StatusProduk = "live" | "dibangun" | "pengembangan";

export type Produk = {
  slug: string;
  nama: string;
  tagline: string;
  ringkasan: string;
  status: StatusProduk;
  /** Hanya diisi kalau status "live" -- tidak pernah menunjuk halaman kosong. */
  url?: string;
  wilayah: string;
  teknologi: string[];
};

type ProdukCopy = Pick<Produk, "tagline" | "ringkasan">;

export const DAFTAR_PRODUK: Produk[] = [
  {
    slug: "ionowu-sweet",
    nama: "ionowu sweet",
    tagline:
      "Kasir modern, CRM, dan Business Intelligence untuk UMKM -- satu ekosistem.",
    ringkasan:
      "Toko kecil sering mencatat penjualan di kertas atau aplikasi kasir yang tidak menyimpan data pelanggan maupun tren penjualan. ionowu sweet dibangun sebagai kasir yang tetap bisa dipakai offline, ditambah CRM dan business intelligence di atasnya -- masih di fondasi paling awal (Fase 0), belum diuji di toko sungguhan.",
    status: "pengembangan",
    wilayah: "Belum ada toko percontohan",
    teknologi: ["Go", "Next.js", "PWA", "PostgreSQL", "Redis"],
  },
  {
    slug: "jalintani",
    nama: "JalinTani",
    tagline:
      "Marketplace sayur yang mempertemukan petani, pedagang, dan pembeli dalam satu aplikasi.",
    ringkasan:
      "Pedagang sayur keliling sering rugi karena stok cepat layu dan tidak laku hari itu juga; pembeli sering kelebihan belanja karena tidak punya panduan porsi. JalinTani menjawab dua-duanya sekaligus: katalog stok harian dari banyak pedagang, AI Planner yang menyarankan porsi sesuai resep, dan checkout COD yang sederhana.",
    status: "live",
    url: "https://jalintani.ionowu.com",
    wilayah: "Purwarupa tahap pilot -- Dongko, Trenggalek",
    teknologi: ["NestJS", "FastAPI", "Next.js", "Expo", "PostgreSQL"],
  },
  {
    slug: "warung-wangi",
    nama: "Warung Wangi",
    tagline: "Etalase digital untuk parfum lokal, dengan mesin pencocokan aroma.",
    ringkasan:
      "Dibangun untuk toko parfum lokal di Dongko, Trenggalek: katalog produk, Aroma Finder yang membantu pembeli menemukan wangi yang cocok, dan tombol WhatsApp langsung ke toko. Fase 1 sudah selesai secara teknis -- yang masih ditunggu adalah data toko sungguhan (alamat, nomor WhatsApp, katalog asli) sebelum resmi dibuka ke publik.",
    status: "dibangun",
    wilayah: "Dongko, Trenggalek",
    teknologi: ["Next.js", "Go", "PostgreSQL", "Redis"],
  },
];

const COPY: Record<Exclude<Locale, "id">, Record<string, ProdukCopy>> = {
  en: {
    "ionowu-sweet": {
      tagline: "Modern POS, CRM, and Business Intelligence for small shops -- one ecosystem.",
      ringkasan:
        "Small shops often record sales on paper or in POS apps that keep no customer data or sales trends. ionowu sweet is built as a cashier system that still works offline, with CRM and business intelligence on top -- still at the earliest foundation stage (Phase 0), not yet tested in a real store.",
    },
    jalintani: {
      tagline:
        "A vegetable marketplace connecting farmers, sellers, and buyers in one app.",
      ringkasan:
        "Roaming vegetable sellers often lose money on stock that wilts unsold; buyers often overbuy without a portioning guide. JalinTani answers both at once: a daily-stock catalogue from many sellers, an AI Planner that suggests portions based on recipes, and simple cash-on-delivery checkout.",
    },
    "warung-wangi": {
      tagline: "A digital storefront for local perfumery, with a scent-matching engine.",
      ringkasan:
        "Built for a local perfumery in Dongko, Trenggalek: product catalogue, an Aroma Finder that helps buyers find a matching scent, and a direct WhatsApp button to the shop. Phase 1 is technically complete -- what remains is real shop data (address, WhatsApp number, real catalogue) before it opens to the public.",
    },
  },
  zh: {
    "ionowu-sweet": {
      tagline: "面向小微商户的现代收银、CRM 与商业智能——一个生态系统。",
      ringkasan:
        "小商户常用纸笔或不保存客户数据与销售趋势的收银软件记账。ionowu sweet 打造成一套离线也能使用的收银系统，并在此之上叠加 CRM 与商业智能——目前仍处于最早期的基础阶段（第 0 阶段），尚未在真实门店中试用。",
    },
    jalintani: {
      tagline: "连接农民、商贩与买家的蔬菜交易平台，一个应用搞定。",
      ringkasan:
        "流动菜贩常因蔬菜滞销枯萎而亏本；买家又常因缺乏用量指引而买多浪费。JalinTani 同时解决这两个问题：多个商贩的每日库存目录、根据食谱建议购买份量的 AI 规划助手，以及简单的货到付款结账方式。",
    },
    "warung-wangi": {
      tagline: "本地香水店的数字橱窗，内置香气匹配引擎。",
      ringkasan:
        "为位于东爪哇 Trenggalek 县 Dongko 的本地香水店打造：产品目录、帮买家找到匹配香气的 Aroma Finder，以及直连店铺的 WhatsApp 按钮。第一阶段在技术上已完成——正式对外开放前，还需要真实的店铺资料（地址、WhatsApp 号码、真实商品目录）。",
    },
  },
};

export function daftarProduk(locale: Locale = "id"): Produk[] {
  if (locale === "id") return DAFTAR_PRODUK;
  return DAFTAR_PRODUK.map((p) => ({ ...p, ...COPY[locale][p.slug] }));
}
