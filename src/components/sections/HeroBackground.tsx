"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/* Dimuat terpisah dari paket JS awal — `ogl` tidak boleh membebani
   setiap halaman, hanya halaman yang benar-benar menampilkan Aurora. */
const Aurora = dynamic(() => import("@/components/bits/Aurora"), { ssr: false });

/** Baca token warna dari CSS, bukan menulis ulang nilainya di sini.
 *  WebGL tidak bisa membaca `var()` langsung, jadi resolusinya dilakukan
 *  di JavaScript, sekali, saat komponen dipasang. */
function bacaWarnaToken(): [string, string, string] {
  const s = getComputedStyle(document.documentElement);
  const ambil = (nama: string, cadangan: string) => s.getPropertyValue(nama).trim() || cadangan;
  // token-ok: cadangan kalau getPropertyValue gagal, nilainya menyalin token — bukan sumber baru
  return [
    ambil("--navy-500", "#103F69"), // token-ok: cadangan, menyalin --navy-500
    ambil("--teal-500", "#0F9B9C"), // token-ok: cadangan, menyalin --teal-500
    ambil("--teal-400", "#22C7C8"), // token-ok: cadangan, menyalin --teal-400
  ];
}

/**
 * Latar hero.
 *
 * Aturan bujet performa (dokumen 06): maksimal satu latar WebGL per halaman,
 * dan WAJIB punya gantinya. Aturan mainnya:
 *
 * - Di bawah 768px (HP): tidak pernah memuat WebGL. Gradasi CSS saja.
 * - Kalau pengguna mematikan animasi: tidak memuat WebGL.
 * - Kalau WebGL2 gagal diinisialisasi: mundur ke gradasi CSS.
 *
 * Gradasi CSS (`.glow-field`) selalu ada di baliknya, jadi tidak pernah
 * ada jeda layar kosong menunggu WebGL siap.
 */
export function HeroBackground() {
  const [aktifkanAurora, setAktifkanAurora] = useState(false);
  const [gagal, setGagal] = useState(false);
  const [warna, setWarna] = useState<[string, string, string] | null>(null);

  useEffect(() => {
    // Sintaks media query CSS tidak bisa menerima var(); breakpoint 768px
    // ditulis literal di sini — sama dengan breakpoint "md" bawaan Tailwind.
    const cekLayar = window.matchMedia("(min-width: 768px)"); // token-ok: media query tidak bisa var()
    const cekGerak = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evaluasi = () => {
      setWarna(bacaWarnaToken());
      setAktifkanAurora(cekLayar.matches && !cekGerak.matches);
    };
    evaluasi();

    cekLayar.addEventListener("change", evaluasi);
    cekGerak.addEventListener("change", evaluasi);
    return () => {
      cekLayar.removeEventListener("change", evaluasi);
      cekGerak.removeEventListener("change", evaluasi);
    };
  }, []);

  return (
    <div className="glow-field absolute inset-0 overflow-hidden">
      {aktifkanAurora && !gagal && warna && (
        // Aurora aslinya dibuat untuk panel pendek dan lebar (dokumen 06:
        // "sedikit efek, dipakai berulang" — bukan "diregangkan sampai bentuknya
        // berubah"). Di hero setinggi layar penuh, tingginya dibatasi dan
        // dipudarkan ke bawah lewat .aurora-fade supaya menyatu dengan
        // .glow-field CSS di baliknya, bukan berhenti dengan tepi keras.
        <div className="aurora-fade absolute inset-x-0 top-0 h-[min(70vh,44rem)] opacity-45">
          {/* Amplitude dan blend diturunkan dari 1.2/0.7 bawaan sebelumnya --
              nilai itu membuat aurora menyala lebih terang dari default
              komponennya sendiri (0.9/0.5). Warna brand tidak diubah (tidak
              boleh, lihat globals.css), tapi versi terangnya justru yang
              membuat kesan "neon". Diturunkan di bawah bahkan default
              komponen supaya latar terasa lembut, bukan bercahaya keras --
              lebih dekat ke pastel walau hue-nya sama persis. */}
          <Aurora
            colorStops={warna}
            amplitude={0.6}
            blend={0.35}
            speed={0.35}
            onError={() => setGagal(true)}
          />
        </div>
      )}
    </div>
  );
}
