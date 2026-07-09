"use client";

import Link from "next/link";
import { ArrowRight, FileText, Presentation } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

export default function LoginPage() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";

  return (
    <main className="flex min-h-[calc(100dvh-78px)] items-center bg-[#f7f7f4] px-4 pb-20 pt-32 text-[#111315] sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <h1 className="max-w-xl text-[clamp(46px,6vw,76px)] font-semibold leading-[1] tracking-normal [text-wrap:balance]">
            {isZh ? "你的工作區，很快就會在這裡。" : "Your workspace will live here soon."}
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-[#111315]/58">
            {isZh ? "帳號登入正在準備中。現在仍可直接開啟兩個產品。" : "Account sign-in is being prepared. You can still open both products directly."}
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-[#111315]/10 bg-[#111315]/10 sm:grid-cols-2">
          <Link href="/workspace/pitch" className="group flex min-h-64 flex-col bg-[#111315] p-7 text-white transition-colors hover:bg-black sm:p-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#c4ee87] text-[#0a1a00]">
              <Presentation className="h-5 w-5" />
            </span>
            <span className="mt-auto flex items-end justify-between gap-4">
              <span>
                <span className="block text-2xl font-semibold">Pitch</span>
                <span className="mt-2 block text-sm text-white/48">{isZh ? "開始製作簡報" : "Start a presentation"}</span>
              </span>
              <ArrowRight className="h-5 w-5 text-white/42 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </span>
          </Link>
          <Link href="/workspace/briefly" className="group flex min-h-64 flex-col bg-[#e7f2f7] p-7 transition-colors hover:bg-[#d9edf5] sm:p-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#9ad7ff] text-[#071117]">
              <FileText className="h-5 w-5" />
            </span>
            <span className="mt-auto flex items-end justify-between gap-4">
              <span>
                <span className="block text-2xl font-semibold">Briefly</span>
                <span className="mt-2 block text-sm text-[#111315]/48">{isZh ? "開始整理專案" : "Start a project brief"}</span>
              </span>
              <ArrowRight className="h-5 w-5 text-[#111315]/36 transition-transform group-hover:translate-x-1 group-hover:text-[#111315]" />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
