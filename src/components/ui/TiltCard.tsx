"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Kekuatan miring, dalam derajat. */
  amplitudo?: number;
};

const PEGAS = { damping: 30, stiffness: 100, mass: 2 };

/**
 * Kartu yang miring mengikuti posisi kursor, seperti dipegang di tangan.
 * Diadaptasi dari react-bits `TiltedCard` (dokumen 06 — bagian Karya
 * Pilihan), disederhanakan: menerima `children` alih-alih satu gambar wajib,
 * karena tangkapan layar proyek belum tersedia (dokumen 03: `[BELUM ADA]`).
 * Kartu diisi pola abstrak, bukan foto stok — sesuai dokumen 04.
 */
export function TiltCard({ children, className, amplitudo = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const kurangiGerak = useReducedMotion();

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const scaleRaw = useMotionValue(1);
  const rotateX = useSpring(rotateXRaw, PEGAS);
  const rotateY = useSpring(rotateYRaw, PEGAS);
  const scale = useSpring(scaleRaw, PEGAS);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (kurangiGerak) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    rotateXRaw.set((offsetY / (rect.height / 2)) * -amplitudo);
    rotateYRaw.set((offsetX / (rect.width / 2)) * amplitudo);
  }

  function handleMouseEnter() {
    if (!kurangiGerak) scaleRaw.set(1.02);
  }

  function handleMouseLeave() {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
    scaleRaw.set(1);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="[perspective:900px]" // token-ok: jarak pandang 3D, bukan skala jarak tata letak
    >
      <motion.div
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        className={cn("card overflow-hidden", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
