"use client";

import { motion } from "motion/react";

const WHEELS = [[-11, -10.5], [5, -10.5], [-11, 7.5], [5, 7.5]];

/**
 * Top-down tug drawn facing +x (use with offset-rotate: auto), roughly 30 x 16 units.
 * Wrap in a <g transform="scale(...)"> to size it for the map.
 */
export function Tug({
  color = "var(--accent)",
  cart = true,
  light = false,
}: {
  color?: string;
  cart?: boolean;
  /** Use dark ink and a white outline so the tug reads on a white map. */
  light?: boolean;
}) {
  const ink = light ? "#1e293b" : "var(--text)";
  const edge = light ? "#fff" : "var(--bg)";
  return (
    <g>
      {cart && (
        <g>
          <line x1="-14" y1="0" x2="-21" y2="0" stroke={ink} strokeOpacity=".5" strokeWidth="2" />
          <rect x="-41" y="-8" width="20" height="16" rx="2" fill="var(--surface-2)" stroke={color} strokeOpacity=".6" />
          <rect x="-37" y="-5" width="12" height="10" rx="1.5" fill="#f59e0b" opacity=".85" />
        </g>
      )}
      {WHEELS.map(([x, y]) => (
        <rect key={`${x}${y}`} x={x} y={y} width="8" height="3" rx="1.2" fill={ink} opacity=".7" />
      ))}
      <rect x="-15" y="-8" width="30" height="16" rx="4.5" fill={color} stroke={edge} strokeWidth="1.2" />
      <rect x="3" y="-5.5" width="9" height="11" rx="2.5" fill="#dbeafe" stroke={edge} strokeWidth=".8" />
      <rect x="14" y="-6.5" width="3" height="13" rx="1.5" fill={light ? "#1e293b" : "var(--bg)"} />
      <circle cx="16.5" cy="-4" r="1.6" fill="#fde047" />
      <circle cx="16.5" cy="4" r="1.6" fill="#fde047" />
      <motion.circle cx="-7" cy="0" r="2.4" fill="#f59e0b" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
    </g>
  );
}
