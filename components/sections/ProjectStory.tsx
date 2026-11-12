"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { projects as Projects } from "@/content/data";
import { Chip } from "@/components/ui/Chip";
import { AnalyticsVisual } from "@/components/visuals/AnalyticsVisual";
import { FleetVisual } from "@/components/visuals/FleetVisual";
import { MonitorVisual } from "@/components/visuals/MonitorVisual";
import { MtsVisual } from "@/components/visuals/MtsVisual";
import { TeleopsVisual } from "@/components/visuals/TeleopsVisual";
import { ease } from "@/lib/motion";

type Project = (typeof Projects)[number];

const VISUALS = { fleet: FleetVisual, teleops: TeleopsVisual, monitor: MonitorVisual, mts: MtsVisual, analytics: AnalyticsVisual };
const AUTOPLAY_MS = 3000;
const TICK_MS = 250;

/**
 * Case study: the active step (picked by click or autoplay) drives
 * both the text highlight and the animated visual.
 */
export function ProjectStory({ project, total }: { project: Project; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const n = project.steps.length;

  const idle = useRef(0); // ms the user has been idle while this story is in view
  const reduce = useReducedMotion();

  // Autoplay: while the story covers the viewport centre and the user is idle, cycle steps 1 → 2 → 3 → 1.
  // A click restarts the idle timer.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      const r = ref.current?.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      const inView = r && r.top <= mid && r.bottom >= mid;
      idle.current = inView ? idle.current + TICK_MS : 0;
      if (idle.current < AUTOPLAY_MS) return;
      idle.current = 0;
      setStep((s) => (s + 1) % n);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [n, reduce]);

  const goTo = (i: number) => {
    idle.current = 0;
    setStep(i);
  };

  const Visual = VISUALS[project.id];

  return (
    <div
      ref={ref}
      className="relative flex items-center overflow-hidden py-12 lg:py-16"
      style={{ ["--accent" as string]: `var(--${project.color})` }}
    >
      <div className="container-page grid items-center gap-6 lg:grid-cols-12 lg:gap-16">
        {/* Text */}
        <div className="order-2 lg:order-1 lg:col-span-5">
          <p className="label-mono flex items-center gap-3 text-subtle">
            <span className="whitespace-nowrap text-(--accent)">
              {project.index} / {String(total).padStart(2, "0")}
            </span>
            <span className="hidden h-px w-8 bg-border sm:block" />
            {project.kicker}
          </p>
          <h3 className="mt-3 font-serif text-display-md lg:mt-4">{project.title}</h3>
          <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
            {project.stack.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>

          <ol className="mt-5 lg:mt-10">
            {project.steps.map((s, i) => {
              const on = i === step;
              return (
                <li
                  key={s.title}
                  className={`relative border-l py-2 pl-5 transition-colors duration-500 lg:py-3 ${
                    on ? "border-(--accent)" : "hidden border-border lg:block"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={on ? "step" : undefined}
                    className={`flex w-full cursor-pointer items-baseline gap-3 text-left font-medium transition-colors duration-500 ${on ? "text-text" : "text-subtle hover:text-muted"}`}
                  >
                    <span className="font-mono text-xs text-(--accent)">0{i + 1}</span>
                    {s.title}
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: ease.outExpo }}
                        className="overflow-hidden text-sm text-muted sm:text-base"
                      >
                        <span className="block pt-2">{s.body}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>

          {/* Step progress (mobile shows this instead of the full list) */}
          <div className="mt-5 flex gap-1.5 lg:mt-8">
            {project.steps.map((s, i) => (
              <span
                key={s.title}
                className={`h-1 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-(--accent)" : "w-3 bg-border"}`}
              />
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="order-1 lg:order-2 lg:col-span-7">
          <Visual step={step} />
        </div>
      </div>
    </div>
  );
}
