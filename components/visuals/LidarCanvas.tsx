"use client";

import { useEffect, useRef } from "react";

type Rect = { x: number; y: number; w: number; h: number };

const RANGE = 9; // metres
const SWEEP_DEG_PER_MS = 0.3; // one revolution ≈ 1.2 s
const BEAM_STEP = 1.5; // degrees between rays
const FADE_MS = 1400;

function rayRect(dx: number, dy: number, r: Rect) {
  let tmin = 0;
  let tmax = Infinity;
  for (const [d, lo, hi] of [[dx, r.x, r.x + r.w], [dy, r.y, r.y + r.h]] as const) {
    if (Math.abs(d) < 1e-9) {
      if (lo > 0 || hi < 0) return Infinity;
    } else {
      let t1 = lo / d;
      let t2 = hi / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return Infinity;
    }
  }
  return tmin > 0 ? tmin : Infinity;
}
function rayCircle(dx: number, dy: number, cx: number, cy: number, r: number) {
  const b = dx * cx + dy * cy;
  const c = cx * cx + cy * cy - r * r;
  const disc = b * b - c;
  if (c <= 0 || disc < 0 || b < 0) return Infinity;
  return b - Math.sqrt(disc);
}

/**
 * Top-down simulated LiDAR scan: a sweeping beam hits walls, racks and a moving person
 * ahead of the robot; hits fade out like a live viewer. With `detect`, the person gets a
 * detection box and a distance readout. Illustrative scene, not real data.
 */
export function LidarCanvas({ detect }: { detect: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const detectRef = useRef(detect);
  useEffect(() => {
    detectRef.current = detect;
  }, [detect]);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    const pts: { x: number; y: number; t: number; hue: number; person: boolean }[] = [];
    let sweep = 0;
    let last = performance.now();
    let travel = 0;
    let personHit = -1e9;
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      travel += dt * 0.0016; // 1.6 m/s forward
      const tt = now / 1000;

      // Scene in the robot frame (x right, y forward, metres).
      const rects: Rect[] = [{ x: -4.4, y: -14, w: 0.2, h: 40 }, { x: 4.2, y: -14, w: 0.2, h: 40 }];
      const off = travel % 4;
      for (let k = -4; k <= 5; k++) {
        const y = k * 4 - off;
        rects.push({ x: -3.5, y, w: 1.2, h: 2.6 }, { x: 2.3, y, w: 1.2, h: 2.6 });
      }
      const px = Math.sin(tt * 0.7) * 1.6;
      const py = 5.2 + Math.sin(tt * 0.35) * 1.2;

      // Advance the sweep, casting a ray every BEAM_STEP degrees.
      const next = sweep + dt * SWEEP_DEG_PER_MS;
      for (let a = Math.floor(sweep / BEAM_STEP) + 1; a * BEAM_STEP <= next; a++) {
        const rad = (a * BEAM_STEP * Math.PI) / 180;
        const dx = Math.sin(rad);
        const dy = Math.cos(rad);
        let best = RANGE;
        let person = false;
        for (const r of rects) best = Math.min(best, rayRect(dx, dy, r));
        const tp = rayCircle(dx, dy, px, py, 0.4);
        if (tp < best) { best = tp; person = true; }
        if (best < RANGE) {
          pts.push({ x: dx * best, y: dy * best, t: now, hue: (best / RANGE) * 270, person });
          if (person) personHit = now;
        }
      }
      sweep = next % 360;
      while (pts.length > 2600) pts.shift();

      // Draw.
      const rx = w / 2;
      const ry = h * 0.78;
      const sc = ry / RANGE;
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(120,130,170,0.25)";
      ctx.setLineDash([2, 4]);
      for (const m of [3, 6, 9]) {
        ctx.beginPath();
        ctx.arc(rx, ry, m * sc, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const sr = (sweep * Math.PI) / 180;
      const g = ctx.createLinearGradient(rx, ry, rx + Math.sin(sr) * RANGE * sc, ry - Math.cos(sr) * RANGE * sc);
      g.addColorStop(0, "rgba(94,234,212,0.7)");
      g.addColorStop(1, "rgba(94,234,212,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + Math.sin(sr) * RANGE * sc, ry - Math.cos(sr) * RANGE * sc);
      ctx.stroke();

      for (const p of pts) {
        const alpha = 1 - (now - p.t) / FADE_MS;
        if (alpha <= 0) continue;
        ctx.fillStyle = p.person ? `rgba(248,113,113,${alpha})` : `hsla(${p.hue},90%,60%,${alpha})`;
        ctx.fillRect(rx + p.x * sc - 1, ry - p.y * sc - 1, 2.2, 2.2);
      }

      if (detectRef.current && now - personHit < 900) {
        const bx = rx + px * sc;
        const by = ry - py * sc;
        const half = 0.65 * sc;
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx - half, by - half, half * 2, half * 2);
        ctx.fillStyle = "#ef4444";
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText(`Person · ${Math.hypot(px, py).toFixed(1)} m`, Math.min(bx + half + 4, w - 78), by - half - 3);
      }

      // Robot.
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.roundRect(rx - 6, ry - 9, 12, 18, 3);
      ctx.fill();

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
    io.observe(cv);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}
