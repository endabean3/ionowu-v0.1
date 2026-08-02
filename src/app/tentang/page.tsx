import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Ear,
  PuzzlePiece,
  Heartbeat,
  SealCheck,
  GithubLogo,
  LinkedinLogo,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { copy, localizedAlternates, type Locale, withLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Ionowu adalah software house. Kenali cara kami bekerja, nilai yang kami pegang, dan orang di baliknya.",
  alternates: localizedAlternates("/tentang"),
  openGraph: {
    title: "Tentang",
    description:
      "Ionowu adalah software house. Kenali cara kami bekerja, nilai yang kami pegang, dan orang di baliknya.",
    locale: "id_ID",
  },
};

/* Dokumen 03 — HALAMAN TENTANG.
   Cerita berdirinya perusahaan dan legalitas belum ada ("[BELUM ADA]" di
   dokumen 01), jadi tidak ditulis di sini — bukan lupa, sengaja tidak
   mengarang. Nilai di bawah menyarikan filosofi yang sudah ada di seluruh
   isi situs (dokumen 03 Cara Kerja, draft layanan), bukan fakta baru. */
const NILAI = [
  {
    ikon: Ear,
  },
  {
    ikon: PuzzlePiece,
  },
  {
    ikon: Heartbeat,
  },
];

/* Dari referensi/cv-data-real-novenda.pdf. */
const SERTIFIKASI = [
  "Pengembang Web - Badan Nasional Sertifikasi Profesi (BNSP)",
  "Google Cloud - Dicoding & Google Developer",
  "SQL - Dicoding",
  "Microsoft Office - LSP Politeknik Negeri Jember",
  "Bahasa Inggris Profesi - LSP Politeknik Negeri Jember",
];

export default function HalamanTentang() {
  return <HalamanTentangContent locale="id" />;
}

export function HalamanTentangContent({ locale }: { locale: Locale }) {
  const c = copy[locale];

  return (
    <main className="flex-1">
      <PageHeader
        title={c.pages.about.title}
        lead={c.pages.about.lead}
      />

      {/* ---------- Nilai ---------- */}
      <Section>
        <Container>
          <Reveal>
            <h2 className="text-h2 text-ink">{c.pages.about.valuesTitle}</h2>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-3">
            {NILAI.map((n, i) => {
              const Ikon = n.ikon;
              const [judul, kalimat] = c.values[i];
              return (
                <RevealItem key={judul}>
                  <Card statis className="h-full">
                    <Ikon size={28} weight="light" className="text-accent" aria-hidden />
                    <h3 className="mt-5 text-h3 text-ink">{judul}</h3>
                    <p className="mt-3 text-ink-muted">{kalimat}</p>
                  </Card>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </Container>
      </Section>

      {/* ---------- Tim ---------- */}
      <Section className="border-t border-line bg-surface-1/40">
        <Container>
          <Reveal>
            <h2 className="text-h2 text-ink">{c.pages.about.teamTitle}</h2>
          </Reveal>

          <Reveal className="mt-12">
            <Card statis className="grid gap-8 p-0 sm:grid-cols-[220px_1fr]">
              <div className="relative h-72 overflow-hidden sm:h-full">
                {/* Foto asli berlatar merah terang — bentrok dengan palet.
                    Grayscale penuh + tona navy (bukan cuma sebagian) supaya
                    tetap harmonis di crop mana pun, termasuk potongan lebar
                    di HP yang lebih menonjolkan latar merahnya. */}
                <Image
                  src="/tentang/novenda.jpg"
                  alt="Novenda Ilham Wibowo"
                  fill
                  sizes="(min-width: 640px) 220px, 100vw" // token-ok: sintaks media query, sama seperti breakpoint sm bawaan Tailwind
                  className="object-cover object-top grayscale contrast-110"
                />
                <div className="absolute inset-0 bg-brand-navy/45 mix-blend-color" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-surface-2/10 to-transparent" />
              </div>

              <div className="p-6 sm:p-8 sm:pl-0">
                <h3 className="text-h3 text-ink">Novenda Ilham Wibowo</h3>
                <p className="mt-1 text-small text-accent">
                  {c.pages.about.teamRole}
                </p>
                <p className="mt-4 text-ink-muted">
                  {c.pages.about.teamBio}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["ReactJS", "VueJS", "Golang", "Laravel", "PostgreSQL", "AWS"].map(
                    (t) => (
                      <span
                        key={t}
                        className="tabular rounded-button border border-line px-3 py-1.5 text-small text-ink-muted"
                      >
                        {t}
                      </span>
                    ),
                  )}
                </div>
                <div className="mt-6 flex items-center gap-5">
                  <Link
                    href="https://github.com/novenda"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-small font-medium text-ink-muted transition-colors duration-mid ease-out hover:text-ink"
                  >
                    <GithubLogo size={18} aria-hidden />
                    GitHub
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/novenda-ilham-w-96319921b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-small font-medium text-ink-muted transition-colors duration-mid ease-out hover:text-ink"
                  >
                    <LinkedinLogo size={18} aria-hidden />
                    LinkedIn
                  </Link>
                </div>
              </div>
            </Card>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- Sertifikasi ---------- */}
      <Section className="border-t border-line">
        <Container width="prose">
          <Reveal>
            <h2 className="text-h2 text-ink">{c.pages.about.certificationsTitle}</h2>
          </Reveal>
          <RevealGroup className="mt-8 space-y-3">
            {SERTIFIKASI.map((s) => (
              <RevealItem
                key={s}
                className="flex items-start gap-3 border-b border-line pb-3 last:border-0"
              >
                <SealCheck
                  size={18}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-accent"
                  aria-hidden
                />
                <span className="text-ink-muted">{s}</span>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal className="mt-10 flex items-center gap-4 opacity-80">
            <Image
              src="/tentang/politeknik-jember.png"
              alt="Politeknik Negeri Jember"
              width={40}
              height={21}
              className="h-8 w-auto"
            />
            <span className="text-small text-ink-muted">
              Politeknik Negeri Jember - Teknik Informatika
            </span>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- Ajakan ---------- */}
      <Section className="border-t border-line">
        <Container width="prose" className="text-center">
          <Reveal>
            <h2 className="text-h2 text-ink">{c.pages.about.knowMoreTitle}</h2>
            <p className="mt-4 text-ink-muted">
              {c.pages.about.knowMoreLead}
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
