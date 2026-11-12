"use client";

import { AnimatePresence, motion } from "motion/react";
import { ease } from "@/lib/motion";
import { Badge, Frame } from "./Frame";

// Illustrative numbers (not real fleet data). Palette follows common Grafana series colours.
const C = ["#73bf69", "#f2cc0c", "#5794f2", "#ff9830", "#f2495c"];
const DAYS = ["10/01", "10/02", "10/03", "10/04"];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-col rounded-md border border-border bg-surface-2/60 p-2 sm:p-2.5">
      <p className="font-mono text-[9px] text-muted sm:text-[10px]">{title}</p>
      <div className="relative mt-1.5 min-h-0 flex-1">{children}</div>
    </div>
  );
}

function Grid() {
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col justify-between">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-px w-full bg-border" />
      ))}
    </div>
  );
}

function Days() {
  return (
    <div className="mt-1 flex font-mono text-[8px] text-subtle">
      {DAYS.map((d) => (
        <span key={d} className="flex-1 text-center">{d}</span>
      ))}
    </div>
  );
}

/** Grouped vertical bars per day. `data[day][series]` is a 0–100 height. */
function Bars({ data, colors }: { data: number[][]; colors: string[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <Grid />
        <div className="absolute inset-0 flex">
          {data.map((day, d) => (
            <div key={d} className="flex flex-1 items-end justify-center gap-[3px] px-1">
              {day.map((v, s) => (
                <motion.span
                  key={s}
                  className="w-full max-w-4 origin-bottom rounded-t-[2px]"
                  style={{ height: `${v}%`, background: colors[s] }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.8, ease: ease.outExpo, delay: 0.15 + d * 0.12 + s * 0.05 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <Days />
    </div>
  );
}

const LINES = [
  { c: C[0], p: [[6, 0], [34, 46], [66, 78], [96, 84]] },
  { c: C[2], p: [[12, 0], [38, 14], [66, 16], [96, 34]] },
  { c: C[1], p: [[10, 3], [24, 18], [96, 22]] },
  { c: C[4], p: [[62, 0], [80, 4], [86, 2]] },
];

function Lines() {
  return (
    <div className="relative size-full">
      <Grid />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        {/* Reveal left to right with a clip; pathLength would break with non-scaling strokes */}
        <defs>
          <clipPath id="an-lines-clip">
            <motion.rect
              x="-5" y="-5" height="110"
              initial={{ width: 0 }} animate={{ width: 110 }}
              transition={{ duration: 1.6, ease: ease.inOut, delay: 0.15 }}
            />
          </clipPath>
        </defs>
        <g clipPath="url(#an-lines-clip)">
          {LINES.map((l, i) => (
            <polyline
              key={i}
              points={l.p.map(([x, y]) => `${x},${100 - y}`).join(" ")}
              fill="none" stroke={l.c} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Horizontal bars: name left, bar on a track, value right. */
function HBars({ rows, color, max, unit = "" }: { rows: [string, number][]; color: string; max: number; unit?: string }) {
  return (
    <ul className="flex h-full flex-col justify-between gap-1">
      {rows.map(([n, v], i) => (
        <li key={n} className="flex items-center gap-2 font-mono text-[8px] sm:text-[9px]">
          <span className="w-[34%] shrink-0 truncate text-right text-muted">{n}</span>
          <span className="relative h-2 flex-1 overflow-hidden rounded-sm bg-border/60 sm:h-2.5">
            <motion.span
              className="absolute inset-y-0 left-0 origin-left rounded-sm"
              style={{ width: `${(v / max) * 100}%`, background: color }}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: ease.outExpo, delay: 0.15 + i * 0.08 }}
            />
          </span>
          <span className="w-9 text-text tabular-nums">{v}{unit}</span>
        </li>
      ))}
    </ul>
  );
}

function ErrorTypes() {
  const rows: [string, number][] = [["Sherpa 02", 100], ["Sherpa 05", 72], ["Sherpa 01", 26], ["Sherpa 04", 12]];
  return (
    <ul className="flex h-full flex-col justify-between gap-1.5">
      {rows.map(([n, w], i) => (
        <li key={n} className="flex items-center gap-2 font-mono text-[8px] sm:text-[9px]">
          <span className="w-[26%] shrink-0 truncate text-right text-muted">{n}</span>
          <span className="relative h-3 flex-1 sm:h-4">
            <motion.span
              className="absolute inset-y-0 left-0 origin-left rounded-sm bg-[repeating-linear-gradient(90deg,transparent_0_16px,rgba(10,10,18,.35)_16px_17px),linear-gradient(90deg,#f2495c,#fda4af)]"
              style={{ width: `${w}%` }}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: ease.outExpo, delay: 0.15 + i * 0.1 }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

const MTTR: [string, number][] = [
  ["Planner timeout", 6.3], ["Driver restart", 6.2], ["Lidar disconnect", 5.3],
  ["Network drop", 3.2], ["Sensor fault", 2.7], ["Obstacle sensor", 1.1],
];
const OBSTACLE: [string, number][] = [
  ["Route A → B", 0.088], ["Route B → C", 0.075], ["Route C → D", 0.07],
  ["Route D → A", 0.046], ["Route A → C", 0.03], ["Route B → D", 0.015],
];

const SCREENS = [
  [
    { title: "Total Fleet Hours", node: <Bars data={[[38, 3, 85, 40], [0, 0, 48, 0], [28, 0, 80, 8], [0, 76, 0, 0]]} colors={C} /> },
    { title: "Sherpa Travel Distance (km)", node: <Lines /> },
  ],
  [
    { title: "Error Counts", node: <Bars data={[[81, 94], [13, 69], [6, 31], [6, 6]]} colors={[C[1], "#e8b04a"]} /> },
    { title: "Error Types", node: <ErrorTypes /> },
  ],
  [
    { title: "MTTR (mins)", node: <HBars rows={MTTR} color={C[4]} max={6.5} /> },
    { title: "Avg Obstacle Time Per Route (hrs)", node: <HBars rows={OBSTACLE} color={C[0]} max={0.09} /> },
  ],
];

export function AnalyticsVisual({ step }: { step: number }) {
  const screen = SCREENS[Math.min(step, SCREENS.length - 1)];

  return (
    <Frame url="analytics / fleet-kpis">
      <div className="absolute inset-0 flex flex-col gap-2 p-3 sm:gap-2.5 sm:p-4">
        {/* Variable bar + time range, like a Grafana dashboard */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[8px] sm:text-[9px]">
          {["Client: All", "Fleet: All", "Sherpa: All"].map((v) => (
            <span key={v} className="rounded border border-border bg-surface px-1.5 py-0.5 text-muted">{v} ▾</span>
          ))}
          <span className="ml-auto flex items-center gap-1.5 rounded border border-border bg-surface px-1.5 py-0.5 text-muted">
            Last 4 days
            <span className="flex items-center gap-1 text-success">
              <span className="size-1.5 animate-ping rounded-full bg-success" /> live
            </span>
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-2.5"
            initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: ease.outExpo }}
          >
            {screen.map((p) => (
              <Panel key={p.title} title={p.title}>{p.node}</Panel>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute right-3 bottom-3 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5">
        <AnimatePresence mode="popLayout">
          {step === 0 && <Badge key="a">Fleet hours & distance</Badge>}
          {step === 1 && <Badge key="b">Errors & break counts</Badge>}
          {step >= 2 && <Badge key="c">MTTR & obstacle time</Badge>}
          {step >= 2 && <Badge key="d" delay={0.15}>Midnight sessions fixed</Badge>}
        </AnimatePresence>
      </div>
    </Frame>
  );
}
