"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlignLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  FileCode2,
  Image as ImageIcon,
  Layers,
  Layout,
  MousePointerClick,
  Type,
  Blocks,
  Terminal,
  Users,
  X
} from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import type { Dictionary } from "@/common/lib/i18n";

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

const componentIcons = [Layers, Type, AlignLeft, Layout, ImageIcon, MousePointerClick];
const resourceCardIcons = [BookOpen, Terminal, Blocks, Code2, Users] as const;

function ResourceHeroVisual({ copy }: { copy: Dictionary["resourcesPage"]["heroVisual"] }) {
  const reduce = useReducedMotion();
  
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 64, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.4, delay: 0.2, ease: customEase }}
      className="relative w-full h-full"
    >
      <div className="absolute -inset-10 rounded-[3rem] bg-[radial-gradient(circle_at_50%_50%,rgba(142,165,255,0.1),transparent_50%)] blur-3xl mix-blend-screen pointer-events-none" />
      <BezelCard>
        <div className="flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-6 py-5">
            <div className="flex items-center gap-2.5">
              <Code2 className="text-[#a78bfa]" size={18} />
              <span className="text-[15px] font-semibold tracking-wide text-white">{copy.label}</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 bg-white/5 transition-colors hover:text-white">
              <X size={14} />
            </div>
          </div>

          <div className="flex-1 p-8 md:p-10 bg-[#0b0814]/40">
            <div className="overflow-x-auto rounded-[1.5rem] border border-white/[0.08] bg-[#0b0814]/90 p-6 md:p-8 font-mono text-[13px] leading-8 text-zinc-400 shadow-2xl relative transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02]">
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#a78bfa]/10 blur-[40px] pointer-events-none" />
              <p className="text-zinc-600 relative z-10">{`<Slide duration={5}>`}</p>
              <p className="pl-6 text-zinc-300 relative z-10">{`<Text enter="fadeUp" fontWeight={800}>`}</p>
              <p className="pl-12 text-white relative z-10">{copy.codeTitle}</p>
              <p className="pl-6 text-zinc-300 relative z-10">{`</Text>`}</p>
              <p className="pl-6 text-zinc-300 relative z-10">{`<Text delay={0.2}>`}</p>
              <p className="pl-12 text-zinc-500 relative z-10">{copy.codeBody}</p>
              <p className="pl-6 text-zinc-300 relative z-10">{`</Text>`}</p>
              <p className="pl-6 text-zinc-300 relative z-10">{`<Chart values="42,58,72,92" />`}</p>
              <p className="text-zinc-600 relative z-10">{`</Slide>`}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              {copy.cards.map(([title, body]) => (
                <div key={title} className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] p-5">
                  <p className="text-[14px] font-medium text-white">{title}</p>
                  <p className="mt-2 text-[13px] text-zinc-500 font-light leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BezelCard>
    </motion.div>
  );
}

export default function ResourcesPage() {
  const { t } = useI18n();
  const componentReference = t.resourcesPage.components.items.map(([name, description], index) => [
    name,
    description,
    componentIcons[index] ?? Layers
  ] as const);
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
      <section className="relative px-4 pt-40 pb-24 sm:px-6 md:pt-48 md:pb-32 lg:pb-40 overflow-hidden">
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
          <motion.div 
            initial={reduce ? false : { opacity: 0, filter: "blur(12px)", y: 40 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.4, ease: customEase }}
            className="max-w-2xl"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300">
              <BookOpen className="h-4 w-4 text-white" />
              {t.resourcesPage.hero.eyebrow}
            </div>
            <h1 className="text-[3rem] sm:text-5xl md:text-7xl font-medium tracking-tight text-white leading-[1.02]">
              {t.resourcesPage.hero.title}
            </h1>
            <p className="mt-8 max-w-xl text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
              {t.resourcesPage.hero.body}
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group/btn inline-flex w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-1000 group-hover/btn:duration-200" />
                <Link
                  href="/resources/mdx"
                  className="relative inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 rounded-full bg-[#0a0a0c] border border-blue-500/20 pl-6 pr-2 py-2 text-[15px] font-medium text-white transition-all duration-700 hover:bg-[#121218] hover:border-blue-500/40 active:scale-[0.98]"
                >
                  <span>{t.resourcesPage.hero.primary}</span>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-700 group-hover/btn:translate-x-1 group-hover/btn:scale-105">
                    <ArrowRight className="h-4 w-4 text-white drop-shadow-md" />
                  </div>
                </Link>
              </div>
              <Link
                href="/studio"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-8 py-4 text-[15px] font-medium text-zinc-300 transition-colors duration-700 hover:bg-white/5 active:scale-[0.98]"
              >
                {t.resourcesPage.hero.secondary}
              </Link>
            </div>
          </motion.div>

          <ResourceHeroVisual copy={t.resourcesPage.heroVisual} />
        </div>
      </section>

      {/* Seamless Quick Links Typography */}
      <section className="pb-24 pt-8 md:pt-16 relative z-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {t.resourcesPage.resourceItems.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.1} y={16} className="h-full">
                <Link href={item.href} className="group block h-full">
                  <BezelCard className="h-full transition-transform duration-500 group-hover:scale-[1.02]">
                    <div className="flex flex-col p-8 md:p-10 relative overflow-hidden h-full">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[50px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
                      
                      <div className="mb-12 flex items-center justify-between relative z-10">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/10 group-hover:scale-105">
                          {(() => {
                            const Icon = resourceCardIcons[index] ?? Users;
                            return <Icon className="h-6 w-6 stroke-[1.5]" />;
                          })()}
                        </div>
                        <ExternalLink className="h-4 w-4 text-zinc-600 transition-all duration-500 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                      
                      <h3 className="text-2xl font-medium text-white relative z-10 transition-colors duration-500 group-hover:text-blue-400">{item.title}</h3>
                      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400 font-light relative z-10">{item.description}</p>
                    </div>
                  </BezelCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Docs Steps - Double Bezel Layout */}
      <section className="px-4 py-32 md:py-48">
        <div className="mx-auto max-w-[1400px]">
          <Reveal className="max-w-3xl mb-24">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]">
              {t.resourcesPage.docsIntro.title}
            </h2>
            <p className="mt-8 text-lg md:text-xl leading-relaxed text-zinc-400 font-light">
              {t.resourcesPage.docsIntro.body}
            </p>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-3">
            {t.resourcesPage.docSections.map((section, index) => (
              <motion.article
                key={section.title}
                initial={reduce ? false : { opacity: 0, y: 48, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 1.2, ease: customEase }}
                className="h-full"
              >
                <BezelCard className="h-full">
                  <div className="flex flex-col p-8 md:p-10 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[50px] rounded-full pointer-events-none" />
                    
                    <div className="mb-12 flex items-center justify-start relative z-10">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/10 group-hover:scale-105">
                        <FileCode2 className="h-6 w-6 stroke-[1.5]" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-medium text-white relative z-10">{section.title}</h3>
                    <p className="mt-4 text-base leading-relaxed text-zinc-400 font-light relative z-10">{section.description}</p>

                    <div className="mt-12 grid gap-3 relative z-10">
                      {section.points.map((point) => (
                        <div
                          key={point}
                          className="flex items-center gap-4 rounded-[1.5rem] border border-white/5 bg-[#0a0a0c] px-5 py-4 text-[15px] leading-relaxed text-zinc-400 font-light transition-colors hover:bg-white/5"
                        >
                          <Check className="h-4 w-4 shrink-0 text-white" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </BezelCard>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Components Reference - High End Grid */}
      <section id="components" className="px-4 pb-32 md:pb-48">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <Reveal className="lg:sticky lg:top-40">
              <div className="mb-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:scale-105">
                <Code2 className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]">
                {t.resourcesPage.components.title}
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-zinc-400 font-light max-w-lg">
                {t.resourcesPage.components.body}
              </p>
              <p className="mt-8 text-[15px] leading-relaxed text-zinc-500 font-light">
                {t.resourcesPage.components.notePrefix}
                <br />
                <span className="mt-4 inline-flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-white/5 px-4 py-2 align-middle font-mono text-[13px] text-zinc-300">
                  {t.resourcesPage.components.docPath}
                </span>
              </p>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {componentReference.map(([name, description, Icon], index) => (
                <motion.div
                  key={name}
                  initial={reduce ? false : { opacity: 0, y: 32, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 1, ease: customEase }}
                >
                  <BezelCard className="h-full">
                    <div className="group p-8 md:p-10 flex flex-col h-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[50px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
                      
                      <div className="mb-12 flex items-center justify-between relative z-10">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/10 group-hover:scale-105">
                          <Icon className="h-6 w-6 stroke-[1.5]" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-600 transition-all duration-500 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                      
                      <h3 className="text-2xl font-medium text-white relative z-10 transition-colors duration-500 group-hover:text-blue-400">{name}</h3>
                      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400 font-light relative z-10">{description}</p>
                    </div>
                  </BezelCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/[0.04] px-4 py-32 text-center md:py-48">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
              <BookOpen className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]">
              {t.resourcesPage.cta.title}
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-zinc-400 font-light">
              {t.resourcesPage.cta.body}
            </p>
            <div className="mt-12 flex justify-center">
              <div className="relative group/btn inline-flex w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-1000 group-hover/btn:duration-200" />
                <Link
                  href="/studio"
                  className="relative inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 rounded-full bg-[#0a0a0c] border border-blue-500/20 pl-8 pr-2 py-2.5 text-[16px] font-medium text-white transition-all duration-700 hover:bg-[#121218] hover:border-blue-500/40 active:scale-[0.98]"
                >
                  <span>{t.resourcesPage.cta.button}</span>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-700 group-hover/btn:translate-x-1 group-hover/btn:scale-105">
                    <ArrowRight className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>    </main>
  );
}
