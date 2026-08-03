"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ease } from "@/lib/motion";
import {
  copy,
  LOCALE_LABEL,
  LOCALES,
  localeFromPath,
  stripLocale,
  withLocale,
} from "@/lib/i18n";

/**
 * Menu navigasi.
 *
 * Terinspirasi bentuk pil pada referensi/react-bits PillNav, tapi ditulis
 * ulang tanpa GSAP dan tanpa react-router (keduanya bukan bagian dari
 * susunan teknis kita — dokumen 05). Indikator pil yang meluncur memakai
 * `layoutId` dari `motion`, pustaka yang sudah ada di paket kita.
 */
export function Header() {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [ditunjuk, setDitunjuk] = useState<string | null>(null);
  const kurangiGerak = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const c = copy[locale];
  const pathTanpaLocale = stripLocale(pathname);
  const tautan = [
    { label: c.nav.services, path: "/layanan", href: withLocale("/layanan", locale) },
    { label: c.nav.work, path: "/karya", href: withLocale("/karya", locale) },
    { label: c.nav.about, path: "/tentang", href: withLocale("/tentang", locale) },
    { label: c.nav.contact, path: "/kontak", href: withLocale("/kontak", locale) },
  ];

  return (
    // Latar kaca di seluruh bar — dokumen 04 mengizinkan kaca untuk "menu
    // atas". Tanpa ini, konten yang digulir di baliknya (mis. strip
    // teknologi berjalan) terlihat menembus lewat celah transparan header.
    <header className="glass fixed inset-x-0 top-0 z-sticky border-x-0 border-t-0">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-gutter py-4 sm:px-8">
        <Link
          href={withLocale("/", locale)}
          aria-label={c.nav.homeLabel}
          className="rounded-full"
        >
          <Logo tinggi={28} />
        </Link>

        {/* ---------- Menu laptop ---------- */}
        <nav
          aria-label={c.nav.mainNav}
          className="glass hidden items-center gap-1 rounded-full p-1.5 md:flex"
          onMouseLeave={() => setDitunjuk(null)}
        >
          {tautan.map((t) => {
            const aktif =
              pathTanpaLocale === t.path || pathTanpaLocale.startsWith(`${t.path}/`);

            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={aktif ? "page" : undefined}
                onMouseEnter={() => setDitunjuk(t.href)}
                className="relative rounded-full px-4 py-2 text-small font-medium text-ink-muted transition-colors duration-mid ease-out hover:text-ink aria-[current=page]:text-ink"
              >
                {(ditunjuk === t.href || (!ditunjuk && aktif)) && (
                  <motion.span
                    layoutId="pil-nav-aktif"
                    className="absolute inset-0 rounded-full bg-surface-2"
                    transition={
                      kurangiGerak
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 32 }
                    }
                  />
                )}
                <span className="relative">{t.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle label={c.nav.theme} />
          <div className="glass flex items-center rounded-full p-1">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={withLocale(pathTanpaLocale, l)}
                aria-current={locale === l ? "page" : undefined}
                className="rounded-full px-3 py-1.5 text-small font-medium text-ink-muted transition-colors duration-mid ease-out hover:text-ink aria-[current=page]:bg-surface-2 aria-[current=page]:text-ink"
              >
                {LOCALE_LABEL[l]}
              </Link>
            ))}
          </div>
          <Link
            href={withLocale("/kontak", locale)}
            className="btn btn-primary btn-md"
          >
            {c.nav.cta}
          </Link>
        </div>

        {/* ---------- Kontrol HP ---------- */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle label={c.nav.theme} />
          <button
            type="button"
            aria-label={menuTerbuka ? c.nav.closeMenu : c.nav.openMenu}
            aria-expanded={menuTerbuka}
            onClick={() => setMenuTerbuka((v) => !v)}
            className="glass flex h-11 w-11 items-center justify-center rounded-full text-ink"
          >
            {menuTerbuka ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {/* ---------- Menu HP ---------- */}
      <AnimatePresence>
        {menuTerbuka && (
          <motion.nav
            aria-label={c.nav.mobileNav}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: ease.out }}
            className="glass mx-gutter mt-2 rounded-panel p-2 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {tautan.map((t) => {
                const aktif =
                  pathTanpaLocale === t.path || pathTanpaLocale.startsWith(`${t.path}/`);

                return (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      aria-current={aktif ? "page" : undefined}
                      onClick={() => setMenuTerbuka(false)}
                      className="block rounded-card px-4 py-3 text-body text-ink transition-colors duration-mid ease-out hover:bg-surface-2 aria-[current=page]:bg-surface-2 aria-[current=page]:text-accent"
                    >
                      {t.label}
                    </Link>
                  </li>
                );
              })}
              <li className="grid grid-cols-3 gap-2 pt-1">
                {LOCALES.map((l) => (
                  <Link
                    key={l}
                    href={withLocale(pathTanpaLocale, l)}
                    onClick={() => setMenuTerbuka(false)}
                    aria-current={locale === l ? "page" : undefined}
                    className="rounded-card border border-line px-3 py-2 text-center text-small text-ink-muted aria-[current=page]:bg-surface-2 aria-[current=page]:text-ink"
                  >
                    {LOCALE_LABEL[l]}
                  </Link>
                ))}
              </li>
              <li className="pt-1">
                <Link
                  href={withLocale("/kontak", locale)}
                  onClick={() => setMenuTerbuka(false)}
                  className="btn btn-primary btn-md w-full"
                >
                  {c.nav.cta}
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
