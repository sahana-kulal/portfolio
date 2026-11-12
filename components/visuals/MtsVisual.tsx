"use client";

import { AnimatePresence, motion } from "motion/react";
import { ease } from "@/lib/motion";
import { Badge, Frame } from "./Frame";

const VB = "0 0 400 290";

/* ───────────── Step 0: architecture ───────────── */

const NODES = [
  { id: "ui", label: "React UI", sub: "Requester · Approver", x: 15, y: 123, w: 100 },
  { id: "api", label: "Zustand", sub: "10 domain stores", x: 155, y: 123, w: 95 },
  { id: "pg", label: "Axios", sub: "REST API calls", x: 285, y: 48, w: 105 },
  { id: "ws", label: "WebSocket", sub: "live AMR events", x: 285, y: 123, w: 105 },
  { id: "ext", label: "CSV / Excel", sub: "bulk upload", x: 285, y: 198, w: 105 },
];
const H = 44;
// Elbow routes (x[], y[]) from API to each backend + UI to API.
const ROUTES = [
  { x: [105, 150], y: [145, 145] },
  { x: [240, 262, 262, 285], y: [145, 145, 70, 70] },
  { x: [240, 285], y: [145, 145] },
  { x: [240, 262, 262, 285], y: [145, 145, 220, 220] },
];
const toPath = (r: { x: number[]; y: number[] }) => r.x.map((x, i) => `${i ? "L" : "M"}${x},${r.y[i]}`).join(" ");

function Architecture() {
  return (
    <svg viewBox={VB} className="size-full">
      {ROUTES.map((r, i) => (
        <g key={i}>
          <motion.path
            d={toPath(r)}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
          />
          {/* Data packets travelling both ways */}
          {[0, 1].map((dir) => (
            <motion.circle
              key={dir}
              r="3"
              fill="var(--accent)"
              style={{ filter: "drop-shadow(0 0 4px var(--accent))" }}
              initial={{ x: r.x[0], y: r.y[0], opacity: 0 }}
              animate={{
                x: dir ? [...r.x].reverse() : r.x,
                y: dir ? [...r.y].reverse() : r.y,
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 1.6, repeat: Infinity, delay: 0.9 + i * 0.25 + dir * 0.8, ease: "linear" }}
            />
          ))}
        </g>
      ))}
      {NODES.map((n, i) => (
        <motion.g
          key={n.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.outExpo, delay: i * 0.08 }}
        >
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={H}
            rx="8"
            fill="var(--surface-2)"
            stroke={n.id === "api" ? "var(--accent)" : "var(--border)"}
          />
          <text x={n.x + 10} y={n.y + 19} fill="var(--text)" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600">
            {n.label}
          </text>
          <text x={n.x + 10} y={n.y + 33} fill="var(--text-subtle)" fontSize="8" fontFamily="var(--font-mono)">
            {n.sub}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

/* ───────────── Steps 1–2: factory floor ───────────── */

const STAGING = [
  { id: "A", y: 25 },
  { id: "B", y: 115 },
  { id: "C", y: 205 },
];
// Robot stops just outside Line 4 so it doesn't cover the label.
const PATH = { x: [112, 200, 200, 280], y: [140, 140, 228, 228] };

function Floor({ step }: { step: number }) {
  const delivering = step >= 2;
  return (
    <svg viewBox={VB} className="size-full">
      <defs>
        <pattern id="mts-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="var(--border)" />
        </pattern>
      </defs>
      <rect width="400" height="290" fill="url(#mts-grid)" />

      {/* Staging areas */}
      {STAGING.map((s) => {
        const active = s.id === "B";
        return (
          <g key={s.id}>
            <motion.rect
              x="20"
              y={s.y}
              width="92"
              height="52"
              rx="8"
              strokeDasharray="4 3"
              initial={false}
              animate={{
                fill: active ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "var(--surface-2)",
                stroke: active ? "var(--accent)" : "var(--border)",
              }}
              transition={{ duration: 0.5 }}
            />
            <text x="28" y={s.y + 14} fill="var(--text-subtle)" fontSize="7" fontFamily="var(--font-mono)" letterSpacing="1">
              STAGING {s.id}
            </text>
            {[0, 1, 2].map((c) => (
              <rect
                key={c}
                x={30 + c * 24}
                y={s.y + 24}
                width="18"
                height="18"
                rx="3"
                fill={active && c === 1 ? "var(--accent)" : "var(--border)"}
                opacity={active && c === 1 && delivering ? 0.25 : 1}
              />
            ))}
          </g>
        );
      })}

      {/* Destination */}
      <motion.rect
        x="292"
        y="198"
        width="92"
        height="60"
        rx="8"
        fill="var(--surface-2)"
        initial={false}
        animate={{ stroke: delivering ? "var(--success)" : "var(--border)" }}
      />
      <text x="306" y="214" fill="var(--text-subtle)" fontSize="7" fontFamily="var(--font-mono)" letterSpacing="1">
        LINE 4
      </text>
      <text x="306" y="240" fill="var(--text)" fontSize="10" fontFamily="var(--font-sans)" fontWeight="600">
        Assembly
      </text>

      {/* Planned route */}
      <motion.path
        d={toPath(PATH)}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.8, ease: ease.inOut }}
      />

      {/* Robot */}
      <motion.g
        initial={{ x: PATH.x[0], y: PATH.y[0] }}
        animate={delivering ? { x: [...PATH.x, PATH.x[3]], y: [...PATH.y, PATH.y[3]] } : { x: PATH.x[0], y: PATH.y[0] }}
        transition={
          delivering
            ? { duration: 3.2, times: [0, 0.3, 0.55, 0.8, 1], repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }
            : { duration: 0.4 }
        }
      >
        <rect x="-11" y="-8" width="22" height="16" rx="4" fill="var(--accent)" />
        <rect x="-5" y="-13" width="10" height="7" rx="1.5" fill="var(--text)" opacity={delivering ? 1 : 0} />
        <circle cx="0" cy="0" r="2.5" fill="var(--bg)" />
      </motion.g>
    </svg>
  );
}

const CHECKS = ["Requester submitted", "Approver approved", "AMR trip booked"];

export function MtsVisual({ step }: { step: number }) {
  return (
    <Frame url="mts / orders">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step === 0 ? "arch" : "floor"}
          className="absolute inset-0 p-3 sm:p-5"
          initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: ease.outExpo }}
        >
          {step === 0 ? <Architecture /> : <Floor step={step} />}
        </motion.div>
      </AnimatePresence>

      {/* Request card */}
      <AnimatePresence>
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: ease.outExpo, delay: 0.2 }}
            className="absolute top-3 right-3 w-[52%] rounded-md border border-border bg-bg/85 p-2.5 backdrop-blur-md sm:top-5 sm:right-5 sm:w-[44%] sm:p-3"
          >
            <p className="font-mono text-[9px] text-subtle sm:text-[10px]">ORD-1042</p>
            <p className="mt-1 text-[11px] font-medium sm:text-xs">Brackets → Line 4</p>
            <ul className="mt-2 space-y-1">
              {CHECKS.map((c, i) => (
                <motion.li
                  key={c}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.25 }}
                  className="flex items-center gap-1.5 font-mono text-[9px] text-muted sm:text-[10px]"
                >
                  <span className="text-success">✓</span> {c}
                </motion.li>
              ))}
              {step >= 2 && (
                <motion.li
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 font-mono text-[9px] text-success sm:text-[10px]"
                >
                  <span className="size-1.5 animate-pulse rounded-full bg-success" /> Delivering…
                </motion.li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col items-start gap-2 sm:bottom-5 sm:left-5">
        <AnimatePresence mode="popLayout">
          {step === 0 && <Badge key="stores">10 Zustand stores</Badge>}
          {step === 1 && <Badge key="mods">10+ domain modules</Badge>}
          {step >= 2 && <Badge key="roles">Requester → Approver</Badge>}
          {step >= 2 && <Badge key="i18n" delay={0.15}>CSV upload · EN / ES</Badge>}
        </AnimatePresence>
      </div>
    </Frame>
  );
}
