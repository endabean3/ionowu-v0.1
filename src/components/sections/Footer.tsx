"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { copy, localeFromPath, withLocale } from "@/lib/i18n";
import { EMAIL_KONTAK, waHref } from "@/lib/data/kontak";

/**
 * Kaki halaman (dokumen 03).
 *
 * WhatsApp dan email resmi sudah ditetapkan dan ditampilkan di sini —
 * keduanya diambil dari src/lib/data/kontak.ts supaya tautannya tidak pernah
 * berbeda dari yang muncul di halaman Kontak. Nomor WhatsApp SENGAJA tidak
 * ditulis sebagai teks (permintaan pemilik produk, 3 Sep 2026) — tautannya
 * tetap berfungsi penuh, hanya angkanya yang tidak ditampilkan.
 *
 * Alamat kantor dan tautan media sosial MASIH `[BELUM ADA]` (dokumen 01 dan
 * 07 Tahap 0), jadi tetap tidak ditulis — bukan lupa.
 */
export function Footer() {
  const tahun = new Date().getFullYear();
  const locale = localeFromPath(usePathname());
  const c = copy[locale];
  const tautan = [
    { label: c.nav.services, href: withLocale("/layanan", locale) },
    { label: c.nav.work, href: withLocale("/karya", locale) },
    { label: c.nav.about, href: withLocale("/tentang", locale) },
    { label: c.nav.contact, href: withLocale("/kontak", locale) },
    // Halaman lokal hanya ada dalam bahasa Indonesia, jadi tautannya pun
    // hanya muncul di versi Indonesia. Tautan internal ini penting: halaman
    // yang tidak ditunjuk dari mana-mana jarang dirayapi, sebagus apa pun
    // isinya.
    ...(locale === "id"
      ? [{ label: "Programmer Trenggalek", href: "/programmer-trenggalek" }]
      : []),
  ];

  return (
    <footer className="border-t border-line py-16">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <Logo tinggi={28} />

          <nav aria-label={c.nav.footerNav}>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {tautan.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="text-small text-ink-muted transition-colors duration-mid ease-out hover:text-ink"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-8 text-small">
          <a
            href={waHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted transition-colors duration-mid ease-out hover:text-ink"
          >
            WhatsApp
          </a>
          <a
            href={`mailto:${EMAIL_KONTAK}`}
            className="text-ink-muted transition-colors duration-mid ease-out hover:text-ink"
          >
            {EMAIL_KONTAK}
          </a>
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-8 text-small text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {tahun} Ionowu. {c.footer.rights}</p>
          <p>{c.footer.line}</p>
        </div>
      </Container>
    </footer>
  );
}
