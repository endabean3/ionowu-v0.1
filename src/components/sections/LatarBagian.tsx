import { ParallaxScroll } from "@/components/motion/ParallaxScroll";

type LatarBagianProps = {
  /** Sisi tempat gumpalan utama duduk. Diselang-seling antar bagian. */
  sisi?: "kiri" | "kanan";
  /** Kecepatan geser saat digulir, persen. Makin besar makin terasa "jauh". */
  kecepatan?: number;
};

/**
 * Lapisan latar untuk satu bagian halaman: dua gumpalan cahaya warna brand
 * yang mengambang pelan (CSS) DAN ikut bergeser saat halaman digulir
 * (ParallaxScroll) -- dua sumber gerak berbeda pada satu lapisan, jadi latar
 * tidak pernah benar-benar diam.
 *
 * Ini menjawab dua keluhan sekaligus:
 * - "background masih polos": sekarang ada cahaya yang bergerak, bukan cuma
 *   warna rata dengan titik nyaris tak terlihat.
 * - "konsep parallax tidak terwujud": gumpalan ini bergerak dengan kecepatan
 *   berbeda dari isi bagiannya saat digulir, dan itu bekerja di HP juga --
 *   tidak butuh kursor seperti versi sebelumnya.
 *
 * Selalu `aria-hidden` dan `pointer-events-none`: murni dekorasi, tidak
 * pernah ikut urutan baca pembaca layar dan tidak pernah menghalangi klik.
 * Wadah pemanggil WAJIB punya `position: relative` dan `overflow-hidden`.
 */
export function LatarBagian({ sisi = "kiri", kecepatan = 10 }: LatarBagianProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <ParallaxScroll kecepatan={kecepatan} className="absolute inset-0">
        <div
          className={
            "blob-drift h-[26rem] w-[26rem] bg-[var(--brand-teal)] " +
            (sisi === "kiri" ? "-top-32 -left-24" : "-top-32 -right-24")
          }
        />
        <div
          className={
            "blob-drift blob-drift-lambat h-[32rem] w-[32rem] bg-[var(--brand-navy)] " +
            (sisi === "kiri" ? "-right-32 bottom-0" : "bottom-0 -left-32")
          }
        />
      </ParallaxScroll>
    </div>
  );
}
