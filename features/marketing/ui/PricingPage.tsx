"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import { Eyebrow, MktgSection } from "@/features/marketing/ui/primitives";

export function PricingPage() {
  const { locale, localePath } = useI18n();
  const isZh = locale === "zh-TW";
  const docsMcpPath = localePath("/docs#mcp");

  const planFeatures = isZh
    ? [
        "免註冊 Live Demo 工作區",
        "直接畫布與圖層文字圖片編輯",
        "可編輯 PowerPoint (.pptx) 向量匯出",
        "100% 本地 MCP Server (npx)",
        "內建 Editorial, Mesh, Orbit, Signal 版型與 GLSL",
        "自動保存目前瀏覽器 localStorage"
      ]
    : [
        "Live Demo workspace without sign-up",
        "Direct canvas & layer text/image editing",
        "Editable PowerPoint (.pptx) vector export",
        "100% Local MCP Server (npx)",
        "Built-in Editorial, Mesh, Orbit, Signal layout shaders",
        "Auto-save guest progress in browser localStorage"
      ];

  const paidUnlockFeatures = isZh
    ? [
        "解鎖 HTML 網頁簡報匯出（保留轉場與動態）",
        "解鎖 MDX 原始碼下載（版本控制友善）",
        "雲端模板庫與 Remote MCP OAuth 連接",
        "團隊協作與自訂品牌主題"
      ]
    : [
        "Unlock HTML web presentation export (motion intact)",
        "Unlock MDX source code download (git-friendly)",
        "Cloud template library & Remote MCP OAuth connection",
        "Team workspace & custom brand themes"
      ];

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-canvas text-ink selection:bg-accent/30 pt-[120px] pb-24">
      {/* Background ambient lighting */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-accent/10 opacity-30 blur-[140px]" />
      </div>

      <MktgSection>
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="justify-center">SLIDEX PRICING</Eyebrow>
          <h1 className="mt-4 text-[clamp(40px,5.5vw,72px)] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
            {isZh ? "現在免費使用。" : "Free for everyone today."}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-ink/65 sm:text-[18px]">
            {isZh
              ? "Pitch 所有核心編輯、即時預覽與 PPTX 匯出功能目前完全免費。無隱藏費用。"
              : "Pitch core editing, live preview, and PPTX export are completely free today with no credit card required."}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch">
          {/* Card 1: Free Pitch Workspace (Primary Featured) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-accent/40 bg-white/[0.03] p-8 sm:p-10 backdrop-blur-xl shadow-[0_20px_60px_rgba(196,238,135,0.12)]">
            <div className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 font-mono-geist text-[11px] font-semibold text-accent">
              <Sparkles className="h-3 w-3" />
              {isZh ? "免費使用" : "CURRENT PLAN"}
            </div>

            <div>
              <div className="font-mono-geist text-[12px] font-bold tracking-[0.2em] text-accent">PITCH WORKSPACE</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[54px] font-bold tracking-tight text-white">$0</span>
                <span className="font-mono-geist text-[13px] text-white/50">{isZh ? "/ 永久免費" : "/ forever free"}</span>
              </div>
              <p className="mt-2 text-[14.5px] text-ink/60">
                {isZh ? "適合簡報者與單機使用 AI client 創作者" : "Ideal for presenters and standalone AI client builders"}
              </p>

              <ul className="mt-8 space-y-3 border-t border-white/[0.09] pt-6">
                {planFeatures.map((feat) => (
                  <li className="flex items-start gap-3 text-[14px] text-ink/80" key={feat}>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-2">
              <Link
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[15px] font-semibold text-on-accent transition-all hover:bg-accent-hover shadow-lg active:scale-98"
                href={appRoutes.liveDemo}
              >
                {isZh ? "開啟 Live Demo 即刻體驗" : "Open Live Demo"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Pro & Team Unlock (Future Roadmap) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-white/[0.015] p-8 sm:p-10 backdrop-blur-md">
            <div>
              <div className="font-mono-geist text-[12px] font-bold tracking-[0.2em] text-white/40">SLIDEX PRO & CLOUD</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[36px] font-semibold tracking-tight text-white/70">{isZh ? "即將推出" : "Coming Soon"}</span>
              </div>
              <p className="mt-2 text-[14.5px] text-ink/50">
                {isZh ? "進階 HTML 導出、MDX 原始碼與團隊雲端功能" : "Advanced HTML exports, MDX source access, and team features"}
              </p>

              <ul className="mt-8 space-y-3 border-t border-white/[0.09] pt-6">
                {paidUnlockFeatures.map((feat) => (
                  <li className="flex items-start gap-3 text-[14px] text-ink/50" key={feat}>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/40 mt-0.5">
                      <Zap className="h-3 w-3" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 pt-2">
              <Link
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/[0.04] px-6 text-[15px] font-semibold text-white/80 transition-colors hover:bg-white/[0.08]"
                href={docsMcpPath}
              >
                {isZh ? "查看 MCP 文件" : "View MCP Docs"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </MktgSection>
    </main>
  );
}
