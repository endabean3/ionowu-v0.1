import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HalamanRincianKaryaContent } from "@/app/karya/[slug]/page";
import { DAFTAR_KARYA, cariKaryaLocale } from "@/lib/data/karya";
import { isLocale, LOCALE_OG, LOCALES, localizedAlternates, type Locale } from "@/lib/i18n";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  return LOCALES.filter((locale) => locale !== "id").flatMap((locale) =>
    DAFTAR_KARYA.map((k) => ({ locale, slug: k.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === "id") return {};
  const karya = cariKaryaLocale(slug, locale);
  if (!karya) return {};
  return {
    title: karya.nama,
    description: karya.ringkasan,
    alternates: localizedAlternates(`/karya/${slug}`),
    openGraph: {
      title: karya.nama,
      description: karya.ringkasan,
      locale: LOCALE_OG[locale],
    },
  };
}

export default async function LocalizedRincianKarya({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === "id") notFound();
  return <HalamanRincianKaryaContent slug={slug} locale={locale as Locale} />;
}
