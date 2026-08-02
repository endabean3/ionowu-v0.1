import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { TokenSwatch } from "@/components/dev/TokenSwatch";

/* ============================================================
   HALAMAN UJI FONDASI — dipindah dari `/` pada Tahap 2.
   Bukan bagian dari website yang dilihat pengunjung. Gunanya
   membuktikan token, huruf, komponen dasar, dan empat gerakan
   baku masih benar setelah diubah-ubah. Buka lewat /dev/fondasi.
   ============================================================ */

/* Nilai warnanya dibaca dari CSS saat halaman jalan (lihat TokenSwatch),
   jadi tidak ada satu pun #hex yang ditulis ulang di sini. */
const warna = [
  { nama: "base", kelas: "bg-base", token: "--navy-950" },
  { nama: "surface-1", kelas: "bg-surface-1", token: "--navy-900" },
  { nama: "surface-2", kelas: "bg-surface-2", token: "--navy-800" },
  { nama: "line", kelas: "bg-line", token: "--navy-700" },
  { nama: "brand-navy", kelas: "bg-brand-navy", token: "--navy-500" },
  { nama: "accent-deep", kelas: "bg-accent-deep", token: "--teal-500" },
  { nama: "accent", kelas: "bg-accent", token: "--teal-400" },
  { nama: "signal", kelas: "bg-signal", token: "--orange-500" },
];

const kontras = [
  { pasangan: "ink di atas base", nilai: "17.00", lulus: "AAA" },
  { pasangan: "ink-muted di atas base", nilai: "7.09", lulus: "AAA" },
  { pasangan: "accent di atas base", nilai: "9.51", lulus: "AAA" },
  { pasangan: "accent-deep di atas base", nilai: "5.85", lulus: "AA" },
  { pasangan: "on-signal di atas signal", nilai: "7.32", lulus: "AAA" },
];

export default function HalamanUjiFondasi() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="flex-1">
      {/* ---------- Pembuka ---------- */}
      <Section className="glow-field border-b border-line">
        <Container>
          <Reveal>
            <Logo tinggi={36} />
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-12 max-w-4xl text-display text-ink">
              Fondasi <span className="text-accent">siap.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-8 max-w-prose text-lead text-ink-muted">
              Warna, huruf, jarak, bentuk, dan empat gerakan baku sudah terpasang
              sesuai dokumen 04 dan 06. Halaman ini hanya untuk pemeriksaan.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-12 flex flex-wrap gap-4">
              <Button href="#komponen" size="lg">
                Lihat Komponen
              </Button>
              <Button href="#warna" size="lg" variant="secondary">
                Lihat Token
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- Warna ---------- */}
      <Section id="warna">
        <Container>
          <SectionHeading
            eyebrow="Token"
            title="Warna"
            lead="Latar gelap 70%, teks dan garis 25%, teal 4%, oranye 1%. Oranye hanya untuk tombol aksi utama."
          />

          <RevealGroup className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {warna.map((w) => (
              <RevealItem key={w.nama}>
                <TokenSwatch nama={w.nama} kelas={w.kelas} token={w.token} />
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal className="mt-12">
            <Card statis className="max-w-2xl">
              <h3 className="text-h3 text-ink">Kontras sudah dihitung</h3>
              <p className="mt-3 text-ink-muted">
                Semua pasangan di bawah melewati WCAG AA (minimal 4,5:1).
              </p>
              <ul className="mt-6 space-y-3">
                {kontras.map((k) => (
                  <li
                    key={k.pasangan}
                    className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-0"
                  >
                    <span className="text-small text-ink-muted">{k.pasangan}</span>
                    <span className="tabular text-small text-ink">
                      {k.nilai}:1 <span className="text-accent">{k.lulus}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-small text-ink-muted">
                Teks di atas tombol oranye wajib gelap. Putih di atas oranye hanya
                2,71:1 — gagal WCAG.
              </p>
            </Card>
          </Reveal>
        </Container>
      </Section>

      {/* ---------- Huruf ---------- */}
      <Section className="border-y border-line bg-surface-1/40">
        <Container>
          <SectionHeading
            eyebrow="Token"
            title="Huruf"
            lead="Space Grotesk untuk judul, Inter untuk isi, JetBrains Mono untuk angka."
          />

          <div className="mt-16 space-y-10">
            <Reveal>
              <div className="text-small text-ink-muted">display · 40→120px</div>
              <p className="font-display text-display text-ink">Ionowu</p>
            </Reveal>
            <Reveal>
              <div className="text-small text-ink-muted">h1 · 32→64px</div>
              <p className="font-display text-h1 text-ink">
                Perangkat lunak yang menopang bisnis
              </p>
            </Reveal>
            <Reveal>
              <div className="text-small text-ink-muted">h2 · 28→44px</div>
              <p className="font-display text-h2 text-ink">Cara kami bekerja</p>
            </Reveal>
            <Reveal>
              <div className="text-small text-ink-muted">
                isi · 16px · maksimal ±70 huruf per baris
              </div>
              <p className="max-w-prose text-body text-ink-muted">
                Design bukan cuma soal gambar dan warna. Ini cara menceritakan
                kegunaan sebuah sistem, menjelaskan masalah nyata, dan menunjukkan
                jalan keluarnya. Baris teks sengaja dibatasi supaya mata tidak
                lelah saat berpindah baris.
              </p>
            </Reveal>
            <Reveal>
              <div className="text-small text-ink-muted">angka · JetBrains Mono</div>
              <p className="tabular text-h2 text-accent">1.284 · 99,9% · 2021</p>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------- Komponen & Gerakan ---------- */}
      <Section id="komponen">
        <Container>
          <SectionHeading
            eyebrow="Komponen"
            title="Empat gerakan baku"
            lead="Hanya empat ini yang boleh dipakai di seluruh website. Arahkan kursor dan klik untuk memeriksanya."
          />

          <RevealGroup className="mt-16 grid gap-6 md:grid-cols-3">
            <RevealItem>
              <Card className="h-full">
                <div className="tabular text-small text-accent">01</div>
                <h3 className="mt-3 text-h3 text-ink">Masuk</h3>
                <p className="mt-3 text-ink-muted">
                  Naik 24px + memudar muncul. 600ms. Semua kartu di halaman ini
                  memakainya, dengan jeda 80ms antar kartu.
                </p>
              </Card>
            </RevealItem>
            <RevealItem>
              <Card className="h-full">
                <div className="tabular text-small text-accent">02</div>
                <h3 className="mt-3 text-h3 text-ink">Sentuh</h3>
                <p className="mt-3 text-ink-muted">
                  Naik 4px + garis tepi menyala teal. 250ms. Arahkan kursor ke
                  kartu ini.
                </p>
              </Card>
            </RevealItem>
            <RevealItem>
              <Card className="h-full">
                <div className="tabular text-small text-accent">03 · 04</div>
                <h3 className="mt-3 text-h3 text-ink">Tekan &amp; Pindah</h3>
                <p className="mt-3 text-ink-muted">
                  Tekan: mengecil jadi 98%, 120ms. Pindah halaman: memudar + naik
                  12px, 400ms.
                </p>
              </Card>
            </RevealItem>
          </RevealGroup>

          <Reveal className="mt-16">
            <div className="flex flex-wrap items-center gap-4">
              <Button>Aksi Utama</Button>
              <Button variant="secondary">Aksi Kedua</Button>
              <Button variant="ghost">Aksi Ketiga</Button>
              <Button disabled>Tidak Aktif</Button>
            </div>
            <p className="mt-6 max-w-prose text-small text-ink-muted">
              Tinggi tombol minimal 44px. Tekan Tab untuk memeriksa cincin fokus.
              Kalau animasi dimatikan di setelan perangkat, semua gerakan di atas
              berhenti dan halaman tetap utuh.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Kaki halaman situs (Footer bersama) sekarang dipasang sekali di
          layout.tsx untuk semua rute, termasuk halaman ini — jadi tidak
          perlu footer terpisah di sini lagi. */}
    </main>
  );
}
