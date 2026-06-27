"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, TerminalSquare } from "lucide-react";
import { fadeInUp, type MdxDocsSection, type SyntaxCopy, type BrieflyDocsCopy } from "@/features/docs/ui/mdxDocsModel";

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

function OverviewContent({ brieflyDocs }: { brieflyDocs: BrieflyDocsCopy; syntax: SyntaxCopy }) {


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
            {brieflyDocs.overviewRules.map((rule) => (
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

      <BrieflyMcpInstallPanel brieflyDocs={brieflyDocs} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#222] bg-[#050505] p-8 shadow-sm">
          <h2 className="text-[20px] font-medium tracking-tight text-[#ededed]">{brieflyDocs.overviewWhyTitle}</h2>
          <p className="mt-4 text-[14px] leading-relaxed text-[#888]">
            {brieflyDocs.overviewWhyBody}
          </p>
          <ul className="mt-6 space-y-4 text-[14px] text-[#888]">
            {brieflyDocs.overviewWhyPoints.map((point, idx) => {
              const colonIndex = point.indexOf("：");
              const isEn = colonIndex === -1;
              const splitChar = isEn ? ":" : "：";
              const splitIndex = point.indexOf(splitChar);
              if (splitIndex === -1) {
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-[#ededed] mt-1">•</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                );
              }
              const boldPart = point.substring(0, splitIndex + 1);
              const restPart = point.substring(splitIndex + 1);
              return (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#ededed] mt-1">•</span>
                  <span className="leading-relaxed"><strong>{boldPart}</strong>{restPart}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#222] bg-[#050505] p-8 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-[20px] font-medium tracking-tight text-[#ededed]">{brieflyDocs.overviewWorkflowTitle}</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[#888]">
              {brieflyDocs.overviewWorkflowBody}
            </p>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-10 items-center justify-center rounded-xl border border-[#222] bg-[#0a0a0a] px-5 text-[13px] font-medium text-[#ededed] shadow-sm">
              {brieflyDocs.overviewWorkflowStep1}
            </div>
            <div className="h-[1px] flex-1 bg-[#222]" />
            <div className="flex h-10 items-center justify-center rounded-xl border border-[#222] bg-[#0a0a0a] px-5 text-[13px] font-medium text-[#ededed] shadow-sm">
              {brieflyDocs.overviewWorkflowStep2}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrieflyMcpInstallPanel({ brieflyDocs }: { brieflyDocs: BrieflyDocsCopy }) {
  return (
    <div className="rounded-2xl border border-[#222] bg-[#050505] p-8 shadow-sm md:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-widest text-blue-500">
            <TerminalSquare className="h-4 w-4" />
            {brieflyDocs.mcpInstallEyebrow}
          </p>
          <h2 className="mt-3 text-[22px] font-medium tracking-tight text-[#ededed] md:text-[28px]">
            {brieflyDocs.mcpInstallTitle}
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-[#888]">
            {brieflyDocs.mcpInstallBody}
          </p>
        </div>
        <div className="w-full lg:max-w-[440px]">
          <pre className="overflow-x-auto rounded-xl border border-[#222] bg-[#0a0a0a] p-4 text-[13px] leading-relaxed text-[#ededed]">
            <code>{brieflyDocs.mcpInstallCommand}</code>
          </pre>
          <a
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-[#222] bg-[#0a0a0a] px-4 text-[13px] font-medium text-[#ededed] transition-colors hover:border-[#444]"
            href={brieflyDocs.mcpPackageUrl}
            rel="noreferrer"
            target="_blank"
          >
            {brieflyDocs.mcpPackageLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function BuilderContent({ brieflyDocs }: { brieflyDocs: BrieflyDocsCopy; syntax: SyntaxCopy }) {


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
          <h2 className="text-[20px] font-medium tracking-tight text-[#ededed]">{brieflyDocs.builderStepsTitle}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {brieflyDocs.builderSteps.map((step, idx) => {
              return (
                <div key={idx} className="flex flex-col gap-3 rounded-xl border border-[#222] bg-[#0a0a0a] p-6 hover:border-[#444] transition-colors shadow-sm">
                  <h3 className="text-[16px] font-medium text-[#ededed]">{step[0]}</h3>
                  <p className="text-[14px] leading-relaxed text-[#888]">{step[1]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#050505] overflow-hidden shadow-sm">
        <div className="border-b border-[#222] bg-[#050505] px-8 py-5">
          <span className="text-[12px] uppercase tracking-widest font-medium text-[#ededed]">{brieflyDocs.builderExampleTitle}</span>
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
                  {`type="${block.type}"`}
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
