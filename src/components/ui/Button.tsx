"use client";

import Link from "next/link";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ease, sentuh, tekan } from "@/lib/motion";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

/* Tampilan tombol diatur oleh kelas komponen di globals.css, bukan oleh
   tumpukan utility. Lihat catatan "KOMPONEN" di berkas itu untuk alasannya. */
const varian: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

const ukuran: Record<Size, string> = {
  md: "btn-md",
  lg: "btn-lg",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<HTMLMotionProps<"button">, keyof CommonProps> & { href?: never };

type ButtonAsLink = CommonProps & { href: string };

/**
 * Tombol.
 *
 * Sudah membawa gerakan SENTUH dan TEKAN dari dokumen 06.
 * Pakai `href` untuk membuat tautan, tanpa `href` untuk tombol biasa.
 *
 * Keadaan yang sudah ditangani: biasa, disentuh, ditekan, difokus keyboard,
 * dan tidak aktif.
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    children,
    variant = "primary",
    size = "md",
    className,
    ...rest
  } = props;
  const kurangiGerak = useReducedMotion();

  const kelas = cn("btn", varian[variant], ukuran[size], className);

  /* SENTUH (naik 4px) + TEKAN (mengecil 98%).
     Keduanya memakai transform saja — tidak memicu perhitungan ulang tata letak. */
  const gerak = kurangiGerak
    ? {}
    : {
        whileHover: sentuh.hover,
        whileTap: { scale: tekan.scale },
        transition: { duration: sentuh.durationSec, ease: ease.out },
      };

  if ("href" in rest && rest.href) {
    /* motion.span jadi pembungkus supaya <Link> tetap elemen <a> biasa —
       lebih aman untuk keyboard dan pembaca layar. */
    return (
      <motion.span className="inline-flex" {...gerak}>
        <Link href={rest.href} className={kelas}>
          {children}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.button
      className={kelas}
      {...gerak}
      {...(rest as HTMLMotionProps<"button">)}
    >
      {children}
    </motion.button>
  );
}
