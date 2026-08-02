import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { KaryaMedia } from "@/components/ui/KaryaMedia";
import { Button } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { daftarKarya } from "@/lib/data/karya";
import { copy, type Locale, withLocale } from "@/lib/i18n";

/* Tiga yang ditonjolkan di beranda. Daftar lengkap (7 karya, dokumen 03)
   ada di /karya. */
const SLUG_PILIHAN = [
  "sistem-informasi-gudang-farmasi",
  "business-intelligence-rumah-sakit",
  "sistem-informasi-manajemen-toko",
];

export function KaryaPilihan({ locale = "id" }: { locale?: Locale }) {
  const c = copy[locale];
  const daftar = daftarKarya(locale);
  const karyaPilihan = SLUG_PILIHAN.map((slug) =>
    daftar.find((k) => k.slug === slug),
  ).filter((k): k is (typeof daftar)[number] => Boolean(k));

  return (
    <Section id="karya" className="border-t border-line">
      <Container>
        <SectionHeading
          title={c.home.workTitle}
          lead={c.home.workLead}
        />

        <RevealGroup className="mt-16 grid gap-6 md:grid-cols-3">
          {karyaPilihan.map((k) => (
            <RevealItem key={k.slug}>
              <Link href={withLocale(`/karya/${k.slug}`, locale)} className="block h-full">
                {/* p-0: pola visual dibuat menyentuh tepi kartu, seperti
                    tangkapan layar sungguhan nantinya. Menang atas padding
                    bawaan .card lewat urutan @layer (utilities > components). */}
                <TiltCard className="h-full p-0">
                  <KaryaMedia pola={k.pola} className="h-40" />
                  <div className="p-6 sm:p-8">
                    <div className="text-small text-accent">{k.bidang}</div>
                    <h3 className="mt-2 text-h3 text-ink">{k.nama}</h3>
                    <p className="mt-3 text-ink-muted">{k.ringkasan}</p>
                  </div>
                </TiltCard>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-12 flex justify-center">
          <Button href={withLocale("/karya", locale)} variant="secondary">
            {c.common.allWork}
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
