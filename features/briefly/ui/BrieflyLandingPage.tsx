"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/common/lib/I18nProvider";
import { getBrieflyCopy } from "@/features/briefly/application/brieflyCopy";

const easeOut = [0.16, 1, 0.3, 1] as const;

const formatStack = ["Blocks", "Preview", "Review", "Handoff"];

export function BrieflyLandingPage() {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const copy = getBrieflyCopy(locale).landing;
  const isZh = locale === "zh-TW";

  const local = {
    kicker: isZh ? "Brief builder" : "Brief builder",
    heroTitle: isZh ? "先把專案說清楚。" : "Make the project clear first.",
    heroBody: isZh
      ? "把零散想法整理成結構化專案企劃，直接在文件畫布中預覽，讓團隊先對齊背景、目標、受眾與下一步。"
      : "Turn loose ideas into a structured project brief, preview the document on canvas, and align the team around context, goals, audience, and next steps.",
    secondaryCta: isZh ? "看工作流" : "See workflow",
    productLabel: isZh ? "文件工作區預覽" : "Document workspace preview",
    trustLabel: isZh ? "為現代專案文件設計" : "Built for modern project documents",
    formatEyebrow: isZh ? "STRUCTURE" : "STRUCTURE",
    formatTitle: isZh ? "先把文件骨架整理好。" : "Shape the brief before the deck.",
    formatBody: isZh
      ? "Briefly 用區塊保存背景、目標、受眾、範圍與決策脈絡。團隊先把「要說什麼」整理清楚，再進入提案製作。"
      : "Briefly stores context, goals, audience, scope, and decisions as structured blocks so the team clarifies what to say before building the pitch.",
    mdxTitle: isZh ? "結構化區塊" : "Structured blocks",
    mdxBody: isZh ? "把專案背景、目標、角色與限制拆成可審閱的內容單元。" : "Split context, goals, roles, and constraints into reviewable content units.",
    htmlTitle: isZh ? "決策視圖" : "Decision view",
    htmlBody: isZh ? "讓利害關係人快速讀懂狀態、風險、證據與下一步。" : "Help stakeholders read status, risk, evidence, and next steps quickly.",
    stats: isZh
      ? [
          ["結構化", "把零散想法變成能被團隊維護的 Brief。"],
          ["即時預覽", "文件畫布會跟著區塊與內容同步更新。"],
          ["可交付", "把對齊後的內容帶進提案、會議或客戶溝通。"]
        ]
      : [
          ["Structured", "Turn loose notes into a brief the team can maintain."],
          ["Live preview", "The document canvas updates with blocks and content."],
          ["Deliverable", "Move aligned content into pitches, meetings, or client communication."]
        ],
    featuresEyebrow: isZh ? "TOOLKIT" : "TOOLKIT",
    workflowEyebrow: isZh ? "WORKFLOW" : "WORKFLOW",
    finalKicker: isZh ? "Ready" : "Ready",
    features: isZh
      ? [
          ["模組化區塊編輯", "不再受限於死板文件，用結構化區塊拼湊企劃，每個區塊都能獨立編輯與重複使用。"],
          ["原生內容結構", "結合文件撰寫的速度與產品規格的清晰，讓企劃保持可追蹤。"],
          ["即時高階預覽", "編輯的當下就能看到排版後的文件狀態，方便快速審閱。"],
          ["清楚交付", "把已對齊的企劃帶進提案、會議或下一輪執行。"]
        ]
      : [
          ["Modular block editing", "Compose briefs with structured blocks that can be edited and reused independently."],
          ["Native content structure", "Combine writing speed with product-spec clarity so the brief stays traceable."],
          ["Live premium preview", "See the polished document state while editing so review can happen quickly."],
          ["Clear handoff", "Bring the aligned brief into pitches, meetings, or the next round of execution."]
        ],
    workflow: isZh
      ? [
          ["結構建構", "透過視覺化介面快速搭起專案骨架，先釐清背景、目標與限制。"],
          ["屬性檢查", "精細調整每個區塊的欄位、優先級與決策脈絡。"],
          ["團隊審閱", "讓 PM、設計、開發與利害關係人圍繞同一份 Brief 對齊。"]
        ]
      : [
          ["Structure builder", "Use the visual interface to shape context, goals, and constraints quickly."],
          ["Property inspector", "Tune each block's fields, priority, and decision context."],
          ["Team review", "Align PMs, design, engineering, and stakeholders around one brief."]
        ],
    bottomBody: isZh
      ? "不再使用零散的筆記軟體。開始使用 SlideX Briefly，先把專案說清楚，再進入提案與執行。"
      : "Move beyond scattered notes. Start with SlideX Briefly, clarify the project, then move into pitching and execution."
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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(154,215,255,0.16),transparent_35%),linear-gradient(180deg,#08090a_0%,#111416_58%,#08090a_100%)]" />

        <motion.div {...heroMotion} className="mx-auto max-w-6xl text-center">
          <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">{local.kicker}</p>
          <h1 className="mx-auto mt-6 max-w-[920px] text-5xl font-semibold leading-[0.96] text-[#fffaf1] sm:text-7xl lg:text-[92px]">
            {local.heroTitle}
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/66 sm:text-xl">{local.heroBody}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/workspace/briefly"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-[#f7f4ec] px-6 text-[15px] font-semibold text-[#070809] shadow-[0_22px_60px_rgba(154,215,255,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff] active:translate-y-0"
            >
              {copy.primaryCta}
            </Link>
            <a
              href="#briefly-workflow"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-white/14 bg-white/[0.04] px-6 text-[15px] font-semibold text-[#f7f4ec] transition duration-300 hover:-translate-y-0.5 hover:border-[#9ad7ff]/50 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff] active:translate-y-0"
            >
              {local.secondaryCta}
            </a>
          </div>
        </motion.div>

        <motion.div {...reveal(0.1)} className="mx-auto mt-14 max-w-7xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="font-mono text-[12px] font-medium uppercase text-white/42">{local.productLabel}</p>
            <div className="hidden gap-2 sm:flex">
              {formatStack.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <BrieflyWorkspacePreview />
        </motion.div>

        <motion.div {...reveal(0.14)} className="mx-auto mt-8 grid max-w-7xl gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-3">
          {local.stats.map(([value, label]) => (
            <div key={value} className="bg-[#101214] p-7 md:p-8">
              <p className="text-3xl font-semibold leading-none text-[#fffaf1]">{value}</p>
              <p className="mt-5 max-w-[19rem] text-[15px] leading-7 text-white/58">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section id="briefly-formats" className="bg-[#f4f0e7] px-4 py-24 text-[#111315] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <motion.div {...reveal()} className="max-w-2xl">
            <p className="font-mono text-[12px] font-medium uppercase text-[#2f6279]">{local.formatEyebrow}</p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">{local.formatTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-[#111315]/64">{local.formatBody}</p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2">
            <motion.article {...reveal(0.06)} className="rounded-lg border border-[#111315]/10 bg-white p-7 shadow-[0_24px_80px_rgba(17,19,21,0.08)]">
              <p className="font-mono text-xs text-[#2f6279]">01</p>
              <h3 className="mt-7 text-3xl font-semibold">{local.mdxTitle}</h3>
              <p className="mt-4 text-[15px] leading-7 text-[#111315]/64">{local.mdxBody}</p>
            </motion.article>
            <motion.article {...reveal(0.12)} className="rounded-lg border border-[#111315]/10 bg-[#111315] p-7 text-[#f7f4ec] shadow-[0_24px_80px_rgba(17,19,21,0.12)]">
              <p className="font-mono text-xs text-[#9ad7ff]">02</p>
              <h3 className="mt-7 text-3xl font-semibold">{local.htmlTitle}</h3>
              <p className="mt-4 text-[15px] leading-7 text-white/62">{local.htmlBody}</p>
            </motion.article>
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#08090a] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-end">
            <div>
              <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">{local.featuresEyebrow}</p>
              <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-[#fffaf1] sm:text-6xl">
                {copy.featuresTitle} {copy.featuresTitleMuted}
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/62 lg:justify-self-end">{copy.featuresBody}</p>
          </motion.div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {local.features.map(([title, body], index) => (
              <motion.article key={title} {...reveal(index * 0.05)} className="rounded-lg border border-white/10 bg-[#111416] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.18)]">
                <FeatureVisual index={index} />
                <h3 className="mt-7 text-2xl font-semibold leading-snug text-[#fffaf1]">{title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-white/58">{body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="briefly-workflow" className="bg-[#f4f0e7] px-4 py-24 text-[#111315] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <motion.div {...reveal()} className="lg:sticky lg:top-28">
            <p className="font-mono text-[12px] font-medium uppercase text-[#2f6279]">{local.workflowEyebrow}</p>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight sm:text-6xl">
              {copy.workflowTitle} {copy.workflowTitleMuted}
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#111315]/64">{copy.workflowBody}</p>
          </motion.div>

          <div className="grid gap-5">
            {local.workflow.map(([title, body], index) => (
              <motion.article
                key={title}
                {...reveal(index * 0.07)}
                className="grid gap-6 rounded-lg border border-[#111315]/10 bg-white p-5 shadow-[0_20px_70px_rgba(17,19,21,0.08)] sm:grid-cols-[0.34fr_1fr] sm:p-6"
              >
                <WorkflowVisual index={index} />
                <div className="self-center">
                  <p className="font-mono text-sm text-[#2f6279]">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight">{title}</h3>
                  <p className="mt-4 text-[15px] leading-7 text-[#111315]/62">{body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#08090a] px-4 py-28 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
        <motion.div {...reveal()} className="mx-auto max-w-4xl">
          <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">{local.finalKicker}</p>
          <h2 className="mt-5 text-5xl font-semibold leading-[0.98] text-[#fffaf1] sm:text-7xl">
            {copy.bottomTitleLine1} {copy.bottomTitleLine2}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/62">{local.bottomBody}</p>
          <div className="mt-9">
            <Link
              href="/workspace/briefly"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-[#f7f4ec] px-7 text-[15px] font-semibold text-[#070809] transition duration-300 hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff] active:translate-y-0"
            >
              {copy.bottomCta}
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function BrieflyWorkspacePreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/12 bg-[#111416] p-2 shadow-[0_44px_140px_rgba(0,0,0,0.42)]">
      <div className="grid min-h-[560px] rounded-md border border-white/8 bg-[#090b0c] lg:grid-cols-[0.24fr_1fr_0.3fr]">
        <aside className="hidden border-r border-white/10 bg-[#101214] p-4 lg:block">
          <div className="mb-8 h-8 w-24 rounded-full bg-white/10" />
          <p className="font-mono text-[11px] uppercase text-white/36">Blocks</p>
          <div className="mt-4 space-y-3">
            {["Context", "Goal", "Audience", "Scope"].map((item, index) => (
              <div key={item} className={`rounded-md p-3 text-sm ${index === 1 ? "bg-[#9ad7ff] text-[#061016]" : "bg-white/[0.06] text-white/54"}`}>
                {item}
              </div>
            ))}
          </div>
        </aside>

        <div className="bg-[radial-gradient(circle,#24282c_1px,transparent_1px)] [background-size:18px_18px] p-5 sm:p-8">
          <div className="mx-auto max-w-3xl rounded-lg bg-[#f7f4ec] p-6 text-[#111315] shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:p-10">
            <div className="flex items-center justify-between">
              <div className="h-2 w-24 rounded-full bg-[#111315]/16" />
              <div className="rounded-full bg-[#111315] px-3 py-1.5 font-mono text-[11px] text-[#f7f4ec]">Brief</div>
            </div>
            <h3 className="mt-12 max-w-[15rem] text-5xl font-semibold leading-[0.96]">Project brief</h3>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#111315]/62">
              Context, goals, audience, scope, and decisions become one structured document.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {["Goal", "Audience", "Decision", "Next step"].map((item, index) => (
                <div key={item} className="rounded-lg border border-[#111315]/10 bg-white p-4">
                  <p className="font-mono text-[11px] text-[#2f6279]">{item}</p>
                  <div className="mt-4 h-2 rounded-full bg-[#111315]/16" style={{ width: `${86 - index * 10}%` }} />
                  <div className="mt-3 h-2 rounded-full bg-[#111315]/10" style={{ width: `${58 + index * 8}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="hidden border-l border-white/10 bg-[#101214] p-4 lg:block">
          <p className="font-mono text-[11px] uppercase text-white/36">Inspector</p>
          <div className="mt-6 space-y-4">
            {["Layout", "Theme", "Review"].map((item, index) => (
              <div key={item} className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex justify-between text-xs text-white/48">
                  <span>{item}</span>
                  <span>{index === 2 ? "Ready" : "Auto"}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-[#9ad7ff]" style={{ width: `${58 + index * 14}%` }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function FeatureVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="grid h-32 grid-cols-2 gap-2 rounded-lg bg-[#090b0c] p-3">
        <div className="rounded-md bg-[#9ad7ff]" />
        <div className="rounded-md bg-white/12" />
        <div className="rounded-md bg-white/12" />
        <div className="rounded-md bg-[#86efac]/80" />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="h-32 rounded-lg bg-[#090b0c] p-4 font-mono text-[12px] leading-6 text-white/56">
        <p><span className="text-[#9ad7ff]">#</span> Project brief</p>
        <p className="mt-3">&lt;Goal /&gt;</p>
        <p>&lt;Audience /&gt;</p>
        <p>&lt;Scope /&gt;</p>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="h-32 rounded-lg bg-[#f7f4ec] p-4 text-[#111315]">
        <div className="h-2 w-20 rounded-full bg-[#111315]/16" />
        <div className="mt-8 h-3 w-3/4 rounded-full bg-[#111315]/18" />
        <div className="mt-3 h-3 w-1/2 rounded-full bg-[#111315]/10" />
      </div>
    );
  }

  return (
    <div className="flex h-32 items-center gap-3 rounded-lg bg-[#090b0c] p-4">
      <div className="h-16 flex-1 rounded-md border border-white/10 bg-white/[0.06]" />
      <div className="h-px w-10 bg-[#9ad7ff]/70" />
      <div className="h-16 flex-1 rounded-md bg-[#9ad7ff]" />
    </div>
  );
}

function WorkflowVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="min-h-[170px] rounded-lg bg-[#101214] p-4">
        <p className="font-mono text-[11px] text-white/38">Builder</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`h-14 rounded-md ${item === 1 ? "bg-[#9ad7ff]" : "bg-white/12"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="min-h-[170px] rounded-lg bg-[#101214] p-4">
        <p className="font-mono text-[11px] text-white/38">Inspector</p>
        <div className="mt-5 space-y-4">
          {[72, 54, 86].map((width) => (
            <div key={width} className="h-2 rounded-full bg-[#9ad7ff]" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[170px] content-center gap-4 rounded-lg bg-[#101214] p-4">
      <div className="flex items-center gap-3">
        <div className="h-16 flex-1 rounded-md border border-white/10 bg-white/[0.06]" />
        <div className="h-px w-12 bg-[#9ad7ff]/70" />
        <div className="h-16 flex-1 rounded-md bg-[#9ad7ff]" />
      </div>
      <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-white/40">
        <span>Brief</span>
        <span>Review</span>
      </div>
    </div>
  );
}
