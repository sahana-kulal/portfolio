"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Interactive recreation of a fleet-manager UI with simulated data.
 * No customer, site, IP or station data from the real product is used.
 */

type Pt = [number, number];
type Tab = "live" | "book" | "build" | "trips" | "settings";
type RobotStatus = "Idle" | "En Route" | "E-Stopped";
type Robot = {
  id: string;
  battery: number;
  pos: Pt;
  status: RobotStatus;
  mode: "Fleet" | "Manual";
  enabled: boolean;
  tripId: number | null;
  dir: number;
};
type Trip = {
  id: number;
  stations: string[];
  robotId: string | null;
  want?: string;
  booked: string;
  started: string;
  ended: string;
  status: "Pending" | "En Route" | "Completed" | "Cancelled";
  startAt: number | null;
  path: Pt[];
  travelled: number;
  total: number;
};
type Saved = { name: string; stations: string[]; count: number };
type Sim = { robots: Robot[]; trips: Trip[]; next: number; tick: number; amb: number };

const ST: Record<string, Pt> = {
  parking: [300, 340],
  pickup_01: [90, 60],
  pickup_02: [90, 140],
  pickup_03: [90, 220],
  pickup_04: [510, 60],
  pickup_05: [510, 140],
  pickup_06: [510, 220],
  drop_01: [300, 100],
  drop_02: [300, 220],
};
const NAMES = Object.keys(ST);
const RACKS = [
  { x: 110, y: 80, cols: 8, rows: 3 },
  { x: 110, y: 160, cols: 8, rows: 3 },
  { x: 110, y: 240, cols: 8, rows: 2 },
  { x: 320, y: 120, cols: 12, rows: 3 },
  { x: 320, y: 240, cols: 12, rows: 4 },
  { x: 320, y: 80, cols: 12, rows: 1 },
];
const SPEED = 2.4; // map units per 40 ms tick
const TICK_MS = 40;
const clock = () => new Date().toLocaleTimeString("en-GB");

// Aisles the tugs drive on (the map and routing both use these).
const LANES: Pt[][] = [
  [[90, 60], [90, 140], [90, 220]],
  [[510, 60], [510, 140], [510, 220]],
  [[90, 60], [300, 60], [510, 60]],
  [[300, 60], [300, 100], [300, 220], [300, 340]],
];
const key = (p: Pt) => `${p[0]},${p[1]}`;
const manhattan = (a: Pt, b: Pt) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const GRAPH = (() => {
  const g = new Map<string, { p: Pt; n: Map<string, number> }>();
  const add = (p: Pt) => {
    if (!g.has(key(p))) g.set(key(p), { p, n: new Map() });
    return g.get(key(p))!;
  };
  for (const lane of LANES)
    for (let i = 1; i < lane.length; i++) {
      const a = add(lane[i - 1]);
      const b = add(lane[i]);
      const w = manhattan(a.p, b.p);
      a.n.set(key(b.p), w);
      b.n.set(key(a.p), w);
    }
  return g;
})();

function nearestNode(p: Pt): Pt {
  let best: Pt = ST.parking;
  let bd = Infinity;
  for (const { p: q } of GRAPH.values()) {
    const d = manhattan(p, q);
    if (d < bd) { bd = d; best = q; }
  }
  return best;
}
function shortest(a: Pt, b: Pt): Pt[] {
  const dist = new Map<string, number>([[key(a), 0]]);
  const prev = new Map<string, string>();
  const todo = new Set(GRAPH.keys());
  while (todo.size) {
    let u: string | null = null;
    for (const k of todo) if (dist.has(k) && (u === null || dist.get(k)! < dist.get(u)!)) u = k;
    if (u === null) break;
    todo.delete(u);
    if (u === key(b)) break;
    for (const [v, w] of GRAPH.get(u)!.n) {
      const nd = dist.get(u)! + w;
      if (nd < (dist.get(v) ?? Infinity)) { dist.set(v, nd); prev.set(v, u); }
    }
  }
  const out: Pt[] = [];
  let c: string | undefined = key(b);
  while (c) { out.unshift(GRAPH.get(c)!.p); c = prev.get(c); }
  return out;
}
function route(start: Pt, names: string[]): Pt[] {
  const out: Pt[] = [start];
  let cur = nearestNode(start);
  if (manhattan(start, cur) > 0) out.push(cur);
  for (const n of names) {
    out.push(...shortest(cur, ST[n]).slice(1));
    cur = ST[n];
  }
  return out;
}
function len(pts: Pt[]) {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
  return d;
}
function pointAt(pts: Pt[], dist: number): Pt {
  let left = dist;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const seg = Math.abs(bx - ax) + Math.abs(by - ay);
    if (left <= seg && seg > 0) {
      const t = left / seg;
      return [ax + (bx - ax) * t, ay + (by - ay) * t];
    }
    left -= seg;
  }
  return pts[pts.length - 1];
}

function headingAt(pts: Pt[], dist: number): number {
  let left = dist;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const seg = manhattan(pts[i - 1], pts[i]);
    if (seg > 0 && left <= seg) return (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
    left -= seg;
  }
  return 0;
}
/** Splits a path at `dist` into the part already driven and the part still to go. */
function split(pts: Pt[], dist: number): { done: Pt[]; rest: Pt[] } {
  const done: Pt[] = [pts[0]];
  let left = dist;
  for (let i = 1; i < pts.length; i++) {
    const seg = manhattan(pts[i - 1], pts[i]);
    if (left < seg) {
      const cut = pointAt(pts, dist);
      return { done: [...done, cut], rest: [cut, ...pts.slice(i)] };
    }
    left -= seg;
    done.push(pts[i]);
  }
  return { done, rest: [pts[pts.length - 1]] };
}

function seed(): Sim {
  const stations = ["pickup_04", "drop_01", "parking"];
  const path = route(ST.parking, stations);
  const travelled = 60;
  const done: Trip = {
    id: 1001, stations: ["pickup_02", "drop_02"], robotId: "sherpa-03", booked: "09:12:40", started: "09:13:02",
    ended: "09:15:31", status: "Completed", startAt: null, path: [], travelled: 0, total: 0,
  };
  const live: Trip = {
    id: 1002, stations, robotId: "sherpa-02", booked: "09:20:05", started: "09:20:09", ended: "—",
    status: "En Route", startAt: null, path, travelled, total: len(path),
  };
  return {
    next: 1003,
    tick: 0,
    amb: 0,
    trips: [live, done],
    robots: [
      { id: "sherpa-01", battery: 82, pos: ST.parking, status: "Idle", mode: "Fleet", enabled: true, tripId: null, dir: -90 },
      { id: "sherpa-02", battery: 64, pos: pointAt(path, travelled), status: "En Route", mode: "Fleet", enabled: true, tripId: 1002, dir: headingAt(path, travelled) },
      { id: "sherpa-03", battery: 28, pos: ST.pickup_02, status: "Idle", mode: "Fleet", enabled: true, tripId: null, dir: 0 },
    ],
  };
}

function tick(s: Sim, now: number): Sim {
  const robots = s.robots.map((r) => ({ ...r }));
  const trips = s.trips.map((t) => ({ ...t }));
  for (const t of trips) {
    if (t.status !== "Pending" || (t.startAt !== null && now < t.startAt)) continue;
    const r = robots.find((x) => x.status === "Idle" && x.enabled && (!t.want || x.id === t.want));
    if (!r) continue;
    r.status = "En Route";
    r.tripId = t.id;
    t.status = "En Route";
    t.robotId = r.id;
    t.path = route(r.pos, t.stations);
    t.travelled = 0;
    t.total = len(t.path);
    t.started = clock();
  }
  for (const r of robots) {
    if (r.status !== "En Route" || r.tripId === null) continue;
    const t = trips.find((x) => x.id === r.tripId);
    if (!t) continue;
    t.travelled = Math.min(t.total, t.travelled + SPEED);
    r.pos = pointAt(t.path, t.travelled);
    r.battery = Math.max(5, r.battery - 0.003);
    const diff = ((headingAt(t.path, t.travelled) - r.dir + 540) % 360) - 180;
    r.dir += diff * 0.25;
    if (t.travelled >= t.total) {
      t.status = "Completed";
      t.ended = clock();
      r.status = "Idle";
      r.tripId = null;
    }
  }

  // Keep the floor busy: when fewer than 2 trips are running, queue a random one.
  const active = trips.filter((t) => t.status === "En Route" || (t.status === "Pending" && t.startAt === null)).length;
  const stopped = robots.some((r) => r.status === "E-Stopped");
  let amb = active < 2 && !stopped ? s.amb + 1 : 0;
  let next = s.next;
  if (amb > 40) {
    const pick = (pre: string) => {
      const l = NAMES.filter((n) => n.startsWith(pre));
      return l[Math.floor(Math.random() * l.length)];
    };
    trips.unshift({
      id: next++, stations: [pick("pickup"), pick("drop"), "parking"], robotId: null, booked: clock(), started: "—",
      ended: "—", status: "Pending", startAt: null, path: [], travelled: 0, total: 0,
    });
    amb = 0;
  }
  return { ...s, robots, trips: trips.slice(0, 30), next, amb, tick: s.tick + 1 };
}

const progress = (t: Trip) => (t.status === "Completed" ? 100 : t.total ? Math.round((t.travelled / t.total) * 100) : 0);
const stationLabel = (stations: string[]) => stations.join(" → ");

const chip = {
  Idle: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200",
  "En Route": "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200",
  "E-Stopped": "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
  Pending: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300",
  Completed: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200",
  Cancelled: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
} as const;

const NAV: { tab: Tab; label: string; icon: string }[] = [
  { tab: "live", label: "Live Monitoring", icon: "◎" },
  { tab: "book", label: "Book a trip", icon: "＋" },
  { tab: "trips", label: "Manage trips", icon: "☰" },
  { tab: "settings", label: "Settings", icon: "⚙" },
];

const SETTINGS = ["Maintenance", "About", "Asset Status", "Asset Events", "FM Health", "FM Logs", "Plugin Summon Button", "IES"];

const btn = "cursor-pointer rounded px-3 py-1.5 text-xs font-medium uppercase transition-colors";
const btnPrimary = `${btn} bg-blue-600 text-white hover:bg-blue-700`;
const btnOutline = `${btn} border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950`;

/** Flat front-view tug for the login picture. Origin is the bottom centre, on the ground. */
function LoginTug({ x, y, s, body, edge, canopy }: { x: number; y: number; s: number; body: string; edge: string; canopy?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="66" ry="8" fill="#0f172a" opacity=".16" />
      {canopy && (
        <g>
          <rect x="-58" y="-196" width="5" height="160" fill="#475569" />
          <rect x="53" y="-196" width="5" height="160" fill="#475569" />
          <rect x="-66" y="-206" width="132" height="14" rx="4" fill="#64748b" />
          <circle cx="-30" cy="-196" r="3" fill="#fde68a" />
          <circle cx="30" cy="-196" r="3" fill="#fde68a" />
        </g>
      )}
      <rect x="-56" y="-40" width="22" height="40" rx="9" fill="#475569" />
      <rect x="34" y="-40" width="22" height="40" rx="9" fill="#475569" />
      <polygon points="-50,-8 50,-8 46,-92 30,-118 -30,-118 -46,-92" fill={body} stroke={edge} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="-48,-10 -32,-10 -20,-90 -36,-90" fill="#111827" opacity=".85" />
      <rect x="-30" y="-92" width="60" height="70" rx="10" fill="#111827" />
      <rect x="-14" y="-84" width="28" height="14" rx="3" fill="#374151" />
      <circle cx="-16" cy="-40" r="6" fill="#fde68a" />
      <circle cx="16" cy="-40" r="6" fill="#fde68a" />
      <rect x="-6" y="-134" width="12" height="16" rx="3" fill="#f59e0b" />
      <ellipse cx="0" cy="-134" rx="6" ry="4" fill="#fbbf24" />
    </g>
  );
}

export function FleetManagerDemo() {
  const [tab, setTab] = useState<Tab>("live");
  const [sim, setSim] = useState<Sim>(seed);
  const [selected, setSelected] = useState("sherpa-02");
  const [zoom, setZoom] = useState(1);
  const [panel, setPanel] = useState<"Sherpas" | "Stations">("Sherpas");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<Saved[]>([
    { name: "Route A1", stations: ["pickup_01", "drop_01", "parking"], count: 5 },
    { name: "Route A2", stations: ["pickup_02", "drop_02", "parking"], count: 9 },
    { name: "Route B1", stations: ["pickup_04", "drop_01", "parking"], count: 2 },
    { name: "Route B2", stations: ["pickup_05", "drop_02", "parking"], count: 7 },
    { name: "Route B3", stations: ["pickup_06", "drop_02", "parking"], count: 1 },
    { name: "Route A3", stations: ["pickup_03", "drop_02", "parking"], count: 3 },
  ]);
  const [savedTab, setSavedTab] = useState<"Saved Routes" | "Frequent Routes">("Saved Routes");
  const [tripTab, setTripTab] = useState<"Active" | "Scheduled" | "Completed">("Active");
  const [seq, setSeq] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [signedIn, setSignedIn] = useState(true);
  const [menu, setMenu] = useState<"bell" | "account" | null>(null);
  const [user, setUser] = useState("demo.user");
  const [pw, setPw] = useState("demo1234");
  const [showPw, setShowPw] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setSim((s) => tick(s, Date.now())), TICK_MS);
    return () => clearInterval(id);
  }, [visible]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const robot = sim.robots.find((r) => r.id === selected) ?? sim.robots[0];

  const patchRobot = (id: string, p: Partial<Robot>) =>
    setSim((s) => ({ ...s, robots: s.robots.map((r) => (r.id === id ? { ...r, ...p } : r)) }));

  const book = (stations: string[], opts: { schedule?: boolean; want?: string } = {}) => {
    setSim((s) => ({
      ...s,
      next: s.next + 1,
      trips: [
        {
          id: s.next, stations, robotId: null, want: opts.want, booked: clock(), started: "—", ended: "—",
          status: "Pending", startAt: opts.schedule ? Date.now() + 10000 : null, path: [], travelled: 0, total: 0,
        },
        ...s.trips,
      ],
    }));
    setToast(opts.schedule ? "Trip scheduled — starts in 10 s" : "Trip booked");
  };

  const cancel = (id: number) =>
    setSim((s) => ({
      ...s,
      trips: s.trips.map((t) => (t.id === id ? { ...t, status: "Cancelled", ended: clock() } : t)),
      robots: s.robots.map((r) => (r.tripId === id ? { ...r, tripId: null, status: "Idle" } : r)),
    }));

  const activeTrip = sim.trips.find((t) => t.id === robot.tripId && t.status === "En Route");
  const q = query.trim().toLowerCase();

  // Bell: alerts (stopped / low battery) plus a few recent completions.
  const alertNotes = sim.robots.flatMap((r) => [
    ...(r.status === "E-Stopped" ? [{ id: `${r.id}-stop`, text: `${r.id} emergency stopped`, tone: "bg-red-500" }] : []),
    ...(r.battery < 30 ? [{ id: `${r.id}-bat`, text: `${r.id} battery low (${Math.round(r.battery)}%)`, tone: "bg-amber-400" }] : []),
  ]);
  const doneNotes = sim.trips
    .filter((t) => t.status === "Completed")
    .slice(0, 3)
    .map((t) => ({ id: `trip-${t.id}`, text: `Trip #${t.id} completed`, tone: "bg-teal-500" }));
  const notes = [...alertNotes, ...doneNotes];

  const trips = sim.trips.filter((t) =>
    tripTab === "Active"
      ? t.status === "En Route" || (t.status === "Pending" && t.startAt === null)
      : tripTab === "Scheduled"
        ? t.status === "Pending" && t.startAt !== null
        : t.status === "Completed" || t.status === "Cancelled",
  );

  /* ---------- screens ---------- */

  const sherpaCard = (
        <div className="rounded-lg bg-white p-2.5 text-xs dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{robot.id}</p>
              <p className="text-slate-500 dark:text-slate-400">Last connected: {1 + (Math.floor(sim.tick / 25) % 2)} second{Math.floor(sim.tick / 25) % 2 ? "s" : ""} ago</p>
            </div>
            <span className="rounded border border-slate-300 dark:border-zinc-700 px-1.5 py-0.5 font-mono">{Math.round(robot.battery)}%</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className={`shrink-0 rounded-full px-3 py-1 font-medium ${chip[robot.status]}`}>● {robot.status}</span>
            <p className="truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
              x {(robot.pos[0] / 10).toFixed(1)} · y {(robot.pos[1] / 10).toFixed(1)} m ·{" "}
              {robot.status === "En Route" ? (0.78 + (sim.tick % 7) * 0.01).toFixed(2) : "0.00"} m/s
            </p>
          </div>
          <div className="mt-1.5 rounded border border-slate-300 dark:border-zinc-700 px-2 py-1 text-slate-600 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Route</span>
            <p className="truncate">{activeTrip ? stationLabel(activeTrip.stations) : "—"}</p>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <select
              value={robot.mode}
              onChange={(e) => patchRobot(robot.id, { mode: e.target.value as Robot["mode"] })}
              className="rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1"
              aria-label="Mode"
            >
              <option>Fleet</option>
              <option>Manual</option>
            </select>
            <label className="flex cursor-pointer items-center gap-2">
              Enable for trips
              <button
                type="button" role="switch" aria-checked={robot.enabled}
                onClick={() => patchRobot(robot.id, { enabled: !robot.enabled })}
                className={`relative h-5 w-9 rounded-full transition-colors ${robot.enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-zinc-600"}`}
              >
                <span className={`absolute top-0.5 size-4 rounded-full bg-white dark:bg-zinc-900 transition-all ${robot.enabled ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </label>
          </div>
          {robot.status === "E-Stopped" ? (
            <button type="button" onClick={() => patchRobot(robot.id, { status: robot.tripId !== null ? "En Route" : "Idle" })}
              className="mt-1.5 w-full cursor-pointer rounded border border-blue-600 py-1.5 font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950">
              Recover
            </button>
          ) : (
            <button type="button" onClick={() => patchRobot(robot.id, { status: "E-Stopped" })}
              className="mt-1.5 w-full cursor-pointer rounded border border-red-500 py-1.5 font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
              ■ Emergency Stop
            </button>
          )}
          <button type="button" disabled={robot.status !== "Idle"} onClick={() => book(["parking"], { want: robot.id })}
            className="mt-1.5 w-full cursor-pointer rounded border border-slate-300 dark:border-zinc-700 py-1 font-medium disabled:cursor-not-allowed disabled:opacity-40">
            Send to parking
          </button>
        </div>
  );

  const live = (
    <div className="flex h-full">
      <div className="relative min-w-0 flex-1 overflow-hidden bg-[var(--mp-bg)]">
        <div className="absolute inset-0 origin-center transition-transform duration-300" style={{ transform: `scale(${zoom})` }}>
          <svg viewBox="0 0 600 380" className="size-full">
            {/* Floor plan: building shell + storage racks */}
            <rect x="20" y="20" width="560" height="340" rx="4" fill="var(--mp-bg)" stroke="var(--mp-wall)" strokeWidth="3" />
            <path d="M200 20v28M400 20v28M20 280h50M530 280h50" stroke="var(--mp-wall)" strokeWidth="3" />
            {RACKS.map((r, i) =>
              Array.from({ length: r.cols * r.rows }, (_, k) => (
                <rect key={`${i}-${k}`} x={r.x + (k % r.cols) * 12} y={r.y + Math.floor(k / r.cols) * 13} width="10" height="11" rx="1.5" fill="var(--mp-rack)" stroke="var(--mp-rack-s)" />
              )),
            )}
            {/* Aisles */}
            {LANES.map((l, i) => (
              <polyline key={i} points={l.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--mp-lane)" strokeWidth="2.5" strokeLinejoin="round" />
            ))}
            {/* Routes: other tugs faint, selected tug: driven part solid, remaining dashed */}
            {sim.trips.filter((t) => t.status === "En Route").map((t) => {
              const sp = split(t.path, t.travelled);
              const sel = t.robotId === selected;
              return (
                <g key={t.id}>
                  <polyline points={sp.rest.map((p) => p.join(",")).join(" ")} fill="none"
                    stroke={sel ? "#0d9488" : "#94a3b8"} strokeWidth={sel ? 3.5 : 2.5} strokeDasharray="7 5" strokeLinejoin="round" strokeLinecap="round" />
                  {sel && <polyline points={sp.done.map((p) => p.join(",")).join(" ")} fill="none" stroke="#0d9488" strokeOpacity="0.35" strokeWidth="3.5" strokeLinejoin="round" />}
                </g>
              );
            })}
            {NAMES.map((n) => (
              <g key={n}>
                <circle cx={ST[n][0]} cy={ST[n][1]} r="5" fill="var(--mp-bg)" stroke="var(--mp-ink)" strokeWidth="2" />
                <text x={ST[n][0] + 9} y={ST[n][1] + 3} fontSize="9" fill="var(--mp-ink2)">{n}</text>
              </g>
            ))}
            {sim.robots.map((r) => {
              const color = r.status === "E-Stopped" ? "#dc2626" : r.id === selected ? "#0d9488" : "#2563eb";
              return (
                <g key={r.id} transform={`translate(${r.pos[0]} ${r.pos[1]})`} onClick={() => setSelected(r.id)} className="cursor-pointer">
                  {r.id === selected && (
                    <motion.circle r="12" fill="none" stroke={color} strokeWidth="2"
                      animate={{ r: [14, 30], opacity: [0.7, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />
                  )}
                  <g transform={`rotate(${r.dir}) scale(1.3)`}>
                    {/* shadow */}
                    <rect x="-15" y="-8" width="31" height="19" rx="5" fill="#0f172a" opacity=".15" />
                    {/* tow cart with load, only while on a trip */}
                    {r.status === "En Route" && (
                      <g>
                        <line x1="-14" y1="0" x2="-21" y2="0" stroke="var(--mp-lane)" strokeWidth="2" />
                        <rect x="-41" y="-8" width="20" height="16" rx="2" fill="var(--mp-track)" stroke="var(--mp-lane)" />
                        <rect x="-37" y="-5" width="12" height="10" rx="1.5" fill="#f59e0b" opacity=".85" />
                        <rect x="-39" y="-10" width="5" height="2.5" rx="1" fill="var(--mp-ink2)" />
                        <rect x="-39" y="7.5" width="5" height="2.5" rx="1" fill="var(--mp-ink2)" />
                      </g>
                    )}
                    {/* wheels */}
                    {[[-11, -10.5], [5, -10.5], [-11, 7.5], [5, 7.5]].map(([x, y]) => (
                      <rect key={`${x}${y}`} x={x} y={y} width="8" height="3" rx="1.2" fill="var(--mp-ink)" />
                    ))}
                    {/* body */}
                    <rect x="-15" y="-8" width="30" height="16" rx="4.5" fill={color} stroke="var(--mp-edge)" strokeWidth="1.2" />
                    <rect x="-15" y="-1.2" width="19" height="2.4" fill="#fff" opacity=".35" />
                    {/* cab window */}
                    <rect x="3" y="-5.5" width="9" height="11" rx="2.5" fill="#dbeafe" stroke="var(--mp-ink)" strokeWidth=".8" />
                    <line x1="7.5" y1="-5.5" x2="7.5" y2="5.5" stroke="var(--mp-ink)" strokeWidth=".6" opacity=".5" />
                    {/* bumper + headlights */}
                    <rect x="14" y="-6.5" width="3" height="13" rx="1.5" fill="var(--mp-ink)" />
                    <circle cx="16.5" cy="-4" r="1.6" fill={r.status === "En Route" ? "#fde047" : "#cbd5e1"} />
                    <circle cx="16.5" cy="4" r="1.6" fill={r.status === "En Route" ? "#fde047" : "#cbd5e1"} />
                    {/* beacon */}
                    <motion.circle cx="-7" cy="0" r="2.4"
                      fill={r.status === "E-Stopped" ? "#ef4444" : "#f59e0b"}
                      animate={{ opacity: r.status === "Idle" ? 0.35 : [1, 0.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }} />
                  </g>
                  <text y="-19" fontSize="9" fontWeight="600" textAnchor="middle" fill="var(--mp-ink)">{r.id}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {[["+", () => setZoom((z) => Math.min(2.4, z + 0.3))], ["−", () => setZoom((z) => Math.max(1, z - 0.3))], ["⤢", () => setZoom(1)]].map(([l, f]) => (
            <button key={l as string} type="button" onClick={f as () => void} aria-label={l === "+" ? "Zoom in" : l === "−" ? "Zoom out" : "Fit"}
              className="grid size-9 cursor-pointer place-items-center rounded-full bg-white dark:bg-zinc-900 text-lg shadow-md hover:bg-slate-50 dark:hover:bg-zinc-800">
              {l as string}
            </button>
          ))}
        </div>

        {/* Selected Sherpa card */}
        {/* Selected Sherpa card: overlays the map only on small screens; on md+ it docks in the side panel */}
        <div className="absolute bottom-3 left-3 w-60 rounded-lg shadow-lg md:hidden">{sherpaCard}</div>
      </div>

      {/* Right panel */}
      <div className="hidden w-80 shrink-0 flex-col overflow-hidden border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:flex">
        <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
        <div className="grid grid-cols-2 text-xs">
          {(["Sherpas", "Stations"] as const).map((p) => (
            <button key={p} type="button" onClick={() => setPanel(p)}
              className={`cursor-pointer py-2.5 font-medium ${panel === p ? "border-b-2 border-slate-800 dark:border-slate-200" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400"}`}>
              {p}
            </button>
          ))}
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…"
          className="w-full border-b border-slate-200 bg-transparent px-3 py-2 text-xs outline-none dark:border-zinc-800" />
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-auto p-3 text-center text-xs">
          {panel === "Sherpas"
            ? sim.robots.filter((r) => r.id.includes(q)).map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => setSelected(r.id)}
                    className={`w-full cursor-pointer rounded-md px-2 py-2 shadow-sm ${r.id === selected ? "bg-teal-100 dark:bg-teal-900/50" : "bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-700"}`}>
                    {r.id}
                  </button>
                </li>
              ))
            : NAMES.filter((n) => n.includes(q)).map((n) => (
                <li key={n} className="rounded-md bg-slate-50 dark:bg-zinc-950 px-2 py-2">{n}</li>
              ))}
        </ul>
        <div className="hidden border-t border-slate-200 p-3 dark:border-zinc-800 md:block">{sherpaCard}</div>
      </div>
    </div>
  );

  const shown = savedTab === "Saved Routes" ? saved : [...saved].sort((a, b) => b.count - a.count).slice(0, 3);
  const bookScreen = (
    <div className="p-4 sm:p-6">
      <div className="relative flex items-center justify-center gap-6 text-xs font-medium">
        {(["Saved Routes", "Frequent Routes"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setSavedTab(t)}
            className={`cursor-pointer pb-2 ${savedTab === t ? "border-b-2 border-slate-800 dark:border-slate-200" : "text-slate-500 dark:text-slate-400"}`}>
            {t}
          </button>
        ))}
        <button type="button" onClick={() => { setSeq([]); setTab("build"); }}
          className={`${btnPrimary} absolute right-0 -top-1 normal-case`}>
          + Add New Trip
        </button>
      </div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by Route Name"
        className="mt-5 w-full max-w-xs rounded border border-slate-300 bg-transparent px-3 py-2 text-xs outline-none dark:border-zinc-700" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.filter((r) => r.name.toLowerCase().includes(q)).map((r) => (
          <div key={r.name} className="rounded-lg bg-white dark:bg-zinc-900 p-4 shadow-sm">
            <p className="font-semibold">{r.name}</p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Route</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{stationLabel(r.stations)}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className={btnPrimary}
                onClick={() => { book(r.stations); setSaved((s) => s.map((x) => (x.name === r.name ? { ...x, count: x.count + 1 } : x))); }}>
                Book trip
              </button>
              <button type="button" className={btnOutline} onClick={() => book(r.stations, { schedule: true })}>Schedule</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const buildScreen = (
    <div className="p-4 sm:p-6">
      <button type="button" onClick={() => setTab("book")} aria-label="Back" className="cursor-pointer text-2xl leading-none">←</button>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-4">
        {seq.length === 0 ? (
          <p className="py-3 text-xs text-slate-500 dark:text-slate-400">Select stations below to build a route.</p>
        ) : (
          <ol className="flex min-w-max items-start gap-4">
            {seq.map((n, i) => (
              <li key={n} className="flex items-start gap-4">
                <div className="text-center text-xs">
                  <span className="mx-auto grid size-6 place-items-center rounded-full border-2 border-slate-900 dark:border-slate-200 font-semibold">{i + 1}</span>
                  <p className="mt-2">{n}</p>
                </div>
                {i < seq.length - 1 && <span className="mt-3 h-0.5 w-12 bg-slate-900 dark:bg-slate-100 dark:text-slate-900" />}
              </li>
            ))}
          </ol>
        )}
      </div>
      <p className="mt-5 font-semibold">Select Station</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {NAMES.map((n) => {
          const on = seq.includes(n);
          return (
            <button key={n} type="button" onClick={() => setSeq((s) => (on ? s.filter((x) => x !== n) : [...s, n]))}
              className={`cursor-pointer rounded border px-2 py-2.5 text-xs transition-colors ${on ? "border-blue-300 dark:border-blue-800 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200" : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800"}`}>
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap justify-between gap-2">
        <button type="button" onClick={() => setSeq([])} className={`${btn} border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950`}>Clear</button>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!seq.length} className={`${btnOutline} disabled:opacity-40`}
            onClick={() => { setSaved((s) => [...s, { name: `Route ${s.length + 1}`, stations: seq, count: 0 }]); setToast("Route saved"); }}>
            Save route
          </button>
          <button type="button" disabled={!seq.length} className={`${btnOutline} disabled:opacity-40`}
            onClick={() => { book(seq, { schedule: true }); setTripTab("Scheduled"); setTab("trips"); }}>
            Schedule trip
          </button>
          <button type="button" disabled={!seq.length} className={`${btnPrimary} disabled:opacity-40`}
            onClick={() => { book(seq); setTripTab("Active"); setTab("trips"); }}>
            Book trip
          </button>
        </div>
      </div>
    </div>
  );

  const tripsScreen = (
    <div className="p-4 sm:p-6">
      <div className="flex justify-center gap-6 text-xs">
        {(["Active", "Scheduled", "Completed"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTripTab(t)}
            className={`cursor-pointer pb-2 ${tripTab === t ? "border-b-2 border-slate-800 dark:border-slate-200 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-100">
              {["Trip ID", "Sherpa", "Route", "Booked", "Started", "Ended", "Progress", "Status", ""].map((h) => (
                <th key={h} className="px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400 dark:text-slate-500">No {tripTab.toLowerCase()} trips</td></tr>
            )}
            {trips.map((t) => {
              const p = progress(t);
              return (
                <tr key={t.id} className="border-b border-slate-100 dark:border-zinc-800">
                  <td className="px-3 py-3">{t.id}</td>
                  <td className="px-3 py-3">{t.robotId ?? "—"}</td>
                  <td className="max-w-[160px] truncate px-3 py-3">{stationLabel(t.stations)}</td>
                  <td className="px-3 py-3">{t.booked}</td>
                  <td className="px-3 py-3">{t.started}</td>
                  <td className="px-3 py-3">{t.ended}</td>
                  <td className="px-3 py-3">
                    <span className="relative grid size-9 place-items-center">
                      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--mp-track)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${(p / 100) * 94.2} 94.2`} />
                      </svg>
                      <span className="text-[10px]">{p}%</span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 font-medium ${chip[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="px-3 py-3">
                    {(t.status === "En Route" || t.status === "Pending") && (
                      <button type="button" onClick={() => cancel(t.id)}
                        className="cursor-pointer rounded border border-red-400 px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const settingsScreen = (
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
      {SETTINGS.map((s) => (
        <button key={s} type="button" onClick={() => setToast(`${s} isn't part of this demo`)}
          className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-lg bg-white dark:bg-zinc-900 text-sm shadow-sm hover:shadow-md">
          {s}
          <span className="grid size-5 place-items-center rounded bg-blue-600 text-[10px] font-bold text-white">{s[0]}</span>
        </button>
      ))}
    </div>
  );

  const screens = { live, book: bookScreen, build: buildScreen, trips: tripsScreen, settings: settingsScreen };

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-lg border border-border bg-surface/70 backdrop-blur-xl"
      style={{ boxShadow: "0 0 100px -30px var(--cyan), 0 30px 60px -30px rgb(0 0 0 / 0.5)" }}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        <span className="mx-auto rounded-md bg-surface-2 px-3 py-1 font-mono text-[10px] text-subtle">fleet-manager / demo · simulated data</span>
        <span className="w-[42px]" />
      </div>

      <div className="relative flex h-[620px] flex-col bg-slate-50 text-slate-800 [--mp-bg:#fafbfc] [--mp-wall:#cbd5e1] [--mp-rack:#e9edf2] [--mp-rack-s:#d6dde6] [--mp-lane:#475569] [--mp-ink:#1e293b] [--mp-ink2:#334155] [--mp-track:#e2e8f0] [--mp-edge:#fff] dark:bg-zinc-950 dark:text-slate-100 dark:[--mp-bg:#14141d] dark:[--mp-wall:#3a3a4e] dark:[--mp-rack:#212131] dark:[--mp-rack-s:#2e2e40] dark:[--mp-lane:#8b90aa] dark:[--mp-ink:#e6e8f2] dark:[--mp-ink2:#b6bad0] dark:[--mp-track:#2e2e42] dark:[--mp-edge:#14141d] dark:[color-scheme:dark]">
        <header className="flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5">
          <span className="font-serif text-xl leading-none">Fleet Manager</span>
          <span className="hidden rounded border border-slate-300 dark:border-zinc-700 px-3 py-1.5 text-xs sm:block">demo_site ▾</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button type="button" onClick={() => setMenu((m) => (m === "bell" ? null : "bell"))} aria-label="Notifications" aria-expanded={menu === "bell"}
                className="relative grid size-9 cursor-pointer place-items-center rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-zinc-800">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                </svg>
                {alertNotes.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
                    {alertNotes.length}
                  </span>
                )}
              </button>
              {menu === "bell" && (
                <div className="absolute top-11 right-0 z-30 w-64 rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="px-3 py-2 font-medium">Notifications</p>
                  {notes.length === 0 && <p className="px-3 pb-3 text-slate-500 dark:text-slate-400">Nothing new.</p>}
                  <ul>
                    {notes.map((n) => (
                      <li key={n.id} className="flex items-center gap-2 rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800">
                        <span className={`size-2 shrink-0 rounded-full ${n.tone}`} />
                        {n.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="relative">
              <button type="button" onClick={() => setMenu((m) => (m === "account" ? null : "account"))} aria-label="Account" aria-expanded={menu === "account"}
                className="grid size-9 cursor-pointer place-items-center rounded-full border-2 border-slate-400 text-sm font-medium text-slate-500 hover:border-slate-600 hover:text-slate-700 dark:border-zinc-600 dark:text-slate-400 dark:hover:border-zinc-400">
                A
              </button>
              {menu === "account" && (
                <div className="absolute top-11 right-0 z-30 w-48 rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="px-3 py-2 text-slate-500 dark:text-slate-400">Signed in as demo.user</p>
                  <button type="button"
                    onClick={() => { setSignedIn(false); setMenu(null); }}
                    className="w-full cursor-pointer rounded px-3 py-2 text-left font-medium hover:bg-slate-100 dark:hover:bg-zinc-800">
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">{screens[tab]}</main>

        {signedIn && (
        <nav className="mx-auto mb-3 flex w-[min(92%,34rem)] justify-between rounded-lg bg-white dark:bg-zinc-900 px-2 py-1.5 shadow-lg">
          {NAV.map((n) => {
            const on = tab === n.tab || (tab === "build" && n.tab === "book");
            return (
              <button key={n.tab} type="button" onClick={() => setTab(n.tab)}
                className={`flex flex-1 cursor-pointer flex-col items-center gap-0.5 py-1 text-[10px] sm:text-xs ${on ? "font-semibold text-teal-800 dark:text-teal-200" : "text-slate-500 dark:text-slate-400"}`}>
                <span className={`grid size-7 place-items-center rounded-full text-base ${on ? "bg-teal-100 dark:bg-teal-900/50" : ""}`}>{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </nav>
        )}

        {/* Login page (shown after logging out) */}
        {!signedIn && (
          <div className="absolute inset-0 z-40 flex bg-white dark:bg-zinc-950">
            <div className="relative hidden flex-1 overflow-hidden bg-slate-100 dark:bg-zinc-900 md:block">
              <svg viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
                {/* Teal parallelogram pattern, growing toward the top-right corner */}
                {Array.from({ length: 6 }, (_, row) =>
                  Array.from({ length: 9 }, (_, col) => {
                    const size = 5 + col * 2.6 + (5 - row) * 0.6;
                    const x = 250 + col * 40;
                    const y = 12 + row * 42;
                    const sk = size * 0.5;
                    return (
                      <polygon key={`${row}-${col}`} fill="#0d9488" opacity={0.35 + col * 0.07}
                        points={`${x + sk},${y} ${x + size + sk},${y} ${x + size},${y + size * 1.1} ${x},${y + size * 1.1}`} />
                    );
                  }),
                )}
                {/* Three tugs, front view, sitting on the floor */}
                <LoginTug x={125} y={450} s={1} body="#facc15" edge="#ca8a04" />
                <LoginTug x={285} y={450} s={0.92} body="#f3f4f6" edge="#cbd5e1" canopy />
                <LoginTug x={455} y={450} s={1.22} body="#facc15" edge="#ca8a04" />
              </svg>
              <p className="absolute bottom-6 left-7 font-serif text-3xl text-slate-800 dark:text-slate-100">Fleet Manager</p>
            </div>

            <form
              className="flex w-full flex-col justify-center px-8 md:w-[44%] md:px-12"
              onSubmit={(e) => { e.preventDefault(); setSignedIn(true); setToast("Logged in"); }}
            >
              <h4 className="text-center text-2xl font-bold tracking-tight">
                <span className="text-red-600">FM</span> DASHBOARD
              </h4>
              <p className="mt-6 text-center text-lg font-semibold">Sign in</p>

              <label className="mt-4 block text-xs font-semibold">Username
                <input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="off"
                  className="mt-1.5 block w-full rounded-md border border-slate-300 bg-transparent px-3 py-3 text-sm font-normal outline-none focus:border-blue-500 dark:border-zinc-700" />
              </label>
              <label className="mt-4 block text-xs font-semibold">Password
                <span className="relative mt-1.5 block">
                  <input value={pw} onChange={(e) => setPw(e.target.value)} type={showPw ? "text" : "password"} autoComplete="off"
                    className="block w-full rounded-md border border-slate-300 bg-transparent px-3 py-3 pr-11 text-sm font-normal outline-none focus:border-blue-500 dark:border-zinc-700" />
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-500">
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                      {!showPw && <path d="M3 3l18 18" />}
                    </svg>
                  </button>
                </span>
              </label>

              <button type="submit" className="mt-7 w-full cursor-pointer rounded-md bg-blue-500 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-600">
                Log In
              </button>
              <p className="mt-10 text-center text-[10px] text-slate-500 dark:text-slate-400">Demo only: any login works · simulated data · © 2026</p>
            </form>
          </div>
        )}

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              className="pointer-events-none absolute top-16 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 px-4 py-2 text-xs text-white shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
