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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ionowu - Software House",
    template: "%s · Ionowu",
  },
  description:
    "Ionowu adalah software house. Kami merancang, membangun, dan merawat aplikasi web dan sistem internal untuk perusahaan yang sedang bertumbuh.",
  applicationName: "Ionowu",
  alternates: localizedAlternates("/"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
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
     WAJIB sama dengan --navy-950 di globals.css. */
  themeColor: "#050a12", // token-ok: dibaca OS sebelum CSS dimuat
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
      // Next 16 tidak lagi menimpa scroll-behavior saat pindah halaman.
      // Atribut ini mengembalikan perilaku lama: pindah halaman langsung ke atas,
      // tapi tautan #anchor tetap bergulir halus.
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
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
