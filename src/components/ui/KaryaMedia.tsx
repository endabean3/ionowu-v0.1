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
      className={cn(
        "relative w-full overflow-hidden bg-surface-1",
        POLA_KELAS[pola],
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-transparent to-transparent" />
      <div className="absolute inset-x-[8%] top-[14%] bottom-0 overflow-hidden rounded-t-media border border-b-0 border-line bg-surface-2/95 shadow-lift">
        <div className="flex h-7 items-center gap-1.5 border-b border-line px-3">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent-deep" />
          <span className="h-1.5 w-8 rounded-full bg-line" />
        </div>
        {pola === "grid" && <InventoryPreview />}
        {pola === "garis" && <AnalyticsPreview />}
        {pola === "titik" && <RetailPreview />}
      </div>
    </div>
  );
}

function InventoryPreview() {
  return (
    <div className="grid h-full grid-cols-[22%_1fr]">
      <div className="border-r border-line bg-surface-1/80 p-2">
        <div className="h-2 w-2/3 rounded-full bg-accent-deep/50" />
        <div className="mt-3 space-y-2">
          <div className="h-1.5 rounded-full bg-line" />
          <div className="h-1.5 w-4/5 rounded-full bg-line" />
          <div className="h-1.5 w-3/5 rounded-full bg-line" />
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="h-7 rounded bg-accent-deep/15" />
          <div className="h-7 rounded bg-signal/15" />
          <div className="h-7 rounded bg-surface-1" />
        </div>
        <div className="mt-3 space-y-2">
          {["w-full", "w-11/12", "w-4/5"].map((width) => (
            <div key={width} className="flex items-center gap-2 border-b border-line pb-2">
              <span className="h-2 w-2 rounded bg-accent-deep/45" />
              <span className={cn("h-1.5 rounded-full bg-line", width)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsPreview() {
  const bars = ["h-8", "h-12", "h-7", "h-16", "h-11", "h-14"];

  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div className="h-2 w-1/3 rounded-full bg-line" />
        <div className="h-5 w-12 rounded bg-accent-deep/15" />
      </div>
      <div className="mt-3 flex h-20 items-end gap-2 border-b border-line px-2">
        {bars.map((height, index) => (
          <div
            key={`${height}-${index}`}
            className={cn(
              "flex-1 rounded-t-sm",
              height,
              index === 3 ? "bg-signal/65" : "bg-accent-deep/45",
            )}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="h-2 rounded-full bg-line" />
        <div className="h-2 rounded-full bg-line" />
        <div className="h-2 rounded-full bg-line" />
      </div>
    </div>
  );
}

function RetailPreview() {
  return (
    <div className="grid h-full grid-cols-[1fr_32%]">
      <div className="grid grid-cols-3 content-start gap-2 p-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "aspect-square rounded border border-line bg-surface-1",
              index === 1 && "border-accent-deep/50 bg-accent-deep/10",
            )}
          />
        ))}
      </div>
      <div className="border-l border-line bg-surface-1/75 p-2">
        <div className="h-2 w-2/3 rounded-full bg-line" />
        <div className="mt-3 space-y-2">
          <div className="h-1.5 rounded-full bg-line" />
          <div className="h-1.5 w-4/5 rounded-full bg-line" />
        </div>
        <div className="mt-4 h-5 rounded bg-signal/65" />
      </div>
    </div>
  );
}
