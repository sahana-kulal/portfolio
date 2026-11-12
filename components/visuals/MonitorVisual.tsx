"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ease } from "@/lib/motion";
import { Badge, Frame } from "./Frame";
import { Tug } from "./Tug";

type Status = "ok" | "warn" | "error";

// Illustrative fleet (not real data).
const ROBOTS: {
  id: string;
  battery: number;
  status: Status;
  chip: string;
  eta: string;
  path?: string;
  secs?: number;
  at?: [number, number, number];
}[] = [
  { id: "Sherpa 01", battery: 92, status: "ok", chip: "En Route", eta: "Approaching Drop 2 in 12 s", path: "M30,30 H270 V230 H30 Z", secs: 22 },
  { id: "Sherpa 02", battery: 74, status: "ok", chip: "En Route", eta: "Approaching Station 4 in 8 s", path: "M150,30 V230 H30 V130 H150 V30", secs: 16 },
  { id: "Sherpa 03", battery: 55, status: "error", chip: "Error", eta: "Obstacle detected, paused", at: [270, 130, 90] },
  { id: "Sherpa 04", battery: 81, status: "ok", chip: "En Route", eta: "Returning to parking", path: "M30,130 H150 V230 H30 Z", secs: 12 },
  { id: "Sherpa 05", battery: 18, status: "warn", chip: "Low battery", eta: "Charging after this trip", path: "M270,30 V230 H150 V30 Z", secs: 30 },
];
const STATIONS: [string, number, number, "t" | "b" | "l"][] = [
  ["Station 1", 150, 230, "b"],
  ["Station 2", 270, 80, "l"],
  ["Station 3", 150, 30, "t"],
  ["Station 4", 30, 180, "l"],
];
const HAZARD: [number, number][] = [[146, 20], [20, 126], [146, 224], [262, 224]];

const RANK = { error: 0, warn: 1, ok: 2 } as const;
const COLOR = { ok: "#14b8a6", warn: "#f59e0b", error: "#ef4444" } as const;
const CHIP = {
  ok: "bg-teal-500/20 text-teal-300",
  warn: "bg-amber-500/20 text-amber-300",
  error: "bg-red-500/20 text-red-300",
} as const;
const DOT = { ok: "bg-teal-400", warn: "bg-amber-400", error: "bg-red-400" } as const;

function Pill({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={label.length * 5 + 10} height="13" rx="2.5" fill="#5c6bc0" />
      <text x="5" y="9.5" fontSize="7.5" fill="#fff">{label}</text>
    </g>
  );
}

export function MonitorVisual({ step }: { step: number }) {
  const sorted = step >= 1;
  const rotating = step >= 2;

  const alerts = ROBOTS.filter((r) => r.status !== "ok");
  const [focus, setFocus] = useState(0);
  useEffect(() => {
    if (!rotating) return;
    const id = setInterval(() => setFocus((f) => (f + 1) % alerts.length), 1600);
    return () => clearInterval(id);
  }, [rotating, alerts.length]);

  const list = sorted ? [...ROBOTS].sort((a, b) => RANK[a.status] - RANK[b.status]) : ROBOTS;
  const focusId = rotating ? alerts[focus].id : null;

  return (
    <Frame url="fleet-manager / monitoring">
      <div className="absolute inset-0 grid grid-cols-[1.35fr_1fr] gap-2.5 p-3 sm:gap-3 sm:p-4">
        {/* Map */}
        <div className="relative min-h-0 overflow-hidden rounded-md border border-border bg-surface-2/60">
          <svg viewBox="0 0 300 260" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full">
            <defs>
              <pattern id="mon-haz" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="3" height="6" fill="#facc15" />
                <rect x="3" width="3" height="6" fill="#3b3b4a" />
              </pattern>
            </defs>
            {[[40, 60, 100, 60], [170, 60, 90, 60], [40, 150, 100, 70], [170, 150, 90, 70]].map(([x, y, w, h]) => (
              <rect key={`${x}${y}`} x={x} y={y} width={w} height={h} rx="2" fill="var(--surface)" stroke="var(--border)" />
            ))}
            <path d="M30,30 H270 V230 H30 Z M150,30 V230 M30,130 H150" fill="none" stroke="var(--text-subtle)" strokeWidth="3.5" strokeLinejoin="round" />
            {HAZARD.map(([x, y]) => (
              <rect key={`${x}${y}`} x={x} y={y} width="8" height="16" fill="url(#mon-haz)" />
            ))}
            {STATIONS.map(([n, x, y, side]) => (
              <g key={n}>
                <circle cx={x} cy={y} r="5" fill="#5c6bc0" stroke="var(--bg)" strokeWidth="2" />
                <Pill label={n} x={side === "l" ? x + 9 : x - (n.length * 5 + 10) / 2} y={side === "t" ? y - 22 : side === "b" ? y + 9 : y - 6} />
              </g>
            ))}
            {ROBOTS.map((r) => {
              const on = focusId === r.id;
              const pill = (
                <g transform="translate(14 -6)" opacity={focusId && !on ? 0.55 : 1}>
                  <rect width={r.id.length * 4.4 + 8} height="12" rx="2.5" fill={on ? COLOR[r.status] : "#52525b"} />
                  <text x="4" y="8.5" fontSize="7" fill="#fff">{r.id}</text>
                </g>
              );
              const body = (
                <g transform="scale(0.7)">
                  <Tug color={COLOR[r.status]} cart={false} />
                </g>
              );
              const ring = r.status !== "ok" && (
                <motion.circle r="12" fill="none" stroke={COLOR[r.status]} strokeWidth="2"
                  animate={{ r: [10, on ? 34 : 24], opacity: [0.8, 0] }} transition={{ duration: on ? 1 : 1.6, repeat: Infinity, ease: "easeOut" }} />
              );
              if (r.at) {
                return (
                  <g key={r.id} transform={`translate(${r.at[0]} ${r.at[1]})`}>
                    {ring}
                    <g transform={`rotate(${r.at[2]})`}>{body}</g>
                    {pill}
                  </g>
                );
              }
              const anim = { offsetDistance: ["0%", "100%"] };
              const tr = { duration: r.secs, repeat: Infinity, ease: "linear" as const };
              return (
                <g key={r.id}>
                  <motion.g style={{ offsetPath: `path("${r.path}")`, offsetRotate: "auto" }} animate={anim} transition={tr}>
                    {ring}
                    {body}
                  </motion.g>
                  <motion.g style={{ offsetPath: `path("${r.path}")`, offsetRotate: "0deg" }} animate={anim} transition={tr}>
                    {pill}
                  </motion.g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sherpa cards */}
        <ul className="relative flex min-h-0 flex-col gap-1.5 overflow-hidden sm:gap-2">
          {list.map((r) => {
            const on = focusId === r.id;
            return (
              <motion.li
                key={r.id}
                layout
                transition={{ duration: 0.7, ease: ease.outExpo }}
                className={`rounded-md border px-2.5 py-1.5 sm:py-2 ${on ? "border-(--accent) bg-(--accent)/10" : "border-border bg-surface-2/60"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium sm:text-sm">{r.id}</span>
                  <span className="flex items-center gap-1 font-mono text-[9px] text-muted sm:text-[10px]">
                    {r.battery}%
                    <span className="h-2 w-3 rounded-[2px] border border-muted p-px">
                      <span className={`block h-full rounded-[1px] ${r.battery < 25 ? "bg-amber-400" : "bg-teal-400"}`} style={{ width: `${r.battery}%` }} />
                    </span>
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] sm:text-[10px] ${CHIP[r.status]}`}>
                    <span className={`size-1.5 rounded-full ${DOT[r.status]}`} />
                    {r.chip}
                  </span>
                  <span className="truncate text-[9px] text-muted sm:text-[10px]">{r.eta}</span>
                </div>
                <div className="relative mt-1.5 hidden h-3 items-center sm:flex">
                  <span className="size-2 rounded-full border-2 border-indigo-400" />
                  <span className="mx-1 h-px flex-1 border-t border-dotted border-border" />
                  <span className="size-2 rounded-[2px] bg-indigo-400" />
                  {r.path && (
                    <motion.span
                      className="absolute top-1/2 h-2 w-4 -translate-y-1/2 rounded-full"
                      style={{ background: COLOR[r.status] }}
                      animate={{ left: ["0%", "88%"] }}
                      transition={{ duration: r.secs ? r.secs / 3 : 6, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="pointer-events-none absolute right-3 bottom-3 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5">
        <AnimatePresence mode="popLayout">
          {step === 1 && <Badge key="top">Errors & warnings first</Badge>}
          {rotating && <Badge key="rot">↻ 15 s rotation on multiple alerts</Badge>}
        </AnimatePresence>
      </div>
    </Frame>
  );
}
