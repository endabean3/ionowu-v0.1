"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ease, sentuh } from "@/lib/motion";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Matikan gerakan SENTUH untuk kartu yang tidak bisa diklik. */
  statis?: boolean;
};

/**
 * Bentuk kartu baku untuk seluruh website (dokumen 04).
 * Saat kursor di atasnya: naik 4px + garis tepi menyala teal.
 */
export function Card({ children, className, statis = false }: CardProps) {
  const kurangiGerak = useReducedMotion();

  const gerak =
    statis || kurangiGerak
      ? {}
      : {
          whileHover: sentuh.hover,
          transition: { duration: sentuh.durationSec, ease: ease.out },
        };

  return (
    <motion.div
      className={cn("card", !statis && "card-interactive", className)}
      {...gerak}
    >
      {children}
    </motion.div>
  );
}
