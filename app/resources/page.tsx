"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Layers,
  Type,
  AlignLeft,
  Layout,
  MousePointer,
  Terminal,
  Sparkles,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { resourceItems, docSections } from "@/lib/resources";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: easeSmooth }
  })
};

const componentReference: [string, string, React.ElementType][] = [
  ["Scene", "Creates one timed presentation page.", Layers],
  ["Title", "Large animated headline layer for a scene.", Type],
  ["Text", "Supporting body copy with enter, delay, and duration props.", AlignLeft],
  ["Card", "Structured information block with title and text props.", Layout],
  ["CTA", "Call-to-action label for scene endings.", MousePointer]
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-[#111118] text-neutral-200 selection:bg-[#5e6ad2]/35 overflow-x-hidden">
      <SiteNav />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative px-6 pb-20 pt-32 md:pb-28 md:pt-40">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(94,106,210,0.08) 0%, transparent 70%)"
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative mx-auto max-w-6xl"
        >
          <motion.div
            variants={fadeInUp}
            custom={0}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.07] px-3.5 py-1.5 text-xs font-medium text-neutral-400 backdrop-blur-sm"
          >
            <BookOpen className="h-3 w-3 text-[#8b95e0]" />
            Documentation
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            custom={1}
            className="max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl leading-[1.05]"
          >
            Motion Design
            <br />
            <span className="gradient-text-accent">Resources &amp; Workflow</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            custom={2}
            className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-400 md:text-xl"
          >
            Find the MDX scene model, component syntax, Studio workflow, keyboard navigation, and video export direction in one clear learning hub.
          </motion.p>
        </motion.div>
      </section>

      {/* ═══════════ RESOURCE LINKS + DOCS ═══════════ */}
      <section className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />

        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr] lg:gap-12">
            {/* Left: Resource Links */}
            <motion.aside
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="h-fit"
            >
              <motion.div variants={fadeInUp} custom={0} className="mb-6">
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  Resource Links
                </h2>
                <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#5e6ad2]/50 to-transparent" />
              </motion.div>

              <div className="grid gap-3">
                {resourceItems.map((item, idx) => (
                  <motion.a
                    key={item.title}
                    variants={fadeInUp}
                    custom={idx + 1}
                    href={item.href}
                    className="group flex flex-col rounded-xl border border-white/[0.10] bg-white/[0.08] p-4 transition-all hover:border-[#5e6ad2]/20 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                        {item.label}
                      </span>
                      <ExternalLink className="h-3 w-3 text-neutral-500 transition-colors group-hover:text-[#8b95e0]" />
                    </div>
                    <span className="font-semibold text-sm text-white mb-1">
                      {item.title}
                    </span>
                    <span className="text-xs leading-relaxed text-neutral-400">
                      {item.description}
                    </span>
                  </motion.a>
                ))}
              </div>
            </motion.aside>

            {/* Right: Doc Sections */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="grid gap-5"
            >
              {docSections.map((section, idx) => (
                <motion.article
                  key={section.title}
                  variants={fadeInUp}
                  custom={idx}
                  className="group rounded-2xl border border-white/[0.10] bg-white/[0.08] p-6 transition-all hover:border-[#5e6ad2]/15"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.08]">
                      <Sparkles className="h-4 w-4 text-[#8b95e0]" />
                    </div>
                    <h2 className="text-lg font-semibold text-white tracking-tight">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-400 mb-4">
                    {section.description}
                  </p>
                  <ul className="grid gap-2">
                    {section.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-3 text-sm text-neutral-400"
                      >
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5e6ad2]/60" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ QUICK START ═══════════ */}
      <section id="quick-start" className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />

        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeSmooth }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.08]">
                <Terminal className="h-4 w-4 text-neutral-400" />
              </div>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Quick Start
              </h2>
            </div>

            <div className="grid gap-3 text-sm md:grid-cols-3">
              {[
                "npm install",
                "npm run dev",
                "http://localhost:3000/studio"
              ].map((cmd) => (
                <div
                  key={cmd}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.10] bg-[#080808] px-5 py-4 font-mono text-xs text-neutral-400 transition-colors hover:border-[#5e6ad2]/20 hover:text-neutral-400"
                >
                  <div className="h-2 w-2 rounded-full bg-[#5e6ad2]/50" />
                  {cmd}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ COMPONENT REFERENCE ═══════════ */}
      <section id="components" className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />

        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeSmooth }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.08]">
                <Layers className="h-4 w-4 text-neutral-400" />
              </div>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Scene Component Reference
              </h2>
            </div>

            <div className="rounded-2xl border border-white/[0.10] bg-white/[0.08] p-2">
              <div className="divide-y divide-white/[0.07]">
                {componentReference.map(([name, description, Icon], i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.5,
                      ease: easeSmooth
                    }}
                    className="group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-white/[0.07]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.07] text-neutral-400 transition-colors group-hover:border-[#5e6ad2]/20 group-hover:text-neutral-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium text-white">
                          {name}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
                      </div>
                      <p className="mt-0.5 text-sm text-neutral-400">
                        {description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-neutral-400">
              Detailed local documentation remains available in{" "}
              <span className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-neutral-400">
                docs/USAGE.zh-TW.md
              </span>{" "}
              as the complete maintenance guide for developers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeSmooth }}
          >
            <h3 className="text-2xl font-bold tracking-tight text-white mb-4">
              Ready to design?
            </h3>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
              Open the Studio and start building motion-rich presentations in minutes.
            </p>
            <a
              href="/studio"
              className="group relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(94,106,210,0.25)] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Open Studio
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <div className="absolute inset-0 bg-neutral-200 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
