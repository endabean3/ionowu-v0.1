import { cn } from "@/lib/utils";
import type { PolaKarya } from "@/lib/data/karya";

/* Tangkapan layar tiap karya belum ada (dokumen 03: `[BELUM ADA]`).
   Diganti pola abstrak sesuai dokumen 04 ("jangan pakai foto stok, pakai
   bentuk abstrak/grafis data"). Dipakai di beranda, daftar, dan rincian
   karya — satu sumber, supaya konsisten. */
const POLA_KELAS: Record<PolaKarya, string> = {
  grid: "bg-[linear-gradient(var(--surface-line)_1px,transparent_1px),linear-gradient(90deg,var(--surface-line)_1px,transparent_1px)] bg-[size:28px_28px]", // token-ok: pola dekoratif
  garis:
    "bg-[repeating-linear-gradient(115deg,var(--surface-line)_0,var(--surface-line)_1px,transparent_1px,transparent_18px)]",
  titik: "bg-[radial-gradient(var(--surface-line)_1.5px,transparent_1.5px)] bg-[size:20px_20px]", // token-ok: pola dekoratif
};

type KaryaMediaProps = {
  pola: PolaKarya;
  className?: string;
};

export function KaryaMedia({ pola, className }: KaryaMediaProps) {
  return (
    <div
      aria-hidden
      className={cn("relative w-full bg-surface-1", POLA_KELAS[pola], className)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-transparent to-transparent" />
    </div>
  );
}
