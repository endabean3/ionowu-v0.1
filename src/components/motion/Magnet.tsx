"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

type MagnetProps = {
  children: ReactNode;
  className?: string;
  /** Jarak dari tepi elemen yang mulai menarik kursor, dalam piksel. */
  jangkauan?: number;
  /** Makin besar, makin lemah tarikannya. */
  kekuatan?: number;
};

/**
 * Elemen tertarik mengikuti kursor saat kursor mendekat.
 * Diadaptasi dari referensi/react-bits — tanpa dependensi tambahan.
 *
 * Dokumen 06: efek kursor maksimal SATU jenis untuk seluruh website.
 * Ini dipakai HANYA untuk tombol aksi utama di hero.
 *
 * Mati otomatis di HP (tidak ada kursor) dan saat animasi dimatikan.
 */
export function Magnet({ children, className, jangkauan = 80, kekuatan = 4 }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [posisi, setPosisi] = useState({ x: 0, y: 0 });
  const [aktif, setAktif] = useState(false);
  const kurangiGerak = useReducedMotion();

  useEffect(() => {
    if (kurangiGerak) return;
    // Perangkat tanpa kursor (sentuh murni) tidak punya "hover" yang berarti.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const { left, top, width, height } = el.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      const distX = Math.abs(cx - e.clientX);
      const distY = Math.abs(cy - e.clientY);

      if (distX < width / 2 + jangkauan && distY < height / 2 + jangkauan) {
        setAktif(true);
        setPosisi({ x: (e.clientX - cx) / kekuatan, y: (e.clientY - cy) / kekuatan });
      } else {
        setAktif(false);
        setPosisi({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [jangkauan, kekuatan, kurangiGerak]);

  return (
    <div ref={ref} className={className} style={{ display: "inline-block" }}>
      <div
        style={{
          transform: `translate3d(${posisi.x}px, ${posisi.y}px, 0)`,
          // Dokumen 04: dilarang `ease`/`linear` bawaan — pakai token kelengkungan gerak.
          transition: aktif
            ? "transform var(--duration-mid) var(--ease-out)"
            : "transform var(--duration-slow) var(--ease-in-out)",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
