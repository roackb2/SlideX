"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Code2,
  FileCode2,
  MonitorPlay,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import type { Dictionary } from "@/lib/i18n";

export type MdxDocsSection = "overview" | "example" | "patterns" | "props" | "motion";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.48, ease: easeSmooth }
  })
};

type SyntaxCopy = Dictionary["resourcesPage"]["syntax"];

function getSectionBody(section: MdxDocsSection, syntax: SyntaxCopy) {
  const bodies = {
    overview: syntax.overviewBody,
    example: syntax.exampleBody,
    patterns: syntax.patternsBody,
    props: syntax.propsBody,
    motion: syntax.motionBody
  } satisfies Record<MdxDocsSection, string>;

  return bodies[section];
}

function OverviewContent({ syntax }: { syntax: SyntaxCopy }) {
  const overviewLinks = [
    { href: "/resources/mdx/example", icon: FileCode2 },
    { href: "/resources/mdx/patterns", icon: Code2 },
    { href: "/resources/mdx/props", icon: SlidersHorizontal },
    { href: "/resources/mdx/motion", icon: Sparkles }
  ];

  return (
    <section className="scroll-mt-28 space-y-7">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-[#8ea5ff]/20 bg-[#8ea5ff]/[0.05] p-6 md:min-h-[390px] md:p-8"
      >
        <p className="text-sm font-semibold text-[#b9c6ff]">{syntax.overviewTitle}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {syntax.overviewLeadTitle}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-neutral-300">
          {syntax.overviewLeadBody}
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {syntax.rules.map((rule) => (
            <div
              key={rule}
              className="flex gap-3 rounded-xl border border-white/[0.08] bg-black/15 px-4 py-4 text-sm leading-7 text-neutral-300"
            >
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#8ea5ff]" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d1018]">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
              <FileCode2 className="h-4 w-4 text-[#8ea5ff]" />
              {syntax.overviewCodeTitle}
            </div>
            <span className="rounded-full border border-white/[0.1] px-3 py-1 font-mono text-xs text-neutral-500">
              {syntax.fileLabel}
            </span>
          </div>
          <pre className="overflow-x-auto p-5 text-sm leading-7 text-neutral-300">
            <code>{syntax.overviewCode}</code>
          </pre>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {syntax.overviewWorkflowTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-neutral-500">
            {syntax.overviewWorkflowBody}
          </p>
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
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {syntax.overviewReferenceTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-500">
            {syntax.overviewReferenceBody}
          </p>
        </div>
        <div className="divide-y divide-white/[0.08]">
          {syntax.overviewCards.map((card, index) => {
            const item = overviewLinks[index];
            const Icon = item?.icon ?? BookOpen;

            return (
              <Link
                key={card.title}
                href={item?.href ?? "/resources/mdx"}
                className="group grid gap-4 p-5 transition hover:bg-white/[0.035] sm:grid-cols-[44px_minmax(0,1fr)_24px]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.045] text-[#8ea5ff]">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-neutral-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
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
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <FileCode2 className="h-4 w-4 text-[#8ea5ff]" />
            {syntax.fullExampleTitle}
          </div>
          <span className="rounded-full border border-white/[0.1] px-3 py-1 font-mono text-xs text-neutral-500">
            {syntax.fileLabel}
          </span>
        </div>
        <pre className="max-h-[620px] overflow-auto p-5 text-sm leading-7 text-neutral-300">
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
            key={group.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.03, duration: 0.35, ease: easeSmooth }}
            className="grid gap-4 py-7 lg:grid-cols-[220px_minmax(0,1fr)]"
          >
            <div>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#8ea5ff]">
                <Code2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-white">{group.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{group.body}</p>
            </div>
            <pre className="overflow-x-auto rounded-2xl border border-white/[0.1] bg-black/25 p-4 text-xs leading-6 text-neutral-300">
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
              key={`${component}-${prop}`}
              className="grid gap-2 bg-white/[0.025] px-4 py-3 text-sm sm:grid-cols-[0.75fr_0.9fr_1.1fr_1.55fr]"
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
            key={name}
            className="grid gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm sm:grid-cols-[0.95fr_1.45fr]"
          >
            <span className="font-mono text-neutral-300">{name}</span>
            <span className="text-neutral-500">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionContent({ section, syntax }: { section: MdxDocsSection; syntax: SyntaxCopy }) {
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

export default function MdxDocsShell({ section }: { section: MdxDocsSection }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);
  const { t } = useI18n();
  const syntax = t.resourcesPage.syntax;
  const docSections = useMemo(
    () => [
      { id: "overview", href: "/resources/mdx", label: syntax.overviewTitle, icon: BookOpen },
      { id: "example", href: "/resources/mdx/example", label: syntax.fullExampleTitle, icon: FileCode2 },
      { id: "patterns", href: "/resources/mdx/patterns", label: syntax.patternsTitle, icon: Code2 },
      { id: "props", href: "/resources/mdx/props", label: syntax.propsTitle, icon: SlidersHorizontal },
      { id: "motion", href: "/resources/mdx/motion", label: syntax.motionTitle, icon: Sparkles }
    ] satisfies Array<{
      id: MdxDocsSection;
      href: string;
      label: string;
      icon: typeof BookOpen;
    }>,
    [syntax]
  );
  const currentIndex = docSections.findIndex((item) => item.id === section);
  const currentSection = docSections[currentIndex] ?? docSections[0];
  const CurrentIcon = currentSection.icon;
  const nextSection = docSections[currentIndex + 1];
  const nextHref = nextSection?.href ?? "/studio";
  const nextTitle = nextSection?.label ?? syntax.ctaTitle;
  const nextBody = nextSection ? getSectionBody(nextSection.id, syntax) : syntax.ctaBody;
  const docsGroups = [
    {
      title: syntax.sideNavGroups.start,
      links: [
        { ...docSections[0], active: section === "overview" }
      ]
    },
    {
      title: syntax.sideNavGroups.syntax,
      links: [
        { ...docSections[1], active: section === "example" },
        { ...docSections[2], active: section === "patterns" }
      ]
    },
    {
      title: syntax.sideNavGroups.reference,
      links: [
        { ...docSections[3], active: section === "props" },
        { ...docSections[4], active: section === "motion" },
        { href: "/studio", label: syntax.studioLinkLabel, icon: MonitorPlay, active: false }
      ]
    }
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080a0f] text-neutral-200">
      <SiteNav />

      <section className="px-5 pt-24">
        <div className="mx-auto grid w-full max-w-[1068px] gap-0 xl:grid-cols-[248px_minmax(0,780px)] xl:gap-10">
          <aside className="hidden border-r border-white/[0.08] xl:block">
            <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto py-8 pr-6">
              <nav className="divide-y divide-white/[0.08]">
                {docsGroups.map((group) => (
                  <div key={group.title} className="py-5 first:pt-0">
                    <p className="mb-3 px-1 text-sm font-semibold text-neutral-300">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.links.map((item) => (
                        <Link
                          key={`${group.title}-${item.href}`}
                          href={item.href}
                          className={`group flex items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm leading-6 transition ${
                            item.active
                              ? "text-white"
                              : "text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span>{item.label}</span>
                          <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition ${
                            item.active
                              ? "text-[#8ea5ff]"
                              : "text-neutral-600 group-hover:text-neutral-300"
                          }`} />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <motion.header
              initial="hidden"
              animate="visible"
              className="border-b border-white/[0.08] pb-8"
            >
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                <Link href="/resources" className="transition hover:text-neutral-200">
                  {t.nav.resources}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-700" />
                <Link href="/resources/mdx" className="transition hover:text-neutral-200">
                  {syntax.eyebrow}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-700" />
                <span className="text-neutral-300">{currentSection.label}</span>
              </motion.div>

              <motion.div variants={fadeInUp} custom={1} className="mt-7 max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-neutral-300">
                  <CurrentIcon className="h-3.5 w-3.5 text-[#8ea5ff]" />
                  {syntax.eyebrow}
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  {section === "overview" ? syntax.overviewPageTitle : currentSection.label}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400">
                  {getSectionBody(section, syntax)}
                </p>
                <p className="mt-4 text-sm text-neutral-600">{syntax.updatedAt}</p>
              </motion.div>
            </motion.header>

            <article className="py-8">
            <div className="mb-8 xl:hidden">
              <button
                type="button"
                aria-expanded={isMobileNavOpen}
                className="flex w-full items-center justify-between rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur"
                onClick={() => setIsMobileNavOpen((value) => !value)}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <CurrentIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="truncate text-sm font-semibold text-neutral-200">
                    {currentSection.label}
                  </span>
                </span>
                {isMobileNavOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isMobileNavOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.25, ease: easeSmooth }}
                    className="overflow-hidden"
                  >
                    <nav className="mt-3 rounded-2xl border border-white/[0.1] bg-white/[0.035] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur">
                      <div className="space-y-6">
                        {docsGroups.map((group) => (
                          <div key={group.title}>
                            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-600">
                              {group.title}
                            </p>
                            <div className="space-y-1">
                              {group.links.map((item) => {
                                const Icon = item.icon;

                                return (
                                  <Link
                                    key={`${group.title}-${item.href}`}
                                    href={item.href}
                                    onClick={() => setIsMobileNavOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                                      item.active
                                        ? "bg-white/[0.08] text-[#b9c6ff]"
                                        : "text-neutral-400 hover:bg-white/[0.055] hover:text-white"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <SectionContent section={section} syntax={syntax} />

            <section className="mt-16 border-t border-white/[0.08] py-10">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <p className="text-sm font-semibold text-white">{syntax.helpfulTitle}</p>
                  <Link
                    href="/resources"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#b9c6ff] transition hover:text-white"
                  >
                    {syntax.feedbackLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <Link
                  href={nextHref}
                  className="group rounded-2xl border border-[#8ea5ff]/20 bg-[#8ea5ff]/[0.055] p-5 transition hover:border-[#8ea5ff]/35 hover:bg-[#8ea5ff]/[0.08]"
                >
                  <p className="text-xs font-semibold text-[#b9c6ff]">{syntax.nextLabel}</p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <p className="text-lg font-semibold text-white">{nextTitle}</p>
                    <ArrowRight className="h-4 w-4 text-[#8ea5ff] transition group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">{nextBody}</p>
                </Link>
              </div>
            </section>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
