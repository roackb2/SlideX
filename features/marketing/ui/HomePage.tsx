"use client";

import { useState, type PointerEvent } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from "framer-motion";
import { ArrowRight, ChevronDown, Presentation } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import { SlideXFeatureVisual } from "@/common/ui/SlideXFeatureVisual";

const easeOut = [0.16, 1, 0.3, 1] as const;

type SlideVariant = "mesh" | "editorial" | "orbit" | "signal";

const heroSlides: {
  background: string;
  className: string;
  depth: "near" | "far";
  label: string;
  variant: SlideVariant;
}[] = [
  {
    background: "#d8ff76",
    className: "-left-[4%] top-[16%] w-[28%] -rotate-[5deg]",
    depth: "near",
    label: "Mesh",
    variant: "mesh"
  },
  {
    background: "#f2eee8",
    className: "-right-[3%] top-[14%] w-[27%] rotate-[4deg]",
    depth: "far",
    label: "Editorial",
    variant: "editorial"
  },
  {
    background: "#8fcfff",
    className: "bottom-[7%] left-[7%] w-[24%] rotate-[3deg]",
    depth: "far",
    label: "Orbit",
    variant: "orbit"
  },
  {
    background: "#ff6f8f",
    className: "bottom-[6%] right-[6%] w-[26%] -rotate-[4deg]",
    depth: "near",
    label: "Signal",
    variant: "signal"
  }
];

export function HomePage() {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";

  const copy = {
    heroTitle: isZh ? ["不用複雜流程，", "也能完成專業簡報。"] : ["Create presentations without", "the complicated workflow."],
    heroBody: isZh
      ? "從完整示範簡報開始，直接在瀏覽器修改內容，準備好後再匯出 PowerPoint。"
      : "Start with a complete demo deck, edit it directly in the browser, and export it as PowerPoint when you are ready.",
    primaryCta: isZh ? "立即試用 Live Demo" : "Try Live Demo",
    secondaryCta: isZh ? "查看範例簡報" : "View Example Deck",
    heroNote: isZh ? "不需註冊即可開始試用。" : "No sign-up required to try.",
    workflowSteps: isZh
      ? [
          { detail: "開啟一份版面與視覺都已完成的示範簡報。", title: "選擇完整簡報" },
          { detail: "直接在 Pitch 修改文字、圖片與版面。", title: "在瀏覽器編輯" },
          { detail: "直接下載 PPTX；HTML 與 MDX 登入後即可使用。", title: "匯出 PowerPoint" }
        ]
      : [
          { detail: "Open a complete demo deck and start with a finished layout.", title: "Choose a deck" },
          { detail: "Change text, images, and layout directly in Pitch.", title: "Edit in your browser" },
          { detail: "Download a PPTX directly. Sign in to unlock HTML and MDX.", title: "Export to PowerPoint" }
        ],
    featureSections: isZh
      ? [
          {
            eyebrow: "現成模板",
            title: "從完整設計開始，不必從空白頁開始。",
            body: "開啟 Live Demo，直接替換文字與圖片，同時保留完整的版面結構與視覺節奏。",
            link: "試用 Live Demo",
            visual: "canvas" as const
          },
          {
            eyebrow: "瀏覽器編輯",
            title: "直接修改、預覽，再匯出 PowerPoint。",
            body: "文字、圖片與版面都在同一個編輯器完成。準備好後，匯出可在 PowerPoint 開啟的 PPTX。",
            link: "查看示範簡報",
            visual: "export" as const
          }
        ]
      : [
          {
            eyebrow: "Ready-made decks",
            title: "Start with a complete design, not a blank slide.",
            body: "Open the Live Demo, then replace text and images while keeping its polished layout and visual rhythm.",
            link: "Try Live Demo",
            visual: "canvas" as const
          },
          {
            eyebrow: "Browser editing",
            title: "Edit, preview, then export to PowerPoint.",
            body: "Update text, images, and layout in one editor. When the deck is ready, export a PPTX that opens in PowerPoint.",
            link: "View the example deck",
            visual: "export" as const
          }
        ],
    exportTitle: isZh ? "準備好後，直接匯出 PowerPoint。" : "Export to PowerPoint when the deck is ready.",
    exportBody: isZh ? "保持簡報的文字、圖片與版面，下載可在 PowerPoint 開啟的 PPTX。" : "Keep the deck's text, images, and layout in a PPTX you can open in PowerPoint.",
    faqTitle: isZh ? "常見問題，直接回答。" : "Questions, answered.",
    faqBody: isZh ? "關於 Pitch 的核心操作與工作方式。" : "The essentials about working in Pitch.",
    faqItems: isZh
      ? [
          ["需要註冊才能試用嗎？", "不需要。你可以直接開啟 Live Demo，修改文字與圖片，並預覽整份簡報。"],
          ["重新整理後修改會消失嗎？", "不會。訪客的示範內容會自動保存在目前瀏覽器的 localStorage。"],
          ["可以從模板開始嗎？", "可以。登入後會看到 Welcome Deck 與 Launch Deck 兩個內建模板。"],
          ["可以在瀏覽器播放簡報嗎？", "可以。你可以隨時開啟預覽並播放投影片。"],
          ["可以匯出 PowerPoint 嗎？", "可以。Live Demo 可直接輸出 PPTX；HTML、MDX 等其他格式需登入後才可使用。"]
        ]
      : [
          ["Do I need an account to try it?", "No. Open the Live Demo to edit text and images, preview the deck, and play the presentation."],
          ["Will my changes survive a refresh?", "Yes. Guest demo changes are saved automatically in this browser's localStorage."],
          ["Can I start from a template?", "Yes. Signed-in workspaces include the Welcome Deck and Launch Deck templates."],
          ["Can I preview and play the deck in the browser?", "Yes. Open the presentation preview at any time and play through every slide."],
          ["Can I export to PowerPoint?", "Yes. The Live Demo exports PPTX directly. Sign in to unlock HTML, MDX, and other formats."]
        ],
    ctaTitle: isZh ? "現在就用一份完整簡報開始。" : "Start with a complete deck now.",
    ctaBody: isZh ? "不需註冊即可試用編輯器。" : "Try the editor without creating an account.",
    pitchCta: isZh ? "立即試用 Live Demo" : "Try Live Demo",
    pitchCtaBody: isZh ? "直接修改示範簡報，內容會保存在這個瀏覽器。" : "Edit the demo deck directly. Changes stay saved in this browser.",
    exampleCta: isZh ? "查看範例簡報" : "View Example Deck",
    exampleCtaBody: isZh ? "先播放完整示範，再決定要修改哪些內容。" : "Play the complete demo first, then decide what you want to change.",
    powerPointVisual: isZh
      ? {
          body: "在 PowerPoint、Keynote 或 Google Slides 開啟 PPTX。",
          cta: "立即試用 Live Demo",
          eyebrow: "PowerPoint 匯出",
          fileLabel: "PowerPoint 簡報",
          slideLabel: "準備上場。",
          title: "離開瀏覽器後，仍可繼續編輯。"
        }
      : {
          body: "Open the PPTX in PowerPoint, Keynote, or Google Slides.",
          cta: "Try Live Demo",
          eyebrow: "PowerPoint export",
          fileLabel: "PowerPoint presentation",
          slideLabel: "Ready for the room.",
          title: "Keep working after the browser."
        }
  };

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.16 },
          transition: { duration: 0.72, delay, ease: easeOut }
        };

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#f7f7f4] text-[#111315] selection:bg-[#9ad7ff]/45">
      <InteractiveHero
        body={copy.heroBody}
        isZh={isZh}
        primaryCta={copy.primaryCta}
        reduceMotion={Boolean(reduceMotion)}
        secondaryCta={copy.secondaryCta}
        supportingNote={copy.heroNote}
        title={copy.heroTitle}
      />

      <WorkflowSteps items={copy.workflowSteps} reveal={reveal} />

      <FeatureStorySections items={copy.featureSections} reveal={reveal} />

      <PowerPointSection
        body={copy.exportBody}
        reveal={reveal}
        title={copy.exportTitle}
        visualCopy={copy.powerPointVisual}
      />

      <FaqSection
        body={copy.faqBody}
        items={copy.faqItems}
        reduceMotion={Boolean(reduceMotion)}
        reveal={reveal}
        title={copy.faqTitle}
      />

      <section id="download" className="bg-[#c4ee87] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="grid gap-7 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <h2 className="max-w-4xl text-[clamp(42px,6vw,76px)] font-semibold leading-[1] tracking-normal [text-wrap:balance]">
              {copy.ctaTitle}
            </h2>
            <p className="max-w-xl text-lg leading-8 text-[#111315]/60 lg:justify-self-end">{copy.ctaBody}</p>
          </motion.div>

          <motion.div {...reveal(0.06)} className="mt-14 grid overflow-hidden rounded-lg border border-[#111315]/14 bg-[#111315] text-white lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-7 sm:p-9">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#c4ee87] text-[#0a1a00]">
                <Presentation className="h-5 w-5" />
              </span>
              <p className="mt-6 max-w-xl text-[clamp(25px,3.4vw,42px)] font-semibold leading-[0.98]">{copy.pitchCta}</p>
              <p className="mt-3 max-w-md text-[15px] leading-6 text-white/48">{copy.pitchCtaBody}</p>
              <Link href={appRoutes.liveDemo} className="group mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-[#111315] transition-colors hover:bg-[#f2eee8] active:translate-y-px">
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="flex flex-col justify-between border-t border-white/12 p-7 sm:p-9 lg:border-l lg:border-t-0">
              <div>
                <p className="text-[14px] font-semibold text-[#c4ee87]">{copy.exampleCta}</p>
                <p className="mt-3 max-w-sm text-[15px] leading-6 text-white/48">{copy.exampleCtaBody}</p>
              </div>
              <Link href={appRoutes.exampleDeck} className="group mt-9 inline-flex h-11 w-fit items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#c4ee87]">
                {copy.secondaryCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

type FeatureStoryItem = {
  body: string;
  eyebrow: string;
  link: string;
  title: string;
  visual: "canvas" | "export" | "shader";
};

function WorkflowSteps({
  items,
  reveal
}: {
  items: { detail: string; title: string }[];
  reveal: (delay?: number) => Record<string, unknown>;
}) {
  return (
    <section className="bg-[#f7f7f4] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <motion.div {...reveal()} className="mx-auto max-w-7xl border-t border-[#111315]/14">
        <div className="grid md:grid-cols-[1.08fr_0.92fr_1.08fr]">
          {items.map((step, index) => (
            <article
              className={`py-8 md:min-h-44 md:px-8 md:py-9 ${index > 0 ? "border-t border-[#111315]/14 md:border-l md:border-t-0" : "md:pl-0"}`}
              key={step.title}
            >
              <p className="text-[clamp(24px,2.5vw,34px)] font-semibold leading-tight tracking-[-0.035em]">{step.title}</p>
              <p className="mt-3 max-w-sm text-[14px] leading-6 text-[#111315]/54">{step.detail}</p>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function FeatureStorySections({
  items,
  reveal
}: {
  items: FeatureStoryItem[];
  reveal: (delay?: number) => Record<string, unknown>;
}) {
  return (
    <section className="bg-[#f7f7f4] px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-7xl space-y-24 lg:space-y-36">
        {items.map((item, index) => (
          <article
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
            key={item.title}
          >
            <motion.div
              {...reveal()}
              className={index % 2 === 1 ? "lg:order-2" : undefined}
            >
              <p className="text-[12px] font-semibold tracking-[0.12em] text-[#111315]/42">{item.eyebrow}</p>
              <h2 className="mt-5 max-w-xl text-[clamp(38px,4.8vw,64px)] font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
                {item.title}
              </h2>
              <p className="mt-6 max-w-lg text-[17px] leading-8 text-[#111315]/58">{item.body}</p>
              <Link
                className="group mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-[#111315] transition-opacity hover:opacity-58 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#111315]"
                href={index === 0 ? appRoutes.liveDemo : appRoutes.exampleDeck}
              >
                {item.link}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              {...reveal(0.06)}
              className={`relative overflow-hidden rounded-lg bg-[#111315] p-2 shadow-[0_28px_80px_rgba(17,19,21,0.16)] ${index % 2 === 1 ? "lg:order-1" : ""}`}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-md">
                <SlideXFeatureVisual variant={item.visual} />
              </div>
            </motion.div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaqSection({
  body,
  items,
  reduceMotion,
  reveal,
  title
}: {
  body: string;
  items: string[][];
  reduceMotion: boolean;
  reveal: (delay?: number) => Record<string, unknown>;
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#0a0b0d] px-4 pb-24 text-white sm:px-6 lg:px-8 lg:pb-36">
      <div className="mx-auto grid max-w-7xl gap-14 border-t border-white/12 pt-20 lg:grid-cols-[0.7fr_1fr] lg:gap-24 lg:pt-28">
        <motion.div {...reveal()} className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="max-w-lg text-[clamp(40px,5.4vw,68px)] font-semibold leading-[1.02] tracking-normal [text-wrap:balance]">
            {title}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/52">{body}</p>
        </motion.div>

        <motion.div {...reveal(0.06)} className="border-t border-white/14">
          {items.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <motion.div key={question} layout={!reduceMotion} className="border-b border-white/14">
                <button
                  type="button"
                  aria-controls={answerId}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="group flex w-full items-start justify-between gap-6 py-6 text-left sm:py-7"
                >
                  <span className="max-w-[38rem] text-lg font-medium leading-7 text-white/86 transition-colors group-hover:text-white sm:text-xl">
                    {question}
                  </span>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/16 text-white/52 transition-colors group-hover:border-white/30 group-hover:text-white">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={answerId}
                      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.24, ease: easeOut }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[38rem] pb-7 pr-12 text-[16px] leading-7 text-white/52 sm:pb-8 sm:text-[17px]">
                        {answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function InteractiveHero({
  body,
  isZh,
  primaryCta,
  reduceMotion,
  secondaryCta,
  supportingNote,
  title
}: {
  body: string;
  isZh: boolean;
  primaryCta: string;
  reduceMotion: boolean;
  secondaryCta: string;
  supportingNote: string;
  title: string[];
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { damping: 30, stiffness: 130 });
  const smoothY = useSpring(pointerY, { damping: 30, stiffness: 130 });
  const nearX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const nearY = useTransform(smoothY, [-1, 1], [-12, 12]);
  const farX = useTransform(smoothX, [-1, 1], [10, -10]);
  const farY = useTransform(smoothY, [-1, 1], [7, -7]);

  const updatePointer = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  return (
    <motion.section
      initial={false}
      animate={{ backgroundColor: activeSlide === 0 ? "#0b0c0f" : activeSlide === 1 ? "#0e0d0d" : activeSlide === 2 ? "#090d10" : "#100a0d" }}
      transition={{ duration: 0.55 }}
      onPointerMove={updatePointer}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[#0b0c0f] px-5 pb-12 pt-24 text-white sm:px-6 lg:px-8 lg:pb-10 lg:pt-20"
    >
      <div className="absolute inset-x-0 top-[22%] h-px bg-white/[0.055]" />
      <div className="absolute inset-x-0 bottom-[20%] h-px bg-white/[0.055]" />
      <div className="absolute inset-y-0 left-[17%] w-px bg-white/[0.04]" />
      <div className="absolute inset-y-0 right-[17%] w-px bg-white/[0.04]" />

      <div className="absolute inset-0 z-10 hidden lg:block">
        {heroSlides.map((slide, index) => (
          <motion.button
            key={slide.label}
            type="button"
            aria-label={isZh ? `顯示 ${slide.label} 投影片` : `Show ${slide.label} slide`}
            aria-pressed={activeSlide === index}
            onClick={() => setActiveSlide(index)}
            style={{
              x: slide.depth === "near" ? nearX : farX,
              y: slide.depth === "near" ? nearY : farY
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.025, rotate: 0 }}
            className={`absolute ${slide.className} aspect-video overflow-hidden rounded-lg border p-1.5 shadow-[0_34px_90px_rgba(0,0,0,0.42)] transition-[border-color,opacity] duration-300 ${
              activeSlide === index ? "z-20 border-white/52 opacity-100" : "border-white/16 opacity-64 hover:opacity-90"
            }`}
          >
            <SlideArtwork variant={slide.variant} background={slide.background} compact />
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.82, ease: easeOut }}
        className="relative z-20 mx-auto w-full max-w-7xl text-center"
      >
        <h1 className="mx-auto max-w-[1120px] text-[42px] font-semibold leading-[0.98] tracking-[-0.035em] [text-wrap:balance] sm:text-[54px] lg:text-[clamp(50px,5vw,68px)] lg:leading-[1.01] lg:tracking-[-0.035em]">
          {title.map((line, index) => (
            <span key={line} className="block lg:whitespace-nowrap">
              {line}{index < title.length - 1 ? " " : null}
            </span>
          ))}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[16px] leading-7 text-white/58 sm:mt-6 sm:max-w-xl sm:text-lg">{body}</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={appRoutes.liveDemo}
            className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#c4ee87] px-7 text-[15px] font-semibold text-[#0a1a00] transition-colors hover:bg-[#d7f5aa] active:translate-y-px sm:w-auto"
          >
            {primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={appRoutes.exampleDeck}
            className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-white/16 bg-white/[0.045] px-6 text-[14px] font-semibold text-white/72 transition-colors hover:border-white/30 hover:text-white active:translate-y-px sm:w-auto"
          >
            {secondaryCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-4 text-[13px] text-white/46">{supportingNote}</p>
      </motion.div>
    </motion.section>
  );
}

function SlideArtwork({
  background,
  compact = false,
  variant
}: {
  background: string;
  compact?: boolean;
  variant: SlideVariant;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-md" style={{ background }}>
      {variant === "mesh" && (
        <>
          <div className="absolute -left-[12%] -top-[20%] h-[76%] w-[50%] rounded-full bg-[#ff7398]" />
          <div className="absolute left-[20%] top-[12%] h-[72%] w-[46%] rotate-12 rounded-full bg-[#7b5cff] mix-blend-multiply" />
          <div className="absolute right-[5%] top-[18%] h-[58%] w-[31%] rounded-full bg-[#68dbe5] mix-blend-multiply" />
          <div className="absolute bottom-[10%] right-[8%] h-[2px] w-[30%] bg-[#111315]/55" />
        </>
      )}
      {variant === "editorial" && (
        <>
          <div className="absolute inset-y-[9%] left-[8%] w-[34%] bg-[#111315]" />
          <div className="absolute left-[13%] top-[16%] h-[10%] w-[23%] bg-[#f2eee8]" />
          <div className="absolute left-[13%] top-[32%] h-[3%] w-[15%] bg-[#f2eee8]/60" />
          <div className="absolute bottom-[12%] right-[8%] h-[46%] w-[43%] border-[3px] border-[#111315]" />
          <div className="absolute bottom-[19%] right-[15%] h-[28%] w-[21%] rounded-full bg-[#ff6f8f]" />
        </>
      )}
      {variant === "orbit" && (
        <>
          <div className="absolute left-[10%] top-[14%] h-[72%] w-[41%] rounded-full border-[3px] border-[#111315]" />
          <div className="absolute left-[20%] top-[28%] h-[44%] w-[24%] rounded-full bg-[#111315]" />
          <div className="absolute right-[11%] top-[18%] h-[22%] w-[30%] bg-white/80" />
          <div className="absolute bottom-[18%] right-[11%] h-[4%] w-[21%] bg-[#111315]" />
        </>
      )}
      {variant === "signal" && (
        <>
          <div className="absolute left-[8%] top-[13%] h-[74%] w-[2px] bg-[#111315]" />
          <div className="absolute left-[14%] top-[16%] h-[18%] w-[46%] bg-[#111315]" />
          <div className="absolute bottom-[15%] left-[14%] grid h-[42%] w-[72%] grid-cols-5 items-end gap-[4%]">
            {[40, 67, 52, 94, 72].map((height, index) => (
              <div key={height} className={index === 3 ? "bg-[#d8ff76]" : "bg-[#111315]/72"} style={{ height: `${height}%` }} />
            ))}
          </div>
        </>
      )}
      {!compact && <div className="absolute bottom-[7%] right-[6%] h-2 w-2 rounded-full bg-[#111315]" />}
    </div>
  );
}

function PowerPointSection({
  body,
  reveal,
  title,
  visualCopy
}: {
  body: string;
  reveal: (delay?: number) => Record<string, unknown>;
  title: string;
  visualCopy: {
    body: string;
    cta: string;
    eyebrow: string;
    fileLabel: string;
    slideLabel: string;
    title: string;
  };
}) {
  return (
    <section id="workspace" className="overflow-hidden bg-[#0a0b0d] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal()}>
          <h2 className="max-w-3xl text-[clamp(40px,5.8vw,72px)] font-semibold leading-[1.02] tracking-normal [text-wrap:balance]">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/54">{body}</p>
        </motion.div>

        <motion.div {...reveal(0.06)} className="mt-14 grid overflow-hidden rounded-lg border border-white/12 bg-[#111315] lg:grid-cols-[0.72fr_0.28fr]">
          <div className="relative min-h-[420px] overflow-hidden border-b border-white/10 p-6 sm:min-h-[520px] sm:p-10 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.11)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="relative mx-auto flex h-full max-w-[760px] items-center justify-center">
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[#f3f1ec] text-[#111315] shadow-[0_34px_90px_rgba(0,0,0,0.46)]">
                <div className="absolute inset-y-0 left-0 w-[36%] bg-[#c4ee87]" />
                <p className="absolute left-[5%] top-[9%] text-[clamp(11px,1.5vw,19px)] font-semibold">SlideX</p>
                <p className="absolute bottom-[12%] left-[5%] max-w-[28%] text-[clamp(18px,3.3vw,46px)] font-semibold leading-[0.94] tracking-[-0.055em]">{visualCopy.slideLabel}</p>
                <div className="absolute right-[7%] top-[13%] flex h-[74%] w-[48%] items-center justify-center rounded-md border border-[#111315]/12 bg-white">
                  <div className="text-center">
                    <Presentation className="mx-auto h-12 w-12 text-[#d24625] sm:h-16 sm:w-16" strokeWidth={1.5} />
                    <p className="mt-4 text-[clamp(12px,1.6vw,20px)] font-semibold">{visualCopy.fileLabel}</p>
                    <p className="mt-2 text-[clamp(8px,0.9vw,12px)] text-[#111315]/46">.pptx</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="text-[13px] font-semibold text-[#c4ee87]">{visualCopy.eyebrow}</p>
              <p className="mt-5 text-[26px] font-semibold leading-[1.08] tracking-[-0.035em]">{visualCopy.title}</p>
              <p className="mt-4 text-[14px] leading-6 text-white/48">{visualCopy.body}</p>
            </div>
            <Link className="group mt-10 inline-flex h-11 w-fit items-center gap-2 text-[14px] font-semibold text-white hover:text-[#c4ee87]" href={appRoutes.liveDemo}>
              {visualCopy.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
