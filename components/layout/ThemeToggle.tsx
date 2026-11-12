"use client";

import { useLayoutEffect } from "react";

export const THEME_KEY = "theme";

export function ThemeToggle() {
  // React's dev-mode remount clears data-theme set by the inline script; re-apply it.
  useLayoutEffect(() => {
    const t = localStorage.getItem(THEME_KEY);
    if (t) document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  }

  // Both icons are rendered; CSS picks one, so server and client markup always match.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      className="relative grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:text-text"
    >
      {/* Sun (shown in dark mode → switches to light) */}
      <svg
        viewBox="0 0 24 24"
        className="absolute size-[18px] scale-50 rotate-90 opacity-0 transition-all duration-500 ease-out-expo dark:scale-100 dark:rotate-0 dark:opacity-100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      {/* Moon (shown in light mode → switches to dark) */}
      <svg
        viewBox="0 0 24 24"
        className="absolute size-[18px] scale-100 rotate-0 opacity-100 transition-all duration-500 ease-out-expo dark:scale-50 dark:-rotate-90 dark:opacity-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  );
}
