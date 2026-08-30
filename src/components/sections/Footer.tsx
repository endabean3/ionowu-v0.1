"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { copy, localeFromPath, withLocale } from "@/lib/i18n";

/**
 * Kaki halaman (dokumen 03).
 *
 * Alamat kantor, telepon, dan tautan media sosial resmi BELUM diisi —
 * ditandai `[BELUM ADA]` di dokumen 01 dan 07 Tahap 0. Sengaja tidak diisi
 * dengan kontak pribadi Novenda dari CV; itu keputusan bisnis yang perlu
 * dikonfirmasi dulu, bukan sesuatu yang boleh diasumsikan.
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

        <div className="flex flex-col gap-2 border-t border-line pt-8 text-small text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {tahun} Ionowu. {c.footer.rights}</p>
          <p>{c.footer.line}</p>
        </div>
      </Container>
    </footer>
  );
}
