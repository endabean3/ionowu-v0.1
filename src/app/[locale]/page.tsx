import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/components/sections/Hero";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { Layanan } from "@/components/sections/Layanan";
import { ProdukKami } from "@/components/sections/ProdukKami";
import { CaraKerja } from "@/components/sections/CaraKerja";
import { KaryaPilihan } from "@/components/sections/KaryaPilihan";
import { Perawatan } from "@/components/sections/Perawatan";
import { AjakanPenutup } from "@/components/sections/AjakanPenutup";
import {
  LOCALES,
  LOCALE_OG,
  copy,
  isLocale,
  localizedAlternates,
  type Locale,
} from "@/lib/i18n";

type Params = { locale: string };

export function generateStaticParams(): Params[] {
  return LOCALES.filter((locale) => locale !== "id").map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "id") return {};
  return {
    title: copy[locale].metadata.title,
    description: copy[locale].metadata.description,
    alternates: localizedAlternates("/"),
    openGraph: {
      title: copy[locale].metadata.title,
      description: copy[locale].metadata.ogDescription,
      locale: LOCALE_OG[locale],
    },
  };
}

export default async function LocalizedHome({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "id") notFound();

  return (
    <main className="flex-1">
      <Hero locale={locale as Locale} />
      <TechMarquee />
      <Layanan locale={locale as Locale} />
      <CaraKerja locale={locale as Locale} />
      <ProdukKami locale={locale as Locale} />
      <KaryaPilihan locale={locale as Locale} />
      <Perawatan locale={locale as Locale} />
      <AjakanPenutup locale={locale as Locale} />
    </main>
  );
}
