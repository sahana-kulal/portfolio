"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ease } from "@/lib/motion";

/** Floating impact chip. Use inside <AnimatePresence>. */
export function Badge({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { delay, duration: 0.5, ease: ease.outExpo } }}
      exit={{ opacity: 0, y: -8, scale: 0.9, transition: { duration: 0.2 } }}
      className="rounded-full border border-(--accent)/50 bg-bg/85 px-3 py-1.5 font-mono text-[11px] whitespace-nowrap text-text shadow-[0_0_30px_-8px_var(--accent)] backdrop-blur-md"
    >
      {children}
    </motion.span>
  );
}

/** Browser-window chrome around a project mockup, tinted by the project's --accent. */
export function Frame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border bg-surface/70 backdrop-blur-xl"
      style={{ boxShadow: "0 0 100px -30px var(--accent), 0 30px 60px -30px rgb(0 0 0 / 0.5)" }}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        <span className="mx-auto rounded-md bg-surface-2 px-3 py-1 font-mono text-[10px] text-subtle">{url}</span>
        <span className="w-[42px]" />
      </div>
      <div className="relative aspect-[4/3] sm:aspect-[16/11]">{children}</div>
    </div>
  );
}

/** Types `text` out character by character on mount. Remount (change key) to restart. */
export function TypeText({ text, speed = 28, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let id: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      id = setInterval(() => setN((c) => (c >= text.length ? c : c + 1)), speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [reduce, text, speed, delay]);

  const shown = reduce ? text.length : n;
  return (
    <span>
      {text.slice(0, shown)}
      {shown < text.length && <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-(--accent)" />}
    </span>
  );
}
