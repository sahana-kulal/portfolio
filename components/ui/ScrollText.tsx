"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * Paragraphs start dim; scroll lights them up word by word, one continuous
 * sweep across all paragraphs in order. Wrap text in **double asterisks**
 * to render it with the accent gradient.
 */
export function ScrollText({ paragraphs, className }: { paragraphs: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.5"] });

  const words = paragraphs.map((p) => accentWords(p));
  const total = words.reduce((n, w) => n + w.length, 0);
  let k = 0;

  return (
    <div ref={ref} className={className}>
      {words.map((ws, i) => (
        <p key={i} className="text-body-lg text-text">
          {ws.map((w, j) => {
            const start = k++ / total;
            return (
              <span key={j}>
                {reduce ? w : <Word progress={scrollYProgress} range={[start, start + 1 / total]}>{w}</Word>}
                {j < ws.length - 1 && " "}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}

/** Splits a paragraph into words, wrapping text between `**` markers in the accent gradient. */
function accentWords(paragraph: string): ReactNode[] {
  let on = false;
  return paragraph.split(" ").map((word) =>
    word.split("**").map((piece, n) => {
      if (n > 0) on = !on;
      return piece && (on ? <span key={n} className="text-gradient">{piece}</span> : piece);
    }),
  );
}

function Word({ children, progress, range }: { children: ReactNode; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.3, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}
