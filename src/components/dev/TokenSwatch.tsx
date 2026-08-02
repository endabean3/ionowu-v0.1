"use client";

import { useEffect, useRef, useState } from "react";

type TokenSwatchProps = {
  /** Nama token primitif, mis. "--navy-950". */
  token: string;
  /** Nama yang ditampilkan, mis. "base". */
  nama: string;
  /** Kelas latar Tailwind, mis. "bg-base". */
  kelas: string;
};

/**
 * Petak warna untuk halaman uji token.
 *
 * Nilai warnanya dibaca dari CSS saat halaman jalan, bukan ditulis ulang di
 * sini. Jadi kalau token berubah, petak ini ikut berubah sendiri — dan tidak
 * ada nilai #hex yang tercecer di dalam komponen.
 */
export function TokenSwatch({ token, nama, kelas }: TokenSwatchProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [nilai, setNilai] = useState("...");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const v = getComputedStyle(el).getPropertyValue(token).trim();
    setNilai(v ? v.toUpperCase() : "tidak ditemukan");
  }, [token]);

  return (
    <div ref={ref} className="overflow-hidden rounded-card border border-line">
      <div className={`h-24 w-full ${kelas}`} />
      <div className="bg-surface-1 px-4 py-3">
        <div className="text-small text-ink">{nama}</div>
        <div className="tabular text-small text-ink-muted">{nilai}</div>
      </div>
    </div>
  );
}
