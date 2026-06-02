"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Download,
  FileCode2,
  Laptop,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { SiteFooter, SiteNav } from "@/common/ui";

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

export default function DownloadPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080a0f] text-neutral-200">
      <SiteNav />

      <section className="relative px-4 pt-24 sm:px-6">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#8ea5ff]/[0.1] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 pb-14 sm:pb-16 md:pb-20 lg:min-h-[calc(100dvh-6rem)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
            <motion.div
              variants={fadeInUp}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-neutral-300"
            >
              <Download className="h-3.5 w-3.5 text-[#8ea5ff]" />
              {t.downloadPage.hero.eyebrow}
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-[2.35rem] font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {t.downloadPage.hero.title}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-5 max-w-xl text-[15px] leading-7 text-neutral-400 sm:text-base md:mt-6 md:text-lg"
            >
              {t.downloadPage.hero.body}
            </motion.p>
            <motion.div variants={fadeInUp} custom={3} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white/60 px-6 py-3 text-sm font-semibold text-black sm:w-auto"
                disabled
                type="button"
              >
                {t.downloadPage.hero.disabledButton}
              </button>
              <Link
                href="/studio"
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/[0.13] bg-white/[0.06] px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-white/[0.22] hover:bg-white/[0.09] active:scale-95 sm:w-auto"
              >
                {t.downloadPage.hero.secondary}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeSmooth }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_74%_10%,rgba(142,165,255,0.18),transparent_44%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#0d1018] p-5 shadow-2xl shadow-black/50 md:rounded-[32px] md:p-7">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] text-[#8ea5ff]">
                    <Laptop className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{t.downloadPage.packageCard.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">{t.downloadPage.packageCard.subtitle}</p>
                  </div>
                </div>
                <span className="w-fit rounded-full border border-white/[0.1] px-3 py-1 text-xs text-neutral-500">
                  {t.downloadPage.packageCard.status}
                </span>
              </div>

              <div className="rounded-[24px] border border-white/[0.1] bg-black/30 p-4">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
                  <FileCode2 className="h-4 w-4 text-[#8ea5ff]" />
                  {t.downloadPage.packageCard.heading}
                </div>
                <div className="space-y-3">
                  {t.downloadPage.packageCard.items.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm leading-6 text-neutral-300">
                      <Check className="h-4 w-4 shrink-0 text-[#8ea5ff]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-[#8ea5ff]/[0.2] bg-[#8ea5ff]/[0.08] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-[#8ea5ff]" />
                  {t.downloadPage.packageCard.localTitle}
                </div>
                <p className="text-sm leading-relaxed text-neutral-400">
                  {t.downloadPage.packageCard.localBody}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/[0.1] bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/[0.08] px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
          {t.downloadPage.stats.map(([title, body]) => (
            <div key={title} className="py-6 md:px-8 md:py-7 first:md:pl-0 last:md:pr-0">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeSmooth }}
            className="grid gap-8 rounded-[24px] border border-white/[0.1] bg-white/[0.045] p-5 sm:p-6 md:rounded-[32px] md:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center"
          >
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#8ea5ff]/[0.14] text-[#8ea5ff]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-5xl">
                {t.downloadPage.webStudio.title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
                {t.downloadPage.webStudio.body}
              </p>
            </div>
            <div>
              <Link
                href="/studio"
                className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-95"
              >
                {t.downloadPage.webStudio.button}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
