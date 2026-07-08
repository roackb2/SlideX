"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/common/lib/I18nProvider";

const easeOut = [0.16, 1, 0.3, 1] as const;

type PitchWorkflowStep = {
  body: string;
  label: string;
  title: string;
};

type PitchUseCase = {
  body: string;
  title: string;
};

type BentoFeature = {
  body: string;
  codeLabel?: string;
  codeTitle?: string;
  title: string;
};

export default function PitchLandingPage() {
  const { t, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const page = t.pitchPage;
  const isZh = locale === "zh-TW";

  const copy = {
    kicker: isZh ? "Pitch workspace" : "Pitch workspace",
    secondaryCta: isZh ? "看工作流" : "See workflow",
    productLabel: isZh ? "真實工作區預覽" : "Live workspace preview",
    trustLabel: isZh ? "為會持續修改的提案而做" : "Built for decks that keep changing",
    heroTitle: isZh ? "製作高質感動態簡報。" : "Build polished motion decks.",
    heroBody: isZh
      ? "在同一個專注工作區裡撰寫故事、調整畫面、預覽動效，讓提案從草稿到會議現場都保持一致。"
      : "Write the story, shape the canvas, and preview motion in one focused workspace so the pitch stays coherent from draft to meeting.",
    stats: isZh
      ? [
          ["可編輯結構", "文案、頁面與動效保留清楚的工作脈絡。"],
          ["即時預覽", "在同一個工作區檢查畫布、圖層與時間。"],
          ["會議就緒", "從內部審閱到正式提案都維持同一套故事。"]
        ]
      : [
          ["Editable structure", "Copy, slides, and motion keep a clear working context."],
          ["Live preview", "Check canvas, layers, and timing in one workspace."],
          ["Meeting ready", "Keep one story from internal review to final pitch."]
        ],
    formatEyebrow: isZh ? "WORKSPACE" : "WORKSPACE",
    formatTitle: isZh ? "一個工作區完成提案的核心節奏。" : "One workspace for the rhythm of a pitch.",
    formatBody: isZh
      ? "Pitch 把敘事、畫布、時間軸與審閱放在一起，讓你不用在多個工具之間重建同一份簡報。"
      : "Pitch keeps narrative, canvas, timing, and review together so the deck does not get rebuilt across tools.",
    mdxTitle: isZh ? "敘事畫布" : "Narrative canvas",
    mdxBody: isZh ? "從大綱、文案到每一頁的焦點，都能在同一個脈絡中調整。" : "Tune the outline, copy, and focus of each slide in one context.",
    htmlTitle: isZh ? "動態導演" : "Motion direction",
    htmlBody: isZh ? "用時間、圖層與節奏控制畫面，而不是在最後才補動畫。" : "Control timing, layers, and pacing while the deck is still being shaped.",
    toolkitEyebrow: isZh ? "TOOLKIT" : "TOOLKIT",
    toolkitTitle: isZh ? "專為動態簡報打造的製作系統。" : "A production system for motion decks.",
    workflowTitle: isZh ? "從草稿到會議的一條流程。" : "One loop from draft to meeting.",
    workflowBody: isZh
      ? "Pitch 讓書寫內容、視覺結構、動畫時間軸與團隊審閱一起前進。"
      : "Pitch keeps the written story, visual structure, animation timing, and team review moving together.",
    workflowSteps: isZh
      ? [
          { label: "01", title: "整理提案故事", body: "先把目標、受眾、證據與下一步放進清楚的簡報骨架。" },
          { label: "02", title: "調整畫面節奏", body: "在同一個畫布中調整位置、顏色、圖層與時間，讓動效服務敘事。" },
          { label: "03", title: "帶進審閱與會議", body: "讓團隊對齊同一份故事，再進入客戶簡報、內部決策或上市會議。" }
        ]
      : [
          { label: "01", title: "Shape the story", body: "Bring the goal, audience, proof, and next move into a clear deck structure." },
          { label: "02", title: "Tune the rhythm", body: "Adjust position, color, layers, and timing on the same canvas so motion serves the narrative." },
          { label: "03", title: "Move into review", body: "Align the team around one story before client pitches, internal decisions, or launches." }
        ],
    toolkitItems: isZh
      ? [
          { title: "可編輯敘事", body: "從標題、證據到決策頁都保留清楚結構，方便團隊反覆調整。" },
          { title: "即時動效預覽", body: "在同一個工作區重播時間、圖層進場與敘事節奏。" },
          { title: "範本化版面", body: "從實用的投影片結構開始，讓整份提案維持一致的視覺邏輯。" }
        ]
      : [
          { title: "Editable narrative", body: "Keep headlines, proof, and decision pages structured so the team can keep refining." },
          { title: "Live motion preview", body: "Replay timing, layer entrances, and pacing in the same workspace." },
          { title: "Template-backed layouts", body: "Start from useful slide structures and keep the whole pitch visually consistent." }
        ],
    useCasesEyebrow: isZh ? "USE CASES" : "USE CASES",
    useCases: isZh
      ? [
          { title: "業務檢討", body: "把指標、風險與決策整理成有節奏的主管敘事。" },
          { title: "產品敘事", body: "製作上市、功能與 roadmap 簡報，讓動效能承受反覆迭代。" },
          { title: "可重用系統", body: "為需要反覆溝通同一故事的團隊建立可重複的 Slide 模式。" }
        ]
      : [
          { title: "Business reviews", body: "Turn metrics, risks, and decisions into a paced executive story." },
          { title: "Product narratives", body: "Create launch, feature, and roadmap decks with motion that survives iteration." },
          { title: "Reusable systems", body: "Build repeatable slide patterns for teams that communicate the same story many times." }
        ],
    finalKicker: isZh ? "Ready" : "Ready",
    ctaBody: isZh
      ? "從空白簡報開始、載入範本，或把現有故事整理成可以直接審閱的動態提案。"
      : "Start from a clean deck, load a preset, or turn an existing story into a motion pitch ready for review."
  };

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.22 },
          transition: { duration: 0.7, delay, ease: easeOut }
        };

  const heroMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.75, ease: easeOut }
      };

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#08090a] text-[#f7f4ec] selection:bg-[#9ad7ff]/30 selection:text-white">
      <section className="relative px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(154,215,255,0.18),transparent_36%),linear-gradient(180deg,#08090a_0%,#111416_58%,#08090a_100%)]" />

        <motion.div {...heroMotion} className="mx-auto max-w-6xl text-center">
          <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">{copy.kicker}</p>
          <h1 className="mx-auto mt-6 max-w-[980px] text-5xl font-semibold leading-[0.96] text-[#fffaf1] sm:text-7xl lg:text-[92px]">
            {copy.heroTitle}
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/66 sm:text-xl">{copy.heroBody}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/workspace/pitch"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-[#f7f4ec] px-6 text-[15px] font-semibold text-[#070809] shadow-[0_22px_60px_rgba(154,215,255,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff] active:translate-y-0"
            >
              {page.hero.primary}
            </Link>
            <a
              href="#pitch-workflow"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-white/14 bg-white/[0.04] px-6 text-[15px] font-semibold text-[#f7f4ec] transition duration-300 hover:-translate-y-0.5 hover:border-[#9ad7ff]/50 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff] active:translate-y-0"
            >
              {copy.secondaryCta}
            </a>
          </div>
        </motion.div>

        <motion.div {...reveal(0.1)} className="mx-auto mt-14 max-w-7xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="font-mono text-[12px] font-medium uppercase text-white/42">{copy.productLabel}</p>
            <div className="hidden gap-2 sm:flex">
              {["Story", "Canvas", "Motion"].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <ProductScreenshot />
        </motion.div>

        <motion.div {...reveal(0.14)} className="mx-auto mt-8 grid max-w-7xl gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-3">
          {copy.stats.map(([value, label]) => (
            <div key={value} className="bg-[#101214] p-7 md:p-8">
              <p className="text-3xl font-semibold leading-none text-[#fffaf1]">{value}</p>
              <p className="mt-5 max-w-[19rem] text-[15px] leading-7 text-white/58">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section id="formats" className="bg-[#f4f0e7] px-4 py-24 text-[#111315] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <motion.div {...reveal()} className="max-w-2xl">
            <p className="font-mono text-[12px] font-medium uppercase text-[#2f6279]">{copy.formatEyebrow}</p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">{copy.formatTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-[#111315]/64">{copy.formatBody}</p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2">
            <motion.article {...reveal(0.06)} className="rounded-lg border border-[#111315]/10 bg-white p-7 shadow-[0_24px_80px_rgba(17,19,21,0.08)]">
            <p className="font-mono text-xs text-[#2f6279]">01</p>
              <h3 className="mt-7 text-3xl font-semibold">{copy.mdxTitle}</h3>
              <p className="mt-4 text-[15px] leading-7 text-[#111315]/64">{copy.mdxBody}</p>
            </motion.article>
            <motion.article {...reveal(0.12)} className="rounded-lg border border-[#111315]/10 bg-[#111315] p-7 text-[#f7f4ec] shadow-[0_24px_80px_rgba(17,19,21,0.12)]">
              <p className="font-mono text-xs text-[#9ad7ff]">02</p>
              <h3 className="mt-7 text-3xl font-semibold">{copy.htmlTitle}</h3>
              <p className="mt-4 text-[15px] leading-7 text-white/62">{copy.htmlBody}</p>
            </motion.article>
          </div>
        </div>
      </section>

      <section id="pitch-workflow" className="bg-[#08090a] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <motion.div {...reveal()} className="lg:sticky lg:top-28">
            <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">WORKFLOW</p>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-[#fffaf1] sm:text-6xl">{copy.workflowTitle}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/62">{copy.workflowBody}</p>
          </motion.div>

          <div className="grid gap-5">
            {copy.workflowSteps.map((step: PitchWorkflowStep, index: number) => (
              <motion.article
                key={step.title}
                {...reveal(index * 0.07)}
                className="grid gap-6 rounded-lg border border-white/10 bg-[#111416] p-5 sm:grid-cols-[0.34fr_1fr] sm:p-6"
              >
                <WorkflowPreview index={index} />
                <div className="self-center">
                  <p className="font-mono text-sm text-[#9ad7ff]">{step.label}</p>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight text-[#fffaf1]">{step.title}</h3>
                  <p className="mt-4 text-[15px] leading-7 text-white/58">{step.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f0e7] px-4 py-24 text-[#111315] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-end">
            <div>
              <p className="font-mono text-[12px] font-medium uppercase text-[#2f6279]">{copy.toolkitEyebrow}</p>
              <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight sm:text-6xl">{copy.toolkitTitle}</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#111315]/64 lg:justify-self-end">{page.useCases.body}</p>
          </motion.div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {copy.toolkitItems.map((feature: BentoFeature, index: number) => (
              <motion.article key={feature.title} {...reveal(index * 0.05)} className="rounded-lg border border-[#111315]/10 bg-white p-5 shadow-[0_20px_70px_rgba(17,19,21,0.08)]">
                <ToolkitVisual index={index} codeLabel={feature.codeLabel} codeTitle={feature.codeTitle} />
                <h3 className="mt-7 text-2xl font-semibold leading-snug">{feature.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#111315]/62">{feature.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#08090a] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <motion.div {...reveal()} className="lg:sticky lg:top-28">
            <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">{copy.useCasesEyebrow}</p>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-[#fffaf1] sm:text-6xl">{page.useCases.title}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/62">{page.useCases.body}</p>
          </motion.div>
          <div className="grid gap-5">
            {copy.useCases.map((useCase: PitchUseCase, index: number) => (
              <motion.article
                key={useCase.title}
                {...reveal(index * 0.07)}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-6 sm:p-8"
              >
                <p className="font-mono text-sm text-[#9ad7ff]">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-7 text-3xl font-semibold leading-tight text-[#fffaf1]">{useCase.title}</h3>
                <p className="mt-4 text-[16px] leading-7 text-white/58">{useCase.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#08090a] px-4 py-28 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
        <motion.div {...reveal()} className="mx-auto max-w-4xl">
          <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">{copy.finalKicker}</p>
          <h2 className="mt-5 text-5xl font-semibold leading-[0.98] text-[#fffaf1] sm:text-7xl">{page.cta.title}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/62">{copy.ctaBody}</p>
          <div className="mt-9">
            <Link
              href="/workspace/pitch"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-[#f7f4ec] px-7 text-[15px] font-semibold text-[#070809] transition duration-300 hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff] active:translate-y-0"
            >
              {page.cta.button}
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function ProductScreenshot() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/12 bg-[#111416] p-2 shadow-[0_44px_140px_rgba(0,0,0,0.42)]">
      <img
        src="/images/slidex-editor-hero.png"
        alt="SlideX Pitch editor interface"
        className="aspect-[3380/1652] w-full rounded-md object-cover"
      />
    </div>
  );
}

function WorkflowPreview({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="min-h-[170px] rounded-lg border border-white/10 bg-[#090b0c] p-4">
        <p className="font-mono text-[11px] text-white/38">motion-doc.mdx</p>
        <div className="mt-5 space-y-2 font-mono text-[12px] leading-6 text-white/54">
          <p><span className="text-[#9ad7ff]">&lt;Slide</span> duration=5&gt;</p>
          <p className="pl-4">{"<Text enter=\"fade\">"}</p>
          <p className="pl-8 text-[#fffaf1]">Title</p>
          <p className="pl-4">{"<Chart />"}</p>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="min-h-[170px] rounded-lg border border-white/10 bg-[#090b0c] p-4">
        <div className="rounded-md bg-[#f7f4ec] p-4 text-[#111315]">
          <div className="h-2 w-20 rounded-full bg-[#111315]/16" />
          <div className="mt-8 text-3xl font-semibold leading-none">Deck rhythm</div>
          <div className="mt-8 grid h-16 grid-cols-4 items-end gap-2">
            {[42, 76, 58, 92].map((height) => (
              <div key={height} className="rounded-t-md bg-[#111315]" style={{ height: `${height}%`, opacity: height === 92 ? 1 : 0.2 + height / 170 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[170px] content-center gap-4 rounded-lg border border-white/10 bg-[#090b0c] p-4">
      <div className="flex items-center gap-3">
        <div className="h-16 flex-1 rounded-md border border-white/10 bg-white/[0.06]" />
        <div className="h-px w-12 bg-[#9ad7ff]/70" />
        <div className="h-16 flex-1 rounded-md bg-[#9ad7ff]" />
      </div>
      <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-white/40">
        <span>Story</span>
        <span>Deck</span>
        <span>Review</span>
      </div>
    </div>
  );
}

function ToolkitVisual({
  index,
  codeLabel,
  codeTitle
}: {
  codeLabel?: string;
  codeTitle?: string;
  index: number;
}) {
  if (index === 0) {
    return (
      <div className="h-36 rounded-lg bg-[#101214] p-4 font-mono text-[12px] leading-6 text-white/56">
        <p className="mb-3 text-[11px] text-[#9ad7ff]">{codeLabel ?? "storyboard"}</p>
        <p><span className="text-[#9ad7ff]">#</span> {codeTitle ?? "Growth Review"}</p>
        <p className="mt-3">&lt;Slide duration=5&gt;</p>
        <p className="pl-4">{"<Chart motion=\"rise\" />"}</p>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="flex h-36 items-end gap-2 rounded-lg bg-[#101214] p-4">
        {[30, 54, 76, 44, 92].map((height, itemIndex) => (
          <div key={height} className={`w-full rounded-t-md ${itemIndex === 4 ? "bg-[#9ad7ff]" : "bg-white/16"}`} style={{ height: `${height}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-36 grid-cols-4 gap-2 rounded-lg bg-[#101214] p-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className={`rounded-md ${item === 0 ? "bg-[#f7f4ec]" : "bg-white/12"}`} />
      ))}
    </div>
  );
}
