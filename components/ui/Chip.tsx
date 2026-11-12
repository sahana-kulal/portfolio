export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="label-mono relative isolate inline-flex items-center overflow-hidden rounded-full border border-violet/60 bg-surface/40 px-3 py-1.5 text-[11px] tracking-[0.08em] text-text normal-case shadow-[0_0_24px_-6px_var(--violet)] transition-[color,box-shadow] duration-500 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:rounded-full before:bg-[image:var(--gradient-brand)] before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white hover:shadow-[0_0_32px_-4px_var(--violet)] hover:before:scale-x-100">
      {children}
    </span>
  );
}
