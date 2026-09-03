import { WhatsappLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/Card";
import { copy, type Locale } from "@/lib/i18n";
import { EMAIL_KONTAK, waHref } from "@/lib/data/kontak";

/**
 * Saluran kontak langsung: WhatsApp dan email.
 *
 * Dipakai di halaman Kontak dan halaman lokal, dari satu komponen yang sama —
 * supaya labelnya tidak pernah berbeda antar halaman.
 *
 * Nomor WhatsApp SENGAJA tidak ditulis sebagai teks (permintaan pemilik
 * produk, 3 Sep 2026) -- tautannya tetap berfungsi penuh (`waHref()`), yang
 * dihilangkan cuma angka yang tampil di layar dan di kode halaman.
 */
export function SaluranLangsung({
  locale,
  judulSebagai: Judul = "h2",
}: {
  locale: Locale;
  /** Disesuaikan supaya urutan judul halaman tidak melompat. */
  judulSebagai?: "h2" | "h3";
}) {
  const c = copy[locale].pages.contact;

  const saluran = [
    {
      ikon: WhatsappLogo,
      label: c.waLabel,
      nilai: c.waAction,
      href: waHref(),
      eksternal: true,
    },
    {
      ikon: EnvelopeSimple,
      label: c.emailLabel,
      nilai: EMAIL_KONTAK,
      href: `mailto:${EMAIL_KONTAK}`,
      eksternal: false,
    },
  ];

  return (
    <Card statis className="flex flex-col gap-5">
      <Judul className="text-h3 text-ink">{c.directTitle}</Judul>

      <ul className="flex flex-col gap-3">
        {saluran.map((s) => {
          const Ikon = s.ikon;
          return (
            <li key={s.label}>
              <a
                href={s.href}
                {...(s.eksternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex items-center gap-3 text-ink transition-colors duration-mid ease-out hover:text-accent"
              >
                <Ikon
                  size={22}
                  weight="light"
                  aria-hidden
                  className="shrink-0 text-accent"
                />
                <span className="text-small text-ink-muted">{s.label}</span>
                <span className="font-medium">{s.nilai}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="text-small text-ink-muted">{c.note}</p>
    </Card>
  );
}
