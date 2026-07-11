"use client";

import Link from "next/link";
import { ArrowUpRight, Monitor } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

export function DownloadPage() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";

  return (
    <main className="min-h-[100dvh] bg-[#0b0c0f] px-5 pb-24 pt-28 text-[#f4f4f1] sm:px-7 lg:px-10 lg:pt-36">
      <section className="mx-auto max-w-4xl">
        <p className="text-[13px] font-semibold text-[#79b6ff]">Download</p>
        <h1 className="mt-5 max-w-3xl text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.95] tracking-[-0.065em]">
          {isZh ? "Pitch for Mac 正在製作中。" : "Pitch for Mac is in progress."}
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-8 text-white/58">
          {isZh ? "目前可以直接使用瀏覽器中的 Pitch 工作區。Mac 版還沒有可下載版本。" : "Pitch is available in the browser today. A Mac download is not available yet."}
        </p>
        <Link className="group mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-[#f4f4f1] px-5 text-[14px] font-semibold text-[#0b0c0f] transition-colors hover:bg-white active:translate-y-px" href="/workspace/pitch">
          {isZh ? "開啟網頁工作區" : "Open web workspace"}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </section>

      <section className="mx-auto mt-20 max-w-4xl border-t border-white/[0.09] pt-8 lg:mt-24">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.09] bg-white/[0.025] p-6">
            <Monitor className="h-5 w-5 text-[#79b6ff]" />
            <p className="mt-6 text-[17px] font-semibold text-white">Web workspace</p>
            <p className="mt-2 text-[14px] leading-6 text-white/48">{isZh ? "現在可用。無需下載。" : "Available now. No download required."}</p>
          </div>
          <div className="rounded-lg border border-white/[0.09] bg-white/[0.025] p-6">
            <p className="text-[17px] font-semibold text-white">Pitch for Mac</p>
            <p className="mt-2 text-[14px] leading-6 text-white/48">{isZh ? "正在開發中。我們會在這裡更新可用狀態。" : "In development. Availability will be updated here."}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
