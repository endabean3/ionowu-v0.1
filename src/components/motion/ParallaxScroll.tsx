"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";

type ParallaxScrollProps = {
  children: ReactNode;
  className?: string;
  /**
   * Seberapa jauh lapisan ini bergeser sepanjang bagiannya, dalam persen
   * tinggi elemen sendiri. Negatif = bergerak naik lebih cepat dari halaman
   * (terasa DEKAT), positif = tertinggal di belakang (terasa JAUH).
   *
   * Aturan dari data motion: jaga di kisaran 5-15 supaya latar dan konten
   * tidak pernah lepas sinkron sampai mengganggu.
   */
  kecepatan?: number;
};

/**
 * Lapisan yang bergeser mengikuti POSISI GULIR -- ini inti efek parallax yang
 * sebenarnya, dan bedanya besar dengan `Parallax2D` (yang mengikuti kursor):
 *
 * - `Parallax2D` hanya hidup kalau ada kursor. Di HP, dan selama pengguna
 *   menggulir tanpa menggerakkan mouse, efeknya NOL. Itu sebabnya kesan
 *   "berlapis" tidak pernah terasa walaupun komponennya terpasang.
 * - Komponen ini terikat ke gulir, jadi bekerja di HP maupun laptop, dan
 *   justru paling terasa saat pengguna melakukan hal yang paling sering
 *   mereka lakukan di sebuah halaman: menggulir.
 *
 * Keduanya boleh dipakai bersama pada elemen berbeda -- sumbu geraknya beda
 * (gulir = vertikal sepanjang halaman, kursor = dua arah lokal).
 *
 * Dipakai HANYA untuk lapisan latar/dekorasi, tidak pernah untuk teks bacaan
 * atau kontrol -- memparalaks badan teks membuat susah dibaca dan bisa
 * memicu mual (aturan `parallax-subtle`).
 */
export function ParallaxScroll({
  children,
  className,
  kecepatan = 12,
}: ParallaxScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const kurangiGerak = useReducedMotion();

  /* offset: dari saat bagian ini mulai masuk layar sampai keluar sepenuhnya,
     jadi progresnya 0->1 persis selama lapisan terlihat. */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* Pegas lembut supaya geraknya meluncur, bukan menempel kaku ke tiap
     piksel gulir -- roda mouse yang meloncat-loncat jadi tidak terasa patah. */
  const progresHalus = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 26,
    restDelta: 0.001,
  });

  const y = useTransform(
    progresHalus,
    [0, 1],
    kurangiGerak ? ["0%", "0%"] : [`${kecepatan}%`, `${-kecepatan}%`],
  );

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
