import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Container";
import { TiltCard } from "@/components/ui/TiltCard";
import { KaryaMedia } from "@/components/ui/KaryaMedia";
import { AjakanPenutup } from "@/components/sections/AjakanPenutup";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { daftarKarya } from "@/lib/data/karya";
import { copy, localizedAlternates, type Locale, withLocale } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Karya",
  description:
    "Contoh karya Ionowu di sistem informasi, gudang, rumah sakit, toko, penggajian, kost, dan business intelligence.",
  alternates: localizedAlternates("/karya"),
  openGraph: {
    title: "Karya",
    description:
      "Contoh karya Ionowu di sistem informasi, gudang, rumah sakit, toko, penggajian, kost, dan business intelligence.",
    locale: "id_ID",
  },
};

export default function HalamanKarya() {
  return <HalamanKaryaContent locale="id" />;
}

export function HalamanKaryaContent({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const karya = daftarKarya(locale);

  return (
    <main className="flex-1">
      <JsonLd
        data={[
          itemListSchema(
            karya.map((k) => ({ name: k.nama, path: `/karya/${k.slug}` })),
            locale,
          ),
          breadcrumbSchema(
            [
              { name: "Ionowu", path: "/" },
              { name: c.nav.work, path: "/karya" },
            ],
            locale,
          ),
        ]}
      />
      <PageHeader
        title={c.pages.work.title}
        lead={c.pages.work.lead}
      />

      <Section>
        <Container>
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {karya.map((k) => (
              <RevealItem key={k.slug}>
                <Link href={withLocale(`/karya/${k.slug}`, locale)} className="block h-full">
                  <TiltCard className="h-full p-0">
                    <KaryaMedia pola={k.pola} className="h-40" />
                    <div className="p-6 sm:p-8">
                      <div className="text-small text-accent">{k.bidang}</div>
                      <h2 className="mt-2 text-h3 text-ink">{k.nama}</h2>
                      <p className="mt-3 text-ink-muted">{k.ringkasan}</p>
                    </div>
                  </TiltCard>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <AjakanPenutup locale={locale} />
    </main>
  );
}
