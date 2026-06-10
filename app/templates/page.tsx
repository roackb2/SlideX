"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  Folder,
  Layers,
  Play,
  Sparkles
} from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { SiteFooter, SiteNav } from "@/common/ui";
import { StyleThumbnail } from "@/features/marketing";
import { localizeTemplates, type Dictionary } from "@/common/lib/i18n";
import { motionTemplates, type MotionTemplate } from "@/core/motion-doc/presets/templates";

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

function TemplateCard({
  template,
  index
}: {
  template: MotionTemplate;
  index: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 48, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.15, duration: 1.2, ease: customEase }}
      className="h-full"
    >
      <Link href="/studio" className="block h-full group">
        <BezelCard className="h-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-white/5">
          <div className="flex h-full flex-col relative overflow-hidden">
            <div className="relative h-56 overflow-hidden bg-[#0c0c0e]">
              <StyleThumbnail
                className="h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
                label={template.category}
                templateId={template.id}
                title={template.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-md">
                  {template.category}
                </span>
                <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-md">
                  <Clock className="h-3 w-3" />
                  {template.duration}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-8">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2 className="text-xl font-medium text-white">{template.name}</h2>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 transition-colors duration-500 group-hover:bg-white/10">
                  <ArrowRight className="h-4 w-4 text-white transition-transform duration-500 group-hover:translate-x-1" />
                </div>
              </div>
              <p className="text-[15px] leading-relaxed text-zinc-400 font-light">{template.description}</p>
              <p className="mt-8 font-mono text-[11px] tracking-wide text-zinc-600">{template.useCase}</p>
            </div>
          </div>
        </BezelCard>
      </Link>
    </motion.article>
  );
}

function FeaturedPreset({
  copy,
  featured
}: {
  copy: Dictionary["templatesPage"]["featured"];
  featured: MotionTemplate | undefined;
}) {
  const reduce = useReducedMotion();
  if (!featured) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 64, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.4, delay: 0.2, ease: customEase }}
      className="relative"
    >
      <div className="absolute -inset-10 rounded-[3rem] bg-[radial-gradient(circle_at_50%_50%,rgba(0,112,243,0.1),transparent_50%)] blur-3xl mix-blend-screen pointer-events-none" />
      <Link href="/studio" className="group block">
        <BezelCard className="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-blue-500/10">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[#0c0c0e]">
            <StyleThumbnail
              className="h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
              label={featured.category}
              templateId={featured.id}
              title={featured.name}
              variant="hero"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

            <div className="absolute left-6 right-6 top-6 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-zinc-200 backdrop-blur-xl">
                <Play className="h-4 w-4 text-white" />
                {copy.label}
              </span>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black">
                {copy.open}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
              <div className="mb-6 flex flex-wrap gap-3">
                {[featured.category, featured.duration, copy.deckLabel].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-md font-light"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h2 className="max-w-xl text-3xl font-medium tracking-tight text-white md:text-5xl">
                {featured.name}
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-400 font-light">
                {featured.description}
              </p>
            </div>
          </div>
        </BezelCard>
      </Link>
    </motion.div>
  );
}

export default function TemplatesPage() {
  const { t } = useI18n();
  const templates = localizeTemplates(motionTemplates, t.templateMeta);
  const featured = templates[0];
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

      <SiteNav />

      <section className="relative px-4 pt-40 pb-24 sm:px-6 md:pt-48 md:pb-32 lg:pb-40">
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div 
            initial={reduce ? false : { opacity: 0, filter: "blur(12px)", y: 40 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.4, ease: customEase }}
            className="max-w-2xl"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300">
              <Folder className="h-4 w-4 text-white" />
              {t.templatesPage.hero.eyebrow}
            </div>
            <h1 className="text-[3rem] sm:text-5xl md:text-7xl font-medium tracking-tight text-white leading-[1.02]">
              {t.templatesPage.hero.title}
            </h1>
            <p className="mt-8 max-w-xl text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
              {t.templatesPage.hero.body}
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group/btn inline-flex w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-1000 group-hover/btn:duration-200" />
                <Link
                  href="/studio"
                  className="relative inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 rounded-full bg-[#0a0a0c] border border-blue-500/20 pl-6 pr-2 py-2 text-[15px] font-medium text-white transition-all duration-700 hover:bg-[#121218] hover:border-blue-500/40 active:scale-[0.98]"
                >
                  <span>{t.templatesPage.hero.primary}</span>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-700 group-hover/btn:translate-x-1 group-hover/btn:scale-105">
                    <ArrowRight className="h-4 w-4 text-white drop-shadow-md" />
                  </div>
                </Link>
              </div>
              <Link
                href="#gallery"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-8 py-4 text-[15px] font-medium text-zinc-300 transition-colors duration-700 hover:bg-white/5 active:scale-[0.98]"
              >
                {t.templatesPage.hero.secondary}
              </Link>
            </div>
          </motion.div>

          <FeaturedPreset copy={t.templatesPage.featured} featured={featured} />
        </div>
      </section>

      {/* Stats Section - Macro Whitespace */}
      <section className="py-24 md:py-32 border-y border-white/[0.04] bg-black/40 backdrop-blur-2xl">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {t.templatesPage.stats.map(([title, body], i) => (
              <Reveal key={title} delay={i * 0.15} y={24} className="flex flex-col relative before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-white/10 before:to-transparent">
                <p className="text-base font-medium text-white">{title}</p>
                <p className="mt-3 text-base leading-relaxed text-zinc-500 max-w-[32ch] font-light">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="px-4 py-32 md:py-48">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-24 grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-end">
            <Reveal>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]">
                {t.templatesPage.gallery.title}
              </h2>
              <p className="mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-zinc-400 font-light">
                {t.templatesPage.gallery.body}
              </p>
            </Reveal>
            <Reveal delay={0.2} className="grid gap-4 sm:grid-cols-3">
              {t.templatesPage.gallery.steps.map(([step, label]) => (
                <div key={step} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                  <p className="font-mono text-[11px] text-zinc-500 tracking-wide">{step}</p>
                  <p className="mt-4 text-[15px] font-medium text-white">{label}</p>
                </div>
              ))}
            </Reveal>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template, index) => (
              <TemplateCard key={template.id} template={template} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-32 md:pb-48">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <BezelCard>
              <div className="grid gap-16 p-10 sm:p-12 md:p-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-white/5 blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/10 text-white">
                    <Sparkles className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-[1.05]">
                    {t.templatesPage.startingPoint.title}
                  </h2>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400 font-light">
                    {t.templatesPage.startingPoint.body}
                  </p>
                </div>

                <div className="grid gap-4 relative z-10">
                  {t.templatesPage.startingPoint.items.map(([title, body]) => (
                    <div
                      key={title}
                      className="grid gap-6 rounded-[1.5rem] border border-white/10 bg-[#0a0a0c] p-6 sm:grid-cols-[48px_1fr] sm:items-center transition-colors hover:bg-white/5"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
                        <Check className="h-5 w-5 stroke-[1.5]" />
                      </span>
                      <span>
                        <span className="block text-base font-medium text-white">{title}</span>
                        <span className="mt-2 block text-[15px] leading-relaxed text-zinc-400 font-light">{body}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </BezelCard>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/[0.04] px-4 py-32 text-center md:py-48">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white">
              <Layers className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]">
              {t.templatesPage.cta.title}
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-zinc-400 font-light">
              {t.templatesPage.cta.body}
            </p>
            <div className="mt-12 flex justify-center">
              <div className="relative group/btn inline-flex w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-1000 group-hover/btn:duration-200" />
                <Link
                  href="/studio"
                  className="relative inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 rounded-full bg-[#0a0a0c] border border-blue-500/20 pl-8 pr-2 py-2.5 text-[16px] font-medium text-white transition-all duration-700 hover:bg-[#121218] hover:border-blue-500/40 active:scale-[0.98]"
                >
                  <span>{t.templatesPage.cta.button}</span>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-700 group-hover/btn:translate-x-1 group-hover/btn:scale-105">
                    <ArrowRight className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
