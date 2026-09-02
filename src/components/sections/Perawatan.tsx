import { Heartbeat, Check, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { BlurReveal } from "@/components/motion/BlurReveal";
import { Magnet } from "@/components/motion/Magnet";
import { Button } from "@/components/ui/Button";
import { cariLayananLocale } from "@/lib/data/layanan";
import { copy, type Locale, withLocale } from "@/lib/i18n";

/**
 * Penegasan bahwa Ionowu tetap merawat sistem yang sudah dibangun — bukan
 * cuma langkah "Rawat" di Cara Kerja, tapi ditonjolkan sebagai satu bagian
 * sendiri sebelum ajakan kontak.
 *
 * Empat poin di kanan BUKAN teks baru: diambil langsung dari `didapat` milik
 * layanan Infrastruktur & Server (satu sumber, tiga bahasa, sudah ada di
 * repo). Sengaja begitu, bukan menulis klaim maintenance yang terpisah --
 * dokumen 01 melarang mengarang angka atau klaim yang belum bisa
 * dipertanggungjawabkan, dan proyek mana yang kontrak perawatannya masih
 * berjalan adalah fakta bisnis yang belum tercatat di data. Ikon Heartbeat
 * sengaja SAMA dengan ikon langkah "Rawat" di CaraKerja.tsx -- motif yang
 * sama, ditonjolkan lagi.
 *
 * Layout sengaja BUKAN grid tiga kartu (dipakai KaryaPilihan) atau daftar
 * bernomor dengan kolom sticky (dipakai CaraKerja) -- satu panel bersekat,
 * supaya beranda tidak mengulang keluarga tata letak yang sama tiga kali.
 */
export function Perawatan({ locale = "id" }: { locale?: Locale }) {
  const c = copy[locale];
  const layanan = cariLayananLocale("infrastruktur-server", locale);
  if (!layanan) return null;

  return (
    <Section className="border-t border-line">
      <Container>
        <div className="grid overflow-hidden rounded-2xl border border-line lg:grid-cols-2">
          <Reveal arah="kiri" className="flex flex-col justify-center gap-5 p-8 sm:p-12">
            <Heartbeat size={28} weight="light" className="text-accent" aria-hidden />
            <BlurReveal as="h2" text={c.home.maintenanceTitle} className="text-h2 text-ink block" />
            <p className="text-body text-ink-muted">{c.home.maintenanceLead}</p>
            <div className="mt-2">
              <Magnet jangkauan={60} kekuatan={6}>
                <Button href={withLocale("/layanan/infrastruktur-server", locale)} variant="secondary">
                  {c.common.learnMore}
                  <ArrowRight size={16} weight="bold" aria-hidden />
                </Button>
              </Magnet>
            </div>
          </Reveal>

          <div className="section-texture border-t border-line bg-surface-1/40 p-8 sm:p-12 lg:border-t-0 lg:border-l">
            <RevealGroup className="grid gap-5 sm:grid-cols-2">
              {layanan.didapat.map((poin) => (
                <RevealItem key={poin} arah="kanan" className="flex items-start gap-3">
                  <Check
                    size={18}
                    weight="bold"
                    className="mt-0.5 shrink-0 text-accent"
                    aria-hidden
                  />
                  <span className="text-small text-ink-muted">{poin}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </Container>
    </Section>
  );
}
