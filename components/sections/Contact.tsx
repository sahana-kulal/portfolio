"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { links, profile } from "@/content/data";
import { Reveal } from "@/components/ui/Reveal";
import { ease } from "@/lib/motion";

const SOCIALS = [
  { label: "LinkedIn", href: links.linkedin },
];

function CopyField({ value, fallbackHref }: { value: string; fallbackHref: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = fallbackHref;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-cursor="Copy"
      className="group glass flex w-full items-center justify-between gap-4 rounded-full py-3 pr-3 pl-6 text-left transition-colors hover:border-violet/50 sm:w-auto"
    >
      <span className="truncate font-mono text-sm sm:text-base">{value}</span>
      <span className="relative grid h-10 min-w-24 place-items-center overflow-hidden rounded-full bg-[image:var(--gradient-brand)] px-4 text-sm font-medium text-white">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "y" : "n"}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {copied ? "Copied ✓" : "Copy"}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

export function Contact() {
  return (
    <section id="contact" className="container-page py-[clamp(3.5rem,8vh,6rem)]">
      <Reveal>
        <p className="label-mono mb-6 flex items-center gap-3 text-subtle">
          <span className="text-gradient">05</span>
          <span className="h-px w-10 bg-border" />
          Contact
        </p>
      </Reveal>

      <motion.h2
        className="font-serif text-[clamp(2.5rem,6.5vw,5.75rem)] leading-[0.9] tracking-[-0.03em]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {["Let's", "build"].map((w, i) => (
          <span key={w} className="mr-[0.25em] inline-block overflow-hidden pb-[0.04em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
              transition={{ duration: 1, ease: ease.outExpo, delay: i * 0.08 }}
            >
              {w}
            </motion.span>
          </span>
        ))}
        <br />
        <span className="inline-block overflow-hidden pr-[0.1em] pb-[0.22em] align-bottom">
          <motion.em
            className="text-gradient inline-block pr-[0.05em]"
            variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
            transition={{ duration: 1, ease: ease.outExpo, delay: 0.16 }}
          >
            something.
          </motion.em>
        </span>
      </motion.h2>

      <Reveal delay={0.2} className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="mb-6 max-w-md text-body-lg text-muted">
            Open to interesting problems in production debugging and real-time industrial UI. Reach me by email or phone.
          </p>
          <div className="flex flex-col gap-3 sm:items-start">
            <CopyField value={links.email} fallbackHref={`mailto:${links.email}`} />
            <CopyField value={links.phone} fallbackHref={`tel:${links.phone.replace(/\s/g, "")}`} />
          </div>
        </div>

        <div className="flex flex-col gap-3 md:col-span-4 md:col-start-9">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between border-b border-border py-3 text-lg transition-colors hover:border-text"
            >
              {s.label}
              <span className="text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-text">
                ↗
              </span>
            </a>
          ))}
          <a
            href={profile.resumeUrl}
            download
            className="group flex items-center justify-between border-b border-border py-3 text-lg transition-colors hover:border-text"
          >
            Résumé (PDF)
            <span className="text-muted transition-transform duration-300 group-hover:translate-y-1 group-hover:text-text">↓</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
