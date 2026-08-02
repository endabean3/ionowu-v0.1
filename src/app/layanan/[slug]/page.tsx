import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { KaryaMedia } from "@/components/ui/KaryaMedia";
import { DAFTAR_LAYANAN, cariLayananLocale } from "@/lib/data/layanan";
import { cariKaryaLocale } from "@/lib/data/karya";
import { IKON_LAYANAN } from "@/lib/data/ikon-layanan";
import { copy, localizedAlternates, type Locale, withLocale } from "@/lib/i18n";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return DAFTAR_LAYANAN.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const layanan = cariLayananLocale(slug, "id");
  if (!layanan) return {};

  return {
    title: layanan.judul,
    description: layanan.masalah,
    alternates: localizedAlternates(`/layanan/${slug}`),
    openGraph: {
      title: layanan.judul,
      description: layanan.masalah,
      locale: "id_ID",
    },
  };
}

export default async function HalamanRincianLayanan({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return <HalamanRincianLayananContent slug={slug} locale="id" />;
}

export function HalamanRincianLayananContent({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const c = copy[locale];
  const layanan = cariLayananLocale(slug, locale);
  if (!layanan) notFound();

  const Ikon = IKON_LAYANAN[layanan.ikon];
  const karyaTerkait = layanan.karyaTerkait
    .map((s) => cariKaryaLocale(s, locale))
    .filter((k): k is NonNullable<typeof k> => Boolean(k));

  return (
    <main className="flex-1">
      <Section className="glow-field border-b border-line pt-32 pb-16">
        <Container width="prose">
          <Reveal>
            <Breadcrumb
              href={withLocale("/layanan", locale)}
              label={c.common.backServices}
            />
            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-card border border-line bg-surface-2">
                <Ikon size={26} weight="light" className="text-accent" aria-hidden />
              </div>
              <h1 className="text-h1 text-ink">{layanan.judul}</h1>
            </div>
            <p className="mt-6 text-lead text-ink-muted">{layanan.masalah}</p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="prose">
          <Reveal>
            <h2 className="text-h2 text-ink">
              {locale === "id" ? "Yang Anda dapat" : locale === "en" ? "What you get" : "您将获得"}
            </h2>
          </Reveal>
          <RevealGroup className="mt-8 space-y-4">
            {layanan.didapat.map((poin) => (
              <RevealItem key={poin} className="flex items-start gap-3">
                <Check
                  size={18}
                  weight="bold"
                  className="mt-1 shrink-0 text-accent"
                  aria-hidden
                />
                <span className="text-ink-muted">{poin}</span>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal className="mt-12">
            <h2 className="text-h2 text-ink">{c.common.technology}</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {layanan.teknologi.map((t) => (
                <span
                  key={t}
                  className="tabular rounded-button border border-line px-3 py-1.5 text-small text-ink-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-12">
            <Card statis>
              <h3 className="text-h3 text-ink">
                {locale === "id"
                  ? "Waktu pengerjaan dan biaya"
                  : locale === "en"
                    ? "Timeline and budget"
                    : "周期和预算"}
              </h3>
              <p className="mt-3 text-ink-muted">
                {locale === "id"
                  ? "Setiap kebutuhan berbeda. Ceritakan kebutuhan Anda lewat konsultasi awal, lalu kami siapkan perkiraan jadwal dan biaya."
                  : locale === "en"
                    ? "Every project is different. Tell us what you need, then we will prepare a realistic timeline and budget range."
                    : "每个项目都不同。请告诉我们需求，我们会准备合理的周期和预算范围。"}
              </p>
            </Card>
          </Reveal>
        </Container>
      </Section>

      {karyaTerkait.length > 0 && (
        <Section className="border-t border-line">
          <Container>
            <Reveal>
              <h2 className="text-h2 text-ink">{c.common.relatedWork}</h2>
            </Reveal>
            <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {karyaTerkait.map((k) => (
                <RevealItem key={k.slug}>
                  <Link href={withLocale(`/karya/${k.slug}`, locale)} className="block h-full">
                    <Card className="h-full p-0">
                      <KaryaMedia pola={k.pola} className="h-32" />
                      <div className="p-6">
                        <div className="text-small text-accent">{k.bidang}</div>
                        <h3 className="mt-2 text-h3 text-ink">{k.nama}</h3>
                      </div>
                    </Card>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </Container>
        </Section>
      )}

      <Section className="border-t border-line">
        <Container width="prose" className="text-center">
          <Reveal>
            <h2 className="text-h2 text-ink">
              {locale === "id"
                ? "Tertarik dengan layanan ini?"
                : locale === "en"
                  ? "Interested in this service?"
                  : "对这项服务感兴趣？"}
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
