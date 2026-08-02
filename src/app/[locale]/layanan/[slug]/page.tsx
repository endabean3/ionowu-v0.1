import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanRincianLayananContent } from "@/app/layanan/[slug]/page";
import { DAFTAR_LAYANAN, cariLayananLocale } from "@/lib/data/layanan";
import { isLocale, LOCALE_OG, LOCALES, localizedAlternates, type Locale } from "@/lib/i18n";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  return LOCALES.filter((locale) => locale !== "id").flatMap((locale) =>
    DAFTAR_LAYANAN.map((l) => ({ locale, slug: l.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === "id") return {};
  const layanan = cariLayananLocale(slug, locale);
  if (!layanan) return {};
  return {
    title: layanan.judul,
    description: layanan.masalah,
    alternates: localizedAlternates(`/layanan/${slug}`),
    openGraph: {
      title: layanan.judul,
      description: layanan.masalah,
      locale: LOCALE_OG[locale],
    },
  };
}

export default async function LocalizedRincianLayanan({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === "id") notFound();
  return <HalamanRincianLayananContent slug={slug} locale={locale as Locale} />;
}
