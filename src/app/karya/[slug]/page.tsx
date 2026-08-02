import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { KaryaMedia } from "@/components/ui/KaryaMedia";
import { DAFTAR_KARYA, cariKaryaLocale } from "@/lib/data/karya";
import { daftarLayanan } from "@/lib/data/layanan";
import { copy, localizedAlternates, type Locale, withLocale } from "@/lib/i18n";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return DAFTAR_KARYA.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const karya = cariKaryaLocale(slug, "id");
  if (!karya) return {};

  return {
    title: karya.nama,
    description: karya.ringkasan,
    alternates: localizedAlternates(`/karya/${slug}`),
    openGraph: {
      title: karya.nama,
      description: karya.ringkasan,
      locale: "id_ID",
    },
  };
}

export default async function HalamanRincianKarya({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return <HalamanRincianKaryaContent slug={slug} locale="id" />;
}

export function HalamanRincianKaryaContent({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const c = copy[locale];
  const karya = cariKaryaLocale(slug, locale);
  if (!karya) notFound();

  const layananTerkait = daftarLayanan(locale).filter((l) =>
    l.karyaTerkait.includes(karya.slug),
  );

  return (
    <main className="flex-1">
      <Section className="border-b border-line pt-32">
        <Container width="prose">
          <Reveal>
            <Breadcrumb href={withLocale("/karya", locale)} label={c.common.backWork} />
            <div className="mt-8 text-small text-accent">{karya.bidang}</div>
            <h1 className="mt-2 text-h1 text-ink">{karya.nama}</h1>
            <p className="mt-6 text-lead text-ink-muted">{karya.ringkasan}</p>
          </Reveal>
        </Container>

        <Container className="mt-12">
          <Reveal delay={0.15}>
            <KaryaMedia pola={karya.pola} className="h-64 rounded-media sm:h-96" />
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="prose">
          <div className="grid gap-10 sm:grid-cols-2">
            <Reveal>
              <h2 className="text-h3 text-ink">
                {locale === "id" ? "Masalahnya" : locale === "en" ? "Problem" : "问题"}
              </h2>
              <p className="mt-3 text-ink-muted">{karya.masalah}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-h3 text-ink">
                {locale === "id" ? "Yang kami kerjakan" : locale === "en" ? "What we did" : "我们做了什么"}
              </h2>
              <p className="mt-3 text-ink-muted">{karya.dikerjakan}</p>
            </Reveal>
          </div>

          <Reveal className="mt-10">
            <h2 className="text-h3 text-ink">
              {locale === "id" ? "Hasilnya" : locale === "en" ? "Result" : "结果"}
            </h2>
            <p className="mt-3 text-ink-muted">{karya.hasil}</p>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="text-h3 text-ink">{c.common.technology}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {karya.teknologi.map((t) => (
                <span
                  key={t}
                  className="tabular rounded-button border border-line px-3 py-1.5 text-small text-ink-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          {layananTerkait.length > 0 && (
            <Reveal className="mt-10">
              <h2 className="text-h3 text-ink">{c.common.relatedServices}</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {layananTerkait.map((l) => (
                  <Link
                    key={l.slug}
                    href={withLocale(`/layanan/${l.slug}`, locale)}
                    className="text-small font-medium text-accent transition-colors duration-mid ease-out hover:text-ink"
                  >
                    {l.judul} →
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container width="prose" className="text-center">
          <Reveal>
            <h2 className="text-h2 text-ink">
              {locale === "id"
                ? "Punya kebutuhan serupa?"
                : locale === "en"
                  ? "Have a similar need?"
                  : "有类似需求？"}
            </h2>
            <p className="mt-4 text-ink-muted">
              {c.home.finalLead}
            </p>
            <div className="mt-8 flex justify-center">
              <Button href={withLocale("/kontak", locale)} size="lg">
                {c.common.consult}
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </main>
  );
}
