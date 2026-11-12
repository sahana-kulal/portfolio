"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ease } from "@/lib/motion";
import { Badge, Frame } from "./Frame";
import { Tug } from "./Tug";

// Illustrative layout (not real factory data).
const ROUTES = [
  "M40,150 L40,60 L180,60 L180,110 L300,110",
  "M60,170 L140,170 L140,100 L260,100 L260,40",
  "M320,160 L220,160 L220,80 L100,80 L100,30",
];
const SHERPAS = [
  { name: "Sherpa 04", dot: "bg-success" },
  { name: "Sherpa 07", dot: "bg-amber-400" },
  { name: "Sherpa 11", dot: "bg-success" },
];
const STATIONS = ["pickup_01", "pickup_02", "drop_01", "parking"];
const TRIP_STATES = [
  { label: "Booked", cls: "bg-blue-500/20 text-blue-300", dot: "bg-blue-400" },
  { label: "Assigned", cls: "bg-amber-500/20 text-amber-300", dot: "bg-amber-400" },
  { label: "En Route", cls: "bg-emerald-500/20 text-emerald-300", dot: "bg-emerald-400" },
  { label: "Completed", cls: "bg-slate-500/20 text-slate-300", dot: "bg-slate-400" },
];
const TRIP_IDS = ["#1043", "#1042", "#1041"];

export function FleetVisual({ step }: { step: number }) {
  const kpi = step >= 2;

  // Every ~1.8 s each trip moves to its next status, so all four states stay on screen in rotation.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);
  const stationsTab = Math.floor(tick / 2) % 2 === 1;

  return (
    <Frame url="fleet-manager / map">
      <div className="absolute inset-0 grid grid-cols-[1fr_auto] gap-3 p-3 sm:p-4">
        {/* Map */}
        <div className="relative min-h-0 overflow-hidden rounded-md border border-border bg-surface-2/60">
          <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`v${i}`} x1={i * 30} x2={i * 30} y1="0" y2="200" stroke="var(--border)" strokeDasharray="2 5" />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <line key={`h${i}`} x1="0" x2="360" y1={i * 30} y2={i * 30} stroke="var(--border)" strokeDasharray="2 5" />
            ))}
            {ROUTES.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke="var(--accent)" strokeOpacity="0.35" strokeWidth="1.5" strokeLinejoin="round" />
                <motion.path
                  d={d}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.2, delay: i * 0.3, ease: ease.inOut }}
                />
                {/* Tug that follows the route, nose pointing along the direction of travel */}
                <motion.g
                  style={{ offsetPath: `path("${d}")`, offsetRotate: "auto" }}
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 7 + i * 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <g transform="scale(0.5)">
                    <Tug />
                  </g>
                </motion.g>
              </g>
            ))}
          </svg>
          <span className="absolute top-2 left-2 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 font-mono text-[10px] text-success">
            20 Sherpas online
          </span>
        </div>

        {/* Side panel: Sherpas / Stations tabs, then trips in different states */}
        <div className="flex w-[36%] min-w-[118px] flex-col gap-2 sm:w-44">
          <div className="rounded-md border border-border bg-surface-2/60">
            <div className="grid grid-cols-2 border-b border-border font-mono text-[9px] sm:text-[10px]">
              {["Sherpas", "Stations"].map((t) => {
                const on = (t === "Stations") === stationsTab;
                return (
                  <span key={t} className={`py-1.5 text-center ${on ? "border-b-2 border-(--accent) text-text" : "text-subtle"}`}>
                    {t}
                  </span>
                );
              })}
            </div>
            <ul className="space-y-1.5 p-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {(stationsTab ? STATIONS.slice(0, 3).map((n) => ({ name: n, dot: "" })) : SHERPAS).map((r) => (
                  <motion.li
                    key={`${stationsTab}-${r.name}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-1.5 rounded bg-(--accent)/15 py-1 font-mono text-[9px] sm:text-[10px]"
                  >
                    {r.dot && <span className={`size-1.5 rounded-full ${r.dot}`} />}
                    {r.name}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="shrink-0 rounded-md border border-border bg-surface-2/60 p-2">
            <p className="font-mono text-[9px] text-subtle uppercase sm:text-[10px]">Trips</p>
            <ul className="mt-1.5 space-y-1.5">
              {TRIP_IDS.map((id, i) => {
                const st = TRIP_STATES[(tick + i) % TRIP_STATES.length];
                return (
                  <li key={id} className="flex items-center justify-between gap-1 font-mono text-[9px] sm:text-[10px]">
                    <span className="text-muted">{id}</span>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={st.label}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.25 }}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${st.cls}`}
                      >
                        <span className={`size-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </motion.span>
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Selected Sherpa card */}
          <div className="hidden min-h-0 rounded-md border border-border bg-surface-2/60 p-2 font-mono text-[9px] md:block">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text">Sherpa 07</span>
              <span className="rounded border border-border px-1 py-px text-muted">23%</span>
            </div>
            <p className="mt-1 text-subtle">
              Last connected: {1 + (tick % 2)} second{tick % 2 ? "s" : ""} ago
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-400" />
              Stopped
            </span>
            <p className="mt-1.5 truncate rounded border border-border px-1.5 py-1 text-muted">
              <span className="text-subtle">Route </span>pickup_01 › … parking
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-1">
              <span className="rounded border border-border px-1.5 py-0.5 text-muted">Fleet ▾</span>
              <span className="flex items-center gap-1 text-muted">
                Enable
                <span className="relative h-3 w-6 rounded-full bg-blue-500/70">
                  <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-white" />
                </span>
              </span>
            </div>
            <span className="mt-1.5 block rounded bg-red-600 py-1 text-center text-white">■ Emergency Stop</span>
            <div className="mt-1.5 grid grid-cols-2 gap-1 text-center">
              <span className="rounded bg-border/60 py-0.5 text-text">P Parking</span>
              <span className="rounded bg-border/30 py-0.5 text-subtle">Recover</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 bottom-3 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5">
        <AnimatePresence mode="popLayout">
          {step === 0 && <Badge key="resp">⚡ Response time −50%</Badge>}
          {step === 1 && <Badge key="ws">Sub-second WebSocket updates</Badge>}
          {step === 1 && <Badge key="sess" delay={0.15}>6-month sessions</Badge>}
          {kpi && <Badge key="an">Chart.js KPI dashboard</Badge>}
          {kpi && <Badge key="tl" delay={0.15}>Traffic signal control</Badge>}
        </AnimatePresence>
      </div>
    </Frame>
  );
}
