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
      <Container className="grid gap-14 lg:grid-cols-[minmax(16rem,0.65fr)_minmax(0,1.35fr)] lg:gap-20">
        <SectionHeading
          title={c.home.processTitle}
          className="self-start lg:sticky lg:top-32"
        />

        <RevealGroup className="border-y border-line">
          {c.process.map(([judul, kalimat], i) => {
            const Ikon = IKON[i];
            return (
              <RevealItem
                key={judul}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-line py-7 last:border-b-0 sm:grid-cols-[3rem_minmax(10rem,0.7fr)_minmax(0,1fr)] sm:items-start sm:gap-6 sm:py-8"
              >
                <div className="tabular pt-1 text-small text-accent">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex items-center gap-3">
                  <Ikon size={23} weight="light" className="shrink-0 text-accent" aria-hidden />
                  <h3 className="text-h3 text-ink">{judul}</h3>
                </div>
                <p className="col-start-2 text-small text-ink-muted sm:col-start-3 sm:pt-1">
                  {kalimat}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
