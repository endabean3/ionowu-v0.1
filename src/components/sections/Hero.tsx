import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BlurReveal } from "@/components/motion/BlurReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Magnet } from "@/components/motion/Magnet";
import { HeroBackground } from "@/components/sections/HeroBackground";
import { copy, type Locale, withLocale } from "@/lib/i18n";

/**
 * Bagian pembuka (dokumen 03, dokumen 07 Tahap 2).
 *
 * Ini bagian yang paling menentukan kesan pertama — lihat "Cara Menguji
 * Apakah Sudah Terasa Mahal" di dokumen 06 sebelum mengubah apa pun di sini.
 */
export function Hero({ locale = "id" }: { locale?: Locale }) {
  const c = copy[locale];

  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden border-b border-line">
      <HeroBackground />

      <Container className="relative z-raised grid gap-10 pt-28 pb-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.55fr)] lg:items-end lg:pt-24">
        <BlurReveal
          as="h1"
          text={c.home.heroTitle}
          className="max-w-5xl text-h1 text-ink sm:text-display"
        />

        <Reveal delay={0.25} className="lg:pb-3">
          <p className="max-w-prose text-lead text-ink-muted">
            {c.home.heroLead}
          </p>
        </Reveal>

        <Reveal delay={0.4} className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <Magnet jangkauan={70} kekuatan={5}>
              <Button href={withLocale("/kontak", locale)} size="lg">
                {c.common.consult}
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Button>
            </Magnet>
            <Button href={withLocale("/karya", locale)} size="lg" variant="secondary">
              {c.common.viewWork}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
