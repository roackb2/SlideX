"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles, Terminal, Layers, Calendar } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { MktgSection } from "@/features/marketing/ui/primitives";

export function BlogPage() {
  const { locale, localePath } = useI18n();
  const isZh = locale === "zh-TW";

  const posts = isZh
    ? [
        {
          date: "2026 年 7 月 20 日",
          tag: "RELEASE V2.0",
          title: "SlideX MCP 2.0 重磅升級：專為 AI Client 打造的簡報協議",
          description: "支援 Claude、Codex、Cursor、Antigravity 與其他 MCP client，直接建立投影片、讀取圖層並匯出向量 PPTX。",
          link: localePath("/docs")
        },
        {
          date: "2026 年 7 月 15 日",
          tag: "DESIGN SYSTEM",
          title: "Paper Shaders 與 Editorial 版型美學導航",
          description: "介紹內建的四種 Shader 預設與可延展的字體系統。",
          link: localePath("/docs")
        }
      ]
    : [
        {
          date: "July 20, 2026",
          tag: "RELEASE V2.0",
          title: "SlideX MCP 2.0: The Presentation Protocol Built for AI Clients",
          description: "Native support for Claude, Codex, Cursor, and Antigravity. Create, inspect, and export decks directly through MCP.",
          link: localePath("/docs")
        },
        {
          date: "July 15, 2026",
          tag: "DESIGN SYSTEM",
          title: "Paper Shaders & Editorial Typography Aesthetics",
          description: "Deep dive into our 4 built-in GLSL visual shader presets (Editorial, Mesh, Orbit, Signal) and scalable typography grid.",
          link: localePath("/docs")
        }
      ];

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-canvas text-ink selection:bg-accent/30 pt-[120px] pb-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/10 rounded-full blur-[140px] mix-blend-screen" />
      </div>
      <MktgSection>
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[clamp(40px,5.5vw,72px)] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
            {isZh ? "Pitch 最新動態" : "Pitch updates"}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/60 sm:text-[18px]">
            {isZh ? "查看 SlideX 的功能更新、技術決策與設計變化。" : "Explore feature releases, architecture decisions, and design updates."}
          </p>
        </div>

        {/* Posts List Grid */}
        <div className="mt-14 space-y-6 max-w-4xl mx-auto">
          {posts.map((post) => (
            <article
              key={post.title}
              className="group relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.02] p-8 sm:p-10 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.04]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1 font-mono-geist text-[11px] font-semibold text-accent">
                  <Sparkles className="h-3 w-3" />
                  {post.tag}
                </span>
                <span className="flex items-center gap-1.5 font-mono-geist text-[12px] text-white/40">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
              </div>

              <h2 className="mt-6 text-[clamp(22px,2.6vw,32px)] font-semibold leading-tight text-white group-hover:text-white/80 transition-colors">
                {post.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60">{post.description}</p>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  className="inline-flex items-center gap-2 font-mono-geist text-[13px] font-semibold text-accent transition-colors hover:text-accent-hover hover:underline"
                  href={post.link}
                >
                  {isZh ? "閱讀完整說明" : "Read Full Post"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="font-mono-geist text-[11px] text-white/30">SLIDEX TEAM</span>
              </div>
            </article>
          ))}
        </div>
      </MktgSection>
    </main>
  );
}
