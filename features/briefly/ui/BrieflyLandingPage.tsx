"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  GripVertical,
  LayoutTemplate,
  Link2,
  Palette,
  Paperclip,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

const easeOut = [0.16, 1, 0.3, 1] as const;

type BrieflyTool = {
  body: string;
  icon: LucideIcon;
  title: string;
};

export function BrieflyLandingPage() {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";

  const copy = {
    heroTitle: isZh ? ["把專案說清楚，", "讓團隊開始做。"] : ["Make the project clear.", "Move the team forward."],
    heroBody: isZh
      ? "用結構化區塊整理背景、目標、範圍、時程與決策。"
      : "Structure context, goals, scope, timing, and decisions in one brief.",
    primaryCta: isZh ? "開始整理" : "Start a brief",
    secondaryCta: isZh ? "探索功能" : "Explore features",
    introTitle: isZh ? "不是寫更多，而是讓關鍵資訊有位置。" : "Not more writing. A place for what matters.",
    introBody: isZh
      ? "選擇需要的區塊，Briefly 會把內容整理成可閱讀、可執行的專案文件。"
      : "Choose the blocks you need. Briefly turns them into a readable, actionable project document.",
    features: isZh
      ? [
          {
            title: "用區塊建立專案結構。",
            body: "加入背景、目標、交付物、受眾、風險與決策；需要什麼就放什麼，也能隨時排序。"
          },
          {
            title: "直接在文件上整理內容。",
            body: "編輯器與預覽同步更新，標題、段落、清單、圖片與連結都能在畫布上確認。"
          },
          {
            title: "把執行資訊放回專案裡。",
            body: "用里程碑、團隊角色、預算與決策紀錄，讓負責人和下一步不再散落。"
          },
          {
            title: "讓每份 brief 都容易閱讀。",
            body: "調整頁寬、間距、字體、標題、圖片與明暗主題，再用一致版面交付給團隊。"
          }
        ]
      : [
          {
            title: "Build the project with blocks.",
            body: "Add context, goals, deliverables, audience, risks, and decisions, then arrange them in the order you need."
          },
          {
            title: "Edit directly on the document.",
            body: "The editor and preview update together, so headings, paragraphs, lists, images, and links stay easy to review."
          },
          {
            title: "Keep execution details with the project.",
            body: "Use milestones, team roles, budgets, and decision records to make ownership and next steps visible."
          },
          {
            title: "Make every brief easy to read.",
            body: "Tune page width, spacing, typography, headers, imagery, and light or dark themes before sharing."
          }
        ],
    toolkitTitle: isZh ? "從背景到決策，一份 brief 裝下整個專案。" : "From context to decisions, keep the whole project in one brief.",
    toolkitBody: isZh ? "內容可組合、版面可調整，更新時不必重做整份文件。" : "Compose the content, tune the layout, and update without rebuilding the document.",
    tools: (isZh
      ? [
          { title: "拖曳排序", body: "快速調整區塊順序與文件結構。", icon: GripVertical },
          { title: "時程與里程碑", body: "記錄日期、階段與重要節點。", icon: CalendarDays },
          { title: "團隊與角色", body: "整理成員、職責與 RACI 關係。", icon: Users },
          { title: "圖片與附件", body: "把參考圖、檔案與資源放回脈絡。", icon: Paperclip },
          { title: "版面與主題", body: "調整頁寬、字體、色彩與背景。", icon: Palette },
          { title: "連結與交付", body: "保持內容完整，交給下一個工作流程。", icon: Link2 }
        ]
      : [
          { title: "Drag to reorder", body: "Reshape blocks and document structure quickly.", icon: GripVertical },
          { title: "Timeline and milestones", body: "Record dates, phases, and important moments.", icon: CalendarDays },
          { title: "Team and roles", body: "Organize members, ownership, and RACI roles.", icon: Users },
          { title: "Images and attachments", body: "Keep references, files, and resources in context.", icon: Paperclip },
          { title: "Layout and themes", body: "Tune width, type, color, and background.", icon: Palette },
          { title: "Links and handoff", body: "Keep content intact for the next workflow.", icon: Link2 }
        ]) satisfies BrieflyTool[],
    ctaTitle: isZh ? "先把事情說清楚。" : "Start by making it clear.",
    ctaBody: isZh ? "打開 Briefly，建立第一份專案文件。" : "Open Briefly and build the first project document.",
    ctaButton: isZh ? "開啟 Briefly" : "Open Briefly"
  };

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.17 },
          transition: { duration: 0.72, delay, ease: easeOut }
        };

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-white text-[#111315] selection:bg-[#9ad7ff]/45">
      <section className="relative flex min-h-[820px] items-end overflow-hidden px-4 pb-16 pt-28 text-white sm:px-6 lg:min-h-[min(880px,100dvh)] lg:px-8 lg:pb-20">
        <Image
          src="/images/briefly-workspace.png"
          alt={isZh ? "Briefly 專案文件工作區" : "Briefly project document workspace"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,7,0.98)_0%,rgba(5,6,7,0.84)_42%,rgba(5,6,7,0.2)_82%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,7,0.16)_0%,rgba(5,6,7,0.12)_48%,rgba(5,6,7,0.9)_100%)]" />

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.82, ease: easeOut }}
          className="relative z-10 mx-auto w-full max-w-7xl"
        >
          <h1 className="max-w-[980px] text-[clamp(40px,7vw,90px)] font-semibold leading-[0.98] tracking-normal [text-wrap:balance]">
            {copy.heroTitle.map((line) => <span key={line} className="block">{line}</span>)}
          </h1>
          <p className="mt-7 max-w-xl text-[17px] leading-8 text-white/68 sm:text-xl">{copy.heroBody}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/workspace/briefly" className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-md bg-[#9ad7ff] px-7 text-[15px] font-semibold text-[#071117] transition-colors hover:bg-[#bde4fb] sm:w-auto">
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#briefly-features" className="inline-flex h-13 w-full items-center justify-center rounded-md border border-white/18 bg-black/24 px-7 text-[15px] font-semibold text-white/76 backdrop-blur-md transition-colors hover:border-white/36 hover:text-white sm:w-auto">
              {copy.secondaryCta}
            </a>
          </div>
        </motion.div>
      </section>

      <section className="bg-[#e7f2f7] px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <motion.div {...reveal()} className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <h2 className="max-w-3xl text-[clamp(40px,5.8vw,72px)] font-semibold leading-[1.02] tracking-normal [text-wrap:balance]">{copy.introTitle}</h2>
          <p className="max-w-xl text-lg leading-8 text-[#111315]/58 lg:justify-self-end">{copy.introBody}</p>
        </motion.div>
      </section>

      <section id="briefly-features" className="bg-white px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl space-y-28 lg:space-y-40">
          <FeatureShowcase {...copy.features[0]} side="right" reveal={reveal} visual={<BlockLibraryVisual isZh={isZh} />} />
          <FeatureShowcase {...copy.features[1]} side="left" reveal={reveal} visual={<LiveDocumentVisual isZh={isZh} />} />
          <FeatureShowcase {...copy.features[2]} side="right" reveal={reveal} visual={<ProjectControlVisual isZh={isZh} />} />
          <FeatureShowcase {...copy.features[3]} side="left" reveal={reveal} visual={<StyleSystemVisual isZh={isZh} />} />
        </div>
      </section>

      <section className="bg-[#f7f7f4] px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <motion.div {...reveal()} className="grid gap-7 lg:grid-cols-[0.82fr_1fr] lg:items-end">
            <h2 className="max-w-3xl text-[clamp(38px,5vw,64px)] font-semibold leading-[1.04] tracking-normal [text-wrap:balance]">{copy.toolkitTitle}</h2>
            <p className="max-w-xl text-lg leading-8 text-[#111315]/58 lg:justify-self-end">{copy.toolkitBody}</p>
          </motion.div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg bg-[#111315]/10 md:grid-cols-2 lg:grid-cols-3">
            {copy.tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.article key={tool.title} {...reveal(index * 0.035)} className="min-h-52 bg-white p-7 transition-colors hover:bg-[#eef7fb] sm:p-8">
                  <Icon className="h-6 w-6 text-[#39708a]" strokeWidth={1.7} />
                  <h3 className="mt-10 text-2xl font-semibold">{tool.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#111315]/56">{tool.body}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0a0b0d] px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-28">
        <motion.div {...reveal()} className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="max-w-4xl text-[clamp(42px,6vw,76px)] font-semibold leading-[1] tracking-normal [text-wrap:balance]">{copy.ctaTitle}</h2>
            <p className="mt-6 text-lg text-white/56">{copy.ctaBody}</p>
          </div>
          <Link href="/workspace/briefly" className="group inline-flex h-14 items-center justify-center gap-3 rounded-md bg-[#9ad7ff] px-8 text-[15px] font-semibold text-[#071117] transition-colors hover:bg-[#bde4fb]">
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

function BlockLibraryVisual({ isZh }: { isZh: boolean }) {
  const blocks = isZh
    ? ["背景與問題", "目標與成功標準", "預期產出", "時程規劃", "目標受眾", "風險與假設", "預算", "決策紀錄"]
    : ["Context", "Goals and success", "Deliverables", "Timeline", "Audience", "Risks", "Budget", "Decisions"];
  return (
    <div className="aspect-[16/10] overflow-hidden rounded-md bg-[#0a0c0e] p-[6%] text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[clamp(7px,0.95vw,12px)] font-semibold"><FileText className="h-[1.2em] w-[1.2em] text-[#9ad7ff]" />{isZh ? "新增內容區塊" : "Add content block"}</div>
        <span className="rounded-sm bg-white/[0.06] px-[2%] py-[1%] text-[clamp(5px,0.65vw,8px)] text-white/40">8 blocks</span>
      </div>
      <div className="mt-[6%] grid grid-cols-2 gap-[2.5%]">
        {blocks.map((block, index) => (
          <div key={block} className={`flex min-h-[clamp(34px,5vw,62px)] items-center gap-[5%] rounded-md border px-[6%] ${index === 1 ? "border-[#9ad7ff]/55 bg-[#9ad7ff]/12" : "border-white/10 bg-white/[0.035]"}`}>
            <span className={`flex h-[clamp(18px,2.5vw,30px)] w-[clamp(18px,2.5vw,30px)] shrink-0 items-center justify-center rounded-sm ${index === 1 ? "bg-[#9ad7ff] text-[#071117]" : "bg-white/[0.07] text-white/38"}`}>
              {index === 1 ? <Check className="h-[55%] w-[55%]" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <span className="truncate text-[clamp(6px,0.85vw,11px)] text-white/68">{block}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveDocumentVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-[#0a0c0e]">
      <Image src="/images/briefly-canvas.png" alt={isZh ? "Briefly 即時文件畫布" : "Briefly live document canvas"} fill sizes="(max-width: 1024px) 100vw, 56vw" className="object-cover" />
    </div>
  );
}

function ProjectControlVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="grid aspect-[16/10] grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-md bg-white/10 text-white">
      <div className="bg-[#101214] p-[8%]">
        <div className="flex items-center gap-2 text-[clamp(7px,0.9vw,12px)] text-white/48"><CalendarDays className="h-[1.2em] w-[1.2em] text-[#9ad7ff]" />{isZh ? "里程碑" : "Milestones"}</div>
        <div className="mt-[13%] space-y-[8%]">
          {[["Research", "Jul 12"], ["Prototype", "Jul 24"], ["Launch", "Aug 08"]].map(([label, date], index) => (
            <div key={label} className="grid grid-cols-[auto_1fr_auto] items-center gap-[5%] text-[clamp(5px,0.68vw,9px)]">
              <span className={`h-2 w-2 rounded-full ${index === 1 ? "bg-[#9ad7ff]" : "bg-white/20"}`} />
              <span className="text-white/64">{label}</span>
              <span className="text-white/32">{date}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#e7f2f7] p-[8%] text-[#111315]">
        <div className="flex items-center gap-2 text-[clamp(7px,0.9vw,12px)] text-[#111315]/48"><Users className="h-[1.2em] w-[1.2em] text-[#39708a]" />{isZh ? "團隊角色" : "Team roles"}</div>
        <div className="mt-[12%] space-y-[7%]">
          {[["AL", "Product", "A"], ["MK", "Design", "R"], ["CH", "Research", "C"]].map(([avatar, role, raci], index) => (
            <div key={role} className="flex items-center gap-[5%] text-[clamp(5px,0.68vw,9px)]">
              <span className="flex h-[clamp(16px,2vw,26px)] w-[clamp(16px,2vw,26px)] items-center justify-center rounded-full bg-[#111315] text-white">{avatar}</span>
              <span className="flex-1 text-[#111315]/64">{role}</span>
              <span className={`flex h-5 w-5 items-center justify-center rounded-sm ${index === 1 ? "bg-[#39708a] text-white" : "bg-[#111315]/8 text-[#111315]/45"}`}>{raci}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#9ad7ff] p-[8%] text-[#071117]">
        <div className="text-[clamp(7px,0.9vw,12px)] text-[#071117]/52">{isZh ? "預算" : "Budget"}</div>
        <div className="mt-[11%] text-[clamp(18px,3vw,38px)] font-semibold">$48K</div>
        <div className="mt-[8%] flex h-2 overflow-hidden rounded-sm">
          <span className="w-[54%] bg-[#071117]" />
          <span className="w-[28%] bg-[#39708a]" />
          <span className="flex-1 bg-white/62" />
        </div>
      </div>
      <div className="bg-[#101214] p-[8%]">
        <div className="text-[clamp(7px,0.9vw,12px)] text-white/48">{isZh ? "最新決策" : "Latest decision"}</div>
        <div className="mt-[11%] text-[clamp(8px,1.15vw,15px)] font-medium leading-snug">{isZh ? "採用單一品牌系統" : "Use one brand system"}</div>
        <div className="mt-[10%] inline-flex items-center gap-1 rounded-sm bg-[#c4ee87]/14 px-[4%] py-[2%] text-[clamp(5px,0.65vw,8px)] text-[#c4ee87]"><Check className="h-[1em] w-[1em]" />Approved</div>
      </div>
    </div>
  );
}

function StyleSystemVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className="grid aspect-[16/10] grid-cols-[0.28fr_0.72fr] overflow-hidden rounded-md bg-[#0a0c0e] text-white">
      <div className="border-r border-white/10 p-[9%]">
        <div className="flex items-center gap-2 text-[clamp(7px,0.9vw,11px)] text-white/50"><LayoutTemplate className="h-[1.1em] w-[1.1em]" />{isZh ? "文件樣式" : "Document style"}</div>
        <div className="mt-[18%] space-y-[14%]">
          {[
            [isZh ? "頁寬" : "Page width", "Wide"],
            [isZh ? "字體" : "Typography", "Sans"],
            [isZh ? "標題" : "Header", "Editorial"],
            [isZh ? "間距" : "Spacing", "Standard"]
          ].map(([label, value]) => (
            <div key={label}>
              <div className="mb-[5%] text-[clamp(5px,0.65vw,8px)] text-white/32">{label}</div>
              <div className="flex items-center justify-between rounded-sm bg-white/[0.055] px-[7%] py-[6%] text-[clamp(5px,0.7vw,9px)] text-white/68">{value}<span>⌄</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center bg-[#dfeef3] p-[7%]">
        <div className="grid h-full w-[82%] grid-cols-2 gap-[5%]">
          <div className="bg-white p-[10%] shadow-[0_16px_45px_rgba(26,52,64,0.12)]">
            <div className="h-[5%] w-[28%] bg-[#9ad7ff]" />
            <div className="mt-[9%] h-[8%] w-[72%] bg-[#111315]" />
            <div className="mt-[8%] space-y-[5px]"><div className="h-[3px] bg-[#111315]/14" /><div className="h-[3px] w-[82%] bg-[#111315]/14" /></div>
            <div className="mt-[12%] h-[28%] bg-[#dfeef3]" />
          </div>
          <div className="bg-[#111315] p-[10%] shadow-[0_16px_45px_rgba(26,52,64,0.12)]">
            <div className="h-[5%] w-[28%] bg-[#c4ee87]" />
            <div className="mt-[9%] h-[8%] w-[72%] bg-white" />
            <div className="mt-[8%] space-y-[5px]"><div className="h-[3px] bg-white/16" /><div className="h-[3px] w-[82%] bg-white/16" /></div>
            <div className="mt-[12%] grid h-[28%] grid-cols-2 gap-[5%]">
              <div className="bg-[#9ad7ff]" />
              <div className="bg-[#ff6f8f]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
