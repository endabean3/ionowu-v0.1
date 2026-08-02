import {
  Headset,
  Compass,
  Hammer,
  RocketLaunch,
  Heartbeat,
} from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { copy, type Locale } from "@/lib/i18n";
const IKON = [Headset, Compass, Hammer, RocketLaunch, Heartbeat];

export function CaraKerja({ locale = "id" }: { locale?: Locale }) {
  const c = copy[locale];

  return (
    <Section id="cara-kerja" className="border-t border-line bg-surface-1/40">
      <Container>
        <SectionHeading title={c.home.processTitle} />

        <RevealGroup className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {c.process.map(([judul, kalimat], i) => {
            const Ikon = IKON[i];
            return (
              <RevealItem key={judul} className="border-t border-line pt-6">
                <div className="tabular text-small text-accent">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <Ikon size={24} weight="light" className="mt-4 text-ink-muted" aria-hidden />
                <h3 className="mt-4 text-h3 text-ink">{judul}</h3>
                <p className="mt-2 text-small text-ink-muted">{kalimat}</p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
