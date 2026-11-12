"use client";

/**
 * Inline script that executes during HTML parsing (server render) but is inert when React
 * renders it on the client — avoids React's "script tag" dev warning. See Next docs:
 * guides/preventing-flash-before-hydration.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
