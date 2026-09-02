import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";
import { BlurReveal } from "@/components/motion/BlurReveal";

type SectionHeadingProps = {
  /** Label kecil di atas judul, mis. "Layanan". Opsional. */
  eyebrow?: string;
  title: ReactNode;
  /** Kalimat penjelas di bawah judul. Maksimal 25 kata. */
  lead?: ReactNode;
  className?: string;
  /** Tingkat judul HTML. Jaga urutan h1 → h2 → h3, jangan melompat. */
  as?: "h1" | "h2" | "h3";
};

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
  as = "h2",
}: SectionHeadingProps) {
  const Tag = as;

  return (
    <Reveal className={cn("max-w-prose", className)}>
      {eyebrow && (
        <div className="mb-5 flex items-center gap-3">
          {/* Garis pendek teal — motif berulang, diambil dari referensi desain */}
          <span aria-hidden className="h-px w-10 bg-accent-deep" />
          <span className="text-small font-medium tracking-widest text-accent uppercase">
            {eyebrow}
          </span>
        </div>
      )}

      {typeof title === "string" ? (
        <BlurReveal
          as={as}
          text={title}
          className={cn(as === "h1" ? "text-h1" : "text-h2", "text-ink block")}
        />
      ) : (
        <Tag className={cn(as === "h1" ? "text-h1" : "text-h2", "text-ink")}>
          {title}
        </Tag>
      )}

      {lead && <p className="mt-5 text-lead text-ink-muted">{lead}</p>}
    </Reveal>
  );
}
