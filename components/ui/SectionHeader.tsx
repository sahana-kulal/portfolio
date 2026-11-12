import { Reveal } from "./Reveal";

/** "01 — LABEL" mono line, then a serif title with one gradient-italic word. */
export function SectionHeader({
  index,
  label,
  before,
  accent,
  after = "",
  className = "",
}: {
  index: string;
  label: string;
  before: string;
  accent: string;
  after?: string;
  className?: string;
}) {
  return (
    <Reveal className={`mb-16 md:mb-24 ${className}`}>
      <p className="label-mono mb-6 flex items-center gap-3 text-subtle">
        <span className="text-gradient">{index}</span>
        <span className="h-px w-10 bg-border" />
        {label}
      </p>
      <h2 className="font-serif text-display-lg">
        {before} <em className="text-gradient pr-[0.08em]">{accent}</em>
        {after}
      </h2>
    </Reveal>
  );
}
