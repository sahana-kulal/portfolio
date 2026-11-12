import { projects } from "@/content/data";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FleetManagerDemo } from "@/components/demo/FleetManagerDemo";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectStory } from "./ProjectStory";

export function Projects() {
  return (
    <section id="work" className="pt-[clamp(3.5rem,8vh,6rem)]">
      <div className="container-page">
        <SectionHeader index="03" label="Selected work" before="Systems I've" accent="shipped." className="!mb-0" />
      </div>
      {projects.map((p) => (
        <ProjectStory key={p.id} project={p} total={projects.length} />
      ))}
      <div className="container-page pt-8 pb-4">
        <Reveal>
          <p className="label-mono mb-4 flex items-center gap-3 text-subtle">
            <span className="text-gradient">Live demo</span>
            <span className="h-px w-10 bg-border" />
            Simulated data
          </p>
          <h3 className="font-serif text-display-md">
            Try the <em className="text-gradient pr-[0.08em]">Fleet Manager.</em>
          </h3>
          <p className="mt-4 mb-8 max-w-2xl text-muted">
            A working recreation of the operator UI: watch Sherpas move, book or schedule a trip, build a route, cancel a
            trip, and hit emergency stop. All data is made up.
          </p>
        </Reveal>
        <FleetManagerDemo />
      </div>
    </section>
  );
}
