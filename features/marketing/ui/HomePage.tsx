"use client";

import { useState, type PointerEvent } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  easeOut,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Terminal,
  Sparkles,
  Layers,
  Cpu,
  FileSpreadsheet,
  Palette,
  ShieldCheck,
  Code,
  Search,
  Edit3,
  Download,
  Copy,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Play,
  Share2,
  Undo,
  RotateCcw,
  Grid,
  Maximize2,
  Zap
} from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import {
  BrowserFrame,
  CodeCard,
  Eyebrow,
  MktgGhostLink,
  MktgPrimaryLink,
  MktgSection,
  TrustBadgeRow,
  mktgEase
} from "@/features/marketing/ui/primitives";
import { StyleThumbnail } from "@/features/marketing/ui/StyleThumbnail";

const MCP_INSTALL_COMMAND = "npx -y @z7589xxz758/slidex-mcp-server";

const MCP_CONFIG_SNIPPET = `{
  "mcpServers": {
    "slidex": {
      "command": "npx",
      "args": ["-y", "@z7589xxz758/slidex-mcp-server"]
    }
  }
}`;

const MARQUEE_ITEMS = [
  "CREATE",
  "INSPECT",
  "EDIT",
  "EXPORT",
  "PPTX",
  "HTML",
  "MDX",
  "LOCAL MCP",
  "REMOTE MCP",
  "SHADERS",
  "LAYOUTS"
];

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

type HomeCopy = {
  copiedLabel: string;
  copyLabel: string;
  ctaBody: string;
  ctaTitle: string;
  exportBody: string;
  exportFormats: { detail: string; label: string }[];
  exportNote: string;
  exportTitle: string;
  faqBody: string;
  faqItems: string[][];
  faqTitle: string;
  heroBody: string;
  heroSlideAria: (variant: SlideVariant) => string;
  mcpAgentDone: string[];
  mcpAgentPrompt: string;
  mcpBody: string;
  mcpCapabilities: { detail: string; label: string }[];
  mcpClients: string;
  mcpTitle: string;
  paths: { body: string; bullets: string[]; eyebrow: string; title: string }[];
  pathsTitle: string;
  primaryCta: string;
  secondaryCta: string;
  workflow: { detail: string; title: string }[];
};

type Reveal = (delay?: number) => Record<string, unknown>;

export function HomePage() {
  const { locale, localePath } = useI18n();
  const reduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";
  const docsMcpPath = localePath("/docs#mcp");

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.16 },
          transition: { duration: 0.72, delay, ease: mktgEase }
        };

  const copy: HomeCopy = {
    heroBody: isZh
      ? "不需要複雜學習，用自然語言或手動調整，輕鬆打造專業 Pitch Deck。"
      : "No complex learning curve. Build professional pitch decks effortlessly with natural language or manual edits.",
    primaryCta: isZh ? "開啟 Live Demo" : "Try Live Demo",
    secondaryCta: isZh ? "連接 AI client" : "Connect your AI client",
    heroSlideAria: (variant) => (isZh ? `顯示 ${variant} 投影片` : `Show ${variant} slide`),
    pathsTitle: isZh ? "兩種方式，同一份簡報。" : "Two ways in. One deck.",
    paths: isZh
      ? [
          {
            body: "從一份完整的示範簡報開始，直接在瀏覽器修改文字、圖片與版面，準備好就匯出 PowerPoint。",
            bullets: ["免註冊 Live Demo", "畫布與圖層直接編輯", "匯出可編輯的 PPTX"],
            eyebrow: "FOR PRESENTERS",
            title: "打開就能改，改完就能匯出。"
          },
          {
            body: "SlideX MCP 讓相容的 AI client 建立、檢查、編輯與匯出簡報。一句指令，就是一頁投影片。",
            bullets: ["建立與重排投影片", "檢查並修改每個區塊", "Revision 衝突安全寫入"],
            eyebrow: "FOR AI BUILDERS",
            title: "你的 AI client，直接操作整份簡報。"
          }
        ]
      : [
          {
            body: "Start from a complete demo deck, change text, images, and layout right in the browser, then export to PowerPoint.",
            bullets: ["Live Demo without sign-up", "Direct canvas and layer editing", "Editable PPTX export"],
            eyebrow: "FOR PRESENTERS",
            title: "Open, edit, export. That is the flow."
          },
          {
            body: "SlideX MCP lets compatible AI clients create, inspect, edit, and export presentations. One prompt becomes one slide.",
            bullets: ["Create and reorder slides", "Inspect and edit every block", "Conflict-safe revision writes"],
            eyebrow: "FOR AI BUILDERS",
            title: "Your AI client drives the whole deck."
          }
        ],
    exportTitle: isZh ? "即時預覽，無縫匯出。" : "Instant preview, seamless export.",
    exportBody: isZh
      ? "隨時播放完整簡報掌握發表節奏，輕鬆匯出至習慣的工具繼續編輯與分享。"
      : "Play the complete deck anytime to check your rhythm, then export to your preferred tools to continue editing.",
    exportFormats: isZh
      ? [
          { detail: "無縫匯出至 PowerPoint、Keynote 或 Google Slides 繼續微調", label: "PPTX" },
          { detail: "完整保留動態與轉場效果，複製連結即可線上分享", label: "HTML" },
          { detail: "基於 MotionDoc 語法，對 Git 版本控制極為友善", label: "MDX" }
        ]
      : [
          { detail: "Keep editing in PowerPoint, Keynote, or Google Slides", label: "PPTX" },
          { detail: "Motion and transitions intact, ready to share online", label: "HTML" },
          { detail: "MotionDoc source code, friendly to version control", label: "MDX" }
        ],
    exportNote: isZh ? "免費註冊即可解鎖 HTML 網頁簡報與 MDX 匯出。" : "Sign in to unlock HTML web presentations and MDX export.",
    mcpTitle: isZh ? "讓 AI 幫你做簡報。" : "Let your AI build the deck.",
    mcpBody: isZh
      ? "在本機用 npx 啟動，或透過 OAuth 連接 Remote MCP。"
      : "Run locally with npx, or connect to Remote MCP over OAuth.",
    mcpClients: isZh ? "Claude · Codex · Cursor · Antigravity 等相容 client" : "Claude · Codex · Cursor · Antigravity, and any compatible client",
    mcpAgentPrompt: isZh ? "「把 Q3 業務回顧做成 6 頁簡報。」" : "\u201CTurn the Q3 review into a 6-slide deck.\u201D",
    mcpAgentDone: isZh
      ? ["建立 6 張投影片", "套用 Editorial 版型", "匯出 deck.pptx"]
      : ["Created 6 slides", "Applied Editorial layout", "Exported deck.pptx"],
    mcpCapabilities: isZh
      ? [
          { detail: "建立 deck、套用版型與 shader", label: "CREATE" },
          { detail: "讀取每張投影片與區塊", label: "INSPECT" },
          { detail: "精準移動、更新與重排", label: "EDIT" },
          { detail: "輸出互動 HTML 與 PPTX", label: "EXPORT" }
        ]
      : [
          { detail: "Create decks from layouts and shaders", label: "CREATE" },
          { detail: "Read every slide and block", label: "INSPECT" },
          { detail: "Move, update, and reorder precisely", label: "EDIT" },
          { detail: "Ship interactive HTML and PPTX", label: "EXPORT" }
        ],
    copyLabel: isZh ? "複製" : "Copy",
    copiedLabel: isZh ? "已複製" : "Copied",
    workflow: isZh
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
    faqTitle: isZh ? "常見問題，幫你解答。" : "Questions, answered.",
    faqBody: isZh ? "關於 Pitch 與 SlideX MCP 的核心問題。" : "The essentials about Pitch and SlideX MCP.",
    faqItems: isZh
      ? [
          ["需要註冊才能試用嗎？", "不需要。你可以直接開啟 Live Demo，修改文字與圖片，並預覽整份簡報。"],
          ["什麼是 SlideX MCP？", "SlideX MCP 是讓 AI client 操作簡報的 Model Context Protocol server。可以在本機用 npx 執行，或透過 OAuth 連接 Remote MCP。"],
          ["用 MCP 需要會寫程式嗎？", "不需要。安裝一次之後，用自然語言告訴 AI 你要什麼。建立投影片、調整版面或匯出 PPTX 都可以。"],
          ["重新整理後修改會消失嗎？", "不會。訪客的示範內容會自動保存在目前瀏覽器的 localStorage。"],
          ["可以從模板開始嗎？", "可以。登入後會看到 Welcome Deck 與 Launch Deck 兩個內建模板。"],
          ["可以在瀏覽器播放簡報嗎？", "可以。你可以隨時開啟預覽並播放投影片。"],
          ["可以匯出 PowerPoint 嗎？", "可以。Live Demo 可直接輸出 PPTX；HTML、MDX 等其他格式需登入後才可使用。"]
        ]
      : [
          ["Do I need an account to try it?", "No. Open the Live Demo to edit text and images, preview the deck, and play the presentation."],
          ["What is SlideX MCP?", "SlideX MCP is a Model Context Protocol server that lets AI clients work on presentations. Run it locally with npx, or connect to Remote MCP over OAuth."],
          ["Do I need to code to use MCP?", "No. Install it once, then just tell your AI what you want. Create slides, adjust layouts, or export a PPTX."],
          ["Will my changes survive a refresh?", "Yes. Guest demo changes are saved automatically in this browser's localStorage."],
          ["Can I start from a template?", "Yes. Signed-in workspaces include the Welcome Deck and Launch Deck templates."],
          ["Can I preview and play the deck in the browser?", "Yes. Open the presentation preview at any time and play through every slide."],
          ["Can I export to PowerPoint?", "Yes. The Live Demo exports PPTX directly. Sign in to unlock HTML, MDX, and other formats."]
        ],
    ctaTitle: isZh ? "現在就用一份完整簡報開始。" : "Start with a complete deck now.",
    ctaBody: isZh ? "自己動手，或交給 AI。兩種方式都不需要註冊。" : "Build it yourself or hand it to your AI. No sign-up either way."
  };

  const previewImage = `/marketing/preview-${locale}.webp`;

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-canvas text-ink selection:bg-accent/30">
      <InteractiveHero
        body={copy.heroBody}
        isZh={isZh}
        primaryCta={copy.primaryCta}
        reduceMotion={Boolean(reduceMotion)}
        secondaryCta={copy.secondaryCta}
        supportingNote={isZh ? "不需要註冊即可開始試用。" : "No account required to start."}
        title={isZh ? ["用自然語言，與 AI Agent", "一起打造專業簡報。"] : ["Build professional presentations", "effortlessly with AI Agents."]}
      />

      <MarqueeStrip />

      <BentoGridSection copy={copy} docsMcpPath={docsMcpPath} isZh={isZh} reveal={reveal} />

      <ExportSection copy={copy} image={previewImage} reveal={reveal} />

      <McpSection copy={copy} docsMcpPath={docsMcpPath} reduceMotion={Boolean(reduceMotion)} reveal={reveal} />

      <WorkflowSection items={copy.workflow} reveal={reveal} />

      <FaqSection body={copy.faqBody} items={copy.faqItems} reduceMotion={Boolean(reduceMotion)} reveal={reveal} title={copy.faqTitle} />

      <FinalCtaSection copy={copy} docsMcpPath={docsMcpPath} reveal={reveal} />
    </main>
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

function MarqueeStrip() {
  return (
    <div aria-hidden="true" className="relative overflow-hidden border-y border-white/[0.09] bg-white/[0.015] py-4 backdrop-blur-sm">
      <div className="animate-mktg-marquee flex w-max items-center">
        {[0, 1].map((half) => (
          <div className="flex items-center" key={half}>
            {MARQUEE_ITEMS.map((item) => (
              <span className="flex items-center" key={`${half}-${item}`}>
                <span className="px-7 font-mono-geist text-[12px] tracking-[0.3em] text-white/45">{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent/70 shadow-[0_0_8px_rgba(196,238,135,0.6)]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

{/* Clean, Minimalist Editorial Bento Grid Section */}
function BentoGridSection({
  copy,
  docsMcpPath,
  isZh,
  reveal
}: {
  copy: HomeCopy;
  docsMcpPath: string;
  isZh: boolean;
  reveal: Reveal;
}) {
  return (
    <MktgSection className="py-24 lg:py-32">
      <motion.div {...reveal()} className="text-center md:text-left">
        <Eyebrow className="justify-center md:justify-start">ESSENTIAL CAPABILITIES</Eyebrow>
        <h2 className="mt-4 text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
          {copy.pathsTitle}
        </h2>
      </motion.div>

      {/* Clean Minimalist Bento Grid */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Tier 1 Card A: AI Builder Bento Card (7 cols) */}
        <motion.article
          {...reveal(0.05)}
          className="group relative md:col-span-7 flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.035] sm:p-10"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-md border border-white/14 bg-white/[0.04] px-3 py-1 font-mono-geist text-[11px] tracking-[0.24em] text-accent">
                <Cpu className="h-3.5 w-3.5 text-accent" />
                {copy.paths[1].eyebrow}
              </div>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
            </div>
            
            <h3 className="mt-6 text-[clamp(26px,2.8vw,36px)] font-semibold leading-[1.06] tracking-[-0.03em] [text-wrap:balance]">
              {copy.paths[1].title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/65">{copy.paths[1].body}</p>

            <ul className="mt-8 grid gap-3 border-t border-white/[0.09] pt-6">
              {copy.paths[1].bullets.map((bullet) => (
                <li className="flex items-center gap-3 text-[14px] text-ink/80" key={bullet}>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent border border-accent/30 shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-10 pt-2">
            <MktgGhostLink href={docsMcpPath}>
              {copy.secondaryCta}
              <ArrowRight className="h-4 w-4" />
            </MktgGhostLink>
          </div>
        </motion.article>

        {/* Tier 1 Card B: Presenter Live Canvas Bento Card (5 cols) */}
        <motion.article
          {...reveal(0.12)}
          className="group relative md:col-span-5 flex flex-col justify-between overflow-hidden rounded-3xl bg-accent p-8 text-on-accent shadow-[0_20px_60px_rgba(196,238,135,0.18)] transition-all duration-300 hover:scale-[1.01] sm:p-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-on-accent/20 bg-on-accent/10 px-3 py-1 font-mono-geist text-[11px] tracking-[0.24em] text-on-accent/70">
              <Layers className="h-3.5 w-3.5 text-on-accent" />
              {copy.paths[0].eyebrow}
            </div>
            
            <h3 className="mt-6 text-[clamp(26px,2.8vw,36px)] font-semibold leading-[1.06] tracking-[-0.03em] [text-wrap:balance]">
              {copy.paths[0].title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-on-accent/75">{copy.paths[0].body}</p>

            <ul className="mt-8 grid gap-3 border-t border-on-accent/20 pt-6">
              {copy.paths[0].bullets.map((bullet) => (
                <li className="flex items-center gap-3 text-[14px] text-on-accent/90" key={bullet}>
                  <Check className="h-3.5 w-3.5 shrink-0 text-on-accent" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-10 pt-2">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-canvas px-7 text-[15px] font-semibold text-ink transition-colors hover:bg-[#16181c] active:translate-y-px"
              href={appRoutes.liveDemo}
            >
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.article>

        {/* Tier 2 Card 1: PPTX Export Bento Card (4 cols) */}
        <motion.article
          {...reveal(0.16)}
          className="group relative md:col-span-4 flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.035]"
        >
          <div>
            <div className="flex items-center gap-2.5 font-mono-geist text-[12px] font-semibold text-accent">
              <FileSpreadsheet className="h-4 w-4 text-accent" />
              <span>{copy.exportFormats[0].label}</span>
            </div>
            <h4 className="mt-4 text-[20px] font-semibold text-ink">
              {isZh ? "PowerPoint 向量相容" : "PowerPoint Vector Ready"}
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/60">{copy.exportFormats[0].detail}</p>
          </div>
          <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-ink/40 font-mono-geist text-[11px]">
            <span>FULLY EDITABLE</span>
            <span>Keynote · Slides</span>
          </div>
        </motion.article>

        {/* Tier 2 Card 2: Paper Shaders Bento Card (4 cols) */}
        <motion.article
          {...reveal(0.2)}
          className="group relative md:col-span-4 flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.035]"
        >
          <div>
            <div className="flex items-center gap-2.5 font-mono-geist text-[12px] font-semibold text-accent">
              <Palette className="h-4 w-4 text-accent" />
              <span>PAPER SHADERS</span>
            </div>
            <h4 className="mt-4 text-[20px] font-semibold text-ink">
              {isZh ? "視覺版型與 GLSL" : "Aesthetic Layouts & GLSL"}
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/60">
              {isZh ? "內建 Editorial, Mesh, Orbit, Signal 等高質感視覺預設。" : "Built-in Editorial, Mesh, Orbit, Signal shaders and refined typography."}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center gap-1.5">
            {["EDITORIAL", "MESH", "ORBIT", "SIGNAL"].map((preset) => (
              <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono-geist text-[10px] text-white/60" key={preset}>
                {preset}
              </span>
            ))}
          </div>
        </motion.article>

        {/* Tier 2 Card 3: Local MDX Privacy Bento Card (4 cols) */}
        <motion.article
          {...reveal(0.24)}
          className="group relative md:col-span-4 flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.035]"
        >
          <div>
            <div className="flex items-center gap-2.5 font-mono-geist text-[12px] font-semibold text-accent">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>LOCAL & PRIVATE</span>
            </div>
            <h4 className="mt-4 text-[20px] font-semibold text-ink">
              {isZh ? "本機離線與版本控制" : "Offline & MDX Friendly"}
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/60">
              {copy.exportFormats[1].detail} & {copy.exportFormats[2].detail}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-ink/40 font-mono-geist text-[11px]">
            <span className="flex items-center gap-1">
              <Code className="h-3.5 w-3.5 text-accent" /> MDX SOURCE
            </span>
            <span>NO ACCOUNT NEEDED</span>
          </div>
        </motion.article>
      </div>
    </MktgSection>
  );
}



function ExportSection({ copy, image, reveal }: { copy: HomeCopy; image: string; reveal: Reveal }) {
  return (
    <MktgSection className="border-t border-white/[0.08] py-24 lg:py-32">
      <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <motion.div {...reveal(0.05)}>
          <BrowserFrame alt={copy.exportTitle} src={image} url="slidexdeck.com/workspace/pitch?demo=1&view=preview" />
          <div className="flex items-center justify-between border-b border-white/[0.1] pb-3 pt-4">
            <p className="font-mono-geist text-[10px] tracking-[0.24em] text-white/45">FIG.02 — PLAYBACK</p>
            <p className="font-mono-geist text-[10px] tracking-[0.24em] text-white/45">MOTION INTACT</p>
          </div>
        </motion.div>

        <motion.div {...reveal(0.12)} className="flex flex-col justify-center">
          <Eyebrow>EXPORT & PREVIEW</Eyebrow>
          <h3 className="mt-4 max-w-md text-[clamp(26px,3vw,38px)] font-semibold leading-[1.06] tracking-[-0.03em] [text-wrap:balance]">
            {copy.exportTitle}
          </h3>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/60">{copy.exportBody}</p>
          
          <dl className="mt-8 border-t border-white/[0.1]">
            {copy.exportFormats.map((format) => (
              <div className="grid grid-cols-[72px_1fr] items-baseline gap-4 border-b border-white/[0.1] py-4" key={format.label}>
                <dt className="font-mono-geist text-[12px] font-semibold tracking-[0.18em] text-accent">{format.label}</dt>
                <dd className="text-[14px] leading-6 text-ink/70">{format.detail}</dd>
              </div>
            ))}
          </dl>
          
          <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3.5 py-2">
            <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="font-mono-geist text-[11px] tracking-[0.12em] text-white/50">{copy.exportNote}</span>
          </div>
        </motion.div>
      </div>
    </MktgSection>
  );
}

function McpSection({
  copy,
  docsMcpPath,
  reduceMotion,
  reveal
}: {
  copy: HomeCopy;
  docsMcpPath: string;
  reduceMotion: boolean;
  reveal: Reveal;
}) {
  const [activeTab, setActiveTab] = useState<"workflow" | "install" | "config">("workflow");

  const capabilities = [
    { icon: Sparkles, badge: "GLSL & Layouts", ...copy.mcpCapabilities[0] },
    { icon: Search, badge: "Blocks & MotionDoc", ...copy.mcpCapabilities[1] },
    { icon: Edit3, badge: "Conflict-Safe Writes", ...copy.mcpCapabilities[2] },
    { icon: Download, badge: "PPTX, HTML & MDX", ...copy.mcpCapabilities[3] }
  ];

  const clientPills = ["Claude", "Codex", "Cursor", "Antigravity"];

  return (
    <section className="relative border-t border-white/[0.08] bg-canvas-deep px-5 py-24 sm:px-7 lg:px-10 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-accent/5 blur-[120px]" />
      
      <div className="mx-auto max-w-[1200px]">
        {/* Header with Title & Top-Right Action Buttons */}
        <motion.div {...reveal()} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Eyebrow>SlideX MCP Protocol</Eyebrow>
            <h2 className="mt-4 text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
              {copy.mcpTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink/65 sm:text-[16px] sm:leading-8">{copy.mcpBody}</p>
            
            {/* Client Ecosystem Badges Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className="font-mono-geist text-[11px] tracking-[0.18em] text-white/40 uppercase mr-1">SUPPORTED CLIENTS:</span>
              {clientPills.map((client) => (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-white/[0.04] px-3.5 py-1 backdrop-blur-md font-mono-geist text-[12px] font-medium text-white/80 transition-colors hover:border-accent/40 hover:text-accent" key={client}>
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {client}
                </span>
              ))}
            </div>
          </div>

          {/* Clean Top-Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <MktgGhostLink href={docsMcpPath}>{copy.secondaryCta}</MktgGhostLink>
            <a
              className="group inline-flex h-12 items-center gap-2 rounded-md border border-white/16 bg-white/[0.045] px-5 text-[14px] font-semibold text-white transition-colors hover:border-white/30 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4ee87]"
              href="https://github.com/zz41354899/SlideX"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </motion.div>

        {/* Stage Grid */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 items-start">
          {/* Left Side: Unified macOS Interactive Terminal Stage */}
          <motion.div {...reveal(0.06)} className="overflow-hidden rounded-2xl border border-white/16 bg-white/[0.02] shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            {/* macOS Terminal Header with Interactive Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.09] bg-white/[0.03] px-5 py-3">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f56]/80 border border-[#e0443e]/40" />
                  <span className="h-3 w-3 rounded-full bg-[#ffbd2e]/80 border border-[#dea123]/40" />
                  <span className="h-3 w-3 rounded-full bg-[#27c93f]/80 border border-[#1aab29]/40" />
                </span>
                <span className="font-mono-geist text-[11px] text-white/50">slidex-mcp-server</span>
              </div>

              {/* Ultra-Refined macOS Segmented Control Tab Switcher */}
              <div className="relative flex items-center gap-1 rounded-xl border border-white/14 bg-black/40 p-1 backdrop-blur-md">
                {(
                  [
                    { id: "workflow", label: "WORKFLOW", icon: Zap },
                    { id: "install", label: "INSTALL", icon: Terminal },
                    { id: "config", label: "CONFIG", icon: SlidersHorizontal }
                  ] as const
                ).map((tab) => {
                  const isActive = activeTab === tab.id;
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 font-mono-geist text-[11px] font-bold transition-colors rounded-lg ${
                        isActive ? "text-on-accent" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeMcpTabPill"
                          className="absolute inset-0 z-0 rounded-lg bg-accent shadow-[0_0_14px_rgba(196,238,135,0.4)] border border-accent/60"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <IconComponent className={`h-3.5 w-3.5 ${isActive ? "text-on-accent" : "text-white/50"}`} />
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terminal Body Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "workflow" && (
                  <motion.div
                    key="workflow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <p className="flex items-center gap-2.5 font-mono-geist text-[11px] tracking-[0.2em] text-white/50">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                        </span>
                        AGENT SESSION EXECUTION
                      </p>
                      <Terminal className="h-4 w-4 text-accent" />
                    </div>
                    
                    <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
                      <p className="font-mono-geist text-[10px] tracking-[0.22em] text-accent">USER PROMPT</p>
                      <p className="mt-1.5 font-mono-geist text-[14.5px] font-semibold text-white">{copy.mcpAgentPrompt}</p>
                    </div>

                    <div className="mt-5 space-y-2.5">
                      <p className="font-mono-geist text-[11px] tracking-[0.18em] text-white/40">COMPLETED ACTIONS:</p>
                      {copy.mcpAgentDone.map((item, index) => (
                        <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 font-mono-geist text-[13px] text-white/80" key={item}>
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent">
                            <Check className="h-3 w-3" />
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "install" && (
                  <motion.div
                    key="install"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CodeCard code={MCP_INSTALL_COMMAND} copyLabel={copy.copyLabel} copiedLabel={copy.copiedLabel} title="TERMINAL INSTALL COMMAND" />
                  </motion.div>
                )}

                {activeTab === "config" && (
                  <motion.div
                    key="config"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CodeCard code={MCP_CONFIG_SNIPPET} copyLabel={copy.copyLabel} copiedLabel={copy.copiedLabel} title="MCP CONFIGURATION SNIPPET" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Side: 4 Frosted Glass Visual Capability Cards */}
          <motion.div {...reveal(0.12)} className="grid gap-4">
            {capabilities.map((cap, index) => {
              const IconComponent = cap.icon;
              return (
                <div
                  className="group relative flex items-start gap-4 rounded-2xl border border-white/12 bg-white/[0.025] p-5 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.05]"
                  key={cap.label}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-on-accent">
                    <IconComponent className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-geist text-[12px] font-bold tracking-[0.2em] text-accent">{cap.label}</span>
                      <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono-geist text-[10px] text-white/50">{cap.badge}</span>
                    </div>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink/75 group-hover:text-ink">{cap.detail}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ items, reveal }: { items: HomeCopy["workflow"]; reveal: Reveal }) {
  return (
    <MktgSection className="py-24 lg:py-32">
      <motion.div {...reveal()} className="text-center">
        <Eyebrow className="justify-center">HOW IT WORKS</Eyebrow>
        <h2 className="mt-4 text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
          Simple three-step workflow.
        </h2>
      </motion.div>

      {/* Minarah inspired 3-step cards */}
      <motion.div {...reveal(0.08)} className="mt-14 grid gap-6 md:grid-cols-3">
        {items.map((step, index) => (
          <article
            className="group relative flex flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.04]"
            key={step.title}
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 border border-accent/30 font-mono-geist text-[14px] font-bold text-accent">
                0{index + 1}
              </div>
              <h3 className="mt-6 text-[clamp(22px,2.4vw,28px)] font-semibold leading-tight tracking-[-0.03em]">{step.title}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink/60">{step.detail}</p>
            </div>
            
            <div className="mt-8 h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-full bg-accent/60 transition-transform duration-500 -translate-x-full group-hover:translate-x-0" />
            </div>
          </article>
        ))}
      </motion.div>
    </MktgSection>
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
  reveal: Reveal;
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <MktgSection className="border-t border-white/[0.08] py-24 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.65fr_1fr] lg:gap-20">
        <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-4 max-w-md text-[clamp(32px,4.4vw,54px)] font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
            {title}
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink/60">{body}</p>
        </motion.div>

        {/* Super Shortcuts Accordion */}
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
                  className="group flex w-full items-start justify-between gap-6 py-6 text-left focus:outline-none"
                >
                  <span className="max-w-[38rem] text-[17px] font-medium leading-7 text-ink/86 transition-colors group-hover:text-accent sm:text-lg">
                    {question}
                  </span>
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/16 text-white/52 transition-all duration-300 ${isOpen ? "bg-accent/15 border-accent/50 text-accent rotate-180" : "group-hover:border-accent/40 group-hover:text-accent"}`}>
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={answerId}
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: mktgEase }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[38rem] pb-7 pr-12 text-[15px] leading-relaxed text-ink/60 sm:text-[16px]">{answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </MktgSection>
  );
}

function FinalCtaSection({ copy, docsMcpPath, reveal }: { copy: HomeCopy; docsMcpPath: string; reveal: Reveal }) {
  return (
    <section className="px-5 py-24 sm:px-7 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1200px]">
        {/* Minarah & Super Shortcuts Inspired Gradient Banner */}
        <motion.div
          {...reveal()}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent via-[#a8ea49] to-[#88d626] p-10 text-on-accent shadow-[0_30px_90px_rgba(196,238,135,0.2)] sm:p-16 text-center"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_60%)]" />
          
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="text-[clamp(38px,5.8vw,76px)] font-semibold leading-[0.98] tracking-[-0.04em] [text-wrap:balance]">
              {copy.ctaTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-on-accent/80 font-medium sm:text-[17px]">
              {copy.ctaBody}
            </p>
            
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className="inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-canvas px-8 text-[15px] font-semibold text-ink transition-all duration-200 hover:bg-[#16181c] hover:scale-[1.02] active:translate-y-px shadow-lg"
                href={appRoutes.liveDemo}
              >
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-on-accent/30 bg-on-accent/10 px-7 text-[15px] font-semibold text-on-accent backdrop-blur-md transition-all duration-200 hover:bg-on-accent/20 active:translate-y-px"
                href={docsMcpPath}
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
