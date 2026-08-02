import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanKontakContent } from "@/app/kontak/page";
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
    title: copy[locale].nav.contact,
    description: copy[locale].pages.contact.lead,
    alternates: localizedAlternates("/kontak"),
    openGraph: {
      title: copy[locale].nav.contact,
      description: copy[locale].pages.contact.lead,
      locale: LOCALE_OG[locale],
    },
  };
}

export default async function LocalizedKontak({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "id") notFound();
  return <HalamanKontakContent locale={locale as Locale} />;
}
