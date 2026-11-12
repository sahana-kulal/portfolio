"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { ease } from "@/lib/motion";

/** Counts 0 → value when scrolled into view. Server HTML holds the final value (no-JS / SEO safe). */
export function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  // Reset to 0 on mount (element is below the fold) so the count-up has somewhere to start.
  useEffect(() => {
    if (!reduce && ref.current && !inView) ref.current.textContent = format(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: ease.outExpo,
      onUpdate: (n) => {
        if (ref.current) ref.current.textContent = format(n);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- format is derived from props already listed
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(value)}
    </span>
  );
}
