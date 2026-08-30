import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MapPin, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Section } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { daftarLayanan } from "@/lib/data/layanan";
import { daftarKarya } from "@/lib/data/karya";
import { WA_TAMPIL, waHref } from "@/lib/data/kontak";
import {
  breadcrumbSchema,
  localServiceSchema,
} from "@/lib/seo/structured-data";

/* ============================================================
   HALAMAN LOKAL — TRENGGALEK

   Kenapa halaman ini ada: situs ini sebelumnya tidak menyebut satu pun nama
   tempat, sehingga tidak punya alasan apa pun untuk muncul di pencarian lokal.
   Pesaing di kata kunci yang sama semuanya punya halaman khusus.

   YANG TIDAK ADA DI SINI, DAN SENGAJA:
   - Alamat kantor. Masih `[BELUM ADA]`. WhatsApp dan email resmi sudah ada
     dan dipasang di halaman ini, tetapi alamat fisik belum — itu sebabnya
     skemanya tetap ProfessionalService, bukan LocalBusiness.
   - Harga, paket, dan lama pengerjaan. Belum pernah ditetapkan.
   - Klaim "kantor di Trenggalek". Yang ditulis adalah WILAYAH LAYANAN, karena
     itu yang benar-benar bisa dipertanggungjawabkan.

   Halaman ini juga sengaja BUKAN halaman tipis berisi kata kunci berulang —
   Google menghukum pola itu sebagai doorway page. Isinya menunjuk ke layanan
   dan karya yang memang nyata, dengan tautan ke halaman rincian masing-masing.
   ============================================================ */

const JUDUL = "Programmer & Jasa Pembuatan Website Trenggalek";
const DESKRIPSI =
  "Ionowu mengerjakan aplikasi web, sistem informasi perusahaan, dan integrasi data untuk klien di Trenggalek dan Jawa Timur — dari pengalaman nyata membangun sistem rumah sakit dan gudang farmasi.";

export const metadata: Metadata = {
  title: JUDUL,
  description: DESKRIPSI,
  // Hanya versi Indonesia. Halaman ini menyasar pencarian lokal berbahasa
  // Indonesia, jadi tidak ada padanan /en maupun /zh yang masuk akal —
  // memaksakan terjemahannya justru membuat anotasi hreflang menunjuk halaman
  // yang tidak setara.
  alternates: { canonical: "/programmer-trenggalek" },
  openGraph: {
    title: JUDUL,
    description: DESKRIPSI,
    locale: "id_ID",
    type: "website",
  },
};

/* Wilayah layanan. Kabupaten sekitar Trenggalek disebut karena pencarian
   lokal sering memakai nama kota tetangga, dan seluruhnya memang terjangkau
   dari wilayah yang sama. */
const WILAYAH = [
  "Trenggalek",
  "Tulungagung",
  "Kediri",
  "Blitar",
  "Ponorogo",
  "Pacitan",
];

const ALASAN = [
  {
    judul: "Dibangun mengikuti cara kerja Anda",
    isi: "Software siap pakai sering memaksa Anda mengubah alur kerja supaya cocok dengan sistemnya. Kami membalik itu — sistemnya yang mengikuti alur yang sudah berjalan.",
  },
  {
    judul: "Pengalaman di sistem operasional, bukan sekadar tampilan",
    isi: "Sistem gudang farmasi, business intelligence rumah sakit, dan pipeline data adalah pekerjaan yang sudah pernah kami selesaikan — bukan contoh yang dikarang untuk portofolio.",
  },
  {
    judul: "Dirawat setelah jadi",
    isi: "Aplikasi tidak berhenti di serah terima. Perawatan, perbaikan, dan penyesuaian ikut kami tangani supaya sistemnya tetap dipakai, bukan ditinggalkan.",
  },
];

export default function HalamanProgrammerTrenggalek() {
  const layanan = daftarLayanan("id");
  // Karya yang wilayahnya memang di Jawa Timur — bukti paling relevan untuk
  // pembaca dari daerah yang sama.
  const karyaJatim = daftarKarya("id").filter((k) =>
    k.bidang.toLowerCase().includes("jawa timur"),
  );
  const karyaTampil = karyaJatim.length > 0 ? karyaJatim : daftarKarya("id").slice(0, 3);

  return (
    <main className="flex-1">
      <JsonLd
        data={[
          localServiceSchema({
            nama: "Ionowu — Programmer & Pembuatan Website Trenggalek",
            deskripsi: DESKRIPSI,
            path: "/programmer-trenggalek",
            wilayah: WILAYAH,
          }),
          breadcrumbSchema(
            [
              { name: "Ionowu", path: "/" },
              { name: "Programmer Trenggalek", path: "/programmer-trenggalek" },
            ],
            "id",
          ),
        ]}
      />

      <PageHeader
        eyebrow="Trenggalek & Jawa Timur"
        title={JUDUL}
        lead={DESKRIPSI}
      />

      <Section>
        <Container width="prose">
          <Reveal>
            <div className="flex items-start gap-3">
              <MapPin
                size={22}
                weight="duotone"
                aria-hidden
                className="mt-1 shrink-0 text-accent"
              />
              <div>
                <h2 className="text-h3">Wilayah yang kami layani</h2>
                <p className="mt-3 text-body text-ink-muted">
                  Ionowu bekerja jarak jauh dan di lokasi untuk klien di
                  Trenggalek serta kabupaten sekitarnya. Pertemuan awal,
                  pendataan alur kerja, dan pendampingan setelah sistem jalan
                  bisa dilakukan langsung di tempat Anda.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {WILAYAH.map((w) => (
                    <li
                      key={w}
                      className="rounded-full border border-line px-4 py-1.5 text-small text-ink-muted"
                    >
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container>
          <SectionHeading
            eyebrow="Layanan"
            title="Yang bisa kami kerjakan"
            lead="Enam layanan inti, disusun dari pengalaman nyata di sistem operasional."
          />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {layanan.map((l) => (
              <RevealItem key={l.slug}>
                <Card className="flex h-full flex-col p-7">
                  <h3 className="text-h4">{l.judul}</h3>
                  <p className="mt-3 flex-1 text-small text-ink-muted">
                    {l.kalimat}
                  </p>
                  <Link
                    href={`/layanan/${l.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-small font-medium text-accent transition-colors duration-mid ease-out hover:text-accent-deep"
                  >
                    Pelajari
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container>
          <SectionHeading
            eyebrow="Bukti"
            title="Sistem yang sudah jalan di Jawa Timur"
            lead="Bukan contoh karangan — ini pekerjaan yang sudah diselesaikan dan dipakai sehari-hari."
          />
          <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
            {karyaTampil.map((k) => (
              <RevealItem key={k.slug}>
                <Card className="flex h-full flex-col p-7">
                  <p className="text-small text-accent">{k.bidang}</p>
                  <h3 className="mt-2 text-h4">{k.nama}</h3>
                  <p className="mt-3 flex-1 text-small text-ink-muted">
                    {k.ringkasan}
                  </p>
                  <Link
                    href={`/karya/${k.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-small font-medium text-accent transition-colors duration-mid ease-out hover:text-accent-deep"
                  >
                    Baca rinciannya
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container width="prose">
          <SectionHeading eyebrow="Kenapa Ionowu" title="Cara kami bekerja" />
          <RevealGroup className="mt-10 flex flex-col gap-6">
            {ALASAN.map((a) => (
              <RevealItem key={a.judul}>
                <div className="flex items-start gap-3">
                  <Check
                    size={20}
                    weight="bold"
                    aria-hidden
                    className="mt-1 shrink-0 text-accent"
                  />
                  <div>
                    <h3 className="text-h4">{a.judul}</h3>
                    <p className="mt-2 text-body text-ink-muted">{a.isi}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section className="border-t border-line">
        <Container width="prose">
          <Reveal>
            <h2 className="text-h2">Mulai dari satu percakapan</h2>
            <p className="mt-4 text-body text-ink-muted">
              Ceritakan proses yang sedang berjalan dan bagian mana yang paling
              memakan waktu. Kami balas dalam 1x24 jam kerja.
            </p>
            {/* WhatsApp ditaruh sejajar dengan formulir, bukan di bawahnya:
                untuk calon klien daerah, pesan singkat hampir selalu lebih
                cepat dimulai daripada mengisi formulir. */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href={waHref("Halo Ionowu, saya dari Trenggalek dan ingin berkonsultasi soal")}>
                <WhatsappLogo size={18} weight="fill" aria-hidden />
                WhatsApp {WA_TAMPIL}
              </Button>
              <Button href="/kontak" variant="ghost">
                Isi formulir
                <ArrowRight size={18} aria-hidden />
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </main>
  );
}
