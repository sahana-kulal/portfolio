import { projects } from "@/content/data";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
    </section>
  );
}
