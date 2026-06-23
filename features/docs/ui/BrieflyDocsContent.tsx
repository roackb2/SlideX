"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FileText, Settings, Play } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { easeSmooth, fadeInUp, type MdxDocsSection, type SyntaxCopy, type BrieflyDocsCopy } from "@/features/docs/ui/mdxDocsModel";

export function BrieflyDocsContent({
  section,
  brieflyDocs,
  syntax
}: {
  section: MdxDocsSection;
  brieflyDocs: BrieflyDocsCopy;
  syntax: SyntaxCopy;
}) {
  if (section === "briefly-blocks") {
    return <BlocksContent brieflyDocs={brieflyDocs} syntax={syntax} />;
  }

  if (section === "briefly-builder") {
    return <BuilderContent brieflyDocs={brieflyDocs} syntax={syntax} />;
  }

  return <OverviewContent brieflyDocs={brieflyDocs} syntax={syntax} />;
}

function OverviewContent({ brieflyDocs, syntax }: { brieflyDocs: BrieflyDocsCopy; syntax: SyntaxCopy }) {
  const { t } = useI18n();
  const rules = [
    "將複雜的需求結構化為清晰的目標與核心訊息",
    "自動產生符合邏輯的故事線架構",
    "無縫對接 SlideX Studio 進行 MDX 簡報設計",
    "隨時更新 Brief，保持團隊對焦"
  ];

  return (
    <section className="scroll-mt-28 space-y-6 md:space-y-8">
      <motion.div
        animate="visible"
        className="rounded-2xl border border-[#222] bg-[#050505] md:min-h-[360px] shadow-sm"
        initial="hidden"
        variants={fadeInUp}
      >
        <div className="h-full p-8 md:p-12">
          <p className="text-[13px] uppercase tracking-widest font-semibold text-blue-500">{brieflyDocs.overviewTitle}</p>
          <h2 className="mt-3 max-w-2xl text-[24px] tracking-tight font-medium text-[#ededed] sm:text-[32px] md:text-[40px]">
            {brieflyDocs.overviewLeadTitle}
          </h2>
          <p className="mt-5 max-w-[65ch] text-[16px] leading-relaxed text-[#888]">
            {brieflyDocs.overviewLeadBody}
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {rules.map((rule) => (
              <div
                className="flex items-start gap-3 rounded-xl border border-[#222] bg-[#0a0a0a] px-5 py-4 text-[14px] leading-relaxed text-[#888] shadow-sm"
                key={rule}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ededed]" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#222] bg-[#050505] p-8 shadow-sm">
          <h2 className="text-[20px] font-medium tracking-tight text-[#ededed]">為什麼需要 Briefly？</h2>
          <p className="mt-4 text-[14px] leading-relaxed text-[#888]">
            在製作任何高品質的提案或簡報之前，確保核心團隊對「我們要溝通什麼」有著相同的理解是關鍵的。Briefly 提供了一個清晰的框架，讓你與利害關係人能先對焦以下要素：
          </p>
          <ul className="mt-6 space-y-4 text-[14px] text-[#888]">
            <li className="flex items-start gap-3">
              <span className="text-[#ededed] mt-1">•</span> 
              <span className="leading-relaxed"><strong>專案目標 (Goal)</strong>：這份簡報希望達成的最終商業目的是什麼？</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#ededed] mt-1">•</span> 
              <span className="leading-relaxed"><strong>目標受眾 (Audience)</strong>：誰在聽？他們關心什麼？</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#ededed] mt-1">•</span> 
              <span className="leading-relaxed"><strong>核心訊息 (Key Messages)</strong>：哪些亮點或數據是絕對不能漏掉的？</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[#222] bg-[#050505] p-8 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-[20px] font-medium tracking-tight text-[#ededed]">從 Briefly 到 Studio</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[#888]">
              當你完成了一份 Brief 之後，可以一鍵轉換為 Markdown 或直接匯出為 MDX，作為 SlideX Studio 的大綱骨架。這樣你就可以確保視覺設計與內容動態完全貼合最初的商業邏輯，避免後期的來回修改。
            </p>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-10 items-center justify-center rounded-xl border border-[#222] bg-[#0a0a0a] px-5 text-[13px] font-medium text-[#ededed] shadow-sm">
              Briefly 產出大綱
            </div>
            <div className="h-[1px] flex-1 bg-[#222]" />
            <div className="flex h-10 items-center justify-center rounded-xl border border-[#222] bg-[#0a0a0a] px-5 text-[13px] font-medium text-[#ededed] shadow-sm">
              Studio 製作簡報
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuilderContent({ brieflyDocs, syntax }: { brieflyDocs: BrieflyDocsCopy; syntax: SyntaxCopy }) {
  const steps = [
    {
      title: "1. 新增 Block 區塊",
      desc: "從左側工具列選擇需要的文件區塊，如：封面 (Cover)、專案目標 (Goal)、時程規劃 (Timeline) 或目標受眾 (Audience)。系統會自動將區塊加入預覽畫布中。"
    },
    {
      title: "2. 透過 Inspector 填寫資料",
      desc: "點擊任一區塊，右側的 Inspector 面板會展開相對應的專屬表單，幫助你結構化地輸入核心訊息與數據，不需煩惱版面問題。"
    },
    {
      title: "3. 調整設計與大綱排序",
      desc: "利用 Outline 工具拖曳排序章節，並切換至 Design 工具設定排版寬度、字型 (Typography)、邊框樣式以及視覺主題 (Theme Gradient)。"
    },
    {
      title: "4. 預覽與匯出文件",
      desc: "隨時切換 MDX 預覽模式查看生成的標記語法。完成後，你可以將 Brief 匯出為 HTML、PDF，或是轉換為 MDX 檔案供 SlideX Studio 製作簡報使用。"
    }
  ];

  return (
    <section className="scroll-mt-28 space-y-6 md:space-y-8">
      <motion.div
        animate="visible"
        className="rounded-2xl border border-[#222] bg-[#050505] shadow-sm"
        initial="hidden"
        variants={fadeInUp}
      >
        <div className="p-8 md:p-12">
          <p className="text-[13px] uppercase tracking-widest font-semibold text-blue-500">{brieflyDocs.builderTitle}</p>
          <h2 className="mt-3 max-w-2xl text-[24px] tracking-tight font-medium text-[#ededed] sm:text-[32px] md:text-[40px]">
            {brieflyDocs.builderLeadTitle}
          </h2>
          <p className="mt-5 max-w-[65ch] text-[16px] leading-relaxed text-[#888]">
            {brieflyDocs.builderLeadBody}
          </p>
        </div>
      </motion.div>

      <div className="rounded-2xl border border-[#222] bg-[#050505] shadow-sm">
        <div className="p-8 md:p-12">
          <h2 className="text-[20px] font-medium tracking-tight text-[#ededed]">使用步驟</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {steps.map((step, idx) => {
              return (
                <div key={idx} className="flex flex-col gap-3 rounded-xl border border-[#222] bg-[#0a0a0a] p-6 hover:border-[#444] transition-colors shadow-sm">
                  <h3 className="text-[16px] font-medium text-[#ededed]">{step.title}</h3>
                  <p className="text-[14px] leading-relaxed text-[#888]">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#050505] overflow-hidden shadow-sm">
        <div className="border-b border-[#222] bg-[#050505] px-8 py-5">
          <span className="text-[12px] uppercase tracking-widest font-medium text-[#ededed]">範例輸出 (MDX)</span>
        </div>
        <pre className="overflow-x-auto p-8 text-[13px] leading-relaxed text-[#888] font-mono bg-[#0a0a0a] relative z-10">
          <code>{`<BriefBlock type="cover" title="專案封面" coverImage="/assets/cover.jpg">

  <BriefField name="project_name">
    Q3 產品發表會
  </BriefField>

  <BriefField name="one_liner">
    向市場宣告全新版本的上線，並強調在效能上的重大突破。
  </BriefField>

  <BriefMeta category="產品發表" stage="規劃中" status="草稿" owner="PM Team" confidentiality="public" />

</BriefBlock>

<BriefBlock type="goal" title="目標與成功標準">

  <BriefField name="primary_goal">
    提升市場關注度，帶來 10,000+ 新品預約數量。
  </BriefField>

  <BriefTags name="secondary_goals" items={["提升品牌知名度","建立 KOL 口碑"]} />

</BriefBlock>`}</code>
        </pre>
      </div>
    </section>
  );
}

function BlocksContent({ brieflyDocs, syntax }: { brieflyDocs: BrieflyDocsCopy; syntax: SyntaxCopy }) {
  const { blocksTitle, blocksLeadTitle, blocksLeadBody, blocks } = brieflyDocs;

  return (
    <section className="scroll-mt-28 space-y-6 md:space-y-8">
      <motion.div
        animate="visible"
        className="rounded-2xl border border-[#222] bg-[#050505] shadow-sm"
        initial="hidden"
        variants={fadeInUp}
      >
        <div className="p-8 md:p-12">
          <p className="text-[13px] uppercase tracking-widest font-semibold text-blue-500">{blocksTitle}</p>
          <h2 className="mt-3 max-w-2xl text-[24px] tracking-tight font-medium text-[#ededed] sm:text-[32px] md:text-[40px]">
            {blocksLeadTitle}
          </h2>
          <p className="mt-5 max-w-[65ch] text-[16px] leading-relaxed text-[#888]">
            {blocksLeadBody}
          </p>
        </div>
      </motion.div>

      <div className="space-y-6 md:space-y-8">
        {blocks?.map((block, i) => (
          <motion.div
            animate="visible"
            className="rounded-2xl border border-[#222] bg-[#050505] overflow-hidden shadow-sm"
            initial="hidden"
            key={block.type}
            variants={fadeInUp}
            custom={i + 1}
          >
            <div className="border-b border-[#222] bg-[#050505] p-8">
              <h3 className="text-[20px] font-medium tracking-tight text-[#ededed] flex items-center gap-3">
                <span className="font-mono text-[13px] text-blue-500 bg-[#0a0a0a] border border-[#222] px-2.5 py-1 rounded-md">
                  type="{block.type}"
                </span>
                {block.title}
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-[#888]">{block.body}</p>
            </div>
            
            {block.code && (
              <div className="relative">
                <div className="absolute top-0 right-0 bg-[#0a0a0a] border-l border-b border-[#222] px-3 py-1.5 text-[11px] font-mono text-[#888] rounded-bl-lg z-20">
                  {syntax.fileLabel}
                </div>
                <pre className="overflow-x-auto p-8 text-[13px] leading-relaxed text-[#888] font-mono bg-[#0a0a0a] relative z-10">
                  <code>{block.code}</code>
                </pre>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
