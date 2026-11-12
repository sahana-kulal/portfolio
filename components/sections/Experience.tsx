"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { experience } from "@/content/data";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ease } from "@/lib/motion";

export function Experience() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" className="container-page py-[clamp(3.5rem,8vh,6rem)]">
      <SectionHeader index="02" label="Experience" before="Where I've been" accent="building." />

      <ol ref={ref} className="relative">
        {/* Track + scroll-linked gradient fill */}
        <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-border">
          <motion.div
            className="absolute inset-0 origin-top bg-[image:var(--gradient-brand)]"
            style={{ scaleY: fill }}
          />
        </div>

        {experience.map((job, i) => (
          <li key={job.role} className="relative pb-20 pl-10 last:pb-0 md:pl-16">
            {/* Node: lights up as it enters the reading zone */}
            <motion.span
              aria-hidden
              className="absolute top-1.5 left-0 grid size-[15px] place-items-center rounded-full border border-border bg-bg"
              initial={{ scale: 0.6 }}
              whileInView={{ scale: 1, borderColor: "var(--cyan)", boxShadow: "0 0 20px var(--cyan)" }}
              viewport={{ once: true, margin: "0px 0px -40% 0px" }}
              transition={{ duration: 0.5, ease: ease.outExpo }}
            >
              <span className="size-[5px] rounded-full bg-[image:var(--gradient-brand)]" />
            </motion.span>

            <div className="grid gap-6 md:grid-cols-12">
              <Reveal className="md:col-span-4">
                <p className="label-mono text-subtle">{job.period}</p>
                <p className="mt-3 text-muted">{job.company}</p>
              </Reveal>

              <Reveal delay={0.1} className="md:col-span-8">
                <h3 className="font-serif text-display-md">
                  {i === 0 ? (
                    <>
                      {job.role.split(" ").slice(0, -1).join(" ")}{" "}
                      <em className="text-gradient pr-[0.08em]">{job.role.split(" ").at(-1)}</em>
                    </>
                  ) : (
                    job.role
                  )}
                </h3>
                <ul className="mt-6 space-y-3">
                  {job.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-muted">
                      <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-[image:var(--gradient-brand)]" />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {job.tech.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </Reveal>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
