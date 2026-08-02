"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Kartu dengan cahaya lembut yang mengikuti kursor (dokumen 06 — pilihan
 * utama untuk bagian Layanan). Diadaptasi dari react-bits `SpotlightCard`,
 * disederhanakan: posisi ditulis lewat CSS custom property alih-alih
 * `useState` per piksel, supaya pergerakan kursor tidak memicu render ulang
 * React — hanya style satu elemen yang berubah.
 *
 * Mati otomatis di HP (tidak ada kursor untuk "mengikuti").
 */
export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [aktif, setAktif] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setAktif(true)}
      onMouseLeave={() => setAktif(false)}
      className={cn("card card-interactive relative overflow-hidden", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-slow ease-out"
        style={{
          opacity: aktif ? 1 : 0,
          background:
            "radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgb(15 155 156 / 0.16), transparent 75%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
