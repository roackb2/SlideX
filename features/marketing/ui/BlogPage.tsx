"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

export function BlogPage() {
  const { locale, localePath } = useI18n();
  const isZh = locale === "zh-TW";

  return (
    <main className="min-h-[100dvh] bg-[#0b0c0f] px-5 pb-24 pt-28 text-[#f4f4f1] sm:px-7 lg:px-10 lg:pt-36">
      <section className="mx-auto max-w-4xl">
        <p className="text-[13px] font-semibold text-[#79b6ff]">Journal</p>
        <h1 className="mt-5 max-w-3xl text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.95] tracking-[-0.065em]">
          {isZh ? "關於 Pitch 的更新。" : "Updates from Pitch."}
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-8 text-white/58">
          {isZh ? "這裡會放功能更新與設計決策。" : "Feature updates and design decisions will live here."}
        </p>
      </section>

      <section className="mx-auto mt-20 max-w-4xl border-t border-white/[0.09] pt-8 lg:mt-24">
        <article className="rounded-lg border border-white/[0.1] bg-white/[0.025] p-6 sm:p-8">
          <p className="text-[14px] font-semibold text-[#79b6ff]">{isZh ? "目前進度" : "Current status"}</p>
          <h2 className="mt-4 text-[28px] font-semibold leading-[1] tracking-[-0.045em]">{isZh ? "Pitch for Mac 正在開發中。" : "Pitch for Mac is in progress."}</h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/49">{isZh ? "在此之前，Pitch 的瀏覽器工作區已經可以直接使用。" : "Until then, the Pitch browser workspace is ready to use."}</p>
          <Link className="group mt-7 inline-flex h-10 items-center gap-2 text-[14px] font-semibold text-white transition-colors hover:text-[#79b6ff]" href={localePath("/download")}>
            {isZh ? "查看下載資訊" : "View download status"}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </article>
      </section>
    </main>
  );
}
