"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig, useReducedMotion } from "motion/react";

/** Global motion config + Lenis smooth scroll (smoothing off under prefers-reduced-motion). */
export function Providers({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  // Tree shape is identical on server and client; only Lenis options change (no DOM impact).
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.1, anchors: true, smoothWheel: !reduce }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
