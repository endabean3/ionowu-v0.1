"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { diam, masuk, masukGroup, masukKiri, masukKanan, masukSkala } from "@/lib/motion";

/** Arah datang elemen. `atas` = gerakan baku lama (naik 24px). */
type Arah = "atas" | "kiri" | "kanan" | "skala";

const VARIAN_ARAH = {
  atas: masuk,
  kiri: masukKiri,
  kanan: masukKanan,
  skala: masukSkala,
} as const;

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
 * Gerakan MASUK: memudar muncul + bergeser dari satu arah, 600ms.
 * Berjalan sekali saat elemen masuk ke layar, lalu berhenti.
 *
 * Kalau pengguna mematikan animasi di setelan perangkatnya,
 * elemen langsung tampil tanpa gerakan.
 */
export function Reveal({ children, className, delay = 0, as = "div", arah = "atas" }: RevealProps) {
  const kurangiGerak = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      variants={kurangiGerak ? diam : VARIAN_ARAH[arah]}
      initial="hidden"
      whileInView="show"
      /* once: animasi berhenti setelah selesai — hemat tenaga saat menggulir */
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Pembungkus untuk sekelompok elemen yang masuk berurutan (jeda 80ms).
 * Pakai bersama <RevealItem> sebagai anak langsungnya.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
}: Omit<RevealProps, "delay">) {
  const kurangiGerak = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      variants={kurangiGerak ? diam : masukGroup}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
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
  const Tag = motion[as];

  return (
    <Tag className={className} variants={kurangiGerak ? diam : VARIAN_ARAH[arah]}>
      {children}
    </Tag>
  );
}
