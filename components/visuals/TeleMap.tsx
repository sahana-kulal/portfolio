"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Tug } from "./Tug";

// Illustrative layout (not a real facility). The tug drives a clockwise loop.
const RACKS = [
  { x: 62, y: 66, cols: 6, rows: 4 },
  { x: 62, y: 160, cols: 6, rows: 4 },
  { x: 62, y: 232, cols: 6, rows: 3 },
  { x: 158, y: 66, cols: 6, rows: 4 },
  { x: 158, y: 160, cols: 6, rows: 4 },
  { x: 158, y: 232, cols: 6, rows: 3 },
];
type Pt = [number, number];
// Junctions on the lanes drawn in the map: the outer loop plus a cross lane each way through the middle.
const A: Pt = [40, 40];
const T: Pt = [150, 40];
const B: Pt = [260, 40];
const R: Pt = [260, 141];
const C: Pt = [260, 290];
const BM: Pt = [150, 290];
const D: Pt = [40, 290];
const L: Pt = [40, 141];
const X: Pt = [150, 141];

// One closed tour over two laps. A blocked stretch is skipped by turning at the junction before it:
//   lap 1: top-right stretch (T→B) and bottom-left stretch (BM→D) are blocked → T→X→R and BM→X→L
//   lap 2: right-lower stretch (R→C) is blocked → R→X→BM
const TOUR: Pt[] = [A, T, X, R, C, BM, X, L, A, T, B, R, X, BM, D, L];
const LEN = TOUR.map((p, i) => {
  const q = TOUR[(i + 1) % TOUR.length];
  return Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]);
});
const START = LEN.map((_, i) => LEN.slice(0, i).reduce((a, b) => a + b, 0));
const TOTAL = LEN.reduce((a, b) => a + b, 0);

// Each obstacle blocks the lane just after junction `j` (distance along the tour). It becomes
// visible when the tug enters the lane leading up to that junction (`prev` long).
const EVENTS = [
  { j: 110, prev: 110, xy: [205, 40] as Pt }, // on T→B
  { j: 580, prev: 110, xy: [95, 290] as Pt }, // on BM→D
  { j: 1261, prev: 101, xy: [260, 215] as Pt }, // on R→C
];
const SPEED = 38; // map units per second
const SLOW = 22; // while an obstacle is being avoided

const mod = (v: number, m: number) => ((v % m) + m) % m;
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function poseAt(dist: number): Pt {
  const r = mod(dist, TOTAL);
  let i = 0;
  while (i < LEN.length - 1 && r >= START[i] + LEN[i]) i++;
  const p = TOUR[i];
  const q = TOUR[(i + 1) % TOUR.length];
  const t = (r - START[i]) / LEN[i];
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
}

/** Which obstacles are showing at tour distance `d`, and whether the tug is reacting to one. */
function obstacles(d: number) {
  const m = mod(d, TOTAL);
  let alert = false;
  const visible: { i: number; op: number }[] = [];
  EVENTS.forEach((e, i) => {
    let s = m - e.j; // negative = junction still ahead
    if (s > TOTAL / 2) s -= TOTAL;
    if (s < -TOTAL / 2) s += TOTAL;
    const op = smooth(-e.prev, -e.prev + 25, s) * (1 - smooth(45, 85, s));
    if (op > 0.01) visible.push({ i, op });
    if (s > -60 && s < 45) alert = true;
  });
  return { alert, visible };
}

const StaticMap = memo(function StaticMap() {
  return (
    <>
      <rect x="20" y="20" width="260" height="290" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
      {RACKS.map((r, i) =>
        Array.from({ length: r.cols * r.rows }, (_, k) => (
          <rect key={`${i}-${k}`} x={r.x + (k % r.cols) * 12} y={r.y + Math.floor(k / r.cols) * 13} width="10" height="11" rx="1.5" fill="var(--border)" fillOpacity=".35" stroke="var(--border)" />
        )),
      )}
      <path d="M40,40 H260 V290 H40 Z M40,141 H260 M150,40 V290" fill="none" stroke="var(--text-subtle)" strokeOpacity=".7" strokeWidth="4" strokeLinejoin="round" />
      {[[75, 304], [105, 304]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(0.5)`}>
          <Tug color="#60a5fa" cart={false} />
        </g>
      ))}
    </>
  );
});

function Obstacle({ x, y, op, warn }: { x: number; y: number; op: number; warn: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      {warn && (
        <circle r="12" fill="none" stroke="#ef4444" strokeWidth="1.5">
          <animate attributeName="r" values="10;24" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#f59e0b" stroke="#111827" strokeWidth="1.5" />
      <path d="M-8,4 L4,-8 M-4,8 L8,-4" stroke="#111827" strokeWidth="2.2" />
      <text y="-13" fontSize="7" fontWeight="600" textAnchor="middle" fill="#ef4444">Obstacle</text>
    </g>
  );
}

/**
 * Tele-operated tug on the map's lanes. When an obstacle blocks a lane, the tug slows, turns onto
 * a cross lane at the next junction and rejoins the loop further on (no steering around it).
 * `onAlert` reports when an obstacle is ahead so other panels can react.
 */
export function TeleMap({ onAlert }: { onAlert: (alert: boolean) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState({ x: 40, y: 40, h: 0, alert: false, visible: [] as { i: number; op: number }[] });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    let last = 0;
    let d = 20;
    let heading = 0;
    let prevAlert = false;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = obstacles(d);
      d += (st.alert ? SLOW : SPEED) * dt;
      const p = poseAt(d);
      const q = poseAt(d + 3);
      const target = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;
      heading += (((target - heading + 540) % 360) - 180) * Math.min(1, dt * 10);
      setPose({ x: p[0], y: p[1], h: heading, alert: st.alert, visible: st.visible });
      if (st.alert !== prevAlert) {
        prevAlert = st.alert;
        onAlert(st.alert);
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(el);
    return () => {
      stop();
      io.disconnect();
    };
  }, [onAlert]);

  const tone = pose.alert ? "#ef4444" : "#14b8a6";

  return (
    <div ref={rootRef} className="absolute inset-0">
      <svg viewBox="0 0 300 330" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full">
        <StaticMap />
        {pose.visible.map((o) => (
          <Obstacle key={o.i} x={EVENTS[o.i].xy[0]} y={EVENTS[o.i].xy[1]} op={o.op} warn={pose.alert} />
        ))}
        <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.h})`}>
          <path d="M10,0 L74,-30 A80,80 0 0 1 74,30 Z" fill={tone} opacity="0.2" />
          <circle r="14" fill="none" stroke={tone} strokeWidth="2">
            <animate attributeName="r" values="12;30" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <g transform="scale(0.75)">
            <Tug color="#facc15" cart={false} />
          </g>
        </g>
      </svg>
      <span
        className={`absolute top-2 right-2 rounded-full px-2 py-0.5 font-mono text-[9px] sm:text-[10px] ${
          pose.alert ? "bg-red-500/20 text-red-400" : "bg-emerald-500/15 text-emerald-400"
        }`}
      >
        {pose.alert ? "Obstacle ahead · rerouting" : "Path clear"}
      </span>
    </div>
  );
}
