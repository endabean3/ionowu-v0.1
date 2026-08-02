import type { ReactNode } from "react";
import { Container, Section } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
};

/**
 * Kepala halaman untuk halaman selain beranda (Layanan, Karya, Tentang,
 * Kontak). Lebih sederhana dari Hero beranda — tanpa latar Aurora, tanpa
 * dua tombol — karena bukan bagian yang harus "wow", cukup jelas dan cepat.
 */
export function PageHeader({ eyebrow, title, lead, className }: PageHeaderProps) {
  return (
    <Section className={cn("glow-field border-b border-line pt-32 pb-16", className)}>
      <Container width="prose">
        <Reveal>
          {eyebrow && (
            <div className="mb-5 flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-accent-deep" />
              <span className="text-small font-medium tracking-widest text-accent uppercase">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="text-h1 text-ink">{title}</h1>
          {lead && <p className="mt-6 text-lead text-ink-muted">{lead}</p>}
        </Reveal>
      </Container>
    </Section>
  );
}
