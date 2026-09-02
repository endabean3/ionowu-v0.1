import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { LatarBagian } from "@/components/sections/LatarBagian";
import { daftarLayanan } from "@/lib/data/layanan";
import { IKON_LAYANAN } from "@/lib/data/ikon-layanan";
import { copy, type Locale, withLocale } from "@/lib/i18n";

export function Layanan({ locale = "id" }: { locale?: Locale }) {
  const c = copy[locale];
  const layanan = daftarLayanan(locale);

  return (
    <Section id="layanan" className="section-texture relative overflow-hidden">
      <LatarBagian sisi="kiri" />
      <Container className="relative z-10">
        <SectionHeading
          title={c.home.servicesTitle}
          lead={c.home.servicesLead}
        />

        {/* 3 kolom rata di layar besar -- dulu 6-kolom dengan lebar kartu
            campuran (2 span-3, 4 span-2) yang menyisakan satu kartu terakhir
            sendirian dengan ruang kosong lebar di sampingnya (6 item, lebar
            2+2+2 tidak habis membagi 6 kolom di baris terakhir). 6 item ÷ 3
            kolom = pas 2 baris penuh, tidak ada sisa. */}
        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {layanan.map((l) => {
            const Ikon = IKON_LAYANAN[l.ikon];
            return (
              <RevealItem key={l.slug} arah="skala">
                <Link
                  href={withLocale(`/layanan/${l.slug}`, locale)}
                  className="group block h-full"
                >
                  <SpotlightCard className="h-full min-h-[15rem]">
                    <Ikon
                      size={28}
                      weight="light"
                      className="text-accent transition-transform duration-mid ease-out group-hover:-translate-y-1 group-hover:rotate-6 group-hover:scale-110"
                      aria-hidden
                    />
                    <h3 className="mt-5 text-h3 text-ink">{l.judul}</h3>
                    <p className="mt-3 text-ink-muted">{l.kalimat}</p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-small font-medium text-ink-muted transition-colors duration-mid ease-out group-hover:text-accent">
                      {c.common.learnMore}
                      <ArrowUpRight
                        size={16}
                        weight="bold"
                        aria-hidden
                        className="transition-transform duration-mid ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </span>
                  </SpotlightCard>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
