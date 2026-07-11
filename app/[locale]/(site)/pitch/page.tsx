"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/common/lib/I18nProvider";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function PitchLandingPage() {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";
  const copy = {
    title: isZh ? ["一個顏色。", "完整掌控。"] : ["One color.", "Full control."],
    body: isZh
      ? "Pitch 是為清楚敘事打造的簡報工作區。每張投影片從一個純色 Fill 開始。"
      : "Pitch is a presentation workspace for clear stories. Every slide starts with one solid fill.",
    primary: isZh ? "開啟工作區" : "Open workspace",
    editorAlt: isZh ? "Pitch 簡報編輯器" : "Pitch presentation editor",
    visualAlt: isZh ? "石墨與銀色流線材質" : "Graphite and silver flowing material study",
    featureTitle: isZh ? "顏色不需要是一套複雜的系統。" : "Color does not need to become a complex system.",
    featureBody: isZh
      ? "像 Figma Slides 一樣，在 Fill 中挑選單色。你可以只更新這一張，或將相同顏色套用到整份 deck。"
      : "Like Figma Slides, choose a single color from Fill. Update one slide, or apply the same color to the entire deck.",
    details: isZh
      ? ["單色 Fill 自動維持文字對比", "直接在畫布上移動與縮放內容", "使用動態來安排閱讀節奏"]
      : ["Solid fill keeps text contrast readable", "Move and scale content directly on the canvas", "Use motion to set the reading rhythm"],
    finalTitle: isZh ? "讓下一頁更清楚。" : "Make the next slide clearer.",
    finalCta: isZh ? "開始製作" : "Start creating"
  };

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { amount: 0.25, once: true },
    transition: { duration: 0.64, ease: easeOut }
  };

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#0b0c0f] text-[#f4f4f1] selection:bg-[#438cff]/45">
      <section className="px-5 pb-20 pt-28 sm:px-7 lg:px-10 lg:pb-28 lg:pt-32">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:items-center">
          <motion.div
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            transition={{ duration: 0.72, ease: easeOut }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">Pitch Beta</p>
            <h1 className="mt-5 text-[clamp(3.2rem,6vw,6rem)] font-semibold leading-[0.96] tracking-[-0.06em]">
              {copy.title.map((line) => <span className="block" key={line}>{line}</span>)}
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-8 text-white/61">{copy.body}</p>
            <Link className="group mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-[#f4f4f1] px-5 text-[14px] font-semibold text-[#0b0c0f] transition-colors hover:bg-white active:translate-y-px" href="/workspace/pitch">
              {copy.primary}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <motion.figure
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            className="overflow-hidden rounded-lg border border-white/[0.14] bg-[#141518] p-1.5 shadow-[0_28px_100px_rgba(0,0,0,0.38)]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985, y: 18 }}
            transition={{ delay: 0.1, duration: 0.78, ease: easeOut }}
          >
            <Image alt={copy.editorAlt} className="h-auto w-full rounded-[4px]" height={1000} priority sizes="(min-width: 1024px) 62vw, 100vw" src="/images/slidex-editor-hero.png" width={2048} />
          </motion.figure>
        </div>
      </section>

      <section className="border-y border-white/[0.09] bg-[#0f1013] px-5 py-24 sm:px-7 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.figure {...reveal} className="overflow-hidden rounded-lg border border-white/[0.09]">
            <Image alt={copy.visualAlt} className="h-auto w-full" height={675} sizes="(min-width: 1024px) 58vw, 100vw" src="/images/slide-metal.png" width={1200} />
          </motion.figure>
          <motion.div {...reveal} transition={{ delay: 0.08, duration: 0.64, ease: easeOut }}>
            <h2 className="text-[clamp(2.4rem,4.6vw,4.5rem)] font-semibold leading-[1] tracking-[-0.05em]">{copy.featureTitle}</h2>
            <p className="mt-6 max-w-lg text-[16px] leading-7 text-white/57">{copy.featureBody}</p>
            <ul className="mt-10 space-y-4">
              {copy.details.map((detail) => (
                <li className="flex items-start gap-3 text-[15px] leading-6 text-white/76" key={detail}>
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#438cff]" />
                  {detail}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-7 lg:px-10 lg:py-28">
        <motion.div {...reveal} className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <h2 className="max-w-3xl text-[clamp(2.8rem,5.4vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.055em]">{copy.finalTitle}</h2>
          <Link className="group inline-flex h-12 items-center gap-2 rounded-md bg-[#438cff] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#5d9cff] active:translate-y-px" href="/workspace/pitch">
            {copy.finalCta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
