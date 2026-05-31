"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  AlignLeft,
  ArrowRight,
  BarChart3,
  Check,
  Code2,
  CreditCard,
  Download,
  Eye,
  FileCode2,
  Image,
  MousePointerClick,
  Palette,
  Play,
  Plus,
  Sparkles,
  Type
} from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { StyleThumbnail } from "@/components/StyleThumbnail";
import { localizeTemplates, type Dictionary } from "@/lib/i18n";
import { motionTemplates } from "@/lib/templates";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: easeSmooth }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 }
  }
};

function Reveal({
  children,
  className = "",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 34 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay, ease: easeSmooth }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const workflowIcons = [FileCode2, Eye, Download];
const toolIcons = [Type, AlignLeft, CreditCard, BarChart3, Image, MousePointerClick];
const layerIcons = [Type, AlignLeft, BarChart3, CreditCard];

function HeroStudio({ copy }: { copy: Dictionary["home"]["heroStudio"] }) {
  const layers = copy.layers.map((label, index) => ({
    icon: layerIcons[index] ?? Type,
    label,
    active: index === 0
  }));

  const toolButtons = copy.toolLabels.map((label, index) => ({
    icon: toolIcons[index] ?? Type,
    label
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 42, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: easeSmooth }}
      className="relative"
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_70%_10%,rgba(142,165,255,0.18),transparent_42%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#0b0d14]/[0.92] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/[0.1] bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#8ea5ff]" />
            <span className="text-sm font-semibold text-white">{copy.title}</span>
            <span className="hidden text-xs text-neutral-500 sm:inline">{copy.project}</span>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
            {copy.export}
          </span>
        </div>

        <div className="grid min-h-[360px] grid-cols-1 md:grid-cols-[164px_1fr] lg:min-h-[430px]">
          <aside className="hidden border-r border-white/[0.1] bg-black/20 p-3 md:block">
            <button className="mb-4 flex w-full items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-left text-xs font-medium text-neutral-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                <Plus className="h-3.5 w-3.5" />
              </span>
              {copy.newSlide}
            </button>

            <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-neutral-500">
              <span>{copy.scenes}</span>
              <span className="font-mono">4</span>
            </div>

            <div className="space-y-1">
              {copy.slides.map((slide, index) => (
                <div
                  key={slide}
                  className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs ${
                    index === 0 ? "bg-white/[0.08] text-white" : "text-neutral-500"
                  }`}
                >
                  <span>{slide}</span>
                  <span className="font-mono">0{index + 1}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-1 border-l border-white/[0.1] pl-3">
              {layers.map((layer) => (
                <div
                  key={layer.label}
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs ${
                    layer.active
                      ? "border border-white/[0.1] bg-white/[0.08] text-white"
                      : "text-neutral-500"
                  }`}
                >
                  <layer.icon className="h-3.5 w-3.5" />
                  <span className="truncate">{layer.label}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="relative flex min-h-[360px] flex-col overflow-hidden bg-[#05060a]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_38%_22%,rgba(142,165,255,0.15),transparent_32%)]" />

            <div className="relative z-10 flex items-center justify-center px-5 pb-16 pt-8 sm:px-8 md:px-10 md:pt-12">
              <div className="aspect-video w-full max-w-[580px] overflow-hidden rounded-[22px] border border-white/[0.12] bg-black shadow-2xl shadow-black/70">
                <div className="relative flex h-full flex-col justify-center p-6 sm:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(142,165,255,0.18),transparent_42%)]" />
                  <div className="relative z-10 max-w-[320px]">
                    <div className="mb-4 flex items-center gap-2 text-xs text-neutral-500">
                      <span>{copy.sceneLabel}</span>
                      <span className="h-px flex-1 bg-white/[0.12]" />
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {copy.slideTitle}
                    </h3>
                    <p className="mb-5 text-sm leading-relaxed text-neutral-400">
                      {copy.slideBody}
                    </p>
                    <div className="flex h-16 items-end gap-2">
                      {[42, 58, 72, 92].map((height, index) => (
                        <motion.span
                          key={height}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.8 + index * 0.12, duration: 0.6, ease: easeSmooth }}
                          className="w-5 rounded-t-md bg-[#8ea5ff]/[0.7]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/[0.12] bg-[#0b0d14]/[0.9] p-1 shadow-xl backdrop-blur-xl">
              {toolButtons.map((tool) => (
                <button
                  key={tool.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
                  type="button"
                  aria-label={tool.label}
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const selectedTemplates = localizeTemplates(motionTemplates, t.templateMeta).slice(0, 4);
  const workflow = t.home.workflow.items.map((item, index) => ({
    ...item,
    icon: workflowIcons[index] ?? FileCode2
  }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080a0f] text-neutral-200">
      <SiteNav />

      <section className="relative px-6 pt-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#8ea5ff]/[0.1] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="mx-auto grid min-h-[calc(100dvh-6rem)] max-w-7xl gap-10 pb-16 md:pb-20 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
            <motion.div
              variants={fadeInUp}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-neutral-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#8ea5ff]" />
              {t.home.hero.eyebrow}
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              {t.home.hero.title}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400 md:text-lg"
            >
              {t.home.hero.body}
            </motion.p>
            <motion.div variants={fadeInUp} custom={3} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/download"
                className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-95"
              >
                {t.home.hero.primary}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.13] bg-white/[0.06] px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-white/[0.22] hover:bg-white/[0.09] active:scale-95"
              >
                {t.home.hero.secondary}
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} custom={4} className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              {t.home.hero.checkpoints.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8ea5ff]/[0.14] text-[#8ea5ff]">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <HeroStudio copy={t.home.heroStudio} />
        </div>
      </section>

      <section className="border-y border-white/[0.1] bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/[0.08] px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {t.home.stats.map(([title, body]) => (
            <div key={title} className="py-6 md:px-8 md:py-7 first:md:pl-0 last:md:pr-0">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {t.home.compose.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
              {t.home.compose.body}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            <Reveal className="rounded-[28px] border border-white/[0.1] bg-white/[0.045] p-5 md:p-7 lg:col-span-7">
              <div className="mb-5 flex items-center gap-2 text-sm font-medium text-[#8ea5ff]">
                <Code2 className="h-4 w-4" />
                {t.home.compose.sourceLabel}
              </div>
              <div className="overflow-hidden rounded-[22px] border border-white/[0.1] bg-black p-4 font-mono text-xs leading-6 shadow-xl shadow-black/30">
                <p className="text-neutral-600">{`<Slide duration={5} theme="dark">`}</p>
                <p className="pl-4 text-white">{`<Title enter="fadeUp">`}</p>
                <p className="pl-8 text-[#8ea5ff]">{t.home.compose.codeTitle}</p>
                <p className="pl-4 text-white">{`</Title>`}</p>
                <p className="pl-4 text-white">{`<Chart values="42,58,72,92" />`}</p>
                <p className="text-neutral-600">{`</Slide>`}</p>
              </div>
            </Reveal>

            <Reveal
              delay={0.05}
              className="relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#10131d] p-5 md:p-7 lg:col-span-5"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(142,165,255,0.18),transparent_36%)]" />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Play className="h-4 w-4 text-[#8ea5ff]" />
                    {t.home.compose.timelineLabel}
                  </div>
                  <span className="rounded-full border border-white/[0.1] px-3 py-1 font-mono text-xs text-neutral-400">
                    00:05
                  </span>
                </div>
                <div className="space-y-3">
                  {t.home.compose.timelineItems.map((item, index) => (
                    <div key={item} className="grid grid-cols-[90px_1fr] items-center gap-3">
                      <span className="text-xs text-neutral-500">{item}</span>
                      <span className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
                        <motion.span
                          initial={{ width: 0 }}
                          whileInView={{ width: `${76 - index * 12}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + index * 0.12, duration: 0.65, ease: easeSmooth }}
                          className="block h-full rounded-full bg-[#8ea5ff]"
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal className="overflow-hidden rounded-[28px] border border-white/[0.1] bg-white/[0.045] lg:col-span-4">
              <StyleThumbnail
                className="h-48 w-full"
                label={selectedTemplates[0]?.category ?? t.thumbnail.fallbackLabel}
                templateId={selectedTemplates[0]?.id ?? "preset"}
                title={selectedTemplates[0]?.name ?? t.home.compose.templateTitle}
                variant="feature"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold tracking-tight text-white">{t.home.compose.templateTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {t.home.compose.templateBody}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="rounded-[28px] border border-white/[0.1] bg-white/[0.045] p-5 md:p-7 lg:col-span-4">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#8ea5ff]/[0.14] text-[#8ea5ff]">
                <Palette className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white">{t.home.compose.blockTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {t.home.compose.blockBody}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="rounded-[28px] border border-[#8ea5ff]/[0.25] bg-[#8ea5ff]/[0.1] p-5 md:p-7 lg:col-span-4">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white">{t.home.compose.polishTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                {t.home.compose.polishBody}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="rounded-[32px] border border-white/[0.1] bg-[#0d1018] p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {t.home.workflow.title}
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-400">
                  {t.home.workflow.body}
                </p>
              </div>

              <div className="grid gap-3">
                {workflow.map((item, index) => (
                  <div
                    key={item.title}
                    className="grid gap-4 rounded-[24px] border border-white/[0.09] bg-black/20 p-4 sm:grid-cols-[48px_1fr_auto] sm:items-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] text-[#8ea5ff]">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-500">{item.body}</p>
                    </div>
                    <span className="hidden rounded-full border border-white/[0.1] px-3 py-1 font-mono text-xs text-neutral-500 sm:inline-flex">
                      0{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {t.home.presets.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
              {t.home.presets.body}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {selectedTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.06, duration: 0.55, ease: easeSmooth }}
              >
                <Link
                  href="/studio"
                  className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/[0.1] bg-white/[0.045] transition hover:border-[#8ea5ff]/[0.35] hover:bg-white/[0.07] active:scale-[0.99]"
                >
                  <StyleThumbnail
                    className="h-44 w-full transition duration-500 group-hover:scale-[1.03]"
                    label={template.category}
                    templateId={template.id}
                    title={template.name}
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-xl font-semibold tracking-tight text-white">{template.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-400">{template.description}</p>
                    <p className="mt-5 text-xs font-medium text-neutral-500">{template.useCase}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="grid gap-8 overflow-hidden rounded-[32px] border border-white/[0.1] bg-white/[0.045] p-6 md:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#8ea5ff]/[0.14] text-[#8ea5ff]">
                <Download className="h-6 w-6" />
              </div>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                {t.home.downloadTeaser.title}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-400 md:text-lg">
                {t.home.downloadTeaser.body}
              </p>
              <div className="mt-8">
                <Link
                  href="/download"
                  className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-95"
                >
                  {t.home.downloadTeaser.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/[0.1] bg-black/30 p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{t.home.downloadTeaser.cardTitle}</span>
                <span className="rounded-full border border-white/[0.1] px-3 py-1 text-xs text-neutral-500">
                  {t.home.downloadTeaser.status}
                </span>
              </div>
              <div className="space-y-3">
                {t.home.downloadTeaser.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm text-neutral-300">
                    <Check className="h-4 w-4 text-[#8ea5ff]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
