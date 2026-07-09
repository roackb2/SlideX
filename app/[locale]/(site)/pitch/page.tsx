"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Image as ImageIcon,
  Layers3,
  Play,
  Shapes,
  Table2,
  Type,
  Video
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

const easeOut = [0.16, 1, 0.3, 1] as const;

type PitchTool = {
  body: string;
  icon: LucideIcon;
  title: string;
};

export default function PitchLandingPage() {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";

  const copy = {
    heroTitle: isZh ? ["把每一頁，", "做成動態視覺。"] : ["Make every slide", "move with purpose."],
    heroBody: isZh
      ? "精確畫布、12 種即時 shader、圖層與動效，一個工作區完成。"
      : "A precise canvas, 12 live shaders, layers, and motion in one workspace.",
    primaryCta: isZh ? "開始製作" : "Start creating",
    secondaryCta: isZh ? "探索功能" : "Explore features",
    introTitle: isZh ? "簡報編輯器，也是一座動態視覺工作室。" : "A slide editor built like a motion studio.",
    introBody: isZh
      ? "從空白頁或範本開始，直接控制每個元素的位置、材質與進場節奏。"
      : "Start from a blank slide or template, then control the position, material, and entrance of every element.",
    features: isZh
      ? [
          {
            title: "用即時 shader 定義氣氛。",
            body: "選擇 Mesh、Liquid Metal、Water 等 12 種材質，再調整色彩、速度、尺度、扭曲與細節。"
          },
          {
            title: "在精確畫布上自由編排。",
            body: "拖曳、縮放、框選、鎖定與排序圖層；格線、對齊與版面配置讓複雜畫面依然可控。"
          },
          {
            title: "用節奏引導觀眾視線。",
            body: "為元素設定進場、延遲與時長，再用頁面轉場串起整份簡報，隨時 Replay 檢查效果。"
          },
          {
            title: "文字、媒體與資料都能直接編輯。",
            body: "加入圖片、影片、圖示、表格與五種圖表，不必離開畫布來回搬運內容。"
          }
        ]
      : [
          {
            title: "Set the mood with live shaders.",
            body: "Choose from 12 materials including Mesh, Liquid Metal, and Water, then tune color, speed, scale, distortion, and detail."
          },
          {
            title: "Compose freely on a precise canvas.",
            body: "Drag, resize, marquee-select, lock, and reorder layers with grids, alignment tools, and ready-made layouts."
          },
          {
            title: "Guide attention with motion.",
            body: "Set entrances, delays, and durations, connect slides with transitions, and replay the complete rhythm at any time."
          },
          {
            title: "Edit text, media, and data in place.",
            body: "Add images, video, icons, tables, and five chart types without leaving the canvas."
          }
        ],
    toolkitTitle: isZh ? "做簡報需要的工具，都在畫布旁。" : "Everything you need stays close to the canvas.",
    toolkitBody: isZh ? "保持設計控制，也保持製作速度。" : "Keep full design control without slowing down.",
    tools: (isZh
      ? [
          { title: "文字與字體", body: "字級、字重、對齊與 Google Fonts。", icon: Type },
          { title: "圖片與影片", body: "裁切、填滿、濾鏡與全版媒體。", icon: Video },
          { title: "圖表與表格", body: "五種圖表與可直接編輯的欄列。", icon: BarChart3 },
          { title: "圖示與形狀", body: "快速建立視覺層級與資訊標記。", icon: Shapes },
          { title: "圖層管理", body: "排序、複製、鎖定與多選。", icon: Layers3 },
          { title: "播放與 Replay", body: "檢查 shader、進場與轉場。", icon: Play }
        ]
      : [
          { title: "Text and type", body: "Size, weight, alignment, and Google Fonts.", icon: Type },
          { title: "Images and video", body: "Crop, fit, filters, and full-slide media.", icon: ImageIcon },
          { title: "Charts and tables", body: "Five chart types and editable rows and columns.", icon: BarChart3 },
          { title: "Icons and shapes", body: "Build hierarchy and visual markers quickly.", icon: Shapes },
          { title: "Layer management", body: "Reorder, duplicate, lock, and multi-select.", icon: Layers3 },
          { title: "Playback and replay", body: "Review shaders, entrances, and transitions.", icon: Play }
        ]) satisfies PitchTool[],
    shaderTitle: isZh ? "12 種即時材質，從安靜到強烈。" : "Twelve live materials, from quiet to bold.",
    shaderNames: [
      "Mesh Gradient",
      "Static Mesh",
      "Swirl",
      "Dot Orbit",
      "God Rays",
      "Neuro Noise",
      "Liquid Metal",
      "Grain Gradient",
      "Metaballs",
      "Paper Texture",
      "Water",
      "Dithering"
    ],
    ctaTitle: isZh ? "讓下一份簡報，第一眼就成立。" : "Make the next deck land at first sight.",
    ctaBody: isZh ? "打開 Pitch，從第一張投影片開始。" : "Open Pitch and start with the first slide.",
    ctaButton: isZh ? "開始 Pitch" : "Start Pitch"
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
    <main className="min-h-[100dvh] overflow-hidden bg-white text-[#111315] selection:bg-[#9ad7ff]/45">
      <section className="relative flex min-h-[820px] items-end overflow-hidden px-4 pb-16 pt-28 text-white sm:px-6 lg:min-h-[min(880px,100dvh)] lg:px-8 lg:pb-20">
        <Image
          src="/images/slidex-editor-hero.png"
          alt={isZh ? "SlideX Pitch 編輯器工作區" : "SlideX Pitch editor workspace"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,7,0.98)_0%,rgba(5,6,7,0.82)_44%,rgba(5,6,7,0.2)_82%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,7,0.18)_0%,rgba(5,6,7,0.12)_48%,rgba(5,6,7,0.9)_100%)]" />

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.82, ease: easeOut }}
          className="relative z-10 mx-auto w-full max-w-7xl"
        >
          <h1 className="max-w-[920px] text-[clamp(40px,7.2vw,92px)] font-semibold leading-[0.98] tracking-normal [text-wrap:balance]">
            {copy.heroTitle.map((line) => <span key={line} className="block">{line}</span>)}
          </h1>
          <p className="mt-7 max-w-xl text-[17px] leading-8 text-white/68 sm:text-xl">{copy.heroBody}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/workspace/pitch" className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-md bg-[#c4ee87] px-7 text-[15px] font-semibold text-[#0a1a00] transition-colors hover:bg-[#d7f5aa] sm:w-auto">
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#pitch-features" className="inline-flex h-13 w-full items-center justify-center rounded-md border border-white/18 bg-black/24 px-7 text-[15px] font-semibold text-white/76 backdrop-blur-md transition-colors hover:border-white/36 hover:text-white sm:w-auto">
              {copy.secondaryCta}
            </a>
          </div>
        </motion.div>
      </section>

      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <motion.div {...reveal()} className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <h2 className="max-w-3xl text-[clamp(40px,5.8vw,72px)] font-semibold leading-[1.02] tracking-normal [text-wrap:balance]">
            {copy.introTitle}
          </h2>
          <p className="max-w-xl text-lg leading-8 text-[#111315]/58 lg:justify-self-end">{copy.introBody}</p>
        </motion.div>
      </section>

      <section id="pitch-features" className="bg-[#f7f7f4] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl space-y-28 lg:space-y-40">
          <FeatureShowcase {...copy.features[0]} side="right" reveal={reveal} visual={<ShaderStudioVisual isZh={isZh} />} />
          <FeatureShowcase {...copy.features[1]} side="left" reveal={reveal} visual={<CanvasVisual isZh={isZh} />} />
          <FeatureShowcase {...copy.features[2]} side="right" reveal={reveal} visual={<MotionTimelineVisual isZh={isZh} />} />
          <FeatureShowcase {...copy.features[3]} side="left" reveal={reveal} visual={<DataBlocksVisual isZh={isZh} />} />
        </div>
      </section>

      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="grid gap-7 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <h2 className="max-w-3xl text-[clamp(38px,5vw,64px)] font-semibold leading-[1.04] tracking-normal [text-wrap:balance]">
              {copy.toolkitTitle}
            </h2>
            <p className="max-w-xl text-lg leading-8 text-[#111315]/58 lg:justify-self-end">{copy.toolkitBody}</p>
          </motion.div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-lg bg-[#111315]/10 md:grid-cols-2 lg:grid-cols-3">
            {copy.tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.article key={tool.title} {...reveal(index * 0.035)} className="min-h-52 bg-[#f7f7f4] p-7 transition-colors hover:bg-[#eef7fb] sm:p-8">
                  <Icon className="h-6 w-6 text-[#39708a]" strokeWidth={1.7} />
                  <h3 className="mt-10 text-2xl font-semibold">{tool.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#111315]/56">{tool.body}</p>
                </motion.article>
              );
            })}
          </div>

          <motion.div {...reveal(0.06)} className="mt-24 grid gap-12 lg:grid-cols-[0.68fr_1fr] lg:items-start">
            <h3 className="max-w-xl text-[clamp(34px,4.7vw,56px)] font-semibold leading-[1.04] [text-wrap:balance]">{copy.shaderTitle}</h3>
            <div className="grid border-t border-[#111315]/14 sm:grid-cols-2 lg:grid-cols-3">
              {copy.shaderNames.map((name) => (
                <div key={name} className="flex min-h-14 items-center border-b border-[#111315]/14 py-4 text-sm font-medium text-[#111315]/68 sm:px-5 sm:odd:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n+1)]:pl-0">
                  {name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#0a0b0d] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-28">
        <motion.div {...reveal()} className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="max-w-4xl text-[clamp(42px,6vw,76px)] font-semibold leading-[1] tracking-normal [text-wrap:balance]">{copy.ctaTitle}</h2>
            <p className="mt-6 text-lg text-white/56">{copy.ctaBody}</p>
          </div>
          <Link href="/workspace/pitch" className="group inline-flex h-14 items-center justify-center gap-3 rounded-md bg-[#c4ee87] px-8 text-[15px] font-semibold text-[#0a1a00] transition-colors hover:bg-[#d7f5aa]">
            {copy.ctaButton}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}

function FeatureShowcase({
  body,
  reveal,
  side,
  title,
  visual
}: {
  body: string;
  reveal: (delay?: number) => Record<string, unknown>;
  side: "left" | "right";
  title: string;
  visual: React.ReactNode;
}) {
  const text = (
    <motion.div {...reveal()} className="self-center">
      <h2 className="max-w-xl text-[clamp(36px,4.8vw,60px)] font-semibold leading-[1.04] tracking-normal [text-wrap:balance]">{title}</h2>
      <p className="mt-6 max-w-xl text-lg leading-8 text-[#111315]/58">{body}</p>
    </motion.div>
  );
  const image = (
    <motion.div {...reveal(0.06)} className="overflow-hidden rounded-lg border border-[#111315]/10 bg-[#111416] p-2 shadow-[0_30px_90px_rgba(17,19,21,0.13)]">
      {visual}
    </motion.div>
  );
  return (
    <article className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
      {side === "left" ? image : text}
      {side === "left" ? text : image}
    </article>
  );
}

function ShaderStudioVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-[#08090a]">
      <Image src="/images/pitch-shader-workspace.png" alt={isZh ? "Pitch shader 控制工作區" : "Pitch shader controls"} fill sizes="(max-width: 1024px) 100vw, 56vw" className="object-cover" />
    </div>
  );
}

function CanvasVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="grid aspect-[16/10] grid-cols-[0.2fr_0.6fr_0.2fr] overflow-hidden rounded-md bg-[#060708] text-white">
      <div className="border-r border-white/10 p-[8%]">
        <div className="text-[clamp(6px,0.8vw,10px)] text-white/44">{isZh ? "圖層" : "Layers"}</div>
        <div className="mt-[18%] space-y-[7%]">
          {[Type, ImageIcon, Shapes, Table2].map((Icon, index) => (
            <div key={index} className={`flex items-center gap-2 rounded-sm px-[7%] py-[8%] text-[clamp(6px,0.76vw,9px)] ${index === 1 ? "bg-white/12 text-white" : "text-white/38"}`}>
              <Icon className="h-[1.1em] w-[1.1em]" />
              <span>{["Title", "Visual", "Shape", "Table"][index]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex items-center justify-center p-[8%] [background-image:radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:14px_14px]">
        <div className="relative aspect-video w-full overflow-hidden bg-[#e6f1f5] p-[8%] shadow-[0_20px_55px_rgba(0,0,0,0.5)]">
          <div className="h-[16%] w-[58%] bg-[#111315]" />
          <div className="mt-[6%] h-[4%] w-[42%] bg-[#111315]/25" />
          <div className="absolute bottom-[10%] right-[8%] grid h-[42%] w-[44%] grid-cols-4 items-end gap-[6%]">
            {[40, 74, 56, 92].map((height, index) => <div key={height} className={index === 3 ? "bg-[#ff6f8f]" : "bg-[#111315]/25"} style={{ height: `${height}%` }} />)}
          </div>
          <div className="absolute inset-[5%] border border-[#0f8cff]">
            <span className="absolute -left-1 -top-1 h-2 w-2 bg-white ring-1 ring-[#0f8cff]" />
            <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-white ring-1 ring-[#0f8cff]" />
          </div>
        </div>
      </div>
      <div className="border-l border-white/10 p-[8%]">
        <div className="text-[clamp(6px,0.8vw,10px)] text-white/44">{isZh ? "位置" : "Position"}</div>
        <div className="mt-[18%] grid grid-cols-2 gap-[7%]">
          {["X", "Y", "W", "H"].map((item, index) => <div key={item} className="bg-white/[0.055] p-[12%] text-[clamp(5px,0.65vw,8px)] text-white/40">{item} <span className="float-right text-white/72">{[72, 48, 680, 382][index]}</span></div>)}
        </div>
        <div className="mt-[20%] h-px bg-white/10" />
        <div className="mt-[12%] space-y-[9%]">
          {[62, 82, 48].map((width) => <div key={width} className="h-[4px] bg-white/10"><div className="h-full bg-[#9ad7ff]" style={{ width: `${width}%` }} /></div>)}
        </div>
      </div>
    </div>
  );
}

function MotionTimelineVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="grid aspect-[16/10] grid-rows-[0.68fr_0.32fr] overflow-hidden rounded-md bg-[#0a0b0d] text-white">
      <div className="flex items-center justify-center p-[7%]">
        <div className="relative aspect-video w-[74%] overflow-hidden bg-[#f1eee8] p-[8%]">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.7 }} className="h-[18%] w-[52%] bg-[#111315]" />
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false }} transition={{ delay: 0.18, duration: 0.7 }} className="mt-[6%] h-[4%] w-[38%] bg-[#111315]/25" />
          <motion.div initial={{ scale: 0.7, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: false }} transition={{ delay: 0.28, duration: 0.65 }} className="absolute bottom-[12%] right-[10%] h-[44%] w-[28%] rounded-full bg-[#7b5cff]" />
        </div>
      </div>
      <div className="border-t border-white/10 p-[4%]">
        <div className="mb-[5%] flex justify-between text-[clamp(6px,0.75vw,10px)] text-white/38">
          <span>{isZh ? "動畫時間軸" : "Motion timeline"}</span>
          <span>4.0s</span>
        </div>
        <div className="space-y-[5%]">
          {[
            ["Title", 12, 54, "#c4ee87"],
            ["Body", 28, 46, "#9ad7ff"],
            ["Shape", 43, 38, "#ff6f8f"]
          ].map(([label, left, width, color]) => (
            <div key={label} className="grid grid-cols-[0.18fr_0.82fr] items-center gap-[3%]">
              <span className="text-[clamp(5px,0.65vw,8px)] text-white/42">{label}</span>
              <div className="relative h-[5px] bg-white/[0.055]">
                <span className="absolute h-full" style={{ left: `${left}%`, width: `${width}%`, backgroundColor: String(color) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataBlocksVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="grid aspect-[16/10] grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-md bg-white/10 text-white">
      <div className="bg-[#101214] p-[8%]">
        <div className="flex items-center gap-2 text-[clamp(7px,0.9vw,12px)] text-white/46"><BarChart3 className="h-[1.2em] w-[1.2em]" />{isZh ? "圖表" : "Charts"}</div>
        <div className="mt-[12%] flex h-[56%] items-end gap-[5%]">
          {[45, 76, 58, 92, 68].map((height, index) => <div key={height} className={index === 3 ? "flex-1 bg-[#c4ee87]" : "flex-1 bg-white/18"} style={{ height: `${height}%` }} />)}
        </div>
      </div>
      <div className="bg-[#f1eee8] p-[8%] text-[#111315]">
        <div className="flex items-center gap-2 text-[clamp(7px,0.9vw,12px)] text-[#111315]/46"><Table2 className="h-[1.2em] w-[1.2em]" />{isZh ? "表格" : "Tables"}</div>
        <div className="mt-[12%] grid grid-cols-3 gap-px bg-[#111315]/12">
          {Array.from({ length: 12 }).map((_, index) => <span key={index} className={`aspect-[3/1] ${index < 3 ? "bg-[#9ad7ff]" : "bg-white"}`} />)}
        </div>
      </div>
      <div className="bg-[#8fcfff] p-[8%] text-[#111315]">
        <div className="flex items-center gap-2 text-[clamp(7px,0.9vw,12px)] text-[#111315]/52"><ImageIcon className="h-[1.2em] w-[1.2em]" />{isZh ? "圖片" : "Images"}</div>
        <div className="relative mt-[10%] h-[56%] overflow-hidden bg-[#111315]">
          <div className="absolute -bottom-[24%] -left-[5%] h-[105%] w-[56%] rounded-full bg-[#ff6f8f]" />
          <div className="absolute -right-[4%] top-[10%] h-[84%] w-[48%] rounded-full bg-[#c4ee87]" />
        </div>
      </div>
      <div className="bg-[#101214] p-[8%]">
        <div className="flex items-center gap-2 text-[clamp(7px,0.9vw,12px)] text-white/46"><Type className="h-[1.2em] w-[1.2em]" />{isZh ? "文字" : "Type"}</div>
        <div className="mt-[12%] text-[clamp(17px,2.5vw,34px)] font-semibold leading-none">Aa</div>
        <div className="mt-[8%] flex gap-[4%]">
          {["Regular", "Medium", "Bold"].map((weight) => <span key={weight} className="text-[clamp(5px,0.65vw,8px)] text-white/42">{weight}</span>)}
        </div>
      </div>
    </div>
  );
}
