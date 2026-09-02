"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { diam, masuk, masukGroup } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Tunda mulai, dalam detik. Untuk elemen yang harus muncul belakangan. */
  delay?: number;
  /** Elemen HTML yang dipakai. Bawaan: div. */
  as?: "div" | "section" | "li" | "span" | "p";
};

/**
 * Gerakan MASUK (dokumen 06): naik 24px + memudar muncul, 600ms.
 * Berjalan sekali saat elemen masuk ke layar, lalu berhenti.
 *
 * Kalau pengguna mematikan animasi di setelan perangkatnya,
 * elemen langsung tampil tanpa gerakan.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const kurangiGerak = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      variants={kurangiGerak ? diam : masuk}
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
}: Omit<RevealProps, "delay">) {
  const kurangiGerak = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag className={className} variants={kurangiGerak ? diam : masuk}>
      {children}
    </Tag>
  );
}
