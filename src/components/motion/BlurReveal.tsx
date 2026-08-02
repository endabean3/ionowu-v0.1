"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { ease } from "@/lib/motion";

type BlurRevealProps = {
  text: string;
  className?: string;
  /** Jeda antar kata, dalam detik. */
  delayAntarKata?: number;
  /** Tunda mulai animasi seluruh judul. */
  delay?: number;
  as?: "h1" | "h2" | "p" | "span";
};

/**
 * Judul muncul dari buram jadi jelas, kata per kata.
 *
 * Diadaptasi dari referensi/react-bits/.../TextAnimations/BlurText — sudah
 * memakai `motion` (bukan GSAP), jadi tidak menambah pustaka baru ke bujet.
 *
 * Dipakai HANYA untuk judul pembuka halaman (dokumen 06: animasi teks berat
 * maksimal 2 per halaman).
 */
export function BlurReveal({
  text,
  className,
  delayAntarKata = 0.09,
  delay = 0,
  as = "h1",
}: BlurRevealProps) {
  const kurangiGerak = useReducedMotion();
  const daftarKata = useMemo(() => text.split(" "), [text]);
  const Tag = motion[as];

  if (kurangiGerak) {
    const Statis = as;
    return <Statis className={className}>{text}</Statis>;
  }

  return (
    <Tag className={className}>
      {daftarKata.map((satuKata, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ willChange: "transform, filter, opacity" }}
          initial={{ opacity: 0, filter: "blur(10px)", y: -24 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.7,
            ease: ease.out,
            delay: delay + i * delayAntarKata,
          }}
        >
          {satuKata}
          {i < daftarKata.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
