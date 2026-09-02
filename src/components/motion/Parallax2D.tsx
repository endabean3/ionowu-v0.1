"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Parallax2DProps = {
  children: ReactNode;
  className?: string;
  /** Jarak geser maksimal dalam piksel. Negatif = arah berlawanan kursor. */
  kekuatan?: number;
};

const PEGAS = { damping: 26, stiffness: 90, mass: 1.2 };

/**
 * Lapisan yang bergeser mengikuti posisi kursor relatif terhadap elemen
 * terdekat berpenanda `data-parallax-root` -- efek kedalaman 2D: dua lapisan
 * dengan `kekuatan` berlawanan tanda terasa punya jarak, seperti kartu pos
 * berlapis. Dipakai di Hero (dokumen 06 lama membatasi satu efek kursor per
 * situs; batas itu sudah dicabut, lihat catatan di motion.ts).
 *
 * Mati otomatis di HP (tidak ada kursor untuk diikuti) dan saat animasi
 * dimatikan lewat setelan perangkat.
 */
export function Parallax2D({ children, className, kekuatan = 14 }: Parallax2DProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xs = useSpring(x, PEGAS);
  const ys = useSpring(y, PEGAS);
  const kurangiGerak = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (kurangiGerak) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = ref.current?.closest<HTMLElement>("[data-parallax-root]");
    if (!root) return;

    function handleMove(e: MouseEvent) {
      const rect = root!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      x.set(px * kekuatan);
      y.set(py * kekuatan);
    }
    function handleLeave() {
      x.set(0);
      y.set(0);
    }

    root.addEventListener("mousemove", handleMove);
    root.addEventListener("mouseleave", handleLeave);
    return () => {
      root!.removeEventListener("mousemove", handleMove);
      root!.removeEventListener("mouseleave", handleLeave);
    };
  }, [kekuatan, kurangiGerak, x, y]);

  return (
    <motion.div ref={ref} style={{ x: xs, y: ys }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
