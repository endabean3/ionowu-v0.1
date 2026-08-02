import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanKaryaContent } from "@/app/karya/page";
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
    title: copy[locale].nav.work,
    description: copy[locale].pages.work.lead,
    alternates: localizedAlternates("/karya"),
    openGraph: {
      title: copy[locale].nav.work,
      description: copy[locale].pages.work.lead,
      locale: LOCALE_OG[locale],
    },
  };
}

export default async function LocalizedKarya({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "id") notFound();
  return <HalamanKaryaContent locale={locale as Locale} />;
}
