"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  diam,
  masuk,
  masukDariAtas,
  masukGroup,
  masukKiri,
  masukKanan,
  masukSkala,
} from "@/lib/motion";
import { useArahGulir, type ArahGulir } from "@/lib/arah-gulir";

/** Arah datang elemen. `atas` = gerakan baku (mengikuti arah gulir). */
type Arah = "atas" | "kiri" | "kanan" | "skala";

/**
 * Hanya `atas` yang ikut arah gulir: sumbunya sama dengan sumbu gulir, jadi
 * ada "melawan arah" yang bisa terasa. `kiri`/`kanan` bergerak mendatar dan
 * `skala` tidak punya arah sama sekali -- keduanya tetap seperti semula.
 */
function pilihVarian(arah: Arah, arahGulir: ArahGulir) {
  if (arah === "kiri") return masukKiri;
  if (arah === "kanan") return masukKanan;
  if (arah === "skala") return masukSkala;
  return arahGulir === "naik" ? masukDariAtas : masuk;
}

/* Ambang pemicu. Dipakai sama di semua komponen di berkas ini supaya elemen
   yang bersebelahan tidak pernah terpicu di garis yang berbeda. */
const VIEWPORT = { once: false, margin: "-8% 0px -8% 0px" } as const;

/**
 * `animate="hidden"` WAJIB ADA, dan alasannya halus.
 *
 * `PageTransition` di root memakai `animate="show"`. Framer Motion
 * mewariskan label varian dari induk ke setiap komponen motion di bawahnya
 * yang tidak menyatakan `animate`-nya sendiri. Urutan prioritasnya:
 * `animate` < `whileInView`. Jadi selama elemen ADA di layar, `whileInView`
 * menang dan tampil benar -- tapi begitu keluar layar, `whileInView` mati
 * dan elemen jatuh kembali ke `animate` warisan, yaitu "show". Akibatnya
 * elemen tidak pernah balik ke keadaan tersembunyi, dan `once: false` tidak
 * ada gunanya karena tidak ada lagi yang tersisa untuk dianimasikan.
 *
 * Menyatakan `animate="hidden"` di sini memutus pewarisan itu: di luar layar
 * elemen kembali tersembunyi (sambil memudar keluar, jadi meninggalkan layar
 * pun ada gerakannya), dan `whileInView` tetap menang saat elemen masuk.
 */
const ANIMATE_LUAR_LAYAR = "hidden";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Tunda mulai, dalam detik. Untuk elemen yang harus muncul belakangan. */
  delay?: number;
  /** Elemen HTML yang dipakai. Bawaan: div. */
  as?: "div" | "section" | "li" | "span" | "p";
  /** Arah datang. Bawaan "atas" -- variasikan antar bagian supaya tidak monoton. */
  arah?: Arah;
};

/**
 * Gerakan MASUK: memudar muncul + bergeser, mengikuti arah gulir.
 *
 * `once: false` (diubah 11 Sep 2026 atas permintaan pemilik produk): animasi
 * BERULANG tiap kali elemen masuk layar, bukan sekali seumur halaman.
 * Sebelumnya `once: true` -- setelah satu kali jalan elemen mati selamanya,
 * jadi menggulir balik ke atas tidak menghasilkan gerakan apa pun dan
 * halaman terasa beku di kunjungan kedua ke bagian yang sama.
 *
 * Hanya `transform` dan `opacity` yang dianimasikan, jadi pengulangan ini
 * tidak memicu perhitungan ulang tata letak walau berjalan terus-menerus
 * sepanjang gulir.
 *
 * Kalau pengguna mematikan animasi di setelan perangkatnya, elemen langsung
 * tampil tanpa gerakan -- aturan itu tidak ikut dicabut.
 */
export function Reveal({ children, className, delay = 0, as = "div", arah = "atas" }: RevealProps) {
  const kurangiGerak = useReducedMotion();
  const arahGulir = useArahGulir();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      variants={kurangiGerak ? diam : pilihVarian(arah, arahGulir)}
      initial="hidden"
      animate={ANIMATE_LUAR_LAYAR}
      whileInView="show"
      viewport={VIEWPORT}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Pembungkus untuk sekelompok elemen yang masuk berurutan (jeda 120ms).
 * Pakai bersama <RevealItem> sebagai anak langsungnya.
 *
 * Saat menggulir naik, urutannya dibalik (`staggerDirection: -1`): yang
 * terdekat dengan pandangan mata bergerak lebih dulu.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
}: Omit<RevealProps, "delay">) {
  const kurangiGerak = useReducedMotion();
  const arahGulir = useArahGulir();
  const Tag = motion[as];

  const varian =
    arahGulir === "naik"
      ? {
          ...masukGroup,
          show: {
            ...masukGroup.show,
            transition: {
              ...(masukGroup.show as { transition: object }).transition,
              staggerDirection: -1,
            },
          },
        }
      : masukGroup;

  return (
    <Tag
      className={className}
      variants={kurangiGerak ? diam : varian}
      initial="hidden"
      animate={ANIMATE_LUAR_LAYAR}
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </Tag>
  );
}

/** Anak dari <RevealGroup>. Tidak berguna kalau dipakai sendirian. */
export function RevealItem({
  children,
  className,
  as = "div",
  arah = "atas",
}: Omit<RevealProps, "delay">) {
  const kurangiGerak = useReducedMotion();
  const arahGulir = useArahGulir();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      variants={kurangiGerak ? diam : pilihVarian(arah, arahGulir)}
    >
      {children}
    </Tag>
  );
}
