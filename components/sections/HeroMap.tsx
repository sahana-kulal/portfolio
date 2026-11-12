"use client";

import { motion, useReducedMotion } from "motion/react";
import { Tug } from "@/components/visuals/Tug";

// Decorative floor plan: aisles are the lines the tugs drive on. Illustrative, not a real site.
const AISLES = "M80,80 H1120 V620 H80 Z M400,80 V620 M800,80 V620 M80,350 H1120";
const CELLS: [number, number, number, number][] = [
  [80, 80, 400, 350], [400, 80, 800, 350], [800, 80, 1120, 350],
  [80, 350, 400, 620], [400, 350, 800, 620], [800, 350, 1120, 620],
];
const STATIONS: [number, number][] = [[400, 80], [800, 350], [400, 620], [80, 350], [1120, 350], [800, 80]];
const TUGS = [
  { d: "M80,80 H1120 V620 H80 Z", secs: 52, color: "#06b6d4", cart: true },
  { d: "M80,350 H400 V620 H80 Z", secs: 26, color: "#7c3aed", cart: false },
  { d: "M400,80 H800 V350 H400 Z", secs: 32, color: "#3b82f6", cart: true },
  { d: "M800,350 H1120 V80 H800 Z", secs: 30, color: "#06b6d4", cart: false },
  { d: "M800,620 H400 V350 H800 Z", secs: 38, color: "#7c3aed", cart: true },
];

/** Live-looking map that sits behind the hero copy. Purely decorative. */
export function HeroMap() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70 [mask-image:radial-gradient(ellipse_80%_75%_at_60%_45%,black_35%,transparent_80%)]"
    >
      <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="size-full">
        <defs>
          <pattern id="hero-rack" width="24" height="20" patternUnits="userSpaceOnUse">
            <rect x="3" y="3" width="16" height="12" rx="2.5" fill="none" stroke="var(--text-subtle)" strokeOpacity=".22" />
          </pattern>
        </defs>

        {CELLS.map(([x0, y0, x1, y1]) => (
          <rect key={`${x0}${y0}`} x={x0 + 36} y={y0 + 36} width={x1 - x0 - 72} height={y1 - y0 - 72} fill="url(#hero-rack)" />
        ))}

        <path d={AISLES} fill="none" stroke="var(--text-subtle)" strokeOpacity=".35" strokeWidth="5" strokeLinejoin="round" />
        <path d={AISLES} fill="none" stroke="var(--cyan)" strokeOpacity=".12" strokeWidth="1.5" strokeDasharray="10 12" />

        {STATIONS.map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="9" fill="var(--bg)" stroke="var(--cyan)" strokeOpacity=".55" strokeWidth="3" />
        ))}

        {TUGS.map((t, i) => (
          <motion.g
            key={t.d}
            style={{ offsetPath: `path("${t.d}")`, offsetRotate: "auto" }}
            initial={{ offsetDistance: `${i * 17}%` }}
            animate={reduce ? undefined : { offsetDistance: [`${i * 17}%`, `${i * 17 + 100}%`] }}
            transition={{ duration: t.secs, repeat: Infinity, ease: "linear" }}
          >
            <g transform="scale(1.35)">
              <Tug color={t.color} cart={t.cart} />
            </g>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
