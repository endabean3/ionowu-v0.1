import type { Transition, Variants } from "motion/react";

/* ============================================================
   EMPAT GERAKAN BAKU — dokumen 06
   Ini SATU-SATUNYA sumber gerakan di seluruh website.
   Sebelum menambah animasi baru, tanya dulu:
   "Apakah ini bisa dicapai dengan empat gerakan di bawah?"
   ============================================================ */

/** Lama gerakan, dalam detik (motion memakai detik, bukan milidetik). */
export const duration = {
  fast: 0.15, // sentuhan kecil
  mid: 0.3, // sebagian besar hal
  slow: 0.6, // elemen masuk
  hero: 1.0, // pembuka halaman saja
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

/** Jeda antar elemen dalam satu kelompok. Maksimal 6 elemen. */
export const STAGGER = 0.08; // 80 ms

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
