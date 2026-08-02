import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** `full` = logo horizontal dengan wordmark. `mark` = monogram saja. */
  jenis?: "full" | "mark";
  className?: string;
  /** Tinggi dalam piksel. Lebar mengikuti proporsi asli. */
  tinggi?: number;
};

/* Ukuran asli berkas SVG — dipakai supaya proporsi tidak pernah berubah
   dan ruang di halaman sudah dipesan sebelum gambar dimuat (cegah CLS). */
const UKURAN = {
  full: { w: 768, h: 199 },
  mark: { w: 226, h: 191 },
} as const;

/**
 * Logo Ionowu.
 *
 * Aturan brand (referensi/brand/README.md) — semuanya DILARANG:
 * menambah bayangan, garis luar, gradasi, memutar, memiringkan,
 * atau mengganti warna sebagian. Komponen ini sengaja tidak menerima
 * prop untuk hal-hal itu.
 */
export function Logo({ jenis = "full", className, tinggi = 32 }: LogoProps) {
  const { w, h } = UKURAN[jenis];
  const lebar = Math.round((w / h) * tinggi);
  const berkas = jenis === "full" ? "ionowu-white.svg" : "ionowu-mark-white.svg";

  return (
    <Image
      src={`/brand/${berkas}`}
      alt="Ionowu"
      width={lebar}
      height={tinggi}
      className={cn("h-auto w-auto", className)}
      style={{ height: tinggi, width: lebar }}
      priority
    />
  );
}
