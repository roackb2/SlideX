"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle2, Code2, FileCode2, SlidersHorizontal, Sparkles, Terminal, X, type LucideIcon } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { easeSmooth, fadeInUp, type MdxDocsSection, type SyntaxCopy } from "@/features/docs/ui/mdxDocsModel";

export function MdxDocsContent({ section, syntax }: { section: MdxDocsSection; syntax: SyntaxCopy }) {
  if (section === "example") {
    return <ExampleContent syntax={syntax} />;
  }

  if (section === "patterns") {
    return <PatternsContent syntax={syntax} />;
  }

  if (section === "props") {
    return <PropsContent syntax={syntax} />;
  }

  if (section === "motion") {
    return <MotionContent syntax={syntax} />;
  }

  if (section === "mcp") {
    return <McpContent syntax={syntax} />;
  }

  return <OverviewContent syntax={syntax} />;
}

function OverviewContent({ syntax }: { syntax: SyntaxCopy }) {
  const { localePath } = useI18n();
  const overviewLinks = [
    { href: "/docs/example", icon: FileCode2 },
    { href: "/docs/patterns", icon: Code2 },
    { href: "/docs/props", icon: SlidersHorizontal },
    { href: "/docs/motion", icon: Sparkles },
    { href: "/docs/mcp", icon: Terminal }
  ] satisfies Array<{ href: string; icon: LucideIcon }>;

  return (
    <section className="scroll-mt-28 space-y-6 md:space-y-8">
      <motion.div
        animate="visible"
        className="rounded-2xl border border-[#222] bg-[#050505] md:min-h-[360px] shadow-sm"
        initial="hidden"
        variants={fadeInUp}
      >
        <div className="h-full p-8 md:p-12">
          <p className="text-[13px] uppercase tracking-widest font-semibold text-blue-500">{syntax.overviewTitle}</p>
          <h2 className="mt-3 max-w-2xl text-[24px] tracking-tight font-semibold text-[#ededed] sm:text-[32px] md:text-[40px]">
            {syntax.overviewLeadTitle}
          </h2>
          <p className="mt-5 max-w-[65ch] text-[16px] leading-relaxed text-[#888]">
            {syntax.overviewLeadBody}
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {syntax.rules.map((rule) => (
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-[#222] bg-[#050505] overflow-hidden flex flex-col shadow-sm">
          <CodePanelHeader fileLabel={syntax.fileLabel} title={syntax.overviewCodeTitle} />
          <pre className="flex-1 max-w-full overflow-x-auto p-8 text-[13px] leading-relaxed text-[#888] font-mono bg-[#0a0a0a]">
            <code>{syntax.overviewCode}</code>
          </pre>
        </div>

        <div className="rounded-2xl border border-[#222] bg-[#050505] p-8 shadow-sm">
          <h2 className="text-[20px] font-medium tracking-tight text-[#ededed]">{syntax.overviewWorkflowTitle}</h2>
          <p className="mt-4 text-[14px] leading-relaxed text-[#888]">{syntax.overviewWorkflowBody}</p>
          <div className="mt-8 space-y-6">
            {syntax.overviewWorkflowSteps.map(([step, title, body]) => (
              <div key={step}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-[#ededed]">{step}</span>
                  <h3 className="text-[14px] font-medium text-[#ededed]">{title}</h3>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-[#888]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#050505] mt-8 overflow-hidden shadow-sm">
        <div className="border-b border-[#222] p-8">
          <h2 className="text-[24px] font-medium tracking-tight text-[#ededed]">{syntax.overviewReferenceTitle}</h2>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-[#888]">{syntax.overviewReferenceBody}</p>
        </div>
        <div className="divide-y divide-[#222]">
          {syntax.overviewCards.map((card, index) => {
            const item = overviewLinks[index];
            const Icon = item?.icon ?? BookOpen;

            return (
              <Link
                className="group grid grid-cols-[40px_minmax(0,1fr)_24px] gap-5 p-6 md:px-8 transition-colors hover:bg-[#0a0a0a]"
                href={localePath(item?.href ?? "/docs/introduction")}
                key={card.title}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111] border border-[#222] text-[#ededed] group-hover:border-[#444] transition-colors">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-[16px] font-medium text-[#ededed] transition-colors">{card.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#888]">{card.body}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#555] transition-transform group-hover:translate-x-1 group-hover:text-[#ededed] mt-1" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ExampleContent({ syntax }: { syntax: SyntaxCopy }) {
  return (
    <section className="scroll-mt-28">
      <div className="rounded-2xl border border-[#222] bg-[#050505] overflow-hidden relative group shadow-sm">
        <CodePanelHeader fileLabel={syntax.fileLabel} title={syntax.fullExampleTitle} />
        <pre className="max-h-[620px] overflow-auto p-8 text-[13px] leading-relaxed text-[#888] font-mono bg-[#0a0a0a]">
          <code>{syntax.fullExample}</code>
        </pre>
      </div>
    </section>
  );
}

function PatternsContent({ syntax }: { syntax: SyntaxCopy }) {
  return (
    <section className="scroll-mt-28">
      <div className="divide-y divide-[#222]">
        {syntax.groups.map((group, index) => (
          <motion.div
            className="grid gap-12 py-16 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]"
            initial={{ opacity: 0, y: 12 }}
            key={group.title}
            transition={{ delay: index * 0.03, duration: 0.4, ease: easeSmooth }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="pr-4">
              <h3 className="text-[20px] font-medium tracking-tight text-[#ededed]">{group.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#888]">{group.body}</p>
            </div>
            <div className="rounded-2xl border border-[#222] bg-[#050505] overflow-hidden shadow-sm">
              <div className="flex items-center justify-between border-b border-[#222] bg-[#050505] px-6 py-4">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#888]">MDX Snippet</span>
              </div>
              <pre className="overflow-x-auto p-8 text-[13px] leading-relaxed text-[#888] font-mono bg-[#0a0a0a]">
                <code>{group.code}</code>
              </pre>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PropsContent({ syntax }: { syntax: SyntaxCopy }) {
  return (
    <section className="scroll-mt-28">
      <div className="rounded-2xl border border-[#222] bg-[#050505] overflow-hidden shadow-sm">
        <div className="divide-y divide-[#222]">
          {syntax.propsRows.map(([component, prop, value, note]) => (
            <div
              className="grid gap-4 px-8 py-6 text-[14px] md:grid-cols-[0.75fr_0.9fr_1.1fr_1.55fr] hover:bg-[#0a0a0a] transition-colors"
              key={`${component}-${prop}`}
            >
              <span className="font-mono text-[#ededed]">{component}</span>
              <span className="font-mono text-blue-500">{prop}</span>
              <span className="font-mono text-[#888]">{value}</span>
              <span className="text-[#888] leading-relaxed">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MotionContent({ syntax }: { syntax: SyntaxCopy }) {
  return (
    <section className="scroll-mt-28">
      <div className="grid gap-3">
        {syntax.motionRows.map(([name, value]) => (
          <div className="rounded-xl border border-[#222] bg-[#050505] shadow-sm" key={name}>
            <div
              className="grid gap-4 px-6 py-5 text-[14px] md:grid-cols-[0.95fr_1.45fr]"
            >
              <span className="font-mono font-medium text-[#ededed]">{name}</span>
              <span className="text-[#888] leading-relaxed">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function McpContent({ syntax }: { syntax: SyntaxCopy }) {
  return (
    <section className="scroll-mt-28 space-y-8">
      <div className="rounded-2xl border border-[#222] bg-[#050505] shadow-sm">
        <div className="p-8 md:p-12">
          <p className="text-[13px] uppercase tracking-widest font-semibold text-blue-500">{syntax.mcpInstallTitle}</p>
          <h2 className="mt-3 max-w-2xl text-[24px] md:text-[32px] font-medium tracking-tight text-[#ededed]">
            {syntax.mcpInstallLead}
          </h2>
          <p className="mt-5 max-w-[65ch] text-[16px] leading-relaxed text-[#888]">
            {syntax.mcpInstallBody}
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {syntax.mcpInstallCards.map((card) => (
          <div className="rounded-2xl border border-[#222] bg-[#050505] overflow-hidden shadow-sm" key={card.title}>
            <CodePanelHeader fileLabel={card.fileLabel} title={card.title} />
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="border-b border-[#222] p-8 text-[14px] leading-relaxed text-[#888] lg:border-b-0 lg:border-r">
                {card.body}
              </div>
              <pre className="max-w-full overflow-x-auto p-8 text-[13px] leading-relaxed text-[#888] font-mono bg-[#0a0a0a]">
                <code>{card.code}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#050505] overflow-hidden shadow-sm">
        <div className="border-b border-[#222] p-8">
          <h2 className="text-[24px] tracking-tight font-medium text-[#ededed]">{syntax.mcpToolsTitle}</h2>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-[#888]">{syntax.mcpToolsBody}</p>
        </div>
        <div className="divide-y divide-[#222]">
          {syntax.mcpToolsRows.map(([tool, body]) => (
            <div className="grid gap-3 px-8 py-6 text-[14px] md:grid-cols-[0.7fr_1.3fr] hover:bg-[#0a0a0a] transition-colors" key={tool}>
              <span className="font-mono font-medium text-[#ededed]">{tool}</span>
              <span className="text-[#888] leading-relaxed">{body}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#050505] shadow-sm">
        <div className="p-8">
          <h2 className="text-[24px] font-medium tracking-tight text-[#ededed]">{syntax.mcpPublishTitle}</h2>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-[#888]">{syntax.mcpPublishBody}</p>
          <div className="mt-8 grid gap-4">
            {syntax.mcpPublishNotes.map((note) => (
              <div className="flex items-start gap-3 rounded-xl border border-[#222] bg-[#0a0a0a] px-5 py-4 text-[14px] leading-relaxed text-[#888] shadow-sm" key={note}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ededed]" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CodePanelHeader({ fileLabel, title }: { fileLabel: string; title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#222] bg-[#050505] px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-medium text-[#ededed]">{title}</span>
        <div className="hidden h-3 w-[1px] bg-[#333] sm:block mx-2" />
        <span className="hidden font-mono text-[11px] text-[#888] sm:block">
          {fileLabel}
        </span>
      </div>
    </div>
  );
}
