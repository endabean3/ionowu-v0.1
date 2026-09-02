import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { BlurReveal } from "@/components/motion/BlurReveal";
import { Magnet } from "@/components/motion/Magnet";
import { LatarBagian } from "@/components/sections/LatarBagian";
import { copy, type Locale, withLocale } from "@/lib/i18n";

/**
 * Bagian terakhir sebelum kaki halaman (dokumen 03).
 * Besar, lapang, satu tombol saja — bukan dua seperti di hero.
 */
export function AjakanPenutup({ locale = "id" }: { locale?: Locale }) {
  const c = copy[locale];

  return (
    <Section className="section-texture relative overflow-hidden border-t border-line">
      <LatarBagian sisi="kiri" />
      <Container width="prose" className="relative z-10 text-center">
        <Reveal arah="skala">
          <BlurReveal as="h2" text={c.home.finalTitle} className="text-h1 text-ink block" />
          <p className="mt-6 text-lead text-ink-muted">
            {c.home.finalLead}
          </p>
          <div className="mt-10 flex justify-center">
            <Magnet jangkauan={70} kekuatan={5}>
              <Button href={withLocale("/kontak", locale)} size="lg">
                {c.common.consult}
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Button>
            </Magnet>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
