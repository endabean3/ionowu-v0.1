import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** `prose` untuk teks panjang (±70 huruf/baris). `content` untuk sisanya. */
  width?: "content" | "prose";
};

/** Pembatas lebar isi + tepi kiri/kanan. Dipakai di setiap bagian halaman. */
export function Container({ children, className, width = "content" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-gutter sm:px-8",
        width === "content" ? "max-w-content" : "max-w-prose",
        className,
      )}
    >
      {children}
    </div>
  );
}

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

/**
 * Satu bagian halaman, dengan jarak atas-bawah yang besar.
 * Jarak lapang inilah pembeda paling kentara antara website mahal dan biasa.
 */
export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("py-section lg:py-section-lg", className)}
      /* scroll-margin supaya tautan #anchor tidak tertutup menu atas */
      style={{ scrollMarginTop: "6rem" }}
    >
      {children}
    </section>
  );
}
