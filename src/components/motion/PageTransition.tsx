"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { diam, pindahHalaman } from "@/lib/motion";

/**
 * Gerakan PINDAH HALAMAN (dokumen 06): memudar + naik 12px, 400ms.
 * Keluar lebih cepat dari masuk (~65%), sudah diatur di `pindahHalaman`.
 *
 * `mode="wait"` berarti halaman lama selesai keluar dulu baru halaman baru
 * masuk — tidak ada dua halaman terlihat bertumpuk di layar yang sama.
 *
 * Header di layout.tsx sengaja TIDAK dibungkus ini — dia `position: fixed`
 * dan harus tetap diam saat konten di baliknya berpindah.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const kurangiGerak = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={kurangiGerak ? diam : pindahHalaman}
        initial="hidden"
        animate="show"
        exit="exit"
        // flex+flex-1: supaya <main className="flex-1"> di tiap halaman
        // masih bisa mengisi sisa tinggi layar (footer tetap di bawah),
        // sekarang lewat pembungkus ini alih-alih langsung anak <body>.
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
