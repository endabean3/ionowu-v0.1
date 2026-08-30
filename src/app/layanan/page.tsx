import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Container";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { AjakanPenutup } from "@/components/sections/AjakanPenutup";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { daftarLayanan } from "@/lib/data/layanan";
import { IKON_LAYANAN } from "@/lib/data/ikon-layanan";
import { copy, localizedAlternates, withLocale, type Locale } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Layanan Ionowu untuk aplikasi web, sistem informasi, integrasi API, business intelligence, infrastruktur, dan otomasi AI.",
  alternates: localizedAlternates("/layanan"),
  openGraph: {
    title: "Layanan",
    description:
      "Layanan Ionowu untuk aplikasi web, sistem informasi, integrasi API, business intelligence, infrastruktur, dan otomasi AI.",
    locale: "id_ID",
  },
};

export default function HalamanLayanan() {
  return <HalamanLayananContent locale="id" />;
}

export function HalamanLayananContent({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const layanan = daftarLayanan(locale);

  return (
    <main className="flex-1">
      <JsonLd
        data={[
          itemListSchema(
            layanan.map((l) => ({ name: l.judul, path: `/layanan/${l.slug}` })),
            locale,
          ),
          breadcrumbSchema(
            [
              { name: "Ionowu", path: "/" },
              { name: c.nav.services, path: "/layanan" },
            ],
            locale,
          ),
        ]}
      />
      <PageHeader
        title={c.pages.services.title}
        lead={c.pages.services.lead}
      />

      <Section>
        <Container>
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {layanan.map((l) => {
              const Ikon = IKON_LAYANAN[l.ikon];
              return (
                <RevealItem key={l.slug}>
                  <Link
                    href={withLocale(`/layanan/${l.slug}`, locale)}
                    className="group block h-full"
                  >
                    <SpotlightCard className="h-full">
                      <Ikon size={28} weight="light" className="text-accent" aria-hidden />
                      <h2 className="mt-5 text-h3 text-ink">{l.judul}</h2>
                      <p className="mt-3 text-ink-muted">{l.kalimat}</p>
                      <span className="mt-6 inline-flex items-center gap-1.5 text-small font-medium text-ink-muted transition-colors duration-mid ease-out group-hover:text-accent">
                        {c.common.learnMore}
                        <ArrowUpRight size={16} weight="bold" aria-hidden />
                      </span>
                    </SpotlightCard>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </Container>
      </Section>

      <AjakanPenutup locale={locale} />
    </main>
  );
}
