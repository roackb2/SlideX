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
    <section className="mt-12 border-t border-white/[0.05] py-8 md:mt-16 md:py-10">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] bg-white/[0.03] ring-1 ring-white/[0.08] p-1">
          <div className="h-full rounded-[calc(1.5rem-0.25rem)] bg-gradient-to-b from-[#121218] to-[#08080b] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] p-5">
            <p className="text-sm font-semibold text-white">{syntax.helpfulTitle}</p>
            <Link
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-400 transition hover:text-white"
              href="/resources"
            >
              {syntax.feedbackLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative group/btn rounded-[1.5rem] ring-1 ring-white/[0.08] bg-white/[0.03] p-1 transition-all hover:ring-blue-500/30">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-[1.5rem] blur opacity-0 group-hover/btn:opacity-25 transition duration-1000 group-hover/btn:duration-200" />
          <Link
            className="relative block h-full rounded-[calc(1.5rem-0.25rem)] bg-gradient-to-b from-[#121218] to-[#08080b] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_24px_64px_rgba(59,130,246,0.02)] group-hover/btn:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_24px_64px_rgba(59,130,246,0.06)] p-5 transition-shadow duration-500"
            href={nextHref}
          >
            <p className="text-xs font-semibold text-sky-400">{syntax.nextLabel}</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-lg font-semibold text-white">{nextTitle}</p>
              <ArrowRight className="h-4 w-4 text-sky-400 transition group-hover/btn:translate-x-1" />
            </div>
            <p className="mt-2 text-sm leading-6 text-neutral-500">{nextBody}</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
