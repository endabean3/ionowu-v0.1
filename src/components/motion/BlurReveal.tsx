"use client";

import { motion, useReducedMotion } from "motion/react";
import { Fragment, useMemo } from "react";
import { ease } from "@/lib/motion";

type BlurRevealProps = {
  text: string;
  className?: string;
  /** Jeda antar kata, dalam detik. */
  delayAntarKata?: number;
  /** Tunda mulai animasi seluruh judul. */
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

/**
 * Judul muncul dari buram jadi jelas, kata per kata.
 *
 * Diadaptasi dari referensi/react-bits/.../TextAnimations/BlurText — sudah
 * memakai `motion` (bukan GSAP), jadi tidak menambah pustaka baru ke bujet.
 *
 * Dipakai di setiap judul besar (hero + setiap `SectionHeading`) — batas
 * "maksimal 2 per halaman" dicabut, tapi tetap `whileInView`/sekali jalan
 * lewat `Reveal`, jadi tidak semuanya berjalan bersamaan saat halaman dibuka.
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

  return (
    <Tag className={className}>
      {daftarKata.map((satuKata, i) => (
        <Fragment key={`${satuKata}-${i}`}>
          <motion.span
            className="inline-block"
            style={{ willChange: "transform, filter, opacity" }}
            initial={
              kurangiGerak
                ? { opacity: 1, filter: "blur(0px)", y: 0 }
                : { opacity: 0, filter: "blur(10px)", y: -24 }
            }
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{
              duration: kurangiGerak ? 0 : 0.7,
              ease: ease.out,
              delay: kurangiGerak ? 0 : delay + i * delayAntarKata,
            }}
          >
            {satuKata}
          </motion.span>
          {i < daftarKata.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
