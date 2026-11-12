"use client";

import { motion } from "motion/react";
import { dur, ease } from "@/lib/motion";

/** Fade + rise + un-blur when scrolled into view (once). */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: dur.slow, ease: ease.outExpo, delay }}
    >
      {children}
    </motion.div>
  );
}
