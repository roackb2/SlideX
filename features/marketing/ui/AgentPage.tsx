"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Activity, Shield } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import { MktgSection, mktgEase } from "@/features/marketing/ui/primitives";
import { ThreeShaderCanvas } from "@/features/pitch/ui/preview/ThreeShaderCanvas";

export function AgentPage() {
  const { locale, t } = useI18n();
  const copy = t.marketing.agent;
  const isZh = locale === "zh-TW";
  const reduceMotion = useReducedMotion();
  const displayMetrics = isZh
    ? "leading-[1.16] tracking-[-0.035em]"
    : "leading-[1.05] tracking-[-0.04em]";
  const displaySize = isZh
    ? "text-[34px] sm:text-[clamp(42px,5.2vw,72px)]"
    : "text-[38px] sm:text-[clamp(42px,5.2vw,72px)]";
  const sectionHeadingMetrics = isZh
    ? "leading-[1.18] tracking-[-0.03em]"
    : "leading-[1.08] tracking-[-0.035em]";

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.16 },
          transition: { duration: 0.72, delay, ease: mktgEase }
        };

  return (
    <main className="min-h-[100dvh] bg-canvas text-ink selection:bg-accent/30 overflow-hidden">
      {/* Antigravity Hero */}
      <section className="relative isolate flex flex-col items-center justify-center overflow-hidden border-b border-white/[0.09] px-5 pb-24 pt-32 sm:px-7 lg:px-10 lg:pt-48 lg:pb-40">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[#0a0a0f]">
          <ThreeShaderCanvas
            angle={45}
            className="opacity-70"
            color1="#0a0a0f"
            color2="#18182b"
            color3="#262b47"
            color4="#7a7acc"
            color5="#424266"
            color6="#10101a"
            detail={0.12}
            intensity={0.4}
            presetId="mesh-gradient"
            scale={0.9}
            shaderPreset="Default"
            softness={0.3}
            speed={0.2}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,15,0.3)_0%,rgba(10,10,15,0.8)_70%,#0a0a0f_100%)]" />
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[20%] left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-accent/15 blur-[160px]" />
        </div>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.82, ease: mktgEase }}
          className="relative z-10 mx-auto max-w-[900px] text-center"
        >
          <h1 className={`${displaySize} font-bold text-white [text-wrap:balance] ${displayMetrics}`}>
            {copy.heroTitle}
          </h1>
          
          <p className="mx-auto mt-7 max-w-[620px] text-[16px] leading-7 text-white/65 sm:text-[18px] sm:leading-8">
            {copy.heroDescription}
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-7 text-[14px] font-semibold text-on-accent transition-colors hover:bg-accent-hover active:scale-95"
              href={appRoutes.liveDemo}
            >
              {copy.getStarted}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/[0.045] px-7 text-[14px] font-semibold text-white/72 transition-colors hover:border-white/30 hover:text-white"
              href="https://heddleagent.com"
              rel="noreferrer"
              target="_blank"
            >
              {copy.learnHeddleAgent}
              <ArrowUpRight className="h-4 w-4 text-white/50" />
            </a>
          </div>
        </motion.div>
      </section>

      <MktgSection className="border-t border-white/10 py-24 lg:py-32">
        <motion.div {...reveal(0)} className="mx-auto max-w-2xl text-center">
          <h2 className={`text-[30px] font-bold text-white [text-wrap:balance] sm:text-[clamp(34px,4.2vw,52px)] ${displayMetrics}`}>
            {copy.workflowTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-7 text-white/60 sm:text-[17px] sm:leading-8">{copy.workflowBody}</p>
        </motion.div>

        <motion.figure {...reveal(0.08)} className="mt-12 paper-panel overflow-hidden rounded-[28px] border border-white/14 p-2 sm:p-3">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0a0b09]">
              <Image
                alt={isZh ? "AI Agent 對話面板與簡報編輯畫布的產品預覽" : "Product preview of an AI Agent chat panel beside a presentation canvas"}
                className="h-full w-full object-cover"
                height={1003}
                sizes="(min-width: 1024px) 1200px, 100vw"
                src="/marketing/agent-chat-preview.png"
                width={1568}
              />
            </div>
        </motion.figure>
      </MktgSection>

      {/* Section 1: Challenge */}
      <MktgSection className="border-t border-white/10 py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] items-start">
          <motion.div {...reveal(0)}>
            <h2 className={`text-[28px] font-bold text-white sm:text-[clamp(32px,3.6vw,44px)] ${sectionHeadingMetrics}`}>
              {copy.challengeTitle}
            </h2>
          </motion.div>
          <motion.div {...reveal(0.1)} className="max-w-2xl space-y-7 text-[16px] leading-7 text-white/65 sm:text-[17px] sm:leading-8 lg:mt-8">
            <p className="text-[18px] font-medium leading-8 text-white sm:text-[19px]">
              {copy.challengeParagraphs[0]}
            </p>
            <p>
              {copy.challengeParagraphs[1]}
            </p>
          </motion.div>
        </div>
      </MktgSection>

      {/* Section 3: Boundaries */}
      <MktgSection className="border-t border-white/10 py-24 lg:py-32">
        <motion.div {...reveal(0)} className="text-center mx-auto max-w-3xl mb-16">
          <h2 className={`text-[28px] font-bold text-white sm:text-[clamp(32px,3.6vw,44px)] ${sectionHeadingMetrics}`}>
            {copy.boundariesTitle}
          </h2>
          <p className="mt-5 text-[16px] leading-7 text-white/60 sm:text-[17px] sm:leading-8">
            {copy.boundariesDescription}
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          <motion.div {...reveal(0.1)} className="rounded-3xl border border-accent/30 bg-accent/[0.05] p-8 sm:p-12 backdrop-blur-md">
            <div className="mb-7 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-1.5 text-[13px] font-semibold text-on-accent">
              <Activity className="h-4 w-4" />
                {copy.heddleProvides}
            </div>
            <ul className="grid gap-6">
              {copy.heddleItems.map((item, i) => (
                <li key={i} className="flex gap-4 text-[15px] leading-7 text-white/80 sm:text-[16px]">
                  <span className="font-mono-geist text-[12px] text-accent mt-1 flex-shrink-0">0{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...reveal(0.2)} className="rounded-3xl border border-white/12 bg-white/[0.02] p-8 sm:p-12 relative overflow-hidden backdrop-blur-md">
            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-1.5 text-[13px] font-semibold text-white shadow-sm">
                <Shield className="h-4 w-4" />
                {copy.slideXOwns}
              </div>
              <ul className="grid gap-6">
                {copy.slideXItems.map((item, i) => (
                  <li key={i} className="flex gap-4 text-[15px] leading-7 text-white/70 sm:text-[16px]">
                    <span className="font-mono-geist text-[12px] text-white/30 mt-1 flex-shrink-0">0{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-24 -right-24 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          </motion.div>
        </div>
      </MktgSection>

      {/* CTA Footer */}
      <MktgSection className="border-t border-white/10 py-24 lg:py-40">
        <motion.div {...reveal(0)} className="mx-auto max-w-3xl text-center">
          <h2 className={`text-[30px] font-bold text-white sm:text-[clamp(34px,4.4vw,52px)] ${displayMetrics}`}>
            {copy.ctaTitle}
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-8 text-[15px] font-semibold text-on-accent transition-all hover:bg-accent-hover hover:scale-[1.03] active:scale-95"
              href={appRoutes.liveDemo}
            >
              {copy.ctaStart}
            </Link>
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/[0.045] px-8 text-[15px] font-semibold text-white/72 transition-colors hover:border-white/30 hover:text-white"
              href={appRoutes.login}
            >
              {copy.loginNow}
            </Link>
          </div>
        </motion.div>
      </MktgSection>
    </main>
  );
}
