"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Code2, Download, Eye, FileCode2, Play, Sparkles, PlayCircle, Share2, Presentation, X } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { localizeTemplates } from "@/common/lib/i18n";
import { motionTemplates } from "@/core/motion-doc/presets/templates";
import { HeroStudio } from "@/features/marketing/ui/home/HeroStudio";
import { StyleThumbnail } from "@/features/marketing/ui/StyleThumbnail";

const customEase = [0.32, 0.72, 0, 1] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 48
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, delay, ease: customEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Double-Bezel Architecture
function BezelCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2rem] bg-white/[0.05] ring-1 ring-white/[0.12] shadow-2xl p-1.5 ${className}`}>
      <div className="h-full rounded-[calc(2rem-0.375rem)] bg-gradient-to-b from-[#121218] to-[#08080b] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

const workflowIcons = [FileCode2, Eye, Download];

export function HomePage() {
  const { t } = useI18n();
  const selectedTemplates = localizeTemplates(motionTemplates, t.templateMeta).slice(0, 4);
  const workflow = t.home.workflow.items.map((item, index) => ({
    ...item,
    icon: workflowIcons[index] ?? FileCode2
  }));
  const reduce = useReducedMotion();

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-400 selection:bg-white/20 selection:text-white relative z-0">
      {/* Background Mesh (Ethereal Blue Light) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] rounded-full bg-[#1e3a8a]/20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[20%] h-[60vw] w-[60vw] rounded-full bg-[#0369a1]/15 blur-[120px] mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[10%] h-[80vw] w-[80vw] rounded-full bg-[#312e81]/20 blur-[130px] mix-blend-screen" />
        <div className="absolute top-[10%] left-[20%] h-[300px] w-[500px] rounded-full bg-[#38bdf8]/10 blur-[80px] mix-blend-screen" />
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />
      </div>
      {/* Hero Section */}
      <section className="relative px-4 pt-40 pb-24 sm:px-6 md:pt-48 md:pb-32 lg:pb-40 overflow-hidden">
        <div className="mx-auto max-w-[1400px] grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
          <motion.div 
            initial={reduce ? false : { opacity: 0, filter: "blur(12px)", y: 40 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.4, ease: customEase }}
            className="max-w-2xl"
          >
            <h1 className="text-[3rem] sm:text-5xl md:text-7xl font-medium tracking-tight text-white leading-[1.02]">
              {t.home.hero.title}
            </h1>
            <p className="mt-8 max-w-xl text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
              {t.home.hero.body}
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group/btn inline-flex w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-1000 group-hover/btn:duration-200" />
                <Link
                  href="/studio"
                  className="relative inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 rounded-full bg-[#0a0a0c] border border-blue-500/20 pl-6 pr-2 py-2 text-[15px] font-medium text-white transition-all duration-700 hover:bg-[#121218] hover:border-blue-500/40 active:scale-[0.98]"
                >
                  <span>{t.home.hero.primary}</span>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-700 group-hover/btn:translate-x-1 group-hover/btn:scale-105">
                    <ArrowRight className="h-4 w-4 text-white drop-shadow-md" />
                  </div>
                </Link>
              </div>
              <Link
                href="/templates"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-8 py-4 text-[15px] font-medium text-zinc-300 transition-colors duration-700 hover:bg-white/5 active:scale-[0.98]"
              >
                {t.home.hero.secondary}
              </Link>
            </div>
            

          </motion.div>

          <Reveal delay={0.2} y={64} className="w-full h-full min-h-[400px]">
            <div className="rounded-[2.5rem] bg-white/[0.02] ring-1 ring-white/[0.06] p-2">
              <div className="rounded-[calc(2.5rem-0.5rem)] overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10">
                <HeroStudio copy={t.home.heroStudio} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Seamless Feature Typography */}
      <section className="pb-24 pt-8 md:pt-16 relative z-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.home.stats.map(([title, body], i) => (
              <Reveal key={title} delay={i * 0.15} y={16} className="h-full">
                <BezelCard className="h-full transition-transform duration-500 hover:scale-[1.02]">
                  <div className="flex flex-col p-8 md:p-10 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[50px] rounded-full pointer-events-none" />
                    
                    <div className="mb-12 flex items-center justify-start relative z-10">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/10 group-hover:scale-105">
                        {i === 0 ? <FileCode2 className="h-6 w-6 stroke-[1.5]" /> : i === 1 ? <PlayCircle className="h-6 w-6 stroke-[1.5]" /> : <Share2 className="h-6 w-6 stroke-[1.5]" />}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-medium text-white relative z-10 group-hover:text-blue-400 transition-colors duration-500">{title}</h3>
                    <p className="mt-4 text-base leading-relaxed text-zinc-400 font-light relative z-10">{body}</p>
                  </div>
                </BezelCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Compose Section - Asymmetrical Bento with Double-Bezel */}
      <section className="px-4 py-32 md:py-48">
        <div className="mx-auto max-w-[1400px]">
          <Reveal className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]">
              {t.home.compose.title}
            </h2>
            <p className="mt-8 text-lg md:text-xl leading-relaxed text-zinc-400 font-light">
              {t.home.compose.body}
            </p>
          </Reveal>

          <div className="mt-24 grid gap-6 grid-cols-1 md:grid-cols-12 auto-rows-[minmax(320px,auto)]">
            
            {/* Cell 1: Source Code (8 cols) */}
            <Reveal delay={0.1} className="md:col-span-8 md:row-span-2">
              <BezelCard className="h-full">
                <div className="flex flex-col h-full p-8 md:p-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#a78bfa]/[0.05] to-transparent" />
                  
                  <div className="flex-1 flex flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0b0814]/90 shadow-2xl transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02] relative z-10">
                    <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Code2 className="text-[#a78bfa]" size={16} />
                        <span className="text-sm font-semibold tracking-wide text-white">{t.home.compose.sourceLabel}</span>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 bg-white/5 transition-colors group-hover:text-white">
                        <X size={14} />
                      </div>
                    </div>
                    <div className="flex-1 overflow-x-auto p-6 md:p-8 font-mono text-sm leading-8">
                      <p className="text-zinc-600">{`<Slide duration={5} theme="dark">`}</p>
                      <p className="pl-6 text-zinc-300">{`<Text enter="fadeUp" fontWeight={800}>`}</p>
                      <p className="pl-12 text-white">{t.home.compose.codeTitle}</p>
                      <p className="pl-6 text-zinc-300">{`</Text>`}</p>
                      <p className="pl-6 text-zinc-300">{`<Chart values="42,58,72,92" />`}</p>
                      <p className="text-zinc-600">{`</Slide>`}</p>
                    </div>
                  </div>
                </div>
              </BezelCard>
            </Reveal>

            {/* Cell 2: Polish (4 cols) */}
            <Reveal delay={0.2} className="md:col-span-4">
              <BezelCard className="h-full">
                <div className="flex flex-col h-full p-8 md:p-10 relative overflow-hidden group">
                  <div className="mb-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/10 group-hover:scale-105">
                    <Sparkles className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-2xl font-medium text-white relative z-10 group-hover:text-blue-400 transition-colors duration-500">{t.home.compose.polishTitle}</h3>
                  <p className="mt-4 text-base leading-relaxed text-zinc-400 font-light relative z-10">
                    {t.home.compose.polishBody}
                  </p>
                </div>
              </BezelCard>
            </Reveal>

            {/* Cell 3: Timeline (4 cols) */}
            <Reveal delay={0.3} className="md:col-span-4">
              <BezelCard className="h-full">
                <div className="flex flex-col h-full p-8 md:p-10 relative overflow-hidden group">
                  <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-white/5 blur-[60px] pointer-events-none group-hover:bg-[#788bfd]/10 transition-colors duration-1000" />
                  <div className="mb-8 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wide text-neutral-400">
                      <Play className="h-4 w-4" />
                      {t.home.compose.timelineLabel}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {t.home.compose.timelineItems.map((item, index) => (
                      <div key={item} className="grid grid-cols-[60px_1fr] items-center gap-4 group/time">
                        <span className="text-xs font-mono font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">{item}</span>
                        <span className="h-[4px] w-full overflow-hidden rounded-full bg-white/5">
                          <motion.span
                            initial={reduce ? false : { width: 0 }}
                            whileInView={{ width: `${76 - index * 12}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + index * 0.15, duration: 1, ease: customEase }}
                            className="block h-full rounded-full bg-[#788bfd] transition-transform duration-500 group-hover:scale-x-105 origin-left"
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </BezelCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Workflow Section - Editorial Split */}
      <section className="px-4 py-32 md:py-48 border-t border-white/[0.04]">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-16 md:gap-24 md:grid-cols-2 items-start">
            <Reveal className="md:sticky md:top-40">
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]">
                {t.home.workflow.title}
              </h2>
              <p className="mt-8 text-lg md:text-xl leading-relaxed text-zinc-400 font-light max-w-md">
                {t.home.workflow.body}
              </p>
            </Reveal>

            <ul className="grid gap-12">
              {workflow.map((item, index) => (
                <motion.li
                  key={item.title}
                  initial={reduce ? false : { opacity: 0, y: 48, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.2,
                    ease: customEase,
                  }}
                  className="group"
                >
                  <BezelCard>
                    <div className="flex flex-col sm:flex-row gap-8 p-8 md:p-10 items-start">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/10 group-hover:scale-105">
                        <item.icon className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-medium text-white">{item.title}</h3>
                        <p className="mt-4 text-base leading-relaxed text-zinc-400 font-light">{item.body}</p>
                      </div>
                    </div>
                  </BezelCard>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Presets Section - High-End Grid */}
      <section className="px-4 py-32 md:py-48 border-t border-white/[0.04]">
        <div className="mx-auto max-w-[1400px]">
          <Reveal className="max-w-3xl mb-24">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]">
              {t.home.presets.title}
            </h2>
            <p className="mt-8 text-lg md:text-xl leading-relaxed text-zinc-400 font-light">
              {t.home.presets.body}
            </p>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {selectedTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={reduce ? false : { opacity: 0, y: 48, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 1.2, ease: customEase }}
                className="h-full"
              >
                <Link href="/studio" className="block h-full group">
                  <BezelCard className="h-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-white/5">
                    <div className="flex h-full flex-col">
                      <div className="h-56 overflow-hidden">
                        <StyleThumbnail
                          className="h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
                          label={template.category}
                          templateId={template.id}
                          title={template.name}
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-8">
                        <h3 className="text-xl font-medium text-white">{template.name}</h3>
                        <p className="mt-3 flex-1 text-base leading-relaxed text-zinc-400 font-light">{template.description}</p>
                        <p className="mt-8 font-mono text-[11px] tracking-wide text-zinc-600">{template.useCase}</p>
                      </div>
                    </div>
                  </BezelCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="border-t border-white/[0.04] px-4 py-32 text-center md:py-48 relative z-10">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
              <Presentation className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]">
              {t.home.cta.title}
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-zinc-400 font-light">
              {t.home.cta.body}
            </p>
            <div className="mt-12 flex justify-center">
              <div className="relative group/btn inline-flex w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-1000 group-hover/btn:duration-200" />
                <Link
                  href="/studio"
                  className="relative inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 rounded-full bg-[#0a0a0c] border border-blue-500/20 pl-8 pr-2 py-2.5 text-[16px] font-medium text-white transition-all duration-700 hover:bg-[#121218] hover:border-blue-500/40 active:scale-[0.98]"
                >
                  <span>{t.home.cta.button}</span>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-700 group-hover/btn:translate-x-1 group-hover/btn:scale-105">
                    <ArrowRight className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
