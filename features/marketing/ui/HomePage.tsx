"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/common/lib/I18nProvider";

const easeOut = [0.16, 1, 0.3, 1] as const;

type ToolkitVisual = "blocks" | "motion" | "handoff" | "brand" | "rooms" | "templates";

export function HomePage() {
  const { t, locale, localePath } = useI18n();
  const reduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";

  const copy = {
    heroKicker: isZh ? "AI presentation workspace" : "AI presentation workspace",
    heroTitle: isZh ? "把想法變成能贏下會議的動態簡報。" : "Create motion decks that win the room.",
    heroBody: isZh
      ? "SlideX 把 Brief、動態簡報、預覽與團隊協作放進同一個工作區，讓第一份草稿到正式提案都維持清楚、漂亮、可調整。"
      : "SlideX brings briefs, motion decks, preview, and team collaboration into one workspace so every pitch stays clear, polished, and easy to refine.",
    secondaryCta: isZh ? "看完整流程" : "See the flow",
    trustedLabel: isZh ? "為現代專案團隊設計" : "Built for modern project teams",
    whyEyebrow: isZh ? "WHY SLIDEX" : "WHY SLIDEX",
    whyTitle: isZh ? "SlideX 是你的專案敘事工作區。" : "SlideX is your project storytelling workspace.",
    whyBody: isZh
      ? "Pitch 的優點是把簡報製作變成一個完整產品。SlideX 也採用同樣的整頁敘事節奏，但聚焦在 Brief、動態畫布、團隊審閱與可持續更新的提案。"
      : "Pitch turns presentations into a complete product workflow. SlideX follows that full-page rhythm, focused on briefs, motion canvas, team review, and pitches that keep evolving.",
    payoffEyebrow: isZh ? "THE PAYOFF" : "THE PAYOFF",
    payoffTitle: isZh ? "簡報不再是一次性的素材。" : "Decks stop being one-off assets.",
    payoffBody: isZh
      ? "把策略、畫面、動效與審閱節奏放在同一條線上，更新內容時不必重建整份簡報。"
      : "Keep strategy, visuals, motion, and review rhythm on one line so updates do not mean rebuilding the deck.",
    howEyebrow: isZh ? "HOW TO" : "HOW TO",
    howTitle: isZh ? "從第一份草稿到正式提案。" : "From first draft to final pitch.",
    howBody: isZh
      ? "用 Brief 釐清故事，用 Pitch 打磨節奏，最後把提案交給團隊、客戶或會議現場。"
      : "Clarify the story in Briefly, polish the rhythm in Pitch, then bring the deck to your team, client, or meeting.",
    toolkitEyebrow: isZh ? "TOOLKIT" : "TOOLKIT",
    toolkitTitle: isZh ? "一套完整的動態簡報工具箱。" : "A complete toolkit for motion presentations.",
    toolkitBody: isZh
      ? "從品牌一致性、可重用元件到審閱與交付節奏，SlideX 讓簡報像產品一樣被維護。"
      : "From brand consistency and reusable components to review and delivery rhythm, SlideX lets decks be maintained like products.",
    solutionsEyebrow: isZh ? "SOLUTIONS" : "SOLUTIONS",
    solutionsTitle: isZh ? "為真的要說服人的團隊設計。" : "For teams that need to persuade.",
    solutionsBody: isZh
      ? "PM、創辦人、顧問與業務團隊可以用同一套工作流說清楚價值、證據與下一步。"
      : "PMs, founders, consultants, and sales teams can use one workflow to clarify value, evidence, and next steps.",
    templatesTitle: isZh ? "從完整範本開始，而不是空白頁。" : "Start from complete decks, not blank pages.",
    templatesBody: isZh
      ? "上市提案、QBR、投資人更新與客戶簡報都能保留結構與動效，再改成你的故事。"
      : "Launch pitches, QBRs, investor updates, and client decks keep their structure and motion while you rewrite the story.",
    finalBody: isZh
      ? "打開 SlideX Pitch，從一份可維護的動態簡報開始。"
      : "Open SlideX Pitch and start with a motion deck your team can maintain.",
    solutionItems: isZh
      ? [
          ["產品與 GTM", "把定位、路線圖、上市訊息與商業指標合成一份能被決策者快速理解的故事。"],
          ["創辦人與策略團隊", "從投資人更新到重大決策會議，用一致的敘事節奏說清楚機會與風險。"],
          ["顧問與代理商", "把研究、洞察、提案與下一步整理成客戶願意往前推的溝通材料。"],
          ["業務與客戶成功", "針對不同帳戶調整價值證據，同時維持品牌、頁型與說服邏輯一致。"]
        ]
      : [
          ["Product and GTM", "Turn positioning, roadmap, launch messaging, and business signals into a story decision-makers can read quickly."],
          ["Founders and strategy", "Move from investor updates to major internal decisions with one clear narrative rhythm."],
          ["Consultants and agencies", "Package research, insight, recommendations, and next steps into materials clients can act on."],
          ["Sales and success", "Adapt proof for each account while keeping brand, layout, and persuasion logic consistent."]
        ],
    templates: isZh
      ? ["Launch pitch", "QBR", "Investor update", "Client proposal"]
      : ["Launch pitch", "QBR", "Investor update", "Client proposal"]
  };

  /* ── animation helpers ── */
  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 32 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.18 },
          transition: { duration: 0.8, delay, ease: easeOut }
        };

  const staggerReveal = (index: number, baseDelay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.15 },
          transition: { duration: 0.7, delay: baseDelay + index * 0.1, ease: easeOut }
        };

  const heroMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.9, ease: easeOut }
      };

  const stats = isZh
    ? [
        ["策略對齊", "Brief、提案與審閱節奏共用同一條敘事線。"],
        ["即時畫布", "在製作過程中直接檢查畫面、動效與段落節奏。"],
        ["會議就緒", "讓團隊能快速調整，帶著同一份故事進入關鍵場合。"]
      ]
    : [
        ["Aligned strategy", "Brief, pitch, and review rhythm share one narrative line."],
        ["Live canvas", "Check visuals, motion, and pacing while the deck is being made."],
        ["Meeting ready", "Let the team refine quickly and bring one story into high-stakes rooms."]
      ];
  const workflowItems = isZh
    ? [
        { title: "撰寫敘事", body: "先把目標、受眾、證據與下一步整理成清楚的專案故事。" },
        { title: "調整動效", body: "在簡報可播放的狀態下，調整時間、圖層與節奏。" },
        { title: "帶進會議", body: "讓團隊、客戶與決策者看見同一份重點明確的提案。" }
      ]
    : [
        { title: "Write the narrative", body: "Clarify the goal, audience, proof, and next move into a project story." },
        { title: "Tune the motion", body: "Adjust timing, layers, and pacing while the deck stays playable." },
        { title: "Bring it to the room", body: "Give teams, clients, and decision-makers the same focused pitch." }
      ];
  const toolkitItems: Array<{ title: string; body: string; visual: ToolkitVisual }> = [
    {
      title: isZh ? "元件庫" : "Component library",
      body: isZh ? "用穩定的文字、圖表、媒體與版面區塊快速組出一致的提案。" : "Compose consistent pitches from stable text, chart, media, and layout blocks.",
      visual: "blocks"
    },
    {
      title: isZh ? "內建微動態" : "Built-in motion",
      body: isZh ? "為簡報加入乾淨的進場、節奏與互動狀態，不必手拉複雜關鍵影格。" : "Add clean entrances, rhythm, and interaction states without hand-building complex keyframes.",
      visual: "motion"
    },
    {
      title: isZh ? "交付節奏" : "Delivery rhythm",
      body: isZh ? "從內部審閱到正式提案，保留同一份故事與同一套畫面規則。" : "Move from internal review to final pitch with one story and one visual system.",
      visual: "handoff"
    },
    {
      title: isZh ? "品牌一致性" : "Brand consistency",
      body: isZh ? "用受控模板、字體與色彩讓每份提案保持同一套品牌語言。" : "Keep every pitch on brand with controlled templates, fonts, and colors.",
      visual: "brand"
    },
    {
      title: isZh ? "敘事工作區" : "Narrative workspace",
      body: isZh ? "Briefly 與 Pitch 接在同一條內容線，從策略到畫面不用重寫。" : "Briefly and Pitch share one content line from strategy to slides.",
      visual: "rooms"
    },
    {
      title: isZh ? "完整範本" : "Complete presets",
      body: isZh ? "不是空白主題，而是有節奏、頁型與動效的完整 Deck 起點。" : "Start from decks with rhythm, layouts, and motion instead of blank themes.",
      visual: "templates"
    }
  ];

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#08090a] text-[#f7f4ec] selection:bg-[#9ad7ff]/30 selection:text-white">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(154,215,255,0.22),transparent_38%),linear-gradient(180deg,#08090a_0%,#101214_58%,#08090a_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[#f4f0e7]" />

        <motion.div {...heroMotion} className="mx-auto max-w-6xl text-center">
          <motion.p
            {...(reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2, duration: 0.6 } })}
            className="inline-flex items-center gap-2 rounded-full border border-[#9ad7ff]/20 bg-[#9ad7ff]/[0.06] px-4 py-1.5 font-mono text-[12px] font-medium uppercase text-[#9ad7ff]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#9ad7ff] shadow-[0_0_8px_rgba(154,215,255,0.6)]" />
            {copy.heroKicker}
          </motion.p>
          <h1 className="mx-auto mt-8 max-w-[980px] text-[clamp(48px,7vw,100px)] font-semibold leading-[0.94] tracking-[-0.03em] text-[#fffaf1]">
            {copy.heroTitle}
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-white/60 sm:text-xl">{copy.heroBody}</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={localePath("/pitch")}
              className="inline-flex h-13 items-center justify-center whitespace-nowrap rounded-full bg-[#c4ee87] px-7 text-[15px] font-semibold text-[#0a1a00] shadow-[0_0_40px_rgba(196,238,135,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d4f4a7] hover:shadow-[0_0_56px_rgba(196,238,135,0.36)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4ee87] active:translate-y-0"
            >
              {t.home.hero.primary}
            </Link>
            <a
              href="#how"
              className="inline-flex h-13 items-center justify-center whitespace-nowrap rounded-full border border-white/14 bg-white/[0.04] px-7 text-[15px] font-semibold text-[#f7f4ec] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9ad7ff]/40 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff] active:translate-y-0"
            >
              {copy.secondaryCta}
            </a>
          </div>
        </motion.div>

        <motion.div
          {...(reduceMotion ? {} : {
            initial: { opacity: 0, y: 40, scale: 0.98 },
            whileInView: { opacity: 1, y: 0, scale: 1 },
            viewport: { once: true },
            transition: { duration: 1, delay: 0.2, ease: easeOut }
          })}
          className="mx-auto mt-16 max-w-7xl"
        >
          <HeroProductShowcase reduceMotion={!!reduceMotion} />
        </motion.div>

        <motion.div
          {...reveal(0.16)}
          className="mx-auto mt-12 max-w-7xl text-[#111315]"
        >
          <p className="font-mono text-[12px] font-medium uppercase text-[#111315]/50">{copy.trustedLabel}</p>
        </motion.div>
      </section>

      {/* ═══════════ WHY SLIDEX ═══════════ */}
      <section className="bg-[#f4f0e7] px-4 py-32 text-[#111315] sm:px-6 lg:px-8 lg:py-40">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.76fr_1.24fr] lg:items-center">
          <motion.div {...reveal()}>
            <div className="flex items-center gap-3">
              <span className="h-5 w-0.5 rounded-full bg-[#2f6279]" />
              <p className="font-mono text-[12px] font-medium uppercase text-[#2f6279]">{copy.whyEyebrow}</p>
            </div>
            <h2 className="mt-6 max-w-xl text-[clamp(32px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em]">{copy.whyTitle}</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#111315]/60">{copy.whyBody}</p>
          </motion.div>

          <motion.div {...reveal(0.06)} className="overflow-hidden rounded-2xl border border-[#111315]/8 bg-white shadow-[0_32px_100px_rgba(17,19,21,0.12)]">
            <WhyShowcase />
          </motion.div>
        </div>
      </section>

      {/* ── gradient divider ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ═══════════ THE PAYOFF ═══════════ */}
      <section className="bg-[#08090a] px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">{copy.payoffEyebrow}</p>
              <h2 className="mt-6 max-w-2xl text-[clamp(32px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#fffaf1]">{copy.payoffTitle}</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/56 lg:justify-self-end">{copy.payoffBody}</p>
          </motion.div>

          <motion.div
            {...reveal(0.08)}
            className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:grid-cols-3"
          >
            {stats.map(([value, label], index) => (
              <motion.div
                key={value}
                {...staggerReveal(index, 0.12)}
                className="bg-[#101214] p-8 transition-colors duration-300 hover:bg-[#141618] md:p-10"
              >
                <p className="text-4xl font-semibold leading-none text-[#fffaf1]">{value}</p>
                <p className="mt-6 max-w-[18rem] text-[15px] leading-7 text-white/52">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── gradient divider ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* ═══════════ HOW TO ═══════════ */}
      <section id="how" className="bg-[#08090a] px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-5 w-0.5 rounded-full bg-[#9ad7ff]" />
              <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">{copy.howEyebrow}</p>
            </div>
            <h2 className="mt-6 text-[clamp(32px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#fffaf1]">{copy.howTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-white/56">{copy.howBody}</p>
          </motion.div>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {workflowItems.map((item, index) => (
              <motion.article
                key={item.title}
                {...staggerReveal(index)}
                className="group rounded-2xl border border-white/8 bg-[#111416] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-white/14 hover:shadow-[0_32px_100px_rgba(0,0,0,0.28)]"
              >
                <div className="mb-8 overflow-hidden rounded-xl border border-white/8 bg-[#090b0c] p-4">
                  <WorkflowVisual index={index} />
                </div>
                <p className="font-mono text-sm text-[#9ad7ff]">0{index + 1}</p>
                <h3 className="mt-4 text-3xl font-semibold leading-tight text-[#fffaf1]">{item.title}</h3>
                <p className="mt-4 text-[15px] leading-7 text-white/52">{item.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TOOLKIT ═══════════ */}
      <section className="bg-[#f4f0e7] px-4 py-32 text-[#111315] sm:px-6 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-end">
            <div>
              <p className="font-mono text-[12px] font-medium uppercase text-[#2f6279]">{copy.toolkitEyebrow}</p>
              <h2 className="mt-6 max-w-2xl text-[clamp(32px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em]">{copy.toolkitTitle}</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#111315]/56 lg:justify-self-end">{copy.toolkitBody}</p>
          </motion.div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {toolkitItems.map((item, index) => (
              <motion.article
                key={item.title}
                {...staggerReveal(index, 0.04)}
                className="group rounded-2xl border border-[#111315]/8 bg-white p-6 shadow-[0_4px_24px_rgba(17,19,21,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(17,19,21,0.12)]"
              >
                <ToolkitPreview visual={item.visual} />
                <h3 className="mt-8 text-2xl font-semibold leading-snug">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#111315]/56">{item.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── gradient divider ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ═══════════ SOLUTIONS ═══════════ */}
      <section className="bg-[#08090a] px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-end">
            <div>
            <div className="flex items-center gap-3">
              <span className="h-5 w-0.5 rounded-full bg-[#9ad7ff]" />
              <p className="font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">{copy.solutionsEyebrow}</p>
            </div>
            <h2 className="mt-6 max-w-2xl text-[clamp(32px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#fffaf1]">{copy.solutionsTitle}</h2>
            </div>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/56">{copy.solutionsBody}</p>
          </motion.div>

          <div className="mt-16 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <motion.div {...reveal(0.06)} className="rounded-2xl border border-white/8 bg-[#111416] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.24)] sm:p-6">
              <SolutionStudioPanel />
            </motion.div>
            <div className="grid gap-4">
            {copy.solutionItems.map(([title, body], index) => (
              <motion.article
                key={title}
                {...staggerReveal(index, 0.06)}
                className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.06]"
              >
                <p className="font-mono text-sm text-[#9ad7ff]">0{index + 1}</p>
                <h3 className="mt-5 text-2xl font-semibold leading-tight text-[#fffaf1]">{title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-white/52">{body}</p>
              </motion.article>
            ))}
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={localePath("/pitch")}
                className="inline-flex h-13 items-center justify-center whitespace-nowrap rounded-full bg-[#c4ee87] px-7 text-[15px] font-semibold text-[#0a1a00] shadow-[0_0_32px_rgba(196,238,135,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d4f4a7] hover:shadow-[0_0_48px_rgba(196,238,135,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4ee87] active:translate-y-0"
              >
                Pitch
              </Link>
              <Link
                href={localePath("/briefly")}
                className="inline-flex h-13 items-center justify-center whitespace-nowrap rounded-full border border-white/14 bg-white/[0.04] px-7 text-[15px] font-semibold text-[#f7f4ec] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9ad7ff]/40 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff] active:translate-y-0"
              >
                Briefly
              </Link>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TEMPLATES ═══════════ */}
      <section className="bg-[#f4f0e7] px-4 py-32 text-[#111315] sm:px-6 lg:px-8 lg:py-40">
        <motion.div {...reveal()} className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <h2 className="max-w-xl text-[clamp(32px,5vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em]">{copy.templatesTitle}</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#111315]/56">{copy.templatesBody}</p>
            <Link
              href={localePath("/pitch")}
              className="mt-10 inline-flex h-13 items-center justify-center whitespace-nowrap rounded-full bg-[#111315] px-7 text-[15px] font-semibold text-[#f7f4ec] shadow-[0_8px_32px_rgba(17,19,21,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#202427] hover:shadow-[0_12px_40px_rgba(17,19,21,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6279] active:translate-y-0"
            >
              {t.home.hero.primary}
            </Link>
          </div>
          <TemplateGallery templates={copy.templates} />
        </motion.div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative bg-[#08090a] px-4 py-36 text-center sm:px-6 lg:px-8 lg:py-44">
        {/* ambient glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(154,215,255,0.08),transparent_60%)] blur-[80px]" />
          <div className="absolute left-1/3 top-1/3 h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(196,238,135,0.06),transparent_70%)] blur-[60px]" />
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <motion.div {...reveal()} className="mx-auto max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#9ad7ff]/20 bg-[#9ad7ff]/[0.06] px-4 py-1.5 font-mono text-[12px] font-medium uppercase text-[#9ad7ff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9ad7ff] shadow-[0_0_8px_rgba(154,215,255,0.6)]" />
            {t.home.hero.eyebrow}
          </p>
          <h2 className="mt-8 text-[clamp(40px,6.5vw,80px)] font-semibold leading-[0.96] tracking-[-0.03em] text-[#fffaf1]">{t.home.finalCta.title}</h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/56">{copy.finalBody}</p>
          <div className="mt-10">
            <Link
              href={localePath("/pitch")}
              className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-full bg-[#c4ee87] px-8 text-[16px] font-semibold text-[#0a1a00] shadow-[0_0_48px_rgba(196,238,135,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d4f4a7] hover:shadow-[0_0_72px_rgba(196,238,135,0.36)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4ee87] active:translate-y-0"
            >
              {t.home.hero.primary}
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function HeroProductShowcase({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative">
      {/* outer glow */}
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-[radial-gradient(ellipse_at_50%_0%,rgba(154,215,255,0.12),transparent_60%)] blur-[40px]" />

      {/* double-bezel outer frame */}
      <div className="rounded-2xl bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent p-px shadow-[0_48px_160px_rgba(0,0,0,0.48),0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="overflow-hidden rounded-[calc(1rem-1px)] border border-white/[0.06] bg-[#111416] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <motion.img
            src="/images/slidex-editor-hero.png"
            alt="SlideX product interface preview"
            className="aspect-[3380/1652] w-full rounded-lg object-cover"
            {...(reduceMotion ? {} : {
              animate: { y: [0, -4, 0] },
              transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            })}
          />
        </div>
      </div>
    </div>
  );
}

function WhyShowcase() {
  return (
    <div className="grid min-h-[460px] bg-[#101214] p-3 text-[#f7f4ec] lg:grid-cols-[0.28fr_1fr_0.32fr]">
      <div className="hidden border-r border-white/8 p-4 lg:block">
        <div className="mb-8 h-8 w-24 rounded-full bg-white/8" />
        <div className="space-y-3">
          {["Brief", "Signal", "Plan", "Ask"].map((item, index) => (
            <div key={item} className={`rounded-lg p-3 text-sm transition-all duration-300 ${index === 1 ? "bg-[#9ad7ff] text-[#061016] shadow-[0_4px_16px_rgba(154,215,255,0.24)]" : "bg-white/[0.05] text-white/48 hover:bg-white/[0.08]"}`}>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="h-full rounded-xl bg-[#f4f0e7] p-5 text-[#111315]">
          <div className="flex items-center justify-between">
            <div className="h-2 w-24 rounded-full bg-[#111315]/14" />
            <div className="flex gap-2">
              <div className="h-7 w-7 rounded-full bg-[#fb7185] shadow-[0_2px_8px_rgba(251,113,133,0.3)]" />
              <div className="h-7 w-7 rounded-full bg-[#9ad7ff] shadow-[0_2px_8px_rgba(154,215,255,0.3)]" />
              <div className="h-7 w-7 rounded-full bg-[#86efac] shadow-[0_2px_8px_rgba(134,239,172,0.3)]" />
            </div>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[0.82fr_1fr] lg:items-end">
            <div>
              <div className="h-3 w-28 rounded-full bg-[#2f6279]/30" />
              <h3 className="mt-7 max-w-[14rem] text-5xl font-semibold leading-[0.95]">Launch story</h3>
              <p className="mt-5 max-w-[15rem] text-sm leading-6 text-[#111315]/52">
                Evidence, motion, and the next ask stay connected.
              </p>
            </div>
            <div className="grid h-40 grid-cols-5 items-end gap-3">
              {[34, 62, 48, 86, 72].map((height, index) => (
                <div
                  key={height}
                  className={`rounded-t-lg transition-all duration-500 ${index === 3 ? "bg-[#111315] shadow-[0_-4px_16px_rgba(17,19,21,0.12)]" : "bg-[#111315]/18"}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden border-l border-white/8 p-4 lg:block">
        <p className="font-mono text-[11px] uppercase text-white/32">Inspector</p>
        <div className="mt-6 space-y-5">
          {["Timing", "Theme", "Review"].map((item, index) => (
            <div key={item}>
              <div className="mb-2 flex justify-between text-xs text-white/40">
                <span>{item}</span>
                <span>{index + 2}s</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div className="h-2 rounded-full bg-[#9ad7ff] shadow-[0_0_8px_rgba(154,215,255,0.3)]" style={{ width: `${58 + index * 14}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="grid min-h-[180px] gap-3">
        {["Goal", "Audience", "Proof"].map((item, itemIndex) => (
          <div key={item} className="rounded-lg border border-white/8 bg-white/[0.04] p-4 transition-all duration-300 hover:bg-white/[0.06]">
            <p className="font-mono text-[11px] text-white/36">{item}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/12">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#9ad7ff]/60 to-[#9ad7ff]/20"
                initial={{ width: 0 }}
                whileInView={{ width: `${86 - itemIndex * 14}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 + itemIndex * 0.15, ease: easeOut }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="grid min-h-[180px] grid-cols-[0.22fr_1fr] gap-3">
        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`aspect-[4/3] rounded-lg transition-all duration-300 ${item === 1 ? "bg-[#9ad7ff] shadow-[0_4px_12px_rgba(154,215,255,0.24)]" : "bg-white/8 hover:bg-white/12"}`} />
          ))}
        </div>
        <div className="rounded-lg bg-[#f7f4ec] p-4 text-[#111315]">
          <div className="h-2 w-24 rounded-full bg-[#111315]/14" />
          <div className="mt-8 text-3xl font-semibold leading-none">Deck rhythm</div>
          <div className="mt-8 grid h-20 grid-cols-4 items-end gap-2">
            {[42, 76, 58, 92].map((height) => (
              <div key={height} className="rounded-t-lg bg-[#111315] transition-all duration-300" style={{ height: `${height}%`, opacity: height === 92 ? 1 : 0.15 + height / 140 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[180px] content-center gap-4">
      <div className="flex items-center gap-3">
        <div className="h-16 flex-1 rounded-lg border border-white/8 bg-white/[0.05] transition-all duration-300 hover:bg-white/[0.08]" />
        <div className="relative h-px w-12">
          <div className="absolute inset-0 bg-[#9ad7ff]/60" />
          <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-[#9ad7ff]/60" />
        </div>
        <div className="h-16 flex-1 rounded-lg bg-[#9ad7ff] shadow-[0_4px_16px_rgba(154,215,255,0.20)]" />
      </div>
      <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-white/36">
        <span>Brief</span>
        <span>Deck</span>
        <span>Review</span>
      </div>
    </div>
  );
}

function ToolkitPreview({ visual }: { visual: ToolkitVisual }) {
  return (
    <div className="h-36 overflow-hidden rounded-xl border border-[#111315]/8 bg-[#101214] p-4">
      {visual === "blocks" && (
        <div className="grid h-full grid-cols-3 gap-2">
          <div className="rounded-lg bg-gradient-to-br from-[#9ad7ff] to-[#9ad7ff]/70 shadow-[0_4px_12px_rgba(154,215,255,0.16)]" />
          <div className="rounded-lg bg-white/12" />
          <div className="rounded-lg bg-gradient-to-br from-[#86efac]/80 to-[#86efac]/50 shadow-[0_4px_12px_rgba(134,239,172,0.12)]" />
        </div>
      )}
      {visual === "motion" && (
        <div className="flex h-full items-end gap-2">
          {[30, 54, 76, 44, 92].map((height, index) => (
            <div key={height} className={`w-full rounded-t-lg transition-all duration-500 ${index === 4 ? "bg-gradient-to-t from-[#fb7185] to-[#fb7185]/80 shadow-[0_-4px_12px_rgba(251,113,133,0.20)]" : "bg-gradient-to-t from-[#9ad7ff]/60 to-[#9ad7ff]/30"}`} style={{ height: `${height}%` }} />
          ))}
        </div>
      )}
      {visual === "handoff" && (
        <div className="flex h-full items-center gap-3">
          <div className="h-16 w-20 rounded-lg bg-white/12" />
          <div className="relative h-px flex-1">
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-[#9ad7ff]/60" />
          </div>
          <div className="h-16 w-20 rounded-lg bg-[#9ad7ff] shadow-[0_4px_16px_rgba(154,215,255,0.20)]" />
        </div>
      )}
      {visual === "brand" && (
        <div className="grid h-full grid-cols-[0.6fr_1fr] gap-3">
          <div className="rounded-lg bg-[#f7f4ec]" />
          <div className="grid gap-2">
            <div className="rounded-lg bg-gradient-to-r from-[#9ad7ff] to-[#9ad7ff]/70" />
            <div className="rounded-lg bg-gradient-to-r from-[#fb7185] to-[#fb7185]/70" />
            <div className="rounded-lg bg-gradient-to-r from-[#86efac] to-[#86efac]/70" />
          </div>
        </div>
      )}
      {visual === "rooms" && (
        <div className="grid h-full grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/8 bg-white/[0.05] p-3">
            <div className="h-2 w-16 rounded-full bg-white/14" />
            <div className="mt-5 h-12 rounded-lg bg-gradient-to-r from-[#9ad7ff]/60 to-[#9ad7ff]/30" />
          </div>
          <div className="rounded-lg border border-white/8 bg-white/[0.05] p-3">
            <div className="h-2 w-12 rounded-full bg-white/14" />
            <div className="mt-5 h-12 rounded-lg bg-gradient-to-r from-[#86efac]/60 to-[#86efac]/30" />
          </div>
        </div>
      )}
      {visual === "templates" && (
        <div className="grid h-full grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`rounded-lg transition-all duration-300 ${item === 0 ? "bg-[#f7f4ec] shadow-[0_4px_12px_rgba(244,240,231,0.12)]" : "bg-white/10 hover:bg-white/14"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function SolutionStudioPanel() {
  return (
    <div className="grid min-h-[560px] overflow-hidden rounded-xl border border-white/8 bg-[#090b0c] lg:grid-cols-[0.28fr_1fr]">
      <aside className="hidden border-r border-white/8 p-4 lg:block">
        <div className="mb-8 h-8 w-24 rounded-full bg-white/8" />
        <p className="font-mono text-[11px] uppercase text-white/30">Segments</p>
        <div className="mt-4 space-y-3">
          {["Product", "Founder", "Consulting", "Sales"].map((item, index) => (
            <div key={item} className={`rounded-lg p-3 text-sm transition-all duration-300 ${index === 0 ? "bg-[#9ad7ff] text-[#061016] shadow-[0_4px_12px_rgba(154,215,255,0.20)]" : "bg-white/[0.05] text-white/48 hover:bg-white/[0.08]"}`}>
              {item}
            </div>
          ))}
        </div>
      </aside>

      <div className="p-5 sm:p-7">
        <div className="rounded-xl bg-[#f7f4ec] p-6 text-[#111315] sm:p-8">
          <div className="flex items-center justify-between">
            <div className="h-2 w-28 rounded-full bg-[#111315]/14" />
            <div className="rounded-full bg-[#111315] px-3 py-1.5 font-mono text-[11px] text-[#f7f4ec]">Pitch room</div>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <div>
              <div className="h-3 w-24 rounded-full bg-[#2f6279]/28" />
              <h3 className="mt-7 max-w-[13rem] text-5xl font-semibold leading-[0.96]">Decision story</h3>
              <p className="mt-5 max-w-[17rem] text-sm leading-6 text-[#111315]/52">
                Align the audience, evidence, objections, and next move before the meeting starts.
              </p>
            </div>
            <div className="grid gap-3">
              {["Audience", "Evidence", "Objection", "Next move"].map((item, index) => (
                <div key={item} className="rounded-xl border border-[#111315]/8 bg-white p-4 shadow-[0_2px_8px_rgba(17,19,21,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(17,19,21,0.08)]">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] text-[#2f6279]">0{index + 1}</p>
                    <div className="h-2 w-16 rounded-full bg-[#111315]/10" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {["Signal", "Story", "Close"].map((item, index) => (
            <div key={item} className="rounded-xl border border-white/8 bg-white/[0.04] p-4 transition-all duration-300 hover:bg-white/[0.06]">
              <p className="font-mono text-[11px] text-[#9ad7ff]">0{index + 1}</p>
              <p className="mt-5 text-lg font-semibold text-[#fffaf1]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateGallery({ templates }: { templates: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {templates.map((template, index) => (
        <article
          key={template}
          className={`group min-h-[260px] rounded-2xl border p-5 shadow-[0_4px_24px_rgba(17,19,21,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(17,19,21,0.14)] ${
            index === 0 ? "border-white/8 bg-[#111315] text-[#f7f4ec]" : "border-[#111315]/8 bg-white text-[#111315]"
          }`}
        >
          <div className={`h-36 rounded-xl p-4 ${index === 0 ? "bg-[#f7f4ec] text-[#111315]" : "bg-[#101214] text-[#f7f4ec]"}`}>
            <div className="h-2 w-20 rounded-full bg-current opacity-16" />
            <div className="mt-8 max-w-[10rem] text-3xl font-semibold leading-none">{template}</div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase opacity-42">Template</p>
              <p className="mt-2 text-sm opacity-56">Brief, motion, review</p>
            </div>
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#9ad7ff] shadow-[0_0_6px_rgba(154,215,255,0.3)]" />
              <div className="h-3 w-3 rounded-full bg-[#fb7185] shadow-[0_0_6px_rgba(251,113,133,0.3)]" />
              <div className="h-3 w-3 rounded-full bg-[#86efac] shadow-[0_0_6px_rgba(134,239,172,0.3)]" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
