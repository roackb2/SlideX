"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Folder, FileCode, Sparkles } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { motionTemplates } from "@/lib/templates";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.55, ease: easeSmooth }
  })
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-[#111118] text-neutral-200 selection:bg-[#5e6ad2]/35 overflow-x-hidden">
      <SiteNav />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 md:pb-24 md:pt-36">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[250px] w-[300px] sm:h-[400px] sm:w-[600px] rounded-full opacity-30"
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
            className="mb-3 sm:mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.07] px-3 py-1 text-[11px] sm:text-xs font-medium text-neutral-400 backdrop-blur-sm"
          >
            <Folder className="h-3 w-3 text-[#8b95e0]" />
            Deck Presets
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            custom={1}
            className="max-w-3xl text-2xl sm:text-4xl font-bold tracking-tight text-white md:text-6xl leading-[1.05]"
          >
            Ready-to-Use
            <br />
            <span className="gradient-text-accent">Motion Deck Presets</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            custom={2}
            className="mt-3 sm:mt-5 max-w-2xl text-sm sm:text-lg leading-relaxed text-neutral-400 md:text-xl"
          >
            Each preset is a complete MDX scene deck. Load one into the Studio, edit scenes on the left, preview on the right, and prepare the sequence for video export.
          </motion.p>
        </motion.div>
      </section>

      {/* ═══════════ TEMPLATES GRID ═══════════ */}
      <section className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 md:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
            className="grid gap-4 sm:gap-6 md:grid-cols-2"
          >
            {motionTemplates.map((template, idx) => (
              <motion.article
                key={template.id}
                variants={fadeInUp}
                custom={idx}
                className="group relative rounded-2xl border border-white/[0.10] bg-white/[0.06] p-4 sm:p-6 transition-all hover:border-[#5e6ad2]/20 hover:bg-white/[0.08]"
              >
                {/* Top meta */}
                <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.08] text-neutral-400">
                      <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </span>
                    <div className="flex flex-wrap items-center gap-x-1">
                      <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                        {template.category}
                      </span>
                      <span className="mx-1 text-neutral-500">·</span>
                      <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {template.duration}
                      </span>
                    </div>
                  </div>
                  <a
                    href="/studio"
                    className="group/btn relative overflow-hidden rounded-full bg-white px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.2)] active:scale-95 shrink-0 whitespace-nowrap"
                  >
                    <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                      <span className="hidden sm:inline">Use in</span> Studio
                      <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </span>
                    <div className="absolute inset-0 bg-neutral-200 opacity-0 transition-opacity group-hover/btn:opacity-100" />
                  </a>
                </div>

                {/* Title & description */}
                <h2 className="text-base sm:text-xl font-semibold text-white tracking-tight mb-1.5 sm:mb-2">
                  {template.name}
                </h2>
                <p className="text-sm leading-relaxed text-neutral-400 mb-1.5 sm:mb-2">
                  {template.description}
                </p>
                <p className="text-xs leading-relaxed text-neutral-400 mb-3 sm:mb-5">
                  {template.useCase}
                </p>

                {/* Code preview - hidden on mobile, shown on sm+ */}
                <div className="hidden sm:block relative rounded-xl border border-white/[0.10] bg-[#080808] p-3 sm:p-4 overflow-hidden">
                  <div className="absolute top-2.5 sm:top-3 left-3 sm:left-4 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500/50" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                    <div className="h-2 w-2 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3 pt-4 sm:pt-5">
                    <FileCode className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-neutral-500" />
                    <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 tracking-wide">
                      {template.id}.mdx
                    </span>
                  </div>
                  <pre className="max-h-32 sm:max-h-40 md:max-h-56 overflow-auto text-[10px] sm:text-[11px] md:text-xs leading-5 text-neutral-400 font-mono scrollbar-thin">
                    <code>{template.source.slice(0, 350)}...</code>
                  </pre>
                </div>

                {/* Mobile: simplified code hint */}
                <div className="sm:hidden flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#080808] px-3 py-2">
                  <FileCode className="h-3 w-3 text-neutral-500 shrink-0" />
                  <span className="text-[10px] font-mono text-neutral-500 truncate">
                    {template.id}.mdx — {template.source.split('\n').length} lines
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeSmooth }}
          >
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3 sm:mb-4">
              Want to build your own?
            </h3>
            <p className="text-neutral-400 mb-5 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              Start from a blank canvas or remix any preset. Every scene is editable MDX.
            </p>
            <a
              href="/studio"
              className="group relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 sm:px-7 sm:py-3 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_rgba(94,106,210,0.25)] active:scale-95"
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
