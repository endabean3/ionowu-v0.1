import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { Layanan } from "@/components/sections/Layanan";
import { ProdukKami } from "@/components/sections/ProdukKami";
import { CaraKerja } from "@/components/sections/CaraKerja";
import { KaryaPilihan } from "@/components/sections/KaryaPilihan";
import { Perawatan } from "@/components/sections/Perawatan";
import { AjakanPenutup } from "@/components/sections/AjakanPenutup";
import { copy, localizedAlternates } from "@/lib/i18n";

/* ============================================================
   BERANDA — Tahap 3.
   Urutan sengaja (dokumen 03): dari "wow" ke "yakin" ke "ayo hubungi".

   Bagian Testimoni SENGAJA tidak ada — dokumen 03: "kalau belum ada satu
   pun testimoni sungguhan, hapus bagiannya. Jangan diisi testimoni palsu."
   Bagian Statistik/angka juga sengaja tidak ada — jumlah proyek/tahun/klien
   masih `[BELUM ADA]` di dokumen 01, dan dokumen 01 sendiri melarang
   mengarang angka.

   Footer TIDAK ditulis di sini — dipasang sekali di layout.tsx untuk
   seluruh situs (dokumen 07 Tahap 4: pernah lupa dipasang di halaman lain).
   ============================================================ */

export const metadata: Metadata = {
  title: copy.id.metadata.title,
  description: copy.id.metadata.description,
  alternates: localizedAlternates("/"),
  openGraph: {
    title: copy.id.metadata.title,
    description: copy.id.metadata.ogDescription,
    locale: "id_ID",
  },
};

export default function Beranda() {
  return (
    <main className="flex-1">
      <Hero locale="id" />
      <TechMarquee />
      <Layanan locale="id" />
      <ProdukKami locale="id" />
      <CaraKerja locale="id" />
      <KaryaPilihan locale="id" />
      <Perawatan locale="id" />
      <AjakanPenutup locale="id" />
    </main>
  );
}
