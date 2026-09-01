import { ArrowUpRight, Circle } from "@phosphor-icons/react/dist/ssr";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { daftarProduk } from "@/lib/data/produk";
import { copy, type Locale } from "@/lib/i18n";

/**
 * Produk milik Ionowu sendiri -- beda dari KaryaPilihan (pekerjaan untuk
 * klien, nama klien dirahasiakan) dan Layanan (jasa yang dijual). Di sini
 * nama produknya boleh disebut apa adanya karena memang milik sendiri.
 *
 * JalinTani ditautkan langsung (statusnya "live", diuji hidup 1 September
 * 2026). Warung Wangi SENGAJA tidak diberi tombol kunjungi -- statusnya
 * "dibangun", belum go-live menurut README-nya sendiri (alamat, nomor
 * WhatsApp, dan katalog masih placeholder). Menautkan ke sesuatu yang belum
 * ada isinya lebih buruk daripada tidak menautkan sama sekali.
 *
 * Layout kartu tunggal lebar dengan badge status, bukan grid tiga kolom
 * seperti KaryaPilihan -- dua produk saja terasa kosong kalau dipaksakan
 * jadi grid tiga kolom.
 */
export function ProdukKami({ locale = "id" }: { locale?: Locale }) {
  const c = copy[locale];
  const produk = daftarProduk(locale);

  return (
    <Section className="border-t border-line">
      <Container>
        <SectionHeading
          title={c.home.productsTitle}
          lead={c.home.productsLead}
        />

        <RevealGroup className="mt-12 flex flex-col gap-6">
          {produk.map((p) => {
            const isiKartu = (
              <SpotlightCard className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-h3 text-ink">{p.nama}</h3>
                    <span
                      className={
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-small " +
                        (p.status === "live"
                          ? "border-accent-deep/40 text-accent"
                          : "border-line text-ink-muted")
                      }
                    >
                      <Circle
                        size={7}
                        weight="fill"
                        aria-hidden
                        className={p.status === "live" ? "text-accent" : "text-ink-muted"}
                      />
                      {p.status === "live" ? c.home.productsLive : c.home.productsBuilding}
                    </span>
                  </div>
                  <p className="mt-2 text-small text-ink-muted">{p.wilayah}</p>
                  <p className="mt-4 text-body text-ink">{p.tagline}</p>
                  <p className="mt-3 text-small text-ink-muted">{p.ringkasan}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {p.teknologi.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-line px-3 py-1 text-small text-ink-muted"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {p.url && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 self-start text-small font-medium text-accent transition-colors duration-mid ease-out group-hover:text-accent-deep">
                    {c.home.productsVisit}
                    <ArrowUpRight size={16} weight="bold" aria-hidden />
                  </span>
                )}
              </SpotlightCard>
            );

            return (
              <RevealItem key={p.slug}>
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    {isiKartu}
                  </a>
                ) : (
                  isiKartu
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
