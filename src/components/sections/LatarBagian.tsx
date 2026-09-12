import { ParallaxScroll } from "@/components/motion/ParallaxScroll";

type LatarBagianProps = {
  /** Sisi tempat gumpalan utama duduk. Diselang-seling antar bagian. */
  sisi?: "kiri" | "kanan";
  /** Kecepatan geser lapisan JAUH (gumpalan cahaya), persen. */
  kecepatan?: number;
};

/**
 * Lapisan latar untuk satu bagian halaman: gumpalan cahaya warna brand yang
 * mengambang pelan (CSS) DAN kisi titik, keduanya ikut bergeser saat halaman
 * digulir -- tapi dengan KECEPATAN BERBEDA.
 *
 * Selisih kecepatan itulah inti perbaikan 12 Sep 2026. Versi sebelumnya
 * sudah memakai ParallaxScroll dan lapisannya memang bergeser ~44px, tapi
 * satu-satunya yang bergerak adalah gumpalan ber-`blur(90px)` pada
 * `opacity: 0.16` -- tidak ada tepi, tidak ada patokan, jadi tidak ada yang
 * bisa ditangkap mata. Pemilik produk melaporkannya sebagai "parallax belum
 * ada", dan secara pengalaman pengguna memang benar walau kodenya jalan.
 *
 * Sekarang ada dua lapisan:
 * - Gumpalan cahaya, kecepatan RENDAH -> terbaca sebagai lapisan paling jauh.
 * - Kisi titik, kecepatan LEBIH TINGGI -> punya struktur 24px yang jelas,
 *   jadi pergeserannya terhadap isi halaman langsung terlihat.
 *
 * Dua lapisan dengan laju berbeda inilah yang menjual ilusi kedalaman;
 * satu lapisan sendirian tidak pernah bisa, sekencang apa pun digerakkan.
 *
 * Selalu `aria-hidden` dan `pointer-events-none`: murni dekorasi, tidak
 * pernah ikut urutan baca pembaca layar dan tidak pernah menghalangi klik.
 * Wadah pemanggil WAJIB punya `position: relative` dan `overflow-hidden`.
 */
export function LatarBagian({ sisi = "kiri", kecepatan = 8 }: LatarBagianProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Lapisan JAUH: cahaya sudut, bergerak paling sedikit. */}
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

      {/* Lapisan DEKAT: kisi titik. `-inset-y-1/4` memberi ruang lebih supaya
          tepi atas/bawah kisi tidak pernah masuk layar saat bergeser. */}
      <ParallaxScroll kecepatan={kecepatan * 2.5} className="absolute inset-0">
        <div className="kisi-gerak absolute -inset-y-1/4 inset-x-0" />
      </ParallaxScroll>
    </div>
  );
}
