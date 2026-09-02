import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BlurReveal } from "@/components/motion/BlurReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Magnet } from "@/components/motion/Magnet";
import { Parallax2D } from "@/components/motion/Parallax2D";
import { ParallaxScroll } from "@/components/motion/ParallaxScroll";
import { HeroBackground } from "@/components/sections/HeroBackground";
import { copy, type Locale, withLocale } from "@/lib/i18n";

/**
 * Bagian pembuka (dokumen 03, dokumen 07 Tahap 2).
 *
 * Ini bagian yang paling menentukan kesan pertama — lihat "Cara Menguji
 * Apakah Sudah Terasa Mahal" di dokumen 06 sebelum mengubah apa pun di sini.
 *
 * Tata letak diperbaiki 2 Sep 2026. Versi sebelumnya memakai grid dua kolom
 * (`1.05fr / 0.55fr`, `items-end`): di layar 1440px hasilnya judul raksasa
 * menempel kiri, paragraf kecil melayang di tengah-kanan tanpa garis bantu
 * apa pun, dan seperempat layar kanan-bawah kosong melompong. Sekarang satu
 * kolom kiri dengan lebar baca yang dibatasi -- judul, penjelas, lalu tombol
 * menurun dalam satu garis pandang, dan sisi kanan sengaja diserahkan ke
 * latar (Aurora + gumpalan cahaya), bukan diisi teks yang mengambang.
 */
export function Hero({ locale = "id" }: { locale?: Locale }) {
  const c = copy[locale];

  return (
    <section
      data-parallax-root
      className="relative flex min-h-dvh items-center overflow-hidden border-b border-line"
    >
      {/* LAPISAN 1 (paling jauh): Aurora + gumpalan cahaya.
          Dua sumber gerak sekaligus -- bergeser berlawanan arah kursor
          (Parallax2D) DAN tertinggal di belakang saat digulir
          (ParallaxScroll, +18%). Yang kedua inilah yang membuat kedalaman
          benar-benar terasa, karena bekerja tanpa kursor dan saat menggulir. */}
      <ParallaxScroll kecepatan={18} className="absolute inset-0">
        <Parallax2D kekuatan={-22} className="absolute inset-0">
          <HeroBackground />
        </Parallax2D>
      </ParallaxScroll>

      {/* LAPISAN 2 (paling dekat): isi hero, bergerak sedikit lebih cepat
          dari halaman (-6%) supaya jaraknya dengan latar terbaca. */}
      <ParallaxScroll kecepatan={-6} className="relative z-raised w-full">
        <Parallax2D kekuatan={8}>
          <Container className="flex flex-col items-start gap-8 pt-28 pb-20 lg:pt-24">
            <BlurReveal
              as="h1"
              text={c.home.heroTitle}
              className="max-w-[18ch] text-h1 text-balance text-ink sm:text-display"
            />

            <Reveal delay={0.35}>
              <p className="max-w-[52ch] text-lead text-ink-muted">
                {c.home.heroLead}
              </p>
            </Reveal>

            <Reveal delay={0.6}>
              <div className="flex flex-wrap items-center gap-4">
                <Magnet jangkauan={70} kekuatan={5}>
                  <Button href={withLocale("/kontak", locale)} size="lg">
                    {c.common.consult}
                    <ArrowRight size={18} weight="bold" aria-hidden />
                  </Button>
                </Magnet>
                <Magnet jangkauan={70} kekuatan={5}>
                  <Button href={withLocale("/karya", locale)} size="lg" variant="secondary">
                    {c.common.viewWork}
                  </Button>
                </Magnet>
              </div>
            </Reveal>
          </Container>
        </Parallax2D>
      </ParallaxScroll>
    </section>
  );
}
