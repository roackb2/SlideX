"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  return (
    <section className="mt-12 border-t border-white/[0.08] py-8 md:mt-16 md:py-10">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-sm font-semibold text-white">{syntax.helpfulTitle}</p>
          <Link
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#b9c6ff] transition hover:text-white"
            href="/resources"
          >
            {syntax.feedbackLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Link
          className="group rounded-2xl border border-[#8ea5ff]/20 bg-[#8ea5ff]/[0.055] p-5 transition hover:border-[#8ea5ff]/35 hover:bg-[#8ea5ff]/[0.08]"
          href={nextHref}
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
  );
}
