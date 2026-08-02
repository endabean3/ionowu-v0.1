import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { copy, type Locale, withLocale } from "@/lib/i18n";

/**
 * Bagian terakhir sebelum kaki halaman (dokumen 03).
 * Besar, lapang, satu tombol saja — bukan dua seperti di hero.
 */
export function AjakanPenutup({ locale = "id" }: { locale?: Locale }) {
  const c = copy[locale];

  return (
    <Section className="border-t border-line">
      <Container width="prose" className="text-center">
        <Reveal>
          <h2 className="text-h1 text-ink">
            {c.home.finalTitle}
          </h2>
          <p className="mt-6 text-lead text-ink-muted">
            {c.home.finalLead}
          </p>
          <div className="mt-10 flex justify-center">
            <Button href={withLocale("/kontak", locale)} size="lg">
              {c.common.consult}
              <ArrowRight size={18} weight="bold" aria-hidden />
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
