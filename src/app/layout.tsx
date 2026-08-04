import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PageTransition } from "@/components/motion/PageTransition";
import { LocaleHtmlSync } from "@/components/LocaleHtmlSync";
import { localizedAlternates } from "@/lib/i18n";
import "./globals.css";

/* Huruf — dokumen 04.
   next/font meng-host sendiri berkasnya. Tidak ada permintaan ke Google saat
   halaman dibuka, dan tidak ada pergeseran tata letak. */

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"], // 700+ dilarang: terlihat murah di latar gelap
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://ionowu.com"
    : "http://localhost:3000");
const themeInitScript = `
(() => {
  try {
    const saved = localStorage.getItem("ionowu-theme");
    const theme = saved === "dark" || saved === "light"
      ? saved
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();
`;
// Sama dengan scriptSrc di next.config.ts (header CSP): 'unsafe-eval' hanya
// untuk dev, dibutuhkan React untuk fitur debug (jejak error, overlay). Dulu
// ditulis mati tanpa 'unsafe-eval' — meta tag ini yang mengatur, karena
// browser mengambil irisan paling ketat kalau ada dua sumber CSP, jadi
// header yang sudah benar dibatalkan lagi oleh tag ini.
const documentCsp = [
  "default-src 'self'",
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ionowu - Software House",
    template: "%s · Ionowu",
  },
  description:
    "Ionowu adalah software house. Kami merancang, membangun, dan merawat aplikasi web dan sistem internal untuk perusahaan yang sedang bertumbuh.",
  applicationName: "Ionowu",
  manifest: "/manifest.webmanifest",
  alternates: localizedAlternates("/"),
  icons: {
    icon: [
      { url: "/favicon-ionowu.ico", sizes: "any" },
      {
        url: "/brand/ionowu-mark-full-color.svg",
        type: "image/svg+xml",
      },
      { url: "/favicon-ionowu-512.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-ionowu-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon-ionowu.ico",
    apple: "/apple-touch-icon-ionowu.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Ionowu",
    title: "Ionowu - Software House",
    description:
      "Kami bangun perangkat lunak yang menopang bisnis Anda.",
  },
};

export const viewport: Viewport = {
  /* Warna bilah atas browser di HP. Ini satu-satunya tempat nilai warna boleh
     ditulis langsung: sistem operasi membacanya sebelum CSS apa pun dimuat,
     jadi var() tidak mungkin dipakai.
     WAJIB sama dengan warna dasar mode light di globals.css dan manifest. */
  themeColor: "#f4f8fb", // token-ok: dibaca OS sebelum CSS dimuat
  width: "device-width",
  initialScale: 1,
  // maximumScale / userScalable sengaja tidak dikunci — pengguna harus bisa zoom.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-theme="light"
      suppressHydrationWarning
      // Next 16 tidak lagi menimpa scroll-behavior saat pindah halaman.
      // Atribut ini mengembalikan perilaku lama: pindah halaman langsung ke atas,
      // tapi tautan #anchor tetap bergulir halus.
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        {/* Hostinger mengganti header CSP upstream. Kebijakan dokumen ini tetap
            membatasi resource; framing dilindungi X-Frame-Options: DENY. */}
        <meta httpEquiv="Content-Security-Policy" content={documentCsp} />
        {/* <script> mentah, BUKAN next/script (dicoba lebih dulu, terbukti gagal):
            strategy="beforeInteractive" App Router memakai antrean
            `self.__next_s` yang baru diproses oleh bundel JS klien yang
            dimuat `async` — jalannya tidak dijamin sebelum cat pertama
            layar. Dibuktikan lewat jejak sumber Next sendiri
            (client/app-bootstrap.js: loadScriptsInSequence memakai
            document.createElement, dipanggil dari skrip async). Tag mentah
            di sini dieksekusi browser secara sinkron saat parsing <head>,
            sebelum <body> mulai digambar — jadi tema tidak berkedip. */}
        <script
          id="ionowu-theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-base text-ink">
        <LocaleHtmlSync />
        <Header />
        {/* Footer di layout bersama, BUKAN ditulis ulang tiap halaman —
            supaya tidak ada halaman yang lupa memasangnya (pernah terjadi:
            6 halaman baru sempat tanpa footer sama sekali, ketahuan lewat
            pemeriksaan DOM sungguhan saat verifikasi Tahap 4). */}
        <PageTransition>{children}</PageTransition>
        <Footer />
      </body>
    </html>
  );
}
