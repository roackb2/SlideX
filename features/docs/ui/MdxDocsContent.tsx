"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle2, Code2, FileCode2, SlidersHorizontal, Sparkles, type LucideIcon } from "lucide-react";
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

  return <OverviewContent syntax={syntax} />;
}

function OverviewContent({ syntax }: { syntax: SyntaxCopy }) {
  const overviewLinks = [
    { href: "/resources/mdx/example", icon: FileCode2 },
    { href: "/resources/mdx/patterns", icon: Code2 },
    { href: "/resources/mdx/props", icon: SlidersHorizontal },
    { href: "/resources/mdx/motion", icon: Sparkles }
  ] satisfies Array<{ href: string; icon: LucideIcon }>;

  return (
    <section className="scroll-mt-28 space-y-6 md:space-y-7">
      <motion.div
        animate="visible"
        className="rounded-2xl border border-[#8ea5ff]/20 bg-[#8ea5ff]/[0.05] p-5 sm:p-6 md:min-h-[360px] md:p-8"
        initial="hidden"
        variants={fadeInUp}
      >
        <p className="text-sm font-semibold text-[#b9c6ff]">{syntax.overviewTitle}</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
          {syntax.overviewLeadTitle}
        </h2>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-neutral-300 sm:text-base sm:leading-8">
          {syntax.overviewLeadBody}
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {syntax.rules.map((rule) => (
            <div
              className="flex gap-3 rounded-xl border border-white/[0.08] bg-black/15 px-4 py-4 text-sm leading-7 text-neutral-300"
              key={rule}
            >
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#8ea5ff]" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d1018]">
          <CodePanelHeader fileLabel={syntax.fileLabel} title={syntax.overviewCodeTitle} />
          <pre className="max-w-full overflow-x-auto p-4 text-[13px] leading-7 text-neutral-300 sm:p-5 sm:text-sm">
            <code>{syntax.overviewCode}</code>
          </pre>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-white">{syntax.overviewWorkflowTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-500">{syntax.overviewWorkflowBody}</p>
          <div className="mt-5 space-y-4">
            {syntax.overviewWorkflowSteps.map(([step, title, body]) => (
              <div key={step}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#8ea5ff]">{step}</span>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                </div>
                <p className="mt-1 text-sm leading-6 text-neutral-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.08] p-5 md:p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-white">{syntax.overviewReferenceTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500">{syntax.overviewReferenceBody}</p>
        </div>
        <div className="divide-y divide-white/[0.08]">
          {syntax.overviewCards.map((card, index) => {
            const item = overviewLinks[index];
            const Icon = item?.icon ?? BookOpen;

            return (
              <Link
                className="group grid grid-cols-[40px_minmax(0,1fr)_20px] gap-3 p-4 transition hover:bg-white/[0.035] sm:grid-cols-[44px_minmax(0,1fr)_24px] sm:gap-4 sm:p-5"
                href={item?.href ?? "/resources/mdx"}
                key={card.title}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.045] text-[#8ea5ff]">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-neutral-600">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="text-base font-semibold text-white">{card.title}</h3>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">{card.body}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-[#8ea5ff] sm:mt-1" />
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
      <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d1018]">
        <CodePanelHeader fileLabel={syntax.fileLabel} title={syntax.fullExampleTitle} />
        <pre className="max-h-[620px] overflow-auto p-4 text-[13px] leading-7 text-neutral-300 sm:p-5 sm:text-sm">
          <code>{syntax.fullExample}</code>
        </pre>
      </div>
    </section>
  );
}

function PatternsContent({ syntax }: { syntax: SyntaxCopy }) {
  return (
    <section className="scroll-mt-28">
      <div className="divide-y divide-white/[0.08]">
        {syntax.groups.map((group, index) => (
          <motion.div
            className="grid gap-4 py-7 lg:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]"
            initial={{ opacity: 0, y: 12 }}
            key={group.title}
            transition={{ delay: index * 0.03, duration: 0.35, ease: easeSmooth }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#8ea5ff]">
                <Code2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-white">{group.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{group.body}</p>
            </div>
            <pre className="max-w-full overflow-x-auto rounded-2xl border border-white/[0.1] bg-black/25 p-4 text-xs leading-6 text-neutral-300">
              <code>{group.code}</code>
            </pre>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PropsContent({ syntax }: { syntax: SyntaxCopy }) {
  return (
    <section className="scroll-mt-28">
      <div className="overflow-hidden rounded-2xl border border-white/[0.1]">
        <div className="divide-y divide-white/[0.08]">
          {syntax.propsRows.map(([component, prop, value, note]) => (
            <div
              className="grid gap-2 bg-white/[0.025] px-4 py-3 text-sm md:grid-cols-[0.75fr_0.9fr_1.1fr_1.55fr]"
              key={`${component}-${prop}`}
            >
              <span className="font-mono text-neutral-300">{component}</span>
              <span className="font-mono text-[#8ea5ff]">{prop}</span>
              <span className="font-mono text-neutral-500">{value}</span>
              <span className="text-neutral-500">{note}</span>
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
      <div className="grid gap-2">
        {syntax.motionRows.map(([name, value]) => (
          <div
            className="grid gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm md:grid-cols-[0.95fr_1.45fr]"
            key={name}
          >
            <span className="font-mono text-neutral-300">{name}</span>
            <span className="text-neutral-500">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CodePanelHeader({ fileLabel, title }: { fileLabel: string; title: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
        <FileCode2 className="h-4 w-4 text-[#8ea5ff]" />
        {title}
      </div>
      <span className="rounded-full border border-white/[0.1] px-3 py-1 font-mono text-xs text-neutral-500">
        {fileLabel}
      </span>
    </div>
  );
}
