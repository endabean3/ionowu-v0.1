"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Fragment, useMemo } from "react";
import { duration, ease } from "@/lib/motion";
import { useArahGulir } from "@/lib/arah-gulir";

type BlurRevealProps = {
  text: string;
  className?: string;
  /** Jeda antar kata, dalam detik. */
  delayAntarKata?: number;
  /** Tunda mulai animasi seluruh judul. */
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

/** Versi tanpa gerak: kata langsung terbaca di posisi akhir. */
const kataDiam: Variants = {
  hidden: { opacity: 1, filter: "blur(0px)", y: 0, rotate: 0 },
  show: { opacity: 1, filter: "blur(0px)", y: 0, rotate: 0, transition: { duration: 0 } },
};

/** Kata genap datang dari atas-kiri, ganjil dari bawah-kanan. */
function kataVarian(dariAtas: boolean): Variants {
  return {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
      y: dariAtas ? -22 : 18,
      rotate: dariAtas ? -3 : 3,
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      rotate: 0,
      transition: { duration: duration.slow, ease: ease.out },
    },
  };
}

/**
 * Judul muncul dari buram jadi jelas, kata per kata.
 *
 * Diadaptasi dari referensi/react-bits/.../TextAnimations/BlurText — sudah
 * memakai `motion` (bukan GSAP), jadi tidak menambah pustaka baru ke bujet.
 *
 * Dua hal diubah 11 Sep 2026 (permintaan pemilik produk: "selalu ada animasi
 * saat digulir naik maupun turun"):
 *
 * 1. `once: false` -- judul beranimasi ulang setiap kali masuk layar, bukan
 *    sekali seumur halaman.
 *
 * 2. Pemicunya pindah dari tiap KATA ke seluruh JUDUL. Ini wajib begitu
 *    animasinya diulang: kalau tiap kata memantau layarnya sendiri, judul
 *    dua baris yang sedang melewati tepi layar akan punya baris atas yang
 *    sudah balik jadi buram sementara baris bawah masih tajam -- terlihat
 *    seperti kerusakan, bukan animasi. Sekarang satu judul = satu pemicu,
 *    dan urutan antar katanya diatur induknya lewat `staggerChildren`.
 */
export function BlurReveal({
  text,
  className,
  delayAntarKata = 0.09,
  delay = 0,
  as = "h1",
}: BlurRevealProps) {
  const kurangiGerak = useReducedMotion();
  const arahGulir = useArahGulir();
  const daftarKata = useMemo(() => text.split(" "), [text]);
  const Tag = motion[as];

  /* Saat menggulir naik, kata terakhir yang lebih dulu muncul -- urutannya
     mengikuti arah datang mata, bukan selalu kiri ke kanan. */
  const varianJudul: Variants = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: delayAntarKata,
          delayChildren: delay,
          staggerDirection: arahGulir === "naik" ? -1 : 1,
        },
      },
    }),
    [delayAntarKata, delay, arahGulir],
  );

  return (
    <Tag
      className={className}
      variants={kurangiGerak ? kataDiam : varianJudul}
      initial="hidden"
      /* Lihat catatan panjang di Reveal.tsx: tanpa `animate` eksplisit, judul
         ini mewarisi "show" dari PageTransition begitu keluar layar dan tidak
         pernah kembali ke keadaan buram. */
      animate="hidden"
      whileInView="show"
      viewport={{ once: false, margin: "-8% 0px -8% 0px" }}
    >
      {daftarKata.map((satuKata, i) => (
        <Fragment key={`${satuKata}-${i}`}>
          <motion.span
            className="inline-block"
            style={{ willChange: "transform, filter, opacity" }}
            variants={kurangiGerak ? kataDiam : kataVarian(i % 2 === 0)}
          >
            {satuKata}
          </motion.span>
          {i < daftarKata.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
