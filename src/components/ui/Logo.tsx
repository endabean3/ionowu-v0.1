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
  const berkasGelap = jenis === "full" ? "ionowu-white.svg" : "ionowu-mark-white.svg";
  const berkasTerang =
    jenis === "full" ? "ionowu-full-color.svg" : "ionowu-mark-full-color.svg";

  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ height: tinggi, width: lebar }}
    >
      <Image
        src={`/brand/${berkasGelap}`}
        alt="Ionowu"
        width={lebar}
        height={tinggi}
        className="theme-logo-dark absolute inset-0 h-full w-full"
        priority
      />
      <Image
        src={`/brand/${berkasTerang}`}
        alt=""
        width={lebar}
        height={tinggi}
        className="theme-logo-light absolute inset-0 h-full w-full"
        aria-hidden
        priority
      />
    </span>
  );
}
