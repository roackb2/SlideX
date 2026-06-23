"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import type { SyntaxCopy } from "@/features/docs/ui/mdxDocsModel";

export function MdxDocsFooterCta({
  nextBody,
  nextHref,
  nextTitle,
  syntax
}: {
  nextBody: string;
  nextHref: string;
  nextTitle: string;
  syntax: SyntaxCopy;
}) {
  const { localePath } = useI18n();

  return (
    <section className="mt-16 border-t border-[#222] py-10 md:mt-20 md:py-12">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[#222] bg-[#050505] p-8 shadow-sm">
          <p className="text-[14px] font-medium text-[#ededed]">{syntax.helpfulTitle}</p>
          <Link
            className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-blue-500 transition-colors hover:text-blue-400"
            href={localePath("/docs")}
          >
            {syntax.feedbackLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Link
          className="group block rounded-2xl border border-[#222] bg-[#050505] p-8 transition-colors hover:border-[#444] shadow-sm hover:shadow-md"
          href={localePath(nextHref)}
        >
          <p className="text-[11px] uppercase tracking-widest font-semibold text-[#888]">{syntax.nextLabel}</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-[20px] font-medium text-[#ededed] transition-colors">{nextTitle}</p>
            <ArrowRight className="h-5 w-5 text-[#555] transition-transform group-hover:translate-x-1 group-hover:text-[#ededed]" />
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-[#888]">{nextBody}</p>
        </Link>
      </div>
    </section>
  );
}
