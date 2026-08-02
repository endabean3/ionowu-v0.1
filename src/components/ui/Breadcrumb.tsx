import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";

type BreadcrumbProps = {
  href: string;
  label: string;
};

/** Tautan kembali sederhana di atas halaman rincian. */
export function Breadcrumb({ href, label }: BreadcrumbProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-small font-medium text-ink-muted transition-colors duration-mid ease-out hover:text-ink"
    >
      <CaretLeft size={14} weight="bold" aria-hidden />
      {label}
    </Link>
  );
}
