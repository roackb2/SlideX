"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function SiteNotFound() {
  const { locale, localePath } = useI18n();
  const reduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";

  const copy = {
    title: isZh ? "這張投影片不存在。" : "This slide doesn't exist.",
    body: isZh
      ? "您要找的頁面可能已被移除、重新命名，或從未存在。"
      : "The page you're looking for may have been removed, renamed, or never existed.",
    primary: isZh ? "回到首頁" : "Back to home",
    secondary: isZh ? "立即試用 Live Demo" : "Try Live Demo"
  };

  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: easeOut }
        };

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#0a0b0d] text-[#fcfbf8] selection:bg-[#c4ee87]/30">
      <div
        aria-hidden="true"
        className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <header className="relative z-10 px-5 pt-6 sm:px-8 sm:pt-7">
        <Link
          aria-label={isZh ? "SlideX 首頁" : "SlideX home"}
          className="inline-flex w-fit items-center rounded-sm opacity-95 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4ee87]"
          href={localePath("/")}
        >
          <Image alt="SlideX" className="h-auto w-[88px] object-contain" height={72} loading="eager" priority src="/logo.png" width={260} />
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-14 text-center sm:py-16">
        <motion.p {...rise()} className="font-mono-geist text-[11px] tracking-[0.32em] text-white/40">
          ERROR <span className="text-[#c4ee87]">404</span> — SLIDE NOT FOUND
        </motion.p>

        <motion.div
          {...rise(0.08)}
          aria-hidden="true"
          className="relative mt-8 aspect-video w-full max-w-[560px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
        >
          <p className="absolute left-[6%] top-[8%] font-mono-geist text-[9px] tracking-[0.28em] text-white/36 sm:text-[11px]">
            UNTITLED DECK
          </p>
          <div className="absolute right-[6%] top-[20%] flex h-[38%] w-[28%] items-center justify-center rounded-md border border-dashed border-white/14">
            <Plus className="h-4 w-4 text-white/20" strokeWidth={1.5} />
          </div>
          <p className="absolute bottom-[9%] left-[6%] flex items-end leading-none">
            <span className="text-[clamp(88px,20vw,168px)] font-semibold tracking-[-0.06em] text-white/90">4</span>
            <span className="text-[clamp(88px,20vw,168px)] font-semibold tracking-[-0.06em] text-[#c4ee87]">0</span>
            <span className="text-[clamp(88px,20vw,168px)] font-semibold tracking-[-0.06em] text-white/90">4</span>
          </p>
          <div className="absolute bottom-[8%] right-[6%] flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="h-1 w-1 rounded-full border border-[#c4ee87]/70" />
            </span>
            <span className="font-mono-geist text-[9px] tracking-[0.28em] text-white/36 sm:text-[11px]">04 / 04</span>
          </div>
        </motion.div>

        <motion.h1
          {...rise(0.16)}
          className="mt-10 max-w-2xl text-[clamp(30px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em] [text-wrap:balance]"
        >
          {copy.title}
        </motion.h1>
        <motion.p {...rise(0.22)} className="mt-4 max-w-md text-[15px] leading-7 text-white/52">
          {copy.body}
        </motion.p>

        <motion.div {...rise(0.28)} className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#c4ee87] px-7 text-[15px] font-semibold text-[#0a1a00] transition-colors hover:bg-[#d7f5aa] active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4ee87]"
            href={localePath("/")}
          >
            {copy.primary}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/16 bg-white/[0.045] px-6 text-[14px] font-semibold text-white/72 transition-colors hover:border-white/30 hover:text-white active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4ee87]"
            href={appRoutes.liveDemo}
          >
            {copy.secondary}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      <footer className="relative z-10 px-5 pb-6 text-center">
          <p className="font-mono-geist text-[10px] tracking-[0.26em] text-white/28">SLIDEX — PAGE OUT OF DECK RANGE</p>
      </footer>
    </main>
  );
}
