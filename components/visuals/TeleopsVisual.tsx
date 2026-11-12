"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Badge, Frame } from "./Frame";
import { LidarCanvas } from "./LidarCanvas";
import { Tug } from "./Tug";

// Illustrative layout (not a real facility).
const LOOP = "M40,40 H260 V290 H40 Z";
const RACKS = [
  { x: 62, y: 66, cols: 6, rows: 4 },
  { x: 62, y: 160, cols: 6, rows: 4 },
  { x: 62, y: 232, cols: 6, rows: 3 },
  { x: 158, y: 66, cols: 6, rows: 4 },
  { x: 158, y: 160, cols: 6, rows: 4 },
  { x: 158, y: 232, cols: 6, rows: 3 },
];
// Camera feed objects drifting past as the tug drives forward (far -> near).
const LEFT = { x: [84, -34], y: [48, 22], w: [8, 52], h: [14, 88] };
const RIGHT = { x: [108, 182], y: [48, 22], w: [8, 52], h: [14, 88] };
const PASS = 3.6; // seconds per object

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[8px] text-muted sm:text-[9px]">
      {children}
    </span>
  );
}

export function TeleopsVisual({ step }: { step: number }) {
  const lowLatency = step >= 1;
  const lidar = step >= 2;

  // Hovers around 100 ms once the stream is up.
  const [live, setLive] = useState(100);
  useEffect(() => {
    if (!lowLatency) return;
    const id = setInterval(() => setLive(94 + Math.round(Math.random() * 6)), 700);
    return () => clearInterval(id);
  }, [lowLatency]);

  return (
    <Frame url="teleops / sherpa-07">
      <div className="absolute inset-0 grid grid-cols-[1.7fr_1fr] gap-2.5 p-3 sm:gap-3 sm:p-4">
        {/* Map with the tug */}
        <div className="relative min-h-0 overflow-hidden rounded-md border border-border bg-surface-2/60">
          <svg viewBox="0 0 300 330" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full">
            <rect x="20" y="20" width="260" height="290" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
            {RACKS.map((r, i) =>
              Array.from({ length: r.cols * r.rows }, (_, k) => (
                <rect key={`${i}-${k}`} x={r.x + (k % r.cols) * 12} y={r.y + Math.floor(k / r.cols) * 13} width="10" height="11" rx="1.5" fill="var(--border)" fillOpacity=".35" stroke="var(--border)" />
              )),
            )}
            <path d="M40,141 H260 M150,40 V290" fill="none" stroke="var(--border)" strokeWidth="3" />
            <path d={LOOP} fill="none" stroke="var(--text-subtle)" strokeOpacity=".7" strokeWidth="4" strokeLinejoin="round" />
            {/* Parked fleet */}
            {[[75, 304], [105, 304]].map(([x, y]) => (
              <g key={x} transform={`translate(${x} ${y}) scale(0.5)`}>
                <Tug color="#60a5fa" cart={false} />
              </g>
            ))}
            {/* Tele-operated tug: scan cone + ring follow it around the loop */}
            <motion.g
              style={{ offsetPath: `path("${LOOP}")`, offsetRotate: "auto" }}
              animate={{ offsetDistance: ["0%", "100%"] }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            >
              <motion.path
                d="M10,0 L74,-30 A80,80 0 0 1 74,30 Z"
                fill="#14b8a6"
                animate={{ opacity: [0.28, 0.08, 0.28] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <motion.circle
                r="14" fill="none" stroke="#14b8a6" strokeWidth="2"
                animate={{ r: [12, 30], opacity: [0.8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
              <g transform="scale(0.75)">
                <Tug color="#facc15" cart={false} />
              </g>
            </motion.g>
          </svg>

          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className="rounded border border-border bg-surface px-2 py-1 font-mono text-[9px] text-muted sm:text-[10px]">Current</span>
            <span className="rounded border border-border bg-surface px-2 py-1 font-mono text-[9px] text-muted sm:text-[10px]">Map Feed</span>
          </div>

          {/* Joystick */}
          <div className="absolute right-2 bottom-2 grid size-12 place-items-center rounded-full border-[5px] border-border bg-surface/70 sm:size-16">
            <motion.span
              className="size-5 rounded-full bg-muted shadow-md sm:size-6"
              animate={{ x: [0, 7, 0, -5, 0], y: [0, -6, -9, 0, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Feeds */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex min-h-0 flex-1 flex-col gap-1">
            <Chip>Lidar Feed</Chip>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border border-border bg-[#050510]">
              <LidarCanvas detect={lidar} />
              <span className="absolute top-1 left-1 flex items-center gap-1 rounded-full bg-bg/70 px-1.5 py-0.5 font-mono text-[8px] sm:text-[9px]">
                <span className="size-1.5 animate-pulse rounded-full bg-success" /> {lidar ? "DETECTING" : "SCANNING"}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1">
            <Chip>Camera Feed</Chip>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border border-border">
              <svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
                <motion.g animate={{ y: [0, 0.8, 0, -0.6, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
                  <rect y="-4" width="200" height="120" fill="#3b4552" />
                  <rect x="0" y="22" width="200" height="40" fill="#8a9bb0" />
                  <polygon points="0,62 200,62 200,115 0,115" fill="#5d6772" />
                  <polygon points="88,62 112,62 170,115 30,115" fill="#68737f" />
                  {/* Lane markings stream toward the camera */}
                  {["M99,62 L52,115", "M101,62 L148,115"].map((d) => (
                    <motion.path key={d} d={d} stroke="#eab308" strokeWidth="1.8" strokeDasharray="7 7"
                      animate={{ strokeDashoffset: [0, -28] }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
                  ))}
                  {/* Ceiling lights, racks and machines pass by */}
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <motion.rect rx="1.5" fill="#f1f5f9"
                        animate={{ x: [94, 18], y: [22, 3], width: [5, 22], height: [1.5, 4], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: PASS, repeat: Infinity, ease: "easeIn", delay: (i * PASS) / 3 }} />
                      <motion.rect rx="1.5" fill="#f1f5f9"
                        animate={{ x: [101, 160], y: [22, 3], width: [5, 22], height: [1.5, 4], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: PASS, repeat: Infinity, ease: "easeIn", delay: (i * PASS) / 3 }} />
                      {[LEFT, RIGHT].map((o, side) => (
                        <motion.rect key={side} rx="2" fill="#c8d1dc" stroke="#6b7a8c"
                          animate={{ x: o.x, y: o.y, width: o.w, height: o.h, opacity: [0, 1, 1, 0] }}
                          transition={{ duration: PASS, repeat: Infinity, ease: "easeIn", delay: (i * PASS) / 3 }} />
                      ))}
                    </g>
                  ))}
                </motion.g>
                <motion.path d="M70 48v-8h8M130 48v-8h-8M70 72v8h8M130 72v8h-8" stroke="#fff" strokeWidth="1.2" fill="none"
                  animate={{ opacity: [0.9, 0.4, 0.9] }} transition={{ duration: 1.4, repeat: Infinity }} />
              </svg>
              <span className="absolute top-1 left-1 flex items-center gap-1 rounded-full bg-bg/70 px-1.5 py-0.5 font-mono text-[8px] sm:text-[9px]">
                <span className="size-1.5 animate-pulse rounded-full bg-danger" /> LIVE · WebRTC
              </span>
              <span className="absolute right-1 bottom-1 rounded bg-bg/80 px-1.5 py-0.5 font-mono text-[9px] tabular-nums sm:text-[10px]">
                <span className={lowLatency ? "text-success" : "text-subtle"}>{lowLatency ? live : "—"}</span> ms
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 bottom-3 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5">
        <AnimatePresence mode="popLayout">
          {step === 1 && <Badge key="lat">⚡ 100 ms video latency</Badge>}
          {lidar && <Badge key="lid">3D point cloud → 2D</Badge>}
          {lidar && <Badge key="safe" delay={0.15}>Spatial awareness</Badge>}
        </AnimatePresence>
      </div>
    </Frame>
  );
}
