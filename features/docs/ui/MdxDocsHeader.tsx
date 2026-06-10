"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { fadeInUp, getSectionBody, type DocsSectionLink, type MdxDocsSection, type SyntaxCopy } from "@/features/docs/ui/mdxDocsModel";

export function MdxDocsHeader({
  currentSection,
  resourcesLabel,
  section,
  syntax
}: {
  currentSection: DocsSectionLink;
  resourcesLabel: string;
  section: MdxDocsSection;
  syntax: SyntaxCopy;
}) {
  const CurrentIcon = currentSection.icon;

  return (
    <motion.header animate="visible" className="border-b border-white/[0.05] pb-8" initial="hidden">
      <motion.div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500" variants={fadeInUp}>
        <Link className="transition hover:text-neutral-200" href="/resources">
          {resourcesLabel}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-700" />
        <Link className="transition hover:text-neutral-200" href="/resources/mdx">
          {syntax.eyebrow}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-700" />
        <span className="text-neutral-300">{currentSection.label}</span>
      </motion.div>

      <motion.div className="mt-6 max-w-3xl sm:mt-7" custom={1} variants={fadeInUp}>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-sm font-medium text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <CurrentIcon className="h-3.5 w-3.5 text-sky-400" />
          {syntax.eyebrow}
        </div>
        <h1 className="text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
          {section === "overview" ? syntax.overviewPageTitle : currentSection.label}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-400 sm:text-base">
          {getSectionBody(section, syntax)}
        </p>
        <p className="mt-4 text-sm text-neutral-600">{syntax.updatedAt}</p>
      </motion.div>
    </motion.header>
  );
}
