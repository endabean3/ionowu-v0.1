import type { Transition, Variants } from "motion/react";

/* ============================================================
   EMPAT GERAKAN BAKU — dasar, bukan lagi batas atas
   Awalnya (dokumen 06) ini satu-satunya sumber gerakan di seluruh
   website, dan jumlah elemen bergerak per layar dibatasi ketat.
   Pemilik produk secara eksplisit mencabut pembatasan itu (2 Sep
   2026): gerakan sekarang bebas jumlah dan bentuknya, selama tetap
   memakai token durasi/kelengkungan di bawah supaya iramanya masih
   terasa satu keluarga, bukan kumpulan efek yang tidak nyambung.
   Yang TIDAK dicabut: dukungan prefers-reduced-motion (`diam`,
   `useReducedMotion`) tetap wajib di setiap animasi baru — itu
   aturan aksesibilitas, bukan aturan selera.
   ============================================================ */

/** Lama gerakan, dalam detik (motion memakai detik, bukan milidetik).
 *
 *  Dinaikkan 2 Sep 2026: nilai lama (0.6 untuk masuk, 1.0 untuk hero) terasa
 *  tergesa untuk teks sebesar display di hero -- makin besar dan makin jauh
 *  elemennya bergerak, makin lama waktu yang dibutuhkan supaya gerakannya
 *  terbaca sebagai gerakan, bukan kedipan. Umpan balik sentuh/tekan TIDAK
 *  ikut dinaikkan: itu harus tetap terasa langsung di bawah jari. */
export const duration = {
  fast: 0.15, // sentuhan kecil -- sengaja tetap cepat
  mid: 0.35, // sebagian besar hal
  slow: 0.9, // elemen masuk
  hero: 1.4, // pembuka halaman saja
} as const;

/** Kelengkungan gerak. DILARANG memakai `linear` atau `ease` bawaan. */
export const ease = {
  /** Paling sering dipakai. Cepat di awal, melambat halus di akhir. */
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

/** Pegas lembut — untuk gerakan yang mengikuti jari/kursor. */
export const spring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
};

/** Jeda antar elemen dalam satu kelompok. */
export const STAGGER = 0.12; // 120 ms -- dulu 80 ms, terlalu rapat sampai
// satu kelompok terasa muncul serentak, bukan berurutan.

/* ---------- 1. MASUK — naik 24px + memudar muncul, 600ms ---------- */

export const masuk: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.out },
  },
};

/** Pembungkus untuk sekelompok elemen yang masuk berurutan. */
export const masukGroup: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: STAGGER, delayChildren: 0.05 },
  },
};

/* ---------- 1b. VARIASI ARAH MASUK ----------
   Dulu satu-satunya arah adalah "naik dari bawah" (24px). Sekarang boleh
   bervariasi per bagian supaya tidak terasa monoton diulang-ulang di
   sepanjang halaman -- dipakai lewat prop `arah` di <Reveal>. */

export const masukKiri: Variants = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.out } },
};

export const masukKanan: Variants = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: duration.slow, ease: ease.out } },
};

export const masukSkala: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.out },
  },
};

/* ---------- 2. SENTUH — naik 4px, 250ms ----------
   Bagian "tepi menyala" dikerjakan lewat CSS di komponen Card/Button,
   supaya tidak ada elemen tambahan yang dianimasikan JavaScript. */

/** Seberapa tinggi elemen naik, dalam piksel. Kembaran `--lift-distance`. */
export const LIFT = 4;

export const sentuh = {
  rest: { y: 0 },
  hover: { y: -LIFT },
  /** Kembaran `--duration-sentuh` (250ms). */
  durationSec: 0.25,
  transition: { duration: 0.25, ease: ease.out },
} as const;

/* ---------- 3. TEKAN — mengecil jadi 98%, 120ms ---------- */

/** Kembaran `--press-scale`. */
export const PRESS = 0.98;

export const tekan = {
  scale: PRESS,
  /** Kembaran `--duration-tekan` (120ms). */
  durationSec: 0.12,
  transition: { duration: 0.12, ease: ease.out },
} as const;

/* ---------- 4. PINDAH HALAMAN — memudar + naik 12px, 400ms ---------- */

export const pindahHalaman: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.out },
  },
  /* Keluar lebih cepat dari masuk (~65%) supaya terasa responsif. */
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.26, ease: ease.inOut },
  },
};

/* ============================================================
   VERSI TANPA GERAK
   Dipakai kalau pengguna mematikan animasi di setelan perangkatnya.
   Elemen langsung tampil di posisi akhir. Website tetap utuh.
   ============================================================ */

export const diam: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
  exit: { opacity: 1, y: 0, transition: { duration: 0 } },
};
