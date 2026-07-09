"use client";

import { useState, type PointerEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from "framer-motion";
import { ArrowRight, FileText, Layers3, Sparkles } from "lucide-react";
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
    introTitle: isZh ? "先說清楚，再做精彩。" : "Get clear. Then make it shine.",
    introBody: isZh ? "Briefly 整理專案；Pitch 把故事做成畫面。" : "Briefly shapes the project. Pitch turns the story into slides.",
    briefTitle: isZh ? "把散落的想法，整理成一份好 brief。" : "Turn scattered thinking into one clear brief.",
    briefBody: isZh ? "組合目標、受眾、範圍、時程與決策，邊編輯邊看完整文件。" : "Combine goals, audience, scope, timing, and decisions while the document takes shape live.",
    briefLink: isZh ? "認識 Briefly" : "Explore Briefly",
    pitchTitle: isZh ? "把簡報，做成一場視覺體驗。" : "Turn a deck into a visual experience.",
    pitchBody: isZh ? "在精確畫布上使用即時 shader、圖層、資料元件與動效。" : "Use live shaders, layers, data blocks, and motion on a precise canvas.",
    pitchLink: isZh ? "認識 Pitch" : "Explore Pitch",
    ctaTitle: isZh ? "下一個想法，從這裡成形。" : "Shape the next idea here.",
    ctaBody: isZh ? "先整理內容，或直接開始做簡報。" : "Start with the brief, or go straight to the slides.",
    brieflyCta: isZh ? "開啟 Briefly" : "Open Briefly",
    pitchCta: isZh ? "開啟 Pitch" : "Open Pitch"
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
          <motion.div {...reveal()} className="grid gap-7 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <h2 className="max-w-3xl text-[clamp(40px,5.8vw,72px)] font-semibold leading-[1.02] tracking-normal [text-wrap:balance]">
              {copy.introTitle}
            </h2>
            <p className="max-w-xl text-lg leading-8 text-[#111315]/58 lg:justify-self-end">{copy.introBody}</p>
          </motion.div>

          <div className="mt-24 space-y-28 lg:mt-36 lg:space-y-40">
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

      <section className="bg-[#c4ee87] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <motion.div {...reveal()} className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="max-w-4xl text-[clamp(42px,6vw,76px)] font-semibold leading-[1] tracking-normal [text-wrap:balance]">
              {copy.ctaTitle}
            </h2>
            <p className="mt-6 text-lg text-[#111315]/60">{copy.ctaBody}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/workspace/briefly"
              className="group inline-flex h-13 items-center justify-center gap-3 rounded-md border border-[#111315]/20 px-6 text-[15px] font-semibold transition-colors hover:bg-white/45"
            >
              {copy.brieflyCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/workspace/pitch"
              className="group inline-flex h-13 items-center justify-center gap-3 rounded-md bg-[#111315] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-black"
            >
              {copy.pitchCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
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
