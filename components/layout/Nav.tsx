"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { navItems, profile } from "@/content/data";
import { ease } from "@/lib/motion";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Nav-link jumps keep the header visible until the user scrolls by hand.
  const pinned = useRef(false);

  useEffect(() => {
    const release = () => { pinned.current = false; };
    const events = ["wheel", "touchmove", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, release, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, release));
  }, []);

  // Hide on scroll down, show on scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(!pinned.current && y > prev && y > 200);
    setScrolled(y > 20);
  });

  const pin = () => {
    pinned.current = true;
    setHidden(false);
  };

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 pt-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: ease.outExpo, delay: hidden ? 0 : 0.2 }}
    >
      <nav
        className={`container-page flex items-center justify-between rounded-full py-2.5 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled ? "glass" : "border border-transparent"
        }`}
        style={{ maxWidth: "min(1280px, calc(100% - 2rem))" }}
      >
        <a href="#top" className="font-serif text-2xl leading-none" aria-label="Back to top">
          S<span className="text-gradient italic">K</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={pin}
                className="group relative px-3 py-2 text-sm text-muted transition-colors hover:text-text"
              >
                {item.label}
                <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-[image:var(--gradient-brand)] transition-transform duration-300 ease-out-expo group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={profile.resumeUrl}
            download
            className="hidden rounded-full bg-text px-4 py-2 text-sm font-medium text-bg transition-transform hover:scale-[1.03] sm:inline-block"
          >
            Resume ↓
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
