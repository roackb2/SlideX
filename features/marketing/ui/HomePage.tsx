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
import { ArrowRight, ChevronDown, FileText, Layers3, Sparkles } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

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
  const { locale, localePath } = useI18n();
  const reduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";

  const copy = {
    heroTitle: isZh ? ["讓每一頁", "都有記憶點。"] : ["Make every slide", "worth remembering."],
    heroBody: isZh ? "從內容結構到動態畫面，一套工作流完成。" : "From clear thinking to expressive slides, in one workflow.",
    primaryCta: isZh ? "開始製作" : "Start creating",
    secondaryCta: isZh ? "認識產品" : "Explore products",
    briefTitle: isZh ? "把散落的想法，整理成一份好 brief。" : "Turn scattered thinking into one clear brief.",
    briefBody: isZh ? "組合目標、受眾、範圍、時程與決策，邊編輯邊看完整文件。" : "Combine goals, audience, scope, timing, and decisions while the document takes shape live.",
    briefLink: isZh ? "認識 Briefly" : "Explore Briefly",
    pitchTitle: isZh ? "把簡報，做成一場視覺體驗。" : "Turn a deck into a visual experience.",
    pitchBody: isZh ? "在精確畫布上使用即時 shader、圖層、資料元件與動效。" : "Use live shaders, layers, data blocks, and motion on a precise canvas.",
    pitchLink: isZh ? "認識 Pitch" : "Explore Pitch",
    materialsTitle: isZh ? "每個故事，都能有自己的材質。" : "Give every story its own material.",
    materialsBody: isZh ? "切換 shader、色彩與動態，不必重新設計整張投影片。" : "Switch shaders, color, and motion without rebuilding the slide.",
    faqTitle: isZh ? "常見問題，直接回答。" : "Questions, answered.",
    faqBody: isZh ? "關於 SlideX、Briefly 與 Pitch 的核心資訊。" : "The essentials about SlideX, Briefly, and Pitch.",
    faqItems: isZh
      ? [
          ["SlideX 是什麼？", "SlideX 把 Briefly 與 Pitch 放進同一套工作流：先整理內容，再把故事做成簡報。"],
          ["Briefly 可以整理哪些內容？", "你可以整理目標、受眾、範圍、預期產出、時程與決策，並同步查看完整文件。"],
          ["Briefly 和 Pitch 如何搭配？", "先在 Briefly 定義專案與故事重點，內容清楚後，再到 Pitch 設計投影片與動態。"],
          ["Pitch 有什麼不同？", "Pitch 把精確畫布、圖層、資料元件、動效與即時 shader 材質放在同一個編輯環境。"],
          ["可以自訂 shader 嗎？", "可以。選擇材質後，可調整色彩、強度、速度、尺度與細節，建立符合故事的視覺風格。"],
          ["SlideX 適合哪些團隊？", "適合需要把複雜想法說清楚的產品團隊、創辦人、顧問與業務團隊。"]
        ]
      : [
          ["What is SlideX?", "SlideX brings Briefly and Pitch into one workflow: structure the thinking, then turn the story into slides."],
          ["What can I organize in Briefly?", "Bring goals, audience, scope, deliverables, timing, and decisions into one document with a live preview."],
          ["How do Briefly and Pitch work together?", "Define the project and story in Briefly, then move to Pitch when the content is ready for visual design and motion."],
          ["What makes Pitch different?", "Pitch combines a precise canvas with layers, data blocks, motion, and live shader materials in one editor."],
          ["Can I customize the shaders?", "Yes. Choose a material, then adjust color, intensity, speed, scale, and detail to match the story."],
          ["Who is SlideX for?", "SlideX is built for product teams, founders, consultants, and sales teams that need to explain complex ideas clearly."]
        ],
    ctaTitle: isZh ? "下一個想法，從這裡成形。" : "Shape the next idea here.",
    ctaBody: isZh ? "先整理內容，或直接開始做簡報。" : "Start with the brief, or go straight to the slides.",
    brieflyCta: isZh ? "開啟 Briefly" : "Open Briefly",
    brieflyCtaBody: isZh ? "整理目標、範圍與決策。" : "Structure goals, scope, and decisions.",
    pitchCta: isZh ? "開啟 Pitch" : "Open Pitch",
    pitchCtaBody: isZh ? "從第一張動態投影片開始。" : "Start with the first moving slide."
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
        title={copy.heroTitle}
      />

      <section id="products" className="bg-white px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-28 lg:space-y-40">
            <ProductStory
              title={copy.briefTitle}
              body={copy.briefBody}
              href={localePath("/briefly")}
              linkLabel={copy.briefLink}
              imageSide="right"
              reveal={reveal}
              visual={<BriefProductVisual isZh={isZh} />}
            />
            <ProductStory
              title={copy.pitchTitle}
              body={copy.pitchBody}
              href={localePath("/pitch")}
              linkLabel={copy.pitchLink}
              imageSide="left"
              reveal={reveal}
              visual={<PitchProductVisual isZh={isZh} />}
            />
          </div>
        </div>
      </section>

      <ShaderShowcase
        body={copy.materialsBody}
        isZh={isZh}
        reduceMotion={Boolean(reduceMotion)}
        reveal={reveal}
        title={copy.materialsTitle}
      />

      <FaqSection
        body={copy.faqBody}
        items={copy.faqItems}
        reduceMotion={Boolean(reduceMotion)}
        reveal={reveal}
        title={copy.faqTitle}
      />

      <section className="bg-[#c4ee87] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="grid gap-7 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <h2 className="max-w-4xl text-[clamp(42px,6vw,76px)] font-semibold leading-[1] tracking-normal [text-wrap:balance]">
              {copy.ctaTitle}
            </h2>
            <p className="max-w-xl text-lg leading-8 text-[#111315]/60 lg:justify-self-end">{copy.ctaBody}</p>
          </motion.div>

          <motion.div
            {...reveal(0.06)}
            className="mt-14 grid overflow-hidden rounded-lg border border-[#111315]/20 bg-[#111315]/12 lg:grid-cols-2"
          >
            <Link
              href="/workspace/briefly"
              className="group relative flex min-h-[320px] flex-col overflow-hidden bg-[#dfffae] p-7 transition-colors hover:bg-[#e8ffc4] sm:p-9"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#111315] text-white">
                <FileText className="h-5 w-5" />
              </span>
              <span className="mt-7 text-[clamp(28px,3.4vw,44px)] font-semibold leading-none">{copy.brieflyCta}</span>
              <span className="mt-4 max-w-xs text-[15px] leading-6 text-[#111315]/54">{copy.brieflyCtaBody}</span>
              <ArrowRight className="mt-auto h-5 w-5 transition-transform group-hover:translate-x-1" />

              <span className="absolute bottom-7 right-7 hidden h-[52%] w-[40%] rotate-2 bg-white p-[7%] shadow-[0_20px_45px_rgba(30,50,16,0.14)] sm:block">
                <span className="block h-[5px] w-[30%] bg-[#9ad7ff]" />
                <span className="mt-[10%] block h-[9px] w-[72%] bg-[#111315]" />
                <span className="mt-[7%] block h-[3px] w-full bg-[#111315]/14" />
                <span className="mt-[4%] block h-[3px] w-[78%] bg-[#111315]/14" />
                <span className="mt-[12%] grid grid-cols-3 gap-[5%]">
                  {[42, 76, 58].map((height) => (
                    <span key={height} className="flex aspect-square items-end bg-[#e7f2f7] p-[12%]">
                      <span className="block w-full bg-[#39708a]" style={{ height: `${height}%` }} />
                    </span>
                  ))}
                </span>
              </span>
            </Link>

            <Link
              href="/workspace/pitch"
              className="group relative flex min-h-[320px] flex-col overflow-hidden border-t border-[#111315]/20 bg-[#111315] p-7 text-white transition-colors hover:bg-black sm:p-9 lg:border-l lg:border-t-0"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#c4ee87] text-[#0a1a00]">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="mt-7 text-[clamp(28px,3.4vw,44px)] font-semibold leading-none">{copy.pitchCta}</span>
              <span className="mt-4 max-w-xs text-[15px] leading-6 text-white/48">{copy.pitchCtaBody}</span>
              <ArrowRight className="mt-auto h-5 w-5 text-white/62 transition-transform group-hover:translate-x-1 group-hover:text-white" />

              <span className="absolute bottom-7 right-7 hidden aspect-video w-[43%] -rotate-2 overflow-hidden border border-white/12 bg-[#8fcfff] shadow-[0_22px_50px_rgba(0,0,0,0.34)] sm:block">
                <span className="absolute -left-[7%] -top-[16%] h-[82%] w-[58%] rounded-full bg-[#ff6f8f]" />
                <span className="absolute left-[25%] top-[18%] h-[72%] w-[48%] rounded-full bg-[#7b5cff] mix-blend-multiply" />
                <span className="absolute right-[7%] top-[24%] h-[54%] w-[30%] rounded-full bg-[#c4ee87] mix-blend-multiply" />
                <span className="absolute bottom-[10%] right-[8%] h-[2px] w-[26%] bg-[#111315]/52" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
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
  title
}: {
  body: string;
  isZh: boolean;
  primaryCta: string;
  reduceMotion: boolean;
  secondaryCta: string;
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
      animate={{ backgroundColor: activeSlide === 0 ? "#0b0c0f" : activeSlide === 1 ? "#0e0d0d" : activeSlide === 2 ? "#090d10" : "#100a0d" }}
      transition={{ duration: 0.55 }}
      onPointerMove={updatePointer}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      className="relative flex min-h-[820px] items-center overflow-hidden px-4 pb-16 pt-28 text-white sm:px-6 lg:min-h-[min(880px,100dvh)] lg:px-8"
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
        <h1 className="mx-auto max-w-[900px] text-[clamp(48px,7vw,92px)] font-semibold leading-[0.98] tracking-normal [text-wrap:balance]">
          {title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-7 text-white/62 sm:text-lg">{body}</p>

        <div className="mx-auto mt-8 grid max-w-xl grid-cols-4 gap-2 lg:hidden" aria-label={isZh ? "投影片風格" : "Slide styles"}>
          {heroSlides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              aria-label={isZh ? `顯示 ${slide.label} 投影片` : `Show ${slide.label} slide`}
              aria-pressed={activeSlide === index}
              onClick={() => setActiveSlide(index)}
              className={`aspect-video overflow-hidden rounded-md border p-1 transition ${
                activeSlide === index ? "border-white/72 opacity-100" : "border-white/14 opacity-54"
              }`}
            >
              <SlideArtwork variant={slide.variant} background={slide.background} compact />
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/workspace/pitch"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#c4ee87] px-7 text-[15px] font-semibold text-[#0a1a00] transition-colors hover:bg-[#d7f5aa] sm:w-auto"
          >
            {primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#products"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-white/16 bg-white/[0.045] px-6 text-[14px] font-semibold text-white/72 transition-colors hover:border-white/30 hover:text-white sm:w-auto"
          >
            {secondaryCta}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
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

function ProductStory({
  body,
  href,
  imageSide,
  linkLabel,
  reveal,
  title,
  visual
}: {
  body: string;
  href: string;
  imageSide: "left" | "right";
  linkLabel: string;
  reveal: (delay?: number) => Record<string, unknown>;
  title: string;
  visual: React.ReactNode;
}) {
  const text = (
    <motion.div {...reveal()} className="self-center">
      <h3 className="max-w-xl text-[clamp(36px,4.8vw,60px)] font-semibold leading-[1.04] tracking-normal [text-wrap:balance]">
        {title}
      </h3>
      <p className="mt-6 max-w-xl text-lg leading-8 text-[#111315]/58">{body}</p>
      <Link
        href={href}
        className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#27647f] transition-colors hover:text-[#111315]"
      >
        {linkLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );

  const image = (
    <motion.div {...reveal(0.06)} className="overflow-hidden rounded-lg border border-[#111315]/10 bg-[#111416] p-2 shadow-[0_30px_90px_rgba(17,19,21,0.13)]">
      {visual}
    </motion.div>
  );

  return (
    <article className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
      {imageSide === "left" ? image : text}
      {imageSide === "left" ? text : image}
    </article>
  );
}

function BriefProductVisual({ isZh }: { isZh: boolean }) {
  const blocks = isZh ? ["目標與成功標準", "預期產出", "時程規劃", "決策紀錄"] : ["Goals and success", "Deliverables", "Timeline", "Decisions"];
  return (
    <div className="grid aspect-[16/10] grid-cols-[0.38fr_0.62fr] overflow-hidden rounded-md bg-[#0c0e10]">
      <div className="border-r border-white/10 p-[6%]">
        <div className="flex items-center gap-2 text-[clamp(8px,1vw,12px)] font-semibold text-white/78">
          <FileText className="h-[1.1em] w-[1.1em] text-[#9ad7ff]" />
          Briefly
        </div>
        <div className="mt-[16%] space-y-[5%]">
          {blocks.map((block, index) => (
            <div key={block} className={`flex items-center gap-2 rounded-sm px-[6%] py-[6%] text-[clamp(6px,0.78vw,10px)] ${index === 1 ? "bg-[#9ad7ff] text-[#071117]" : "bg-white/[0.055] text-white/50"}`}>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${index === 1 ? "bg-[#071117]" : "bg-white/24"}`} />
              <span className="truncate">{block}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#eaf3f6] p-[7%]">
        <div className="mx-auto h-full max-w-[88%] bg-white p-[8%] shadow-[0_18px_40px_rgba(15,30,38,0.12)]">
          <div className="h-[3%] w-[24%] bg-[#9ad7ff]" />
          <div className="mt-[8%] text-[clamp(9px,1.4vw,19px)] font-semibold text-[#111315]">{isZh ? "產品上市計畫" : "Product launch plan"}</div>
          <div className="mt-[5%] h-px bg-[#111315]/12" />
          <div className="mt-[8%] grid grid-cols-2 gap-[5%]">
            <div>
              <div className="h-[5px] w-[48%] bg-[#111315]/70" />
              <div className="mt-[9%] space-y-[5px]">
                <div className="h-[3px] w-full bg-[#111315]/14" />
                <div className="h-[3px] w-[78%] bg-[#111315]/14" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-[5%]">
              {[50, 82, 66].map((height) => <div key={height} className="self-end bg-[#9ad7ff]" style={{ height: `${height}%` }} />)}
            </div>
          </div>
          <div className="mt-[10%] grid grid-cols-3 gap-[3%]">
            {["A", "R", "C"].map((item) => <div key={item} className="flex aspect-square items-center justify-center rounded-full bg-[#111315] text-[clamp(5px,0.6vw,8px)] text-white">{item}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PitchProductVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="grid aspect-[16/10] grid-cols-[0.18fr_0.64fr_0.18fr] overflow-hidden rounded-md bg-[#08090a] text-white">
      <div className="border-r border-white/10 p-[7%]">
        <div className="flex items-center gap-1 text-[clamp(6px,0.75vw,10px)] text-white/54">
          <Layers3 className="h-[1em] w-[1em]" />
          {isZh ? "投影片" : "Slides"}
        </div>
        <div className="mt-[16%] space-y-[8%]">
          {(["mesh", "editorial", "signal"] as SlideVariant[]).map((variant, index) => (
            <div key={variant} className={`aspect-video rounded-sm border p-[3%] ${index === 0 ? "border-[#c4ee87]" : "border-white/10"}`}>
              <SlideArtwork variant={variant} background={index === 0 ? "#d8ff76" : index === 1 ? "#f2eee8" : "#ff6f8f"} compact />
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex items-center justify-center bg-[#050607] p-[8%]">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:14px_14px]" />
        <div className="relative aspect-video w-full border border-white/16 p-1 shadow-[0_20px_55px_rgba(0,0,0,0.55)]">
          <SlideArtwork variant="mesh" background="#d8ff76" />
        </div>
      </div>
      <div className="border-l border-white/10 p-[8%]">
        <div className="flex items-center gap-1 text-[clamp(6px,0.75vw,10px)] text-white/54">
          <Sparkles className="h-[1em] w-[1em] text-[#c4ee87]" />
          Shader
        </div>
        <div className="mt-[18%] space-y-[14%]">
          {[72, 46, 86, 58].map((value) => (
            <div key={value}>
              <div className="mb-[5%] h-[3px] w-[34%] bg-white/24" />
              <div className="h-[3px] bg-white/10">
                <div className="h-full bg-[#c4ee87]" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[22%] grid grid-cols-3 gap-[8%]">
          {["#ff7398", "#7b5cff", "#68dbe5"].map((color) => <span key={color} className="aspect-square rounded-full border border-white/20" style={{ backgroundColor: color }} />)}
        </div>
      </div>
    </div>
  );
}

type MaterialKey = "mesh" | "metal" | "water" | "paper";

const materials: {
  accent: string;
  background: string;
  foreground: string;
  key: MaterialKey;
  label: string;
  palette: string[];
}[] = [
  {
    accent: "#d8ff76",
    background: "radial-gradient(circle at 18% 22%, #ff7398 0 17%, transparent 42%), radial-gradient(circle at 68% 38%, #7b5cff 0 21%, transparent 49%), radial-gradient(circle at 76% 76%, #68dbe5 0 18%, transparent 45%), #d8ff76",
    foreground: "#111315",
    key: "mesh",
    label: "Mesh",
    palette: ["#d8ff76", "#ff7398", "#7b5cff", "#68dbe5"]
  },
  {
    accent: "#ff6f8f",
    background: "conic-gradient(from 225deg at 58% 52%, #f7f6f0, #17191c 17%, #8fcfff 31%, #f7f6f0 47%, #ff6f8f 63%, #17191c 79%, #f7f6f0)",
    foreground: "#111315",
    key: "metal",
    label: "Liquid Metal",
    palette: ["#f7f6f0", "#17191c", "#8fcfff", "#ff6f8f"]
  },
  {
    accent: "#8fcfff",
    background: "linear-gradient(138deg, #071b25 0%, #0e5367 25%, #8fcfff 46%, #e8f6f7 58%, #187890 73%, #071b25 100%)",
    foreground: "#f8fbfc",
    key: "water",
    label: "Water",
    palette: ["#071b25", "#187890", "#8fcfff", "#e8f6f7"]
  },
  {
    accent: "#f1eee8",
    background: "repeating-linear-gradient(8deg, rgba(17,19,21,0.04) 0 1px, transparent 1px 7px), linear-gradient(120deg, #f4f0e7, #ddd4c7)",
    foreground: "#111315",
    key: "paper",
    label: "Paper",
    palette: ["#f4f0e7", "#ddd4c7", "#111315", "#b94861"]
  }
];

function ShaderShowcase({
  body,
  isZh,
  reduceMotion,
  reveal,
  title
}: {
  body: string;
  isZh: boolean;
  reduceMotion: boolean;
  reveal: (delay?: number) => Record<string, unknown>;
  title: string;
}) {
  const [activeKey, setActiveKey] = useState<MaterialKey>("metal");
  const activeMaterial = materials.find((material) => material.key === activeKey) ?? materials[0];

  return (
    <section className="overflow-hidden bg-[#0a0b0d] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal()} className="grid gap-7 lg:grid-cols-[0.76fr_1fr] lg:items-end">
          <h2 className="max-w-3xl text-[clamp(40px,5.8vw,72px)] font-semibold leading-[1.02] tracking-normal [text-wrap:balance]">
            {title}
          </h2>
          <p className="max-w-xl text-lg leading-8 text-white/54 lg:justify-self-end">{body}</p>
        </motion.div>

        <motion.div {...reveal(0.06)} className="mt-14 grid overflow-hidden rounded-lg border border-white/12 bg-[#111315] lg:grid-cols-[0.24fr_0.76fr]">
          <div className="border-b border-white/10 p-3 lg:border-b-0 lg:border-r lg:p-5">
            <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1" role="tablist" aria-label={isZh ? "Shader 材質" : "Shader materials"}>
              {materials.map((material) => (
                <button
                  key={material.key}
                  type="button"
                  role="tab"
                  aria-selected={activeKey === material.key}
                  onClick={() => setActiveKey(material.key)}
                  className={`group flex min-h-16 items-center gap-3 rounded-md border px-3 text-left transition-colors lg:min-h-20 lg:px-4 ${
                    activeKey === material.key
                      ? "border-white/18 bg-white/[0.075] text-white"
                      : "border-transparent text-white/46 hover:bg-white/[0.04] hover:text-white/78"
                  }`}
                >
                  <span className="h-9 w-9 shrink-0 rounded-md border border-white/14 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]" style={{ background: material.background }} />
                  <span>
                    <span className="block text-[13px] font-semibold sm:text-sm">{material.label}</span>
                    <span className="mt-1 hidden text-[11px] text-white/30 lg:block">
                      {material.key === "mesh" ? "Color field" : material.key === "metal" ? "Reflective" : material.key === "water" ? "Fluid motion" : "Organic grain"}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 hidden border-t border-white/10 pt-5 lg:block">
              <p className="text-[11px] text-white/30">{isZh ? "目前色彩" : "Current palette"}</p>
              <div className="mt-3 flex gap-2">
                {activeMaterial.palette.map((color) => (
                  <span key={color} className="h-7 w-7 rounded-full border border-white/16" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid min-h-[440px] grid-rows-[auto_1fr] sm:min-h-[560px]">
            <div className="flex h-14 items-center border-b border-white/10 px-4 sm:px-5">
              <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: activeMaterial.accent }} />
              <span className="ml-2 text-xs font-medium text-white/58">Shader Studio</span>
              <span className="ml-auto text-[11px] text-white/28">Live preview</span>
            </div>

            <div className="grid min-h-0 lg:grid-cols-[0.76fr_0.24fr]">
              <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden p-5 sm:p-9 [background-image:radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:16px_16px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMaterial.key}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.975, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.34, ease: easeOut }}
                    className="relative aspect-video w-full max-w-[760px] overflow-hidden rounded-md shadow-[0_30px_80px_rgba(0,0,0,0.46)]"
                    style={{ background: activeMaterial.background, color: activeMaterial.foreground }}
                  >
                    <MaterialSlide material={activeMaterial.key} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="hidden border-l border-white/10 p-5 lg:block">
                <p className="text-xs font-semibold text-white/68">{activeMaterial.label}</p>
                <div className="mt-7 space-y-6">
                  {[
                    [isZh ? "強度" : "Intensity", 78],
                    [isZh ? "速度" : "Speed", activeMaterial.key === "paper" ? 12 : 46],
                    [isZh ? "尺度" : "Scale", 64],
                    [isZh ? "細節" : "Detail", 86]
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <div className="mb-2 flex justify-between text-[11px] text-white/32">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-1 bg-white/10">
                        <motion.div
                          key={`${activeMaterial.key}-${label}`}
                          initial={reduceMotion ? false : { width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 0.45, ease: easeOut }}
                          className="h-full"
                          style={{ backgroundColor: activeMaterial.accent }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MaterialSlide({ material }: { material: MaterialKey }) {
  if (material === "mesh") {
    return (
      <>
        <div className="absolute left-[7%] top-[10%] text-[clamp(14px,2.2vw,30px)] font-semibold">Signal in color.</div>
        <div className="absolute bottom-[11%] left-[8%] h-[2px] w-[22%] bg-[#111315]/55" />
        <div className="absolute bottom-[10%] right-[8%] grid w-[42%] grid-cols-3 gap-[4%]">
          {[68, 100, 82].map((height) => <span key={height} className="self-end bg-[#111315]/72" style={{ height: `${height / 2.2}px` }} />)}
        </div>
      </>
    );
  }

  if (material === "metal") {
    return (
      <>
        <div className="absolute left-[7%] top-[10%] max-w-[44%] text-[clamp(14px,2.2vw,30px)] font-semibold">A sharper first impression.</div>
        <div className="absolute bottom-[10%] left-[7%] text-[clamp(7px,0.9vw,12px)] font-medium text-[#111315]/56">LIQUID METAL / 02</div>
        <div className="absolute bottom-[10%] right-[8%] h-[44%] w-[36%] rotate-[-9deg] rounded-[18%] border border-black/20 bg-black/10 shadow-[0_18px_34px_rgba(22,25,28,0.24)] backdrop-blur-[3px]" />
      </>
    );
  }

  if (material === "water") {
    return (
      <>
        <div className="absolute inset-x-0 top-[28%] h-px bg-white/38" />
        <div className="absolute inset-x-0 top-[34%] h-px bg-white/18" />
        <div className="absolute left-[7%] top-[9%] text-[clamp(14px,2.2vw,30px)] font-semibold">Move with the current.</div>
        <div className="absolute bottom-[11%] right-[8%] flex items-end gap-2">
          {[22, 38, 29, 52].map((height) => <span key={height} className="w-2 bg-white/66" style={{ height }} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-y-[8%] left-[6%] w-[34%] bg-[#111315] p-[5%] text-[#f4f0e7]">
        <div className="text-[clamp(11px,1.8vw,24px)] font-semibold leading-tight">Quiet ideas, clearly framed.</div>
        <div className="mt-[16%] h-[2px] w-[58%] bg-[#f4f0e7]/42" />
      </div>
      <div className="absolute bottom-[12%] right-[8%] h-[48%] w-[43%] border-[3px] border-[#111315]">
        <div className="absolute bottom-[12%] right-[12%] h-[48%] w-[34%] rounded-full bg-[#b94861]" />
      </div>
    </>
  );
}
