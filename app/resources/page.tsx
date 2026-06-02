"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlignLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  FileCode2,
  Gauge,
  Image as ImageIcon,
  Layers,
  Layout,
  Type
} from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { SiteFooter, SiteNav } from "@/common/ui";
import type { Dictionary } from "@/common/lib/i18n";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 26 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.62, ease: easeSmooth }
  })
};

const componentIcons = [Layers, Type, AlignLeft, Layout, Gauge, BarChart3, ImageIcon];

function ResourceHeroVisual({ copy }: { copy: Dictionary["resourcesPage"]["heroVisual"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: easeSmooth }}
      className="relative"
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_74%_10%,rgba(142,165,255,0.16),transparent_44%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#0d1018] shadow-2xl shadow-black/50 md:rounded-[32px]">
        <div className="flex items-center justify-between border-b border-white/[0.1] bg-white/[0.04] px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BookOpen className="h-4 w-4 text-[#8ea5ff]" />
            {copy.label}
          </div>
          <span className="rounded-full border border-white/[0.12] px-3 py-1 font-mono text-xs text-neutral-400">
            MDX
          </span>
        </div>

        <div className="grid gap-4 p-5 md:p-6">
          <div className="overflow-x-auto rounded-[20px] border border-white/[0.1] bg-black/35 p-4 font-mono text-[11px] leading-6 text-neutral-400 sm:text-xs md:rounded-[24px]">
            <p className="text-neutral-600">{`<Scene duration={5}>`}</p>
            <p className="pl-4 text-white">{`<Title enter="fadeUp">`}</p>
            <p className="pl-8 text-[#8ea5ff]">{copy.codeTitle}</p>
            <p className="pl-4 text-white">{`</Title>`}</p>
            <p className="pl-4 text-white">{`<Text delay={0.2}>`}</p>
            <p className="pl-8 text-neutral-500">{copy.codeBody}</p>
            <p className="pl-4 text-white">{`</Text>`}</p>
            <p className="text-neutral-600">{`</Scene>`}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {copy.cards.map(([title, body]) => (
              <div key={title} className="rounded-[18px] border border-white/[0.1] bg-white/[0.045] p-4 md:rounded-[20px]">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs text-neutral-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080a0f] text-neutral-200">
      <SiteNav />

      <section className="relative px-4 pt-24 sm:px-6">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#8ea5ff]/[0.1] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 pb-14 sm:pb-16 md:pb-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
            <motion.div
              variants={fadeInUp}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-neutral-300"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#8ea5ff]" />
              {t.resourcesPage.hero.eyebrow}
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-[2.35rem] font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {t.resourcesPage.hero.title}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-400 sm:text-base md:mt-6 md:text-lg"
            >
              {t.resourcesPage.hero.body}
            </motion.p>
            <motion.div variants={fadeInUp} custom={3} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/resources/mdx"
                className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-95 sm:w-auto"
              >
                {t.resourcesPage.hero.primary}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/studio"
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/[0.13] bg-white/[0.06] px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-white/[0.22] hover:bg-white/[0.09] active:scale-95 sm:w-auto"
              >
                {t.resourcesPage.hero.secondary}
              </Link>
            </motion.div>
          </motion.div>

          <ResourceHeroVisual copy={t.resourcesPage.heroVisual} />
        </div>
      </section>

      <section className="border-y border-white/[0.1] bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {t.resourcesPage.resourceItems.map((item, index) => (
            <motion.a
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.45, ease: easeSmooth }}
              href={item.href}
              className="group rounded-[20px] border border-white/[0.1] bg-white/[0.04] p-4 transition hover:border-[#8ea5ff]/[0.3] hover:bg-white/[0.07] md:rounded-[24px]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-white/[0.1] px-3 py-1 text-xs text-neutral-400">
                  {item.label}
                </span>
                <ExternalLink className="h-4 w-4 text-neutral-600 transition group-hover:text-[#8ea5ff]" />
              </div>
              <h2 className="text-base font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.description}</p>
            </motion.a>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {t.resourcesPage.docsIntro.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
              {t.resourcesPage.docsIntro.body}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {t.resourcesPage.docSections.map((section, index) => (
              <motion.article
                key={section.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.06, duration: 0.55, ease: easeSmooth }}
                className="flex flex-col rounded-[24px] border border-white/[0.1] bg-white/[0.045] p-5 md:min-h-[320px] md:rounded-[28px] md:p-6"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8ea5ff]/[0.14] text-[#8ea5ff]">
                    <FileCode2 className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-neutral-600">0{index + 1}</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-white">{section.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{section.description}</p>

                <div className="mt-6 grid gap-2">
                  {section.points.map((point) => (
                    <div
                      key={point}
                      className="flex gap-3 rounded-[18px] border border-white/[0.08] bg-black/20 px-3 py-3 text-sm leading-relaxed text-neutral-400"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8ea5ff]" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="components" className="px-4 pb-16 sm:px-6 md:pb-24 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#8ea5ff]/[0.14] text-[#8ea5ff]">
                <Code2 className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                {t.resourcesPage.components.title}
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-400">
                {t.resourcesPage.components.body}
              </p>
              <p className="mt-6 text-sm leading-relaxed text-neutral-500">
                {t.resourcesPage.components.notePrefix}{" "}
                <span className="mt-2 inline-flex max-w-full overflow-x-auto rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 align-middle font-mono text-xs text-neutral-300 sm:mt-0">
                  {t.resourcesPage.components.docPath}
                </span>
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {componentReference.map(([name, description, Icon], index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04, duration: 0.45, ease: easeSmooth }}
                  className="group rounded-[20px] border border-white/[0.1] bg-white/[0.04] p-4 transition hover:bg-white/[0.07] md:rounded-[24px]"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.07] text-neutral-400 transition group-hover:text-[#8ea5ff]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-600 transition group-hover:text-neutral-300" />
                  </div>
                  <h3 className="font-mono text-sm font-semibold text-white">{name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.1] px-4 py-16 text-center sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.07] text-[#8ea5ff]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            {t.resourcesPage.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-400">
            {t.resourcesPage.cta.body}
          </p>
          <div className="mt-8">
            <Link
              href="/studio"
              className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-95 sm:w-auto"
            >
              {t.resourcesPage.cta.button}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
