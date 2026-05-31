"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  Folder,
  Layers,
  Play,
  Sparkles
} from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { StyleThumbnail } from "@/components/StyleThumbnail";
import { localizeTemplates, type Dictionary } from "@/lib/i18n";
import { motionTemplates, type MotionTemplate } from "@/lib/templates";

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

function TemplateCard({
  template,
  index
}: {
  template: MotionTemplate;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.04, duration: 0.55, ease: easeSmooth }}
    >
      <Link
        href="/studio"
        className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/[0.1] bg-white/[0.045] transition hover:border-[#8ea5ff]/[0.35] hover:bg-white/[0.07] active:scale-[0.99]"
      >
        <div className="relative h-52 overflow-hidden bg-[#0c0f17]">
          <StyleThumbnail
            className="h-full w-full transition duration-700 group-hover:scale-[1.03]"
            label={template.category}
            templateId={template.id}
            title={template.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f]/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/[0.14] bg-black/30 px-3 py-1 text-xs font-medium text-neutral-200 backdrop-blur-md">
              {template.category}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-black/30 px-3 py-1 text-xs text-neutral-300 backdrop-blur-md">
              <Clock className="h-3 w-3" />
              {template.duration}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-white">{template.name}</h2>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-[#8ea5ff]" />
          </div>
          <p className="text-sm leading-relaxed text-neutral-400">{template.description}</p>
          <p className="mt-5 text-xs font-medium leading-relaxed text-neutral-500">{template.useCase}</p>
        </div>
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
  if (!featured) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 34, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: easeSmooth }}
      className="relative"
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_72%_12%,rgba(142,165,255,0.18),transparent_44%)] blur-2xl" />
      <Link
        href="/studio"
        className="group relative block overflow-hidden rounded-[32px] border border-white/[0.12] bg-[#0d1018] shadow-2xl shadow-black/50"
      >
        <div className="relative aspect-[1.16] min-h-[390px] overflow-hidden">
          <StyleThumbnail
            className="h-full w-full transition duration-700 group-hover:scale-[1.02]"
            label={featured.category}
            templateId={featured.id}
            title={featured.name}
            variant="hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-[#080a0f]/30 to-transparent" />

          <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 rounded-full border border-white/[0.14] bg-black/30 px-3 py-1.5 text-sm text-neutral-200 backdrop-blur-md">
              <Play className="h-3.5 w-3.5 text-[#8ea5ff]" />
              {copy.label}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">
              {copy.open}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {[featured.category, featured.duration, copy.deckLabel].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/[0.12] bg-white/[0.07] px-3 py-1 text-xs text-neutral-300 backdrop-blur-md"
                >
                  {item}
                </span>
              ))}
            </div>
            <h2 className="max-w-md text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {featured.name}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-300">
              {featured.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TemplatesPage() {
  const { t } = useI18n();
  const templates = localizeTemplates(motionTemplates, t.templateMeta);
  const featured = templates[0];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080a0f] text-neutral-200">
      <SiteNav />

      <section className="relative px-6 pt-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#8ea5ff]/[0.1] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 pb-16 md:pb-20 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
            <motion.div
              variants={fadeInUp}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-neutral-300"
            >
              <Folder className="h-3.5 w-3.5 text-[#8ea5ff]" />
              {t.templatesPage.hero.eyebrow}
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              {t.templatesPage.hero.title}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400 md:text-lg"
            >
              {t.templatesPage.hero.body}
            </motion.p>
            <motion.div variants={fadeInUp} custom={3} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/studio"
                className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-95"
              >
                {t.templatesPage.hero.primary}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#gallery"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.13] bg-white/[0.06] px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-white/[0.22] hover:bg-white/[0.09] active:scale-95"
              >
                {t.templatesPage.hero.secondary}
              </Link>
            </motion.div>
          </motion.div>

          <FeaturedPreset copy={t.templatesPage.featured} featured={featured} />
        </div>
      </section>

      <section className="border-y border-white/[0.1] bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/[0.08] px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {t.templatesPage.stats.map(([title, body]) => (
            <div key={title} className="py-6 md:px-8 md:py-7 first:md:pl-0 last:md:pr-0">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="gallery" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.78fr_1fr] lg:items-end">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                {t.templatesPage.gallery.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
                {t.templatesPage.gallery.body}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {t.templatesPage.gallery.steps.map(([step, label]) => (
                <div key={step} className="rounded-[24px] border border-white/[0.1] bg-white/[0.04] p-4">
                  <p className="font-mono text-xs text-[#8ea5ff]">{step}</p>
                  <p className="mt-2 text-sm font-medium text-white">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template, index) => (
              <TemplateCard key={template.id} template={template} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeSmooth }}
            className="grid gap-8 rounded-[32px] border border-white/[0.1] bg-[#0d1018] p-6 md:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"
          >
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#8ea5ff]/[0.14] text-[#8ea5ff]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {t.templatesPage.startingPoint.title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
                {t.templatesPage.startingPoint.body}
              </p>
            </div>

            <div className="grid gap-3">
              {t.templatesPage.startingPoint.items.map(([title, body]) => (
                <div
                  key={title}
                  className="grid gap-4 rounded-[24px] border border-white/[0.09] bg-black/20 p-4 sm:grid-cols-[40px_1fr] sm:items-center"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-[#8ea5ff]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-neutral-500">{body}</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-white/[0.1] px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.07] text-[#8ea5ff]">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {t.templatesPage.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-400">
            {t.templatesPage.cta.body}
          </p>
          <div className="mt-8">
            <Link
              href="/studio"
              className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-95"
            >
              {t.templatesPage.cta.button}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
