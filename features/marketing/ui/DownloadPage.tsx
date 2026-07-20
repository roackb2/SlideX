"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Monitor, Laptop, ShieldCheck, Check } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import { Eyebrow, MktgSection } from "@/features/marketing/ui/primitives";

export function DownloadPage() {
  const { locale, localePath } = useI18n();
  const isZh = locale === "zh-TW";
  const docsMcpPath = localePath("/docs#mcp");

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-canvas text-ink selection:bg-accent/30 pt-[120px] pb-24">
      {/* Ambient background glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-accent/10 opacity-30 blur-[140px]" />
      </div>

      <MktgSection>
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="justify-center">DOWNLOAD & PLATFORMS</Eyebrow>
          <h1 className="mt-4 text-[clamp(40px,5.5vw,72px)] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
            {isZh ? "Pitch for Mac 正在製作中。" : "Pitch for Mac is in development."}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-ink/65 sm:text-[18px]">
            {isZh
              ? "目前可以直接使用瀏覽器中的 Pitch 工作區。Mac 原生版開發中，我們會在第一時間釋出。"
              : "Pitch is ready in your browser today. A dedicated macOS app is currently in active development."}
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch">
          {/* Card 1: Web Workspace (Active Now) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-accent/40 bg-white/[0.03] p-8 sm:p-10 backdrop-blur-xl shadow-[0_20px_60px_rgba(196,238,135,0.12)]">
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 font-mono-geist text-[11px] font-semibold text-accent">
                  <Monitor className="h-3.5 w-3.5" />
                  {isZh ? "即刻可用 · 無需下載" : "AVAILABLE NOW"}
                </div>
                <span className="font-mono-geist text-[11px] text-accent">v2.0 LIVE</span>
              </div>

              <h2 className="mt-6 text-[28px] font-semibold text-white">
                {isZh ? "Pitch 網頁工作區" : "Pitch Web Workspace"}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink/65">
                {isZh
                  ? "直接在 Chrome、Safari 或 Edge 開啟。支援所有視覺編輯、簡報播放與 PowerPoint 匯出。"
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
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[15px] font-semibold text-on-accent transition-all hover:bg-accent-hover shadow-lg active:scale-98"
                href={appRoutes.liveDemo}
              >
                {isZh ? "開啟網頁工作區" : "Open Web Workspace"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Native Mac App (In Progress) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-white/[0.015] p-8 sm:p-10 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/[0.04] px-3 py-1 font-mono-geist text-[11px] font-semibold text-white/60">
                  <Laptop className="h-3.5 w-3.5" />
                  {isZh ? "開發中" : "IN DEVELOPMENT"}
                </div>
                <span className="font-mono-geist text-[11px] text-white/40">MACOS TAURI</span>
              </div>

              <h2 className="mt-6 text-[28px] font-semibold text-white/80">
                {isZh ? "Pitch for Mac 原生應用" : "Pitch for Mac App"}
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink/50">
                {isZh
                  ? "專為 macOS 打造的高效能原生應用。將整合極速 GLSL 渲染引擎與系統層級 MCP Daemon。"
                  : "High-performance native macOS app powered by Tauri, GLSL acceleration, and system-level MCP Daemon."}
              </p>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 font-mono-geist text-[12px] text-white/60 space-y-2">
                <div className="flex justify-between">
                  <span>TARGET PLATFORM:</span>
                  <span className="text-white">macOS 13.0+ (Apple Silicon & Intel)</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS:</span>
                  <span className="text-accent">Private Beta Testing</span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-2">
              <Link
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/[0.04] px-6 text-[15px] font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
                href={docsMcpPath}
              >
                {isZh ? "瞭解 MCP 本機架構" : "Learn About MCP Architecture"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </MktgSection>
    </main>
  );
}
