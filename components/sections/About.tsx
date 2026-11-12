import { metrics, profile } from "@/content/data";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollText } from "@/components/ui/ScrollText";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function About() {
  const { education: edu } = profile;

  return (
    <section id="about" className="container-page py-[clamp(3.5rem,8vh,6rem)]">
      <SectionHeader index="01" label="About" before="Engineering that makes" accent="robots" after=" legible." />

      <ScrollText paragraphs={profile.about} className="max-w-4xl space-y-6" />

      <Reveal delay={0.2} className="mt-12">
        <div className="glass flex flex-col gap-3 rounded-lg px-6 py-5 md:flex-row md:items-center md:gap-8">
          <p className="label-mono text-subtle">Education</p>
          <div className="md:flex-1">
            <p className="font-serif text-xl leading-tight">{edu.school}</p>
            <p className="mt-1 text-muted">{edu.degree}</p>
          </div>
          <div className="flex gap-6 font-mono text-sm text-muted">
            <span>{edu.period}</span>
          </div>
        </div>
      </Reveal>

      <div className="mt-20 grid grid-cols-2 gap-4 md:mt-28 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.08}>
            <div className="glass group relative h-full overflow-hidden rounded-lg p-6 md:p-8">
              {/* Hover glow */}
              <div className="absolute -right-10 -bottom-10 size-32 rounded-full bg-[image:var(--gradient-brand)] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40" />
              <Counter
                value={m.value}
                decimals={m.decimals}
                suffix={m.suffix}
                className="text-gradient block font-serif text-display-md"
              />
              <p className="label-mono mt-4 text-subtle">{m.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
