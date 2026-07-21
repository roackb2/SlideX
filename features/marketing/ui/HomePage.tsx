"use client";

import { useState, type PointerEvent } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Check,
  ChevronDown,
  Sparkles,
  FileSpreadsheet,
  Palette,
  ShieldCheck,
  Code,
  Search,
  Edit3,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  Play,
  Share2,
  Grid,
  Maximize2,
  Zap,
  MessageSquare
} from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import {
  BrowserFrame,
  CodeCard,
  MktgGhostLink,
  MktgPrimaryLink,
  MktgSection,
  TrustBadgeRow,
  mktgEase
} from "@/features/marketing/ui/primitives";
import { StyleThumbnail } from "@/features/marketing/ui/StyleThumbnail";

const MCP_INSTALL_COMMAND = "npx -y @z7589xxz758/slidex-mcp-server";

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
  exportTitle: string;
  faqBody: string;
  faqItems: string[][];
  faqTitle: string;
  heroBody: string;
  heroSlideAria: (variant: SlideVariant) => string;
  mcpBody: string;
  mcpCapabilities: { detail: string; label: string }[];
  mcpClients: string;
  mcpTitle: string;
  paths: { body: string; bullets: string[]; cta: string; title: string }[];
  pathsTitle: string;
  primaryCta: string;
  docsCta: string;
  workflow: { detail: string; title: string }[];
  workflowTitle: string;
};

type Reveal = (delay?: number) => Record<string, unknown>;

export function HomePage() {
  const { locale, localePath } = useI18n();
  const reduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";
  const agentPath = localePath("/agent");
  const mcpServerPath = localePath("/docs#mcp-server");

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
      ? "從一個想法開始，和 AI Agent 一起完成一份清楚、有說服力的簡報。"
      : "Turn an idea into a clear presentation, then refine every slide with AI.",
    primaryCta: isZh ? "開啟 Live Demo" : "Try Live Demo",
    docsCta: isZh ? "查看詳細文件" : "Read the documentation",
    heroSlideAria: (variant) => (isZh ? `顯示 ${variant} 投影片` : `Show ${variant} slide`),
    pathsTitle: isZh ? "把想法做成簡報" : "Turn an idea into a polished deck",
    paths: isZh
      ? [
          {
            body: "從完整的示範簡報開始，改文字、換圖片、調整版面，完成後直接匯出。",
            bullets: ["免註冊 Live Demo", "畫布與圖層直接編輯", "匯出可編輯的 PPTX"],
            cta: "開啟 Live Demo",
            title: "直接打開簡報開始修改"
          },
          {
            body: "說出方向、補充資料、調整語氣。AI Agent 會在同一份簡報裡一路幫你完成。",
            bullets: ["建立與重排投影片", "檢查並修改每個區塊", "在同一段對話持續完成"],
            cta: "了解 AI Agent",
            title: "和 AI 一起更快完成簡報"
          }
        ]
      : [
          {
            body: "Start with a complete demo deck. Change the copy, images, and layout, then export when it is ready.",
            bullets: ["Live Demo without sign-up", "Direct canvas and layer editing", "Editable PPTX export"],
            cta: "Try Live Demo",
            title: "Open a deck and make it yours"
          },
          {
            body: "Set the direction, add context, and keep refining. Your agent works with you in the same presentation.",
            bullets: ["Create and reorder slides", "Inspect and edit every block", "Keep refining in one conversation"],
            cta: "Explore AI Agent",
            title: "Build the deck with an AI Agent"
          }
        ],
    exportTitle: isZh ? "先看細節再放心匯出" : "Preview every detail before you export",
    exportBody: isZh
      ? "在送出前播放整份簡報，確認節奏與細節，再匯出到你習慣的工具。"
      : "Play through the deck before you share it, then export to the tools your team already uses.",
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
    mcpTitle: isZh ? "讓 AI client 操作你的簡報" : "Let your AI client work on real decks",
    mcpBody: isZh
      ? "以本機或遠端 MCP 連接相容的 AI client，直接建立、檢查與更新 SlideX 簡報。"
      : "Connect a compatible AI client through local or remote MCP to create, inspect, and update SlideX presentations.",
    mcpClients: isZh ? "支援 Claude、Codex、Cursor、Antigravity 與其他相容 client" : "Works with Claude, Codex, Cursor, Antigravity, and other compatible clients",
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
          { detail: "從一份已完成版面與視覺的簡報開始。", title: "選一份簡報" },
          { detail: "在瀏覽器裡調整文字、圖片與版面。", title: "完成內容" },
          { detail: "下載 PPTX，或登入後輸出 HTML 與 MDX。", title: "帶著成果離開" }
        ]
      : [
          { detail: "Start with a deck that already has a finished visual direction.", title: "Pick a deck" },
          { detail: "Refine the copy, images, and layout in your browser.", title: "Make it yours" },
          { detail: "Download a PPTX, or sign in to export HTML and MDX.", title: "Share the result" }
        ],
    workflowTitle: isZh ? "三步完成一份簡報" : "From idea to final deck",
    faqTitle: isZh ? "常見問題" : "Frequently asked questions",
    faqBody: isZh ? "關於 Pitch 與 SlideX MCP 的核心問題。" : "The essentials about Pitch and SlideX MCP.",
    faqItems: isZh
      ? [
          ["需要註冊才能試用嗎？", "不需要。你可以直接開啟 Live Demo，修改文字與圖片，並預覽整份簡報。"],
          ["AI Agent 可以幫我做什麼？", "用自然語言說明需求後，Agent 會在同一份簡報裡建立投影片、調整內容與版面，同時保留你的手動修改。"],
          ["什麼是 SlideX MCP？", "SlideX MCP 是讓 AI client 操作簡報的 Model Context Protocol server。可以在本機用 npx 執行，或透過 OAuth 連接 Remote MCP。"],
          ["用 MCP 需要會寫程式嗎？", "不需要。安裝一次之後，用自然語言告訴 AI 你要什麼。建立投影片、調整版面或匯出 PPTX 都可以。"],
          ["重新整理後修改會消失嗎？", "不會。訪客的示範內容會自動保存在目前瀏覽器的 localStorage。"],
          ["可以從模板開始嗎？", "可以。登入後會看到 Welcome Deck 與 Launch Deck 兩個內建模板。"],
          ["可以在瀏覽器播放簡報嗎？", "可以。你可以隨時開啟預覽並播放投影片。"],
          ["可以匯出 PowerPoint 嗎？", "可以。Live Demo 可直接輸出 PPTX；HTML、MDX 等其他格式需登入後才可使用。"]
        ]
      : [
          ["Do I need an account to try it?", "No. Open the Live Demo to edit text and images, preview the deck, and play the presentation."],
          ["What can the AI Agent do?", "Describe what you need in natural language. The Agent creates slides and refines content and layout in the same presentation while keeping your manual edits."],
          ["What is SlideX MCP?", "SlideX MCP is a Model Context Protocol server that lets AI clients work on presentations. Run it locally with npx, or connect to Remote MCP over OAuth."],
          ["Do I need to code to use MCP?", "No. Install it once, then just tell your AI what you want. Create slides, adjust layouts, or export a PPTX."],
          ["Will my changes survive a refresh?", "Yes. Guest demo changes are saved automatically in this browser's localStorage."],
          ["Can I start from a template?", "Yes. Signed-in workspaces include the Welcome Deck and Launch Deck templates."],
          ["Can I preview and play the deck in the browser?", "Yes. Open the presentation preview at any time and play through every slide."],
          ["Can I export to PowerPoint?", "Yes. The Live Demo exports PPTX directly. Sign in to unlock HTML, MDX, and other formats."]
        ],
    ctaTitle: isZh ? "開始下一份簡報" : "Start your next deck",
    ctaBody: isZh ? "自己修改，或和 AI Agent 一起完成。" : "Work on it yourself, or build it with an AI Agent."
  };

  const previewImage = `/marketing/preview-${locale}.webp`;

  return (
    <main className="marketing-shell min-h-[100dvh] overflow-hidden text-ink selection:bg-accent/30">
      <InteractiveHero
        body={copy.heroBody}
        isZh={isZh}
        primaryCta={copy.primaryCta}
        reduceMotion={Boolean(reduceMotion)}
        title={isZh ? ["和 AI Agent 一起", "完成下一份簡報"] : ["Build better presentations", "with an AI Agent"]}
      />

      <MarqueeStrip />

      <BentoGridSection agentPath={agentPath} copy={copy} isZh={isZh} reveal={reveal} />

      <ExportSection copy={copy} image={previewImage} reveal={reveal} />

      <McpSection copy={copy} mcpServerPath={mcpServerPath} reveal={reveal} />

      <WorkflowSection items={copy.workflow} reveal={reveal} title={copy.workflowTitle} />

      <FaqSection body={copy.faqBody} items={copy.faqItems} reduceMotion={Boolean(reduceMotion)} reveal={reveal} title={copy.faqTitle} />

      <FinalCtaSection copy={copy} mcpServerPath={mcpServerPath} reveal={reveal} />
    </main>
  );
}

function InteractiveHero({
  body,
  isZh,
  primaryCta,
  reduceMotion,
  title
}: {
  body: string;
  isZh: boolean;
  primaryCta: string;
  reduceMotion: boolean;
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
      className="relative isolate flex flex-col items-center overflow-hidden border-b border-white/[0.09] px-5 pb-12 pt-36 text-white sm:px-6 lg:px-8 lg:pb-24 lg:pt-40"
    >
      <div aria-hidden="true" className="marketing-hero-surface absolute inset-0 -z-20" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[18%] left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#d8f27d]/10 blur-[160px]" />
      </div>

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.82, ease: easeOut }}
        className={`relative z-20 mx-auto w-full text-center ${isZh ? "max-w-[900px]" : "max-w-[1080px]"}`}
      >
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-[14px] shadow-[0_0_40px_rgba(216,242,125,0.14)]">
          <Image src="/favicon.svg" alt="SlideX Icon" width={64} height={64} className="h-16 w-16" />
        </div>

        <h1 className={`mx-auto font-semibold leading-[1.05] tracking-[-0.03em] [text-wrap:balance] ${isZh ? "text-[48px] sm:text-[64px] lg:text-[76px]" : "text-[43px] sm:text-[48px] lg:text-[68px]"}`}>
          {title.map((line) => (
            <span className="block" key={line}>{line}</span>
          ))}
        </h1>
        <p className="mx-auto mt-6 max-w-[600px] text-[18px] leading-8 text-white/50">
          {body}
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={appRoutes.liveDemo}
            className="group inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 text-[15px] font-semibold text-on-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-hover active:scale-[0.98] sm:w-auto"
          >
            {primaryCta}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px"><ArrowRight className="h-4 w-4" /></span>
          </Link>
        </div>
      </motion.div>

      {/* Hero Container with Floating Mockup */}
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 40 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: easeOut }}
        className="relative z-10 mx-auto mt-20 w-full max-w-[1200px]"
      >
        <div className="paper-panel relative aspect-[16/11] overflow-hidden rounded-[2rem] border border-white/14 p-2 sm:p-3">
          <div className="relative h-full w-full overflow-hidden rounded-[calc(2rem-0.375rem)] border border-white/[0.08] bg-[#0a0b09] p-2 sm:p-3">
            <BrowserFrame alt="App preview" src="/marketing/preview-en.webp" url="slidexdeck.com/workspace/pitch" />
          </div>
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

function MarqueeStrip() {
  return (
    <div aria-hidden="true" className="relative overflow-hidden border-y border-white/[0.09] bg-white/[0.015] py-4 backdrop-blur-sm">
      <div className="animate-mktg-marquee flex w-max items-center">
        {[0, 1].map((half) => (
          <div className="flex items-center" key={half}>
            {MARQUEE_ITEMS.map((item) => (
              <span className="flex items-center" key={`${half}-${item}`}>
                <span className="px-7 font-mono-geist text-[12px] tracking-[0.3em] text-white/40">{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
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
  agentPath,
  copy,
  isZh,
  reveal
}: {
  agentPath: string;
  copy: HomeCopy;
  isZh: boolean;
  reveal: Reveal;
}) {
  return (
    <MktgSection className="py-24 lg:py-32">
      <motion.div {...reveal()} className="text-center md:text-left">
        <h2 className="text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
          {copy.pathsTitle}
        </h2>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-12">
        <motion.article
          {...reveal(0.05)}
          className="group relative md:col-span-7 flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.02] p-8 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.04] sm:p-10"
        >
          <div>
            <h3 className="text-[clamp(26px,2.8vw,36px)] font-semibold leading-[1.06] tracking-[-0.03em] [text-wrap:balance] text-white">
              {copy.paths[1].title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/50">{copy.paths[1].body}</p>

            <ul className="mt-8 grid gap-3 border-t border-white/10 pt-6">
              {copy.paths[1].bullets.map((bullet) => (
                <li className="flex items-center gap-3 text-[14px] text-white/70" key={bullet}>
                  <Check className="h-4 w-4 shrink-0 text-white/50" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-10 pt-2">
            <MktgGhostLink href={agentPath}>
              {copy.paths[1].cta}
              <ArrowRight className="h-4 w-4" />
            </MktgGhostLink>
          </div>
        </motion.article>

        <motion.article
          {...reveal(0.12)}
          className="group relative md:col-span-5 flex flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-white/[0.02] p-8 text-white transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.04] sm:p-10"
        >
          <div>
            <h3 className="text-[clamp(26px,2.8vw,36px)] font-semibold leading-[1.06] tracking-[-0.03em] [text-wrap:balance]">
              {copy.paths[0].title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/50">{copy.paths[0].body}</p>

            <ul className="mt-8 grid gap-3 border-t border-white/10 pt-6">
              {copy.paths[0].bullets.map((bullet) => (
                <li className="flex items-center gap-3 text-[14px] text-white/70" key={bullet}>
                  <Check className="h-4 w-4 shrink-0 text-white/50" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-10 pt-2">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent px-7 text-[15px] font-semibold text-on-accent transition-colors hover:bg-accent-hover active:translate-y-px"
              href={appRoutes.liveDemo}
            >
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.article>

        <motion.article
          {...reveal(0.16)}
          className="group relative md:col-span-4 flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.04]"
        >
          <div>
            <div className="flex items-center gap-2.5 font-mono-geist text-[12px] font-semibold text-accent">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{copy.exportFormats[0].label}</span>
            </div>
            <h4 className="mt-4 text-[20px] font-semibold text-white">
              {isZh ? "PowerPoint 向量相容" : "PowerPoint Vector Ready"}
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed text-white/50">{copy.exportFormats[0].detail}</p>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-white/40 font-mono-geist text-[11px]">
            <span>FULLY EDITABLE</span>
            <span>Keynote · Slides</span>
          </div>
        </motion.article>

        <motion.article
          {...reveal(0.2)}
          className="group relative md:col-span-4 flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.04]"
        >
          <div>
            <div className="flex items-center gap-2.5 font-mono-geist text-[12px] font-semibold text-accent">
              <Palette className="h-4 w-4" />
              <span>PAPER SHADERS</span>
            </div>
            <h4 className="mt-4 text-[20px] font-semibold text-white">
              {isZh ? "視覺版型與 GLSL" : "Aesthetic Layouts & GLSL"}
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed text-white/50">
              {isZh ? "內建 Editorial, Mesh, Orbit, Signal 等高質感視覺預設。" : "Built-in Editorial, Mesh, Orbit, Signal shaders and refined typography."}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-1.5 flex-wrap">
            {["EDITORIAL", "MESH", "ORBIT", "SIGNAL"].map((preset) => (
              <span className="rounded-sm border border-white/10 bg-transparent px-2 py-0.5 font-mono-geist text-[10px] text-white/50" key={preset}>
                {preset}
              </span>
            ))}
          </div>
        </motion.article>

        <motion.article
          {...reveal(0.24)}
          className="group relative md:col-span-4 flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.04]"
        >
          <div>
            <div className="flex items-center gap-2.5 font-mono-geist text-[12px] font-semibold text-accent">
              <ShieldCheck className="h-4 w-4" />
              <span>LOCAL & PRIVATE</span>
            </div>
            <h4 className="mt-4 text-[20px] font-semibold text-white">
              {isZh ? "本機離線與版本控制" : "Offline & MDX Friendly"}
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed text-white/50">
              {copy.exportFormats[1].detail} & {copy.exportFormats[2].detail}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-white/40 font-mono-geist text-[11px]">
            <span className="flex items-center gap-1">
              <Code className="h-3.5 w-3.5 text-white/40" /> MDX SOURCE
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
    <MktgSection className="py-24 lg:py-32">
      <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <motion.div {...reveal(0.05)}>
          <BrowserFrame alt={copy.exportTitle} src={image} url="slidexdeck.com/workspace/pitch?demo=1&view=preview" />
        </motion.div>

        <motion.div {...reveal(0.12)} className="flex flex-col justify-center">
          <h3 className="max-w-md text-[clamp(26px,3vw,38px)] font-semibold leading-[1.06] tracking-[-0.03em] [text-wrap:balance]">
            {copy.exportTitle}
          </h3>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/50">{copy.exportBody}</p>
          
          <dl className="mt-8 border-t border-white/5">
            {copy.exportFormats.map((format) => (
              <div className="grid grid-cols-[72px_1fr] items-baseline gap-4 border-b border-white/5 py-4" key={format.label}>
                <dt className="font-mono-geist text-[12px] font-semibold tracking-[0.18em] text-accent">{format.label}</dt>
                <dd className="text-[14px] leading-6 text-white/70">{format.detail}</dd>
              </div>
            ))}
          </dl>
          
        </motion.div>
      </div>
    </MktgSection>
  );
}

function McpSection({
  copy,
  mcpServerPath,
  reveal
}: {
  copy: HomeCopy;
  mcpServerPath: string;
  reveal: Reveal;
}) {
  const capabilities = [
    { icon: Sparkles, ...copy.mcpCapabilities[0] },
    { icon: Search, ...copy.mcpCapabilities[1] },
    { icon: Edit3, ...copy.mcpCapabilities[2] },
    { icon: Download, ...copy.mcpCapabilities[3] }
  ];

  return (
    <MktgSection className="py-24 lg:py-32" id="mcp">
      <motion.section
        {...reveal()}
        className="paper-panel relative overflow-hidden rounded-[30px] border border-white/12 p-6 sm:p-10 lg:p-14"
      >
        <div aria-hidden="true" className="absolute -right-40 -top-48 h-[30rem] w-[30rem] rounded-full bg-accent/[0.09] blur-[120px]" />
        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="max-w-xl">
            <h2 className="text-[clamp(34px,4.8vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em] [text-wrap:balance]">
              {copy.mcpTitle}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-white/55 sm:text-[16px] sm:leading-8">{copy.mcpBody}</p>
            <p className="mt-6 font-mono-geist text-[11px] leading-6 tracking-[0.12em] text-white/38 sm:text-[12px]">{copy.mcpClients}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <MktgPrimaryLink href={mcpServerPath}>
                {copy.docsCta}
                <ArrowRight className="h-4 w-4" />
              </MktgPrimaryLink>
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#090a08]/70 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:p-3">
            <CodeCard code={MCP_INSTALL_COMMAND} copyLabel={copy.copyLabel} copiedLabel={copy.copiedLabel} title="START LOCALLY" />
          </div>
        </div>

        <div className="relative z-10 mt-12 grid border-t border-white/10 pt-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:pt-6">
          {capabilities.map((cap, index) => {
            const IconComponent = cap.icon;
            return (
              <article
                className={`py-5 sm:px-5 lg:px-6 ${index % 2 === 1 ? "sm:border-l sm:border-white/10" : ""} ${index > 1 ? "sm:border-t sm:border-white/10 lg:border-t-0" : ""} ${index > 0 ? "lg:border-l lg:border-white/10" : ""}`}
                key={cap.label}
              >
                <IconComponent className="h-4 w-4 text-accent" />
                <h3 className="mt-5 font-mono-geist text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">{cap.label}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/48">{cap.detail}</p>
              </article>
            );
          })}
        </div>
      </motion.section>
    </MktgSection>
  );
}

function WorkflowSection({ items, reveal, title }: { items: HomeCopy["workflow"]; reveal: Reveal; title: string }) {
  return (
    <MktgSection className="py-24 lg:py-32">
      <motion.div {...reveal()} className="text-center">
        <h2 className="text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
          {title}
        </h2>
      </motion.div>

      {/* Revone inspired minimalist cards */}
      <motion.div {...reveal(0.08)} className="mt-14 grid gap-6 md:grid-cols-3">
        {items.map((step, index) => (
          <article
            className="group relative flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.02] p-8 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.04]"
            key={step.title}
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 font-mono-geist text-[14px] font-bold text-white">
                0{index + 1}
              </div>
              <h3 className="mt-6 text-[clamp(22px,2.4vw,28px)] font-semibold leading-tight tracking-[-0.03em]">{step.title}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-white/50">{step.detail}</p>
            </div>
            
            <div className="mt-8 h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full w-full bg-white transition-transform duration-500 -translate-x-full group-hover:translate-x-0" />
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
    <MktgSection className="py-24 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.65fr_1fr] lg:gap-20">
        <motion.div {...reveal()} className="lg:sticky lg:top-32 lg:self-start">
          <h2 className="max-w-md text-[clamp(32px,4.4vw,54px)] font-semibold leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
            {title}
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/50">{body}</p>
        </motion.div>

        <motion.div {...reveal(0.06)} className="border-t border-white/10">
          {items.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <motion.div key={question} layout={!reduceMotion} className="border-b border-white/10">
                <button
                  type="button"
                  aria-controls={answerId}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="group flex w-full items-start justify-between gap-6 py-6 text-left focus:outline-none"
                >
                  <span className="max-w-[38rem] text-[17px] font-medium leading-7 text-white/80 transition-colors group-hover:text-white sm:text-lg">
                    {question}
                  </span>
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all duration-300 ${isOpen ? "bg-white/5 border-white/20 text-white rotate-180" : "group-hover:border-white/20 group-hover:text-white"}`}>
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
                      <p className="max-w-[38rem] pb-7 pr-12 text-[15px] leading-relaxed text-white/50 sm:text-[16px]">{answer}</p>
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

function FinalCtaSection({ copy, mcpServerPath, reveal }: { copy: HomeCopy; mcpServerPath: string; reveal: Reveal }) {
  return (
    <section className="px-5 py-24 sm:px-7 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1200px]">
        {/* Deep Black Minimalist CTA */}
        <motion.div
          {...reveal()}
          className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/12 p-10 sm:p-16 text-center shadow-[0_20px_60px_rgba(196,238,135,0.12)] backdrop-blur-xl"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/20 rounded-full blur-[120px] mix-blend-screen" />
          </div>

          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="text-[clamp(38px,5.8vw,76px)] font-semibold leading-[0.98] tracking-[-0.04em] [text-wrap:balance]">
              {copy.ctaTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-white/50 font-medium sm:text-[17px]">
              {copy.ctaBody}
            </p>
            
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent px-8 text-[15px] font-semibold text-on-accent transition-all duration-200 hover:bg-accent-hover active:translate-y-px"
                href={appRoutes.liveDemo}
              >
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/16 bg-white/[0.045] px-7 text-[15px] font-semibold text-white/80 transition-all duration-200 hover:border-white/30 hover:text-white active:translate-y-px"
                href={mcpServerPath}
              >
                {copy.docsCta}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
