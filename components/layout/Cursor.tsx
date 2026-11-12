"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Trailing gradient ring around the native cursor. Grows over links/buttons; elements with
 * data-cursor="Label" grow it larger and show the label. Off on touch / reduced motion.
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  // null = not hovering, "" = hovering a link/button, "Label" = hovering a [data-cursor] target
  const [hover, setHover] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 300, damping: 30 });
  const ry = useSpring(y, { stiffness: 300, damping: 30 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability detection must happen on the client
    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = (e.target as Element | null)?.closest?.("[data-cursor], a, button");
      setHover(el ? (el.getAttribute("data-cursor") ?? "") : null);
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  const isHover = hover !== null;
  const label = hover || null;
  const size = label ? 88 : isHover ? 56 : 36;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div
        className="absolute top-0 left-0 grid place-items-center rounded-full"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: size, height: size }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-300"
          style={{
            background: isHover ? "var(--gradient-brand)" : "transparent",
            opacity: label ? 0.95 : isHover ? 0.35 : 1,
            border: isHover ? "none" : "1.5px solid color-mix(in srgb, var(--violet) 70%, var(--cyan))",
          }}
        />
        {label && <span className="label-mono relative text-[10px] text-white">{label}</span>}
      </motion.div>
    </div>
  );
}
