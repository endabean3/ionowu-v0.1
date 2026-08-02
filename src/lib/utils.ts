import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* ============================================================
   tailwind-merge harus dikenalkan pada token kita.

   Kalau tidak, dia salah menebak. Contoh nyata yang sempat terjadi:
   `text-on-signal` (warna) dianggap bentrok dengan `text-lead` (ukuran huruf),
   lalu dibuang. Akibatnya teks tombol jadi putih di atas oranye — 2,71:1,
   gagal WCAG. Daftar di bawah mencegah tebakan yang salah itu.

   Setiap menambah token baru di globals.css, tambahkan juga di sini.
   ============================================================ */

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // --text-* (ukuran huruf)
      text: ["display", "h1", "h2", "h3", "lead", "body", "small"],
      // --color-*
      color: [
      "base",
      "surface-1",
      "surface-2",
      "line",
      "ink",
      "ink-muted",
      "brand-navy",
      "brand-teal",
      "brand-orange",
      "accent",
      "accent-deep",
        "signal",
        "on-signal",
        "on-accent",
      ],
      // --radius-*
      radius: ["button", "card", "panel", "media"],
      // --shadow-*
      shadow: ["glow-sm", "glow", "glow-signal", "lift"],
      // --spacing-*
      spacing: ["section", "section-lg", "gutter"],
      // --container-*
      container: ["content", "prose"],
      // --font-*
      font: ["display", "sans", "mono"],
    },
    classGroups: {
      // Utility buatan sendiri (@utility di globals.css)
      duration: [{ duration: ["fast", "mid", "slow", "hero"] }],
      z: [{ z: ["raised", "sticky", "overlay", "modal", "toast"] }],
    },
  },
});

/** Gabungkan kelas Tailwind. Kelas yang bentrok, yang terakhir menang. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
