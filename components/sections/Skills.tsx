import { skills } from "@/content/data";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ALL = [...new Set(skills.flatMap((g) => g.items))];

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <div
        className="animate-marquee flex shrink-0"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {[...items, ...items].map((s, i) => (
          <span key={i} className="px-6 font-serif text-[clamp(3rem,8vw,7rem)] leading-none italic">
            {s}
            <span className="ml-12 text-[0.5em] align-middle not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  const half = Math.ceil(ALL.length / 2);

  return (
    <section id="skills" className="relative overflow-hidden py-[clamp(3.5rem,8vh,6rem)]">
      {/* Background marquees */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 space-y-4 opacity-[0.035] select-none">
        <Marquee items={ALL.slice(0, half)} />
        <Marquee items={ALL.slice(half)} reverse />
      </div>

      <div className="container-page relative">
        <SectionHeader index="04" label="Skills" before="The" accent="toolkit." />

        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((g, i) => (
            <Reveal key={g.group} delay={i * 0.06}>
              <div className="glass h-full rounded-lg p-6">
                <p className="label-mono mb-5 flex items-center justify-between text-subtle">
                  {g.group}
                  <span className="text-gradient">{String(g.items.length).padStart(2, "0")}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
