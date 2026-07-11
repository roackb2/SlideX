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
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
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
    heroBody: isZh ? "從精確畫布到動態畫面，在同一個工作區完成。" : "From precise canvas to expressive slides, in one workspace.",
    primaryCta: isZh ? "開始製作" : "Start creating",
    secondaryCta: isZh ? "查看工作區" : "Explore workspace",
    featureSections: isZh
      ? [
          {
            eyebrow: "精確畫布",
            title: "讓內容留在你放置的位置。",
            body: "在同一個工作區管理投影片、圖層與畫布。從文字到資料元件，每個元素都能精確排列，播放與輸出時維持一致。",
            link: "進入 Pitch 工作區",
            visual: "canvas" as const
          },
          {
            eyebrow: "單色與動態",
            title: "先決定氣氛，再調整細節。",
            body: "使用單色 Fill 保持畫面安靜，或切換 Shader 加入動態材質。色彩、速度與強度都能在同一個面板完成。",
            link: "查看 Pitch 功能",
            visual: "shader" as const
          }
        ]
      : [
          {
            eyebrow: "Precise canvas",
            title: "Keep every element exactly where it belongs.",
            body: "Manage slides, layers, and the canvas in one workspace. Position text and data blocks precisely, then preserve the same composition in playback and export.",
            link: "Open the Pitch workspace",
            visual: "canvas" as const
          },
          {
            eyebrow: "Solid or dynamic",
            title: "Set the atmosphere before tuning the details.",
            body: "Use a solid Fill for a quiet canvas, or switch to a Shader for motion and material. Adjust color, speed, and intensity from the same panel.",
            link: "Explore Pitch features",
            visual: "shader" as const
          }
        ],
    materialsTitle: isZh ? "每個故事，都能有自己的材質。" : "Give every story its own material.",
    materialsBody: isZh ? "切換 shader、色彩與動態，不必重新設計整張投影片。" : "Switch shaders, color, and motion without rebuilding the slide.",
    faqTitle: isZh ? "常見問題，直接回答。" : "Questions, answered.",
    faqBody: isZh ? "關於 Pitch 的核心操作與工作方式。" : "The essentials about working in Pitch.",
    faqItems: isZh
      ? [
          ["SlideX 是什麼？", "SlideX 以 Pitch 為核心，讓你在精確畫布上建立、播放與輸出簡報。"],
          ["Pitch 有什麼不同？", "Pitch 把圖層、資料元件、動效與畫面材質整合到同一個編輯環境。"],
          ["可以切換靜態與動態背景嗎？", "可以。靜態模式使用單色 Fill，動態模式可選擇 shader 材質與對應設定。"],
          ["靜態背景如何調整？", "選擇一個單色 Fill 後，可以套用到單張投影片或整份 deck，文字對比會自動維持清楚。"],
          ["可以自訂 shader 嗎？", "可以。動態模式中可調整 shader 的色彩、強度、速度、尺度與細節。"],
          ["SlideX 適合哪些團隊？", "適合需要把複雜想法說清楚的產品團隊、創辦人、顧問與業務團隊。"]
        ]
      : [
          ["What is SlideX?", "SlideX is centered on Pitch, where you build, play, and export presentations on a precise canvas."],
          ["What makes Pitch different?", "Pitch brings layers, data blocks, motion, and visual materials into one editing environment."],
          ["Can I switch between static and dynamic backgrounds?", "Yes. Static mode uses a solid Fill. Dynamic mode lets you choose a shader material and its settings."],
          ["How does a static background work?", "Choose one solid Fill for a slide or the whole deck. Text contrast stays readable automatically."],
          ["Can I customize the shaders?", "Yes. In dynamic mode, adjust shader color, intensity, speed, scale, and detail to match the story."],
          ["Who is SlideX for?", "SlideX is built for product teams, founders, consultants, and sales teams that need to explain complex ideas clearly."]
        ],
    ctaTitle: isZh ? "下一個想法，從這裡成形。" : "Shape the next idea here.",
    ctaBody: isZh ? "從第一張投影片開始。" : "Start with the first slide.",
    pitchCta: isZh ? "開啟 Pitch" : "Open Pitch",
    pitchCtaBody: isZh ? "從第一張投影片開始，把畫面留給故事。" : "Start with the first slide and leave room for the story.",
    downloadCta: isZh ? "Mac 版正在製作中" : "Pitch for Mac is in progress",
    downloadCtaBody: isZh ? "網頁工作區現在可用。" : "The web workspace is ready today.",
    downloadLink: isZh ? "查看下載資訊" : "View download status"
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

      <FeatureStorySections items={copy.featureSections} reveal={reveal} />

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
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="mt-6 max-w-xl text-[clamp(25px,3.4vw,42px)] font-semibold leading-[0.98]">{copy.pitchCta}</p>
              <p className="mt-3 max-w-md text-[15px] leading-6 text-white/48">{copy.pitchCtaBody}</p>
              <Link href="/workspace/pitch" className="group mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-[#111315] transition-colors hover:bg-[#f2eee8]">
                {isZh ? "開啟工作區" : "Open workspace"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="flex flex-col justify-between border-t border-white/12 p-7 sm:p-9 lg:border-l lg:border-t-0">
              <div>
                <p className="text-[14px] font-semibold text-[#c4ee87]">{copy.downloadCta}</p>
                <p className="mt-3 max-w-sm text-[15px] leading-6 text-white/48">{copy.downloadCtaBody}</p>
              </div>
              <Link href={localePath("/download")} className="group mt-9 inline-flex h-11 w-fit items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#c4ee87]">
                {copy.downloadLink}
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
  visual: "canvas" | "shader";
};

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
                href={index === 0 ? "/workspace/pitch" : "#workspace"}
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
                <AnimatedFeatureSvg variant={item.visual} />
              </div>
            </motion.div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AnimatedFeatureSvg({ variant }: { variant: "canvas" | "shader" }) {
  const reduceMotion = useReducedMotion();
  const transition = { duration: 5, ease: "easeInOut" as const, repeat: Infinity, repeatType: "mirror" as const };

  return (
    <svg aria-label={variant === "canvas" ? "Animated Pitch canvas" : "Animated Pitch shader controls"} className="h-full w-full" role="img" viewBox="0 0 800 500">
      <defs>
        <radialGradient id={`feature-bg-${variant}`} cx="32%" cy="28%" r="90%">
          <stop stopColor={variant === "canvas" ? "#f4f4f1" : "#dff2ff"} />
          <stop offset="0.55" stopColor={variant === "canvas" ? "#d8ff76" : "#8176ff"} />
          <stop offset="1" stopColor={variant === "canvas" ? "#9ad7ff" : "#111315"} />
        </radialGradient>
        <pattern id={`feature-grid-${variant}`} height="16" patternUnits="userSpaceOnUse" width="16">
          <circle cx="1" cy="1" fill="#fff" opacity=".12" r="1" />
        </pattern>
      </defs>
      <rect fill="#0a0b0d" height="500" width="800" />
      <rect fill={`url(#feature-grid-${variant})`} height="500" width="800" />
      <rect fill="#15171a" height="48" width="800" />
      <circle cx="25" cy="24" fill="#c4ee87" r="5" />
      <rect fill="#fff" height="7" opacity=".75" rx="3.5" width="58" x="42" y="20" />
      <rect fill="#fff" height="22" opacity=".08" rx="6" width="76" x="116" y="13" />
      <rect fill="#fff" height="22" opacity=".86" rx="6" width="66" x="714" y="13" />

      <rect fill="#111315" height="452" width="142" y="48" />
      <rect fill="#15171a" height="452" width="164" x="636" y="48" />
      {[0, 1, 2].map((item) => (
        <motion.g animate={reduceMotion ? undefined : { opacity: [.45, item === 0 ? 1 : .68, .45] }} key={item} transition={{ ...transition, delay: item * .35 }}>
          <rect fill="#fff" height="72" opacity=".06" rx="6" width="110" x="16" y={88 + item * 86} />
          <rect fill={item === 0 ? `url(#feature-bg-${variant})` : "#2a2d32"} height="48" rx="3" width="86" x="28" y={99 + item * 86} />
          <rect fill="#fff" height="5" opacity=".3" rx="2.5" width="44" x="28" y={155 + item * 86} />
        </motion.g>
      ))}

      <rect fill="#050608" height="326" rx="8" width="458" x="160" y="82" />
      <motion.rect animate={reduceMotion ? undefined : { opacity: [.82, 1, .82] }} fill={`url(#feature-bg-${variant})`} height="252" rx="4" transition={transition} width="414" x="182" y="113" />
      {variant === "canvas" ? (
        <motion.g animate={reduceMotion ? undefined : { x: [0, 26, 0], y: [0, 12, 0] }} transition={transition}>
          <rect fill="#111315" height="26" rx="3" width="142" x="218" y="162" />
          <rect fill="#111315" height="8" opacity=".52" rx="4" width="206" x="218" y="203" />
          <rect fill="#111315" height="8" opacity=".26" rx="4" width="156" x="218" y="221" />
          <rect fill="none" height="86" rx="3" stroke="#8176ff" strokeDasharray="6 4" strokeWidth="2" width="238" x="205" y="149" />
          {[[205,149],[443,149],[205,235],[443,235]].map(([cx, cy]) => <circle cx={cx} cy={cy} fill="#fff" key={`${cx}-${cy}`} r="4" stroke="#8176ff" strokeWidth="2" />)}
        </motion.g>
      ) : (
        <>
          <motion.circle animate={reduceMotion ? undefined : { cx: [330, 450, 330], cy: [220, 260, 220], r: [76, 118, 76] }} cx="330" cy="220" fill="#fff" opacity=".24" r="76" transition={transition} />
          <motion.path animate={reduceMotion ? undefined : { d: ["M190 292 C290 170 410 342 586 174", "M190 232 C306 354 432 142 586 250", "M190 292 C290 170 410 342 586 174"] }} fill="none" stroke="#fff" strokeLinecap="round" strokeOpacity=".7" strokeWidth="4" transition={transition} />
          <rect fill="#fff" height="22" opacity=".9" rx="3" width="164" x="214" y="148" />
          <rect fill="#fff" height="7" opacity=".5" rx="3.5" width="108" x="214" y="181" />
        </>
      )}

      <rect fill="#fff" height="7" opacity=".6" rx="3.5" width="54" x="658" y="76" />
      <rect fill="#050608" height="42" rx="6" width="120" x="658" y="98" />
      <motion.rect animate={reduceMotion ? undefined : { x: variant === "shader" ? [0, 68, 0] : [68, 0, 68] }} fill={variant === "shader" ? "#9ad7ff" : "#f4f4f1"} height="22" rx="4" transition={transition} width="44" x="666" y="108" />
      {[0, 1, 2, 3].map((item) => (
        <g key={item}>
          <rect fill="#fff" height="6" opacity=".28" rx="3" width={52 + item * 5} x="658" y={168 + item * 54} />
          <rect fill="#fff" height="4" opacity=".1" rx="2" width="120" x="658" y={189 + item * 54} />
          <motion.rect animate={reduceMotion ? undefined : { width: [36 + item * 8, 88 - item * 4, 36 + item * 8] }} fill={item === 1 ? "#c4ee87" : "#9ad7ff"} height="4" rx="2" transition={{ ...transition, delay: item * .2 }} width="50" x="658" y={189 + item * 54} />
        </g>
      ))}
    </svg>
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
      className="relative flex min-h-[620px] items-center overflow-hidden px-5 pb-14 pt-32 text-white sm:min-h-[680px] sm:px-6 lg:min-h-[min(880px,100dvh)] lg:px-8 lg:pb-16 lg:pt-28"
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
        <h1 className="mx-auto max-w-[900px] text-[42px] font-semibold leading-[0.98] tracking-[-0.035em] [text-wrap:balance] sm:text-[54px] lg:text-[clamp(48px,7vw,92px)] lg:tracking-normal">
          {title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[16px] leading-7 text-white/58 sm:mt-6 sm:max-w-xl sm:text-lg">{body}</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/workspace/pitch"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#c4ee87] px-7 text-[15px] font-semibold text-[#0a1a00] transition-colors hover:bg-[#d7f5aa] sm:w-auto"
          >
            {primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#workspace"
            className="hidden h-12 w-full items-center justify-center gap-2 rounded-md border border-white/16 bg-white/[0.045] px-6 text-[14px] font-semibold text-white/72 transition-colors hover:border-white/30 hover:text-white sm:w-auto lg:inline-flex"
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
    <section id="workspace" className="overflow-hidden bg-[#0a0b0d] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-36">
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
