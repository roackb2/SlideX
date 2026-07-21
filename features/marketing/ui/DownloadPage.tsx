"use client";

import Link from "next/link";
import { ArrowRight, Monitor, Laptop, Check } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import { MktgSection } from "@/features/marketing/ui/primitives";

export function DownloadPage() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-canvas text-ink selection:bg-accent/30 pt-[120px] pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/10 rounded-full blur-[140px] mix-blend-screen" />
      </div>
      <MktgSection>
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[clamp(40px,5.5vw,72px)] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
            {isZh ? "Pitch for Mac 敬請期待" : "Pitch for Mac is coming soon"}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/60 sm:text-[18px]">
            {isZh
              ? "現在可直接在瀏覽器使用 Pitch。Mac 原生版準備好後，會在這裡更新。"
              : "Pitch is ready in your browser today. We will share the Mac app here when it is ready."}
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch">
          {/* Card 1: Web Workspace (Active Now) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-accent/20 bg-accent/5 p-8 sm:p-10 backdrop-blur-md transition-all duration-300 hover:border-accent/40">
            <div>
              <Monitor className="h-5 w-5 text-accent" />
              <h2 className="mt-6 text-[28px] font-semibold text-white">
                {isZh ? "Pitch 網頁工作區" : "Pitch Web Workspace"}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-white/60">
                {isZh
                  ? "直接在 Chrome、Safari 或 Edge 開啟，支援視覺編輯、簡報播放與 PowerPoint 匯出。"
                  : "Open instantly in Chrome, Safari, or Edge. Complete canvas editing, preview playback, and PPTX export."}
              </p>

              <ul className="mt-6 space-y-2.5 border-t border-white/[0.09] pt-5 font-mono-geist text-[13px] text-white/80">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-accent" />
                  {isZh ? "無需安裝任何軟體" : "Zero installation required"}
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-accent" />
                  {isZh ? "支援 localStorage 自動暫存" : "Automatic localStorage caching"}
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-accent" />
                  {isZh ? "完全相容 SlideX MCP Server" : "100% SlideX MCP Compatible"}
                </li>
              </ul>
            </div>

            <div className="mt-10 pt-2">
              <Link
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[15px] font-semibold text-on-accent transition-all hover:bg-accent-hover active:scale-95"
                href={appRoutes.liveDemo}
              >
                {isZh ? "開啟網頁工作區" : "Open Web Workspace"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Native Mac App (In Progress) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-white/[0.02] p-8 sm:p-10 backdrop-blur-md">
            <div>
              <Laptop className="h-5 w-5 text-white/55" />
              <h2 className="mt-6 text-[28px] font-semibold text-white/80">
                {isZh ? "Pitch for Mac 原生應用" : "Pitch for Mac App"}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-white/50">
                {isZh
                  ? "我們正在準備更貼近 macOS 工作流程的 Pitch 體驗。"
                  : "Coming soon. We are preparing a Pitch experience built around the macOS workflow."}
              </p>

            </div>

            <div className="mt-10 pt-2">
              <span className="inline-flex h-13 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 text-[15px] font-semibold text-white/40">
                {isZh ? "敬請期待" : "Coming soon"}
              </span>
            </div>
          </div>
        </div>
      </MktgSection>
    </main>
  );
}
