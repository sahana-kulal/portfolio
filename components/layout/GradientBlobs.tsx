"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect } from "react";

const blobs = [
  { color: "var(--violet)", size: "max(42vw, 360px)", top: "-10%", left: "-8%", drift: { x: [0, 60, -20, 0], y: [0, 40, 80, 0] }, dur: 26 },
  { color: "var(--cyan)", size: "max(36vw, 320px)", top: "30%", left: "62%", drift: { x: [0, -70, 10, 0], y: [0, -30, 50, 0] }, dur: 30 },
  { color: "var(--blue)", size: "max(30vw, 300px)", top: "65%", left: "15%", drift: { x: [0, 50, 90, 0], y: [0, -60, -10, 0] }, dur: 34 },
];

/** Slow drifting gradient blobs + one that lazily follows the cursor. */
export function GradientBlobs() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 30, damping: 20 });
  const y = useSpring(my, { stiffness: 30, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[110px]"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            background: b.color,
            opacity: "var(--blob-opacity)",
          }}
          // MotionConfig reducedMotion="user" skips these drifts for reduced-motion users.
          animate={b.drift}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Always rendered (avoids hydration mismatch); it simply doesn't move under reduced motion. */}
      <motion.div
        className="absolute -top-[15vw] -left-[15vw] size-[30vw] rounded-full blur-[120px]"
        style={{ x, y, background: "var(--pink)", opacity: "calc(var(--blob-opacity) * 0.6)" }}
      />
    </div>
  );
}
