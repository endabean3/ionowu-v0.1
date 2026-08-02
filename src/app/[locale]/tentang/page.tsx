import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanTentangContent } from "@/app/tentang/page";
import {
  copy,
  isLocale,
  LOCALE_OG,
  LOCALES,
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
    title: copy[locale].nav.about,
    description: copy[locale].pages.about.lead,
    alternates: localizedAlternates("/tentang"),
    openGraph: {
      title: copy[locale].nav.about,
      description: copy[locale].pages.about.lead,
      locale: LOCALE_OG[locale],
    },
  };
}

export default async function LocalizedTentang({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "id") notFound();
  return <HalamanTentangContent locale={locale as Locale} />;
}
