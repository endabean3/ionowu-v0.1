import type { Metadata } from "next";
import { Clock } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { FormulirKontak } from "@/components/kontak/FormulirKontak";
import { SaluranLangsung } from "@/components/kontak/SaluranLangsung";
import { copy, localizedAlternates, type Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Ceritakan kebutuhan Anda. Konsultasi awal gratis, tanpa ikatan. Kami balas dalam 1x24 jam kerja.",
  alternates: localizedAlternates("/kontak"),
  openGraph: {
    title: "Kontak",
    description:
      "Ceritakan kebutuhan Anda. Konsultasi awal gratis, tanpa ikatan. Kami balas dalam 1x24 jam kerja.",
    locale: "id_ID",
  },
};

export default function HalamanKontak() {
  return <HalamanKontakContent locale="id" />;
}

export function HalamanKontakContent({ locale }: { locale: Locale }) {
  const c = copy[locale];

  return (
    <main className="flex-1">
      <PageHeader
        title={c.pages.contact.title}
        lead={c.pages.contact.lead}
      />

      <Section>
        <Container width="prose" className="grid gap-10">
          <Reveal>
            <Card statis className="flex items-start gap-4">
              <Clock size={22} weight="light" className="mt-0.5 shrink-0 text-accent" aria-hidden />
              <div>
                {/* h2, bukan h3: satu-satunya judul di bawah <h1> halaman ini.
                    Melompat dari h1 langsung ke h3 membuat urutan judul rusak
                    bagi pembaca layar — ketahuan lewat Lighthouse (aksesibilitas
                    /kontak 98, audit `heading-order`). Kelas `text-h3` sengaja
                    dipertahankan: yang berubah maknanya, bukan tampilannya. */}
                <h2 className="text-h3 text-ink">{c.pages.contact.responseTitle}</h2>
                <p className="mt-2 text-ink-muted">
                  {c.pages.contact.responseBody}
                </p>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <FormulirKontak locale={locale} />
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container width="prose">
          <Reveal>
            {/* Dulu bagian ini cuma catatan bahwa saluran langsung "sedang
                disiapkan". Sekarang nomornya sudah ada, jadi tempat yang sama
                dipakai untuk menampilkannya — bukan ditambahkan sebagai
                bagian baru yang membuat halaman makin panjang. */}
            <SaluranLangsung locale={locale} />
          </Reveal>
        </Container>
      </Section>
    </main>
  );
}
