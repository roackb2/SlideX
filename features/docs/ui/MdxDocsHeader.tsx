"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
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
  const { localePath } = useI18n();

  return (
    <motion.header animate="visible" className="border-b border-[#222] pb-12" initial="hidden">
      <motion.div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-[#888]" variants={fadeInUp}>
        <Link className="transition hover:text-[#ededed]" href={localePath("/docs")}>
          {resourcesLabel}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-[#555]" />
        <Link className="transition hover:text-[#ededed]" href={localePath("/docs/introduction")}>
          {syntax.eyebrow}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-[#555]" />
        <span className="text-[#ededed]">{currentSection.label}</span>
      </motion.div>

      <motion.div className="mt-10 max-w-3xl sm:mt-12" custom={1} variants={fadeInUp}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#222] bg-[#111] px-3 py-1.5 text-[12px] font-medium text-[#ededed] shadow-sm">
          <CurrentIcon className="h-3.5 w-3.5 text-blue-500" />
          {syntax.eyebrow}
        </div>
        <h1 className="text-[36px] sm:text-[48px] font-semibold leading-none tracking-[-0.03em] text-[#ededed]">
          {section === "overview" ? syntax.overviewPageTitle : currentSection.label}
        </h1>
        <p className="mt-6 max-w-[65ch] text-[16px] leading-relaxed text-[#888]">
          {getSectionBody(section, syntax)}
        </p>
        <p className="mt-6 text-[13px] text-[#555] font-mono">{syntax.updatedAt}</p>
      </motion.div>
    </motion.header>
  );
}
