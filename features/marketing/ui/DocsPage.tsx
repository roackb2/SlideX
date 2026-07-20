"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search, Terminal, ShieldCheck, FileSpreadsheet, Palette, Layers, Sparkles, Check, Code } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import { CodeCard, Eyebrow, MktgGhostLink, MktgPrimaryLink, MktgSection } from "@/features/marketing/ui/primitives";

type DocsLink = {
  href: string;
  label: string;
};

type DocsGroup = {
  label: string;
  links: DocsLink[];
};

export function DocsPage() {
  const { locale, localePath } = useI18n();
  const [query, setQuery] = useState("");
  const isZh = locale === "zh-TW";

  const groups: DocsGroup[] = isZh
    ? [
        { label: "開始使用", links: [{ href: "#overview", label: "SlideX 簡介" }, { href: "#workspace", label: "工作區架構" }, { href: "#canvas", label: "16:9 畫布定位" }] },
        { label: "核心概念", links: [{ href: "#slides", label: "投影片與圖層" }, { href: "#fill", label: "單色 Fill" }, { href: "#shader", label: "GLSL Paper Shaders" }, { href: "#motion", label: "文字與動態轉場" }] },
        { label: "MCP 與自動化", links: [{ href: "#mcp", label: "SlideX MCP Server" }, { href: "#mcp-local", label: "本機 stdio MCP" }, { href: "#mcp-remote", label: "Remote OAuth MCP" }] },
        { label: "輸出格式", links: [{ href: "#powerpoint", label: "PowerPoint (PPTX)" }, { href: "#html", label: "互動 HTML" }] }
      ]
    : [
        { label: "Getting Started", links: [{ href: "#overview", label: "SlideX Overview" }, { href: "#workspace", label: "Workspace Architecture" }, { href: "#canvas", label: "16:9 Canvas Positioning" }] },
        { label: "Core Concepts", links: [{ href: "#slides", label: "Slides & Layers" }, { href: "#fill", label: "Solid Fills" }, { href: "#shader", label: "GLSL Paper Shaders" }, { href: "#motion", label: "Text & Motion" }] },
        { label: "MCP & Automation", links: [{ href: "#mcp", label: "SlideX MCP Server" }, { href: "#mcp-local", label: "Local stdio MCP" }, { href: "#mcp-remote", label: "Remote OAuth MCP" }] },
        { label: "Export Formats", links: [{ href: "#powerpoint", label: "PowerPoint (PPTX)" }, { href: "#html", label: "Interactive HTML" }] }
      ];

  const filteredGroups = (() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return groups;

    return groups
      .map((group) => ({
        ...group,
        links: group.links.filter((link) => link.label.toLocaleLowerCase().includes(normalizedQuery))
      }))
      .filter((group) => group.links.length > 0);
  })();

  const pageLinks = isZh
    ? [{ href: "#overview", label: "SlideX 是什麼" }, { href: "#workspace", label: "工作區導覽" }, { href: "#fill", label: "背景模式" }, { href: "#mcp", label: "MCP Server" }, { href: "#powerpoint", label: "匯出格式" }]
    : [{ href: "#overview", label: "What is SlideX" }, { href: "#workspace", label: "Workspace Tour" }, { href: "#fill", label: "Background Modes" }, { href: "#mcp", label: "MCP Server" }, { href: "#powerpoint", label: "Export Formats" }];

  const localMcpCommand = "npx -y @z7589xxz758/slidex-mcp-server";

  const localMcpConfig = `{
  "mcpServers": {
    "slidex": {
      "command": "npx",
      "args": ["-y", "@z7589xxz758/slidex-mcp-server"]
    }
  }
}`;

  return (
    <main className="min-h-[100dvh] bg-canvas text-ink selection:bg-accent/30 pt-20">
      {/* Documentation Sub-Header */}
      <div className="sticky top-0 z-30 border-b border-white/[0.09] bg-[#0b0c0f]/80 px-5 backdrop-blur-xl sm:px-7 lg:px-10">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono-geist text-[13px] font-bold text-white tracking-wider">SlideX Docs</span>
            <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 font-mono-geist text-[10px] font-semibold text-accent">
              v0.6.0
            </span>
          </div>

          <label className="hidden h-9 w-full max-w-xs items-center gap-2.5 rounded-lg border border-white/14 bg-white/[0.04] px-3.5 text-white/50 focus-within:border-accent/60 md:flex transition-colors">
            <Search className="h-3.5 w-3.5 shrink-0 text-white/40" />
            <span className="sr-only">{isZh ? "搜尋文件" : "Search documentation"}</span>
            <input
              className="min-w-0 flex-1 bg-transparent font-mono-geist text-[12px] text-white outline-none placeholder:text-white/30"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isZh ? "搜尋 SlideX 文件..." : "Search SlideX docs..."}
              type="search"
              value={query}
            />
          </label>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_200px]">
        {/* Left Sidebar Navigation */}
        <aside className="hidden border-r border-white/[0.08] px-6 py-10 lg:block">
          <nav aria-label={isZh ? "文件章節" : "Documentation sections"} className="sticky top-28 space-y-8 font-mono-geist">
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-3 text-[11px] font-bold tracking-widest text-accent/80 uppercase">{group.label}</p>
                <div className="grid gap-1">
                  {group.links.map((link) => (
                    <a
                      className="rounded-lg px-2.5 py-1.5 text-[13px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
                      href={link.href}
                      key={link.href}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {filteredGroups.length === 0 ? (
              <p className="text-[12px] text-white/40">{isZh ? "找不到符合的章節。" : "No matching sections."}</p>
            ) : null}
          </nav>
        </aside>

        {/* Center Main Article Body */}
        <article className="min-w-0 px-6 py-12 sm:px-10 lg:px-14 lg:py-16 xl:px-16">
          <header id="overview" className="scroll-mt-36">
            <Eyebrow>SLIDEX DOCUMENTATION</Eyebrow>
            <h1 className="mt-4 max-w-3xl text-[clamp(36px,5.2vw,64px)] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
              {isZh ? "用 SlideX 打造專業、流暢的簡報。" : "Build clear presentations with SlideX."}
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink/70 sm:text-[17px]">
              {isZh
                ? "從 16:9 畫布、單色 Fill、GLSL Paper Shaders 到原生 MCP AI 協作與 PowerPoint 匯出，這裡整理完整的開發與使用指南。"
                : "Learn the complete SlideX workflow, from canvas layout and solid fill to dynamic shaders, MCP AI integration, and PowerPoint export."}
            </p>
          </header>

          {/* Quick Links Grid */}
          <section className="mt-12 border-t border-white/[0.09] pt-8">
            <h2 className="text-[20px] font-semibold tracking-[-0.035em] text-white">{isZh ? "快速導向" : "Quick links"}</h2>
            <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
              {pageLinks.map((link) => (
                <a
                  className="group flex min-h-20 items-center justify-between rounded-xl border border-white/12 bg-white/[0.025] px-5 py-4 text-[14.5px] font-semibold text-white/80 transition-all hover:border-accent/40 hover:bg-white/[0.05] hover:text-white"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 text-white/40 transition-transform group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </section>

          {/* Workspace Section */}
          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-32" id="workspace">
            <Eyebrow>01 · WORKSPACE ARCHITECTURE</Eyebrow>
            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-white">{isZh ? "工作區架構" : "Workspace Architecture"}</h2>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink/65">
              {isZh
                ? "左側側邊欄負責管理投影片巡覽與圖層結構，中間為 1024 × 576 標準 16:9 編輯畫布，右側 Inspector 面板用於微調選取元素或背景參數。"
                : "Manage slides and layer order on the left panel, design on the 1024 × 576 (16:9) canvas in the center, and adjust fine controls on the right Inspector panel."}
            </p>
          </section>

          {/* Canvas Section */}
          <section className="mt-12 scroll-mt-32" id="canvas">
            <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-white">{isZh ? "畫布與百分比定位" : "Canvas & Percentage Positioning"}</h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">
              {isZh
                ? "所有元素位置與寬高皆依據畫布百分比（Percentage Coordinates）精確儲存，確保簡報在網頁預覽、即時播放與匯出成可編輯 PPTX 時維持一致構圖。"
                : "Element positions and dimensions are stored as exact canvas percentage coordinates, preserving composition accuracy across web playback and PPTX export."}
            </p>
          </section>

          {/* Slides Section */}
          <section className="mt-12 scroll-mt-32" id="slides">
            <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-white">{isZh ? "投影片與圖層控制" : "Slides & Layer Control"}</h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">
              {isZh
                ? "每頁投影片可容納文字、圖片、影片、圖示、表格與向量幾何形狀。圖層清單支援拖曳重排，即時調整畫布上的前後覆蓋關係。"
                : "Each slide supports text, images, video, icons, tables, and vector shapes. Reorder layers smoothly to adjust visual stacking."}
            </p>
          </section>

          {/* Background Modes Section */}
          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-32" id="fill">
            <Eyebrow>02 · VISUAL STYLES</Eyebrow>
            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-white">{isZh ? "背景模式" : "Background Modes"}</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/12 bg-white/[0.025] p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 font-mono-geist text-[12px] font-bold text-accent">
                  <Palette className="h-4 w-4" />
                  <span>STATIC SOLID FILL</span>
                </div>
                <h3 className="mt-3 text-[18px] font-semibold text-white">{isZh ? "靜態單色填滿" : "Solid Color Fill"}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
                  {isZh
                    ? "為單一投影片設定專屬填滿色彩，或將統一色調一鍵套用至全份簡報。"
                    : "Assign custom background colors to individual slides or apply a theme color across the whole deck."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/[0.025] p-6 backdrop-blur-md scroll-mt-32" id="shader">
                <div className="flex items-center gap-2 font-mono-geist text-[12px] font-bold text-accent">
                  <Sparkles className="h-4 w-4" />
                  <span>GLSL PAPER SHADERS</span>
                </div>
                <h3 className="mt-3 text-[18px] font-semibold text-white">{isZh ? "動態 GLSL Shader" : "Dynamic GLSL Shader"}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
                  {isZh
                    ? "提供 Editorial、Mesh、Orbit、Signal 4 大高質感視覺預設，可自由調整顏色、速度與光影強度。"
                    : "Choose between Editorial, Mesh, Orbit, and Signal GLSL shader presets with speed and intensity controls."}
                </p>
              </div>
            </div>
          </section>

          {/* Motion Section */}
          <section className="mt-12 scroll-mt-32" id="motion">
            <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-white">{isZh ? "文字與動態轉場" : "Text & Motion Transitions"}</h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">
              {isZh
                ? "支援字級、對齊與框線調整。元素進場動畫與投影片轉場在 Pitch 播放模式與互動式 HTML 輸出中均會完整保留。"
                : "Text supports alignment, font sizes, and borders. Element entrance animations and slide transitions remain intact in playback and HTML export."}
            </p>
          </section>

          {/* MCP Server Section */}
          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-32" id="mcp">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Eyebrow>03 · AI INTEGRATION</Eyebrow>
                <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-white">SlideX MCP Server</h2>
              </div>
              <a
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 font-mono-geist text-[11px] font-semibold text-accent transition-colors hover:bg-accent/25"
                href="https://www.npmjs.com/package/@z7589xxz758/slidex-mcp-server/v/0.6.0"
                rel="noreferrer"
                target="_blank"
              >
                v0.6.0 on npm
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink/70">
              {isZh
                ? "透過 Model Context Protocol (MCP)，讓相容的 AI client（Claude, Codex, Cursor, Antigravity）自動建立、檢查與微調簡報。支援本機 stdio 與受保護的 Remote OAuth MCP。"
                : "Use the Model Context Protocol to let compatible AI clients (Claude, Codex, Cursor, Antigravity) create, inspect, and refine decks. Supports local stdio and protected Remote OAuth MCP."}
            </p>

            {/* Local MCP Commands */}
            <div className="mt-10 scroll-mt-32" id="mcp-local">
              <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-white">{isZh ? "本機 MCP：直接啟動" : "Local MCP: Direct Run"}</h3>
              <p className="mt-3 text-[14.5px] text-ink/65">
                {isZh ? "無需事先全域安裝，使用 npx 即可立即執行：" : "Run directly via npx without pre-installing:"}
              </p>
              
              <div className="mt-4 max-w-2xl">
                <CodeCard code={localMcpCommand} copyLabel={isZh ? "複製" : "Copy"} copiedLabel={isZh ? "已複製" : "Copied"} title="TERMINAL RUN COMMAND" />
              </div>

              <p className="mt-6 text-[14.5px] text-ink/65">
                {isZh ? "在支援 stdio 的 AI client 加入以下 MCP 設定檔：" : "Add this MCP config snippet to stdio compatible AI clients:"}
              </p>

              <div className="mt-4 max-w-2xl">
                <CodeCard code={localMcpConfig} copyLabel={isZh ? "複製" : "Copy"} copiedLabel={isZh ? "已複製" : "Copied"} title="MCP CLIENT CONFIG (JSON)" />
              </div>
            </div>

            {/* Remote MCP */}
            <div className="mt-10 scroll-mt-32" id="mcp-remote">
              <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-white">Remote OAuth MCP</h3>
              <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink/65">
                {isZh
                  ? "Remote MCP 採用 OAuth 與 PKCE 驗證，讓 Streamable HTTP 客戶端安全地讀取或編輯您登入的 SlideX 簡報。"
                  : "Remote MCP uses OAuth and PKCE authentication so Streamable HTTP clients can securely read or edit your SlideX presentations."}
              </p>
              
              <div className="mt-4 max-w-2xl">
                <CodeCard code="https://slidexdeck.com/mcp" copyLabel={isZh ? "複製" : "Copy"} copiedLabel={isZh ? "已複製" : "Copied"} title="REMOTE MCP ENDPOINT" />
              </div>
            </div>
          </section>

          {/* Export Formats Section */}
          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-32" id="powerpoint">
            <Eyebrow>04 · EXPORT & DELIVERY</Eyebrow>
            <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-white">{isZh ? "匯出與交付" : "Export & Delivery"}</h2>

            <div className="mt-7 space-y-8">
              <div className="rounded-2xl border border-white/12 bg-white/[0.025] p-6 backdrop-blur-md">
                <div className="flex items-center gap-2.5 font-mono-geist text-[12px] font-bold text-accent">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>POWERPOINT (PPTX)</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                  {isZh
                    ? "匯出的 PPTX 檔案可於 PowerPoint、Keynote 與 Google Slides 中開啟。文字、表格與形狀皆保留為純向量物件；套用動態效果的圖片會自動渲染成獨立 PNG 物件，保障跨平台排版 100% 精準。"
                    : "Exported PPTX files open cleanly in PowerPoint, Keynote, and Google Slides. Text, tables, and shapes remain vector editable objects."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/[0.025] p-6 backdrop-blur-md scroll-mt-32" id="html">
                <div className="flex items-center gap-2.5 font-mono-geist text-[12px] font-bold text-accent">
                  <Code className="h-4 w-4" />
                  <span>INTERACTIVE HTML & MDX</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                  {isZh
                    ? "若需要完整保留 GLSL shader、微光特效與投影片播放轉場，可輸出獨立互動式 HTML 網頁簡報；MDX 格式則提供簡潔源碼，極致親和版本控制。"
                    : "Export standalone interactive HTML to retain GLSL shaders and transitions offline. MDX format offers version-control friendly source code."}
                </p>
              </div>
            </div>

            {/* Bottom Primary CTA */}
            <div className="mt-12 flex items-center gap-4 border-t border-white/[0.09] pt-8">
              <MktgPrimaryLink href={appRoutes.liveDemo}>
                {isZh ? "開啟 Live Demo 試用" : "Try Live Demo"}
                <ArrowRight className="h-4 w-4" />
              </MktgPrimaryLink>
            </div>
          </section>
        </article>

        {/* Right Sidebar Quick Outline */}
        <aside className="hidden border-l border-white/[0.08] px-6 py-12 xl:block">
          <nav aria-label={isZh ? "本頁內容" : "On this page"} className="sticky top-28 font-mono-geist">
            <p className="mb-4 text-[11px] font-bold tracking-widest text-accent uppercase">{isZh ? "本頁導覽" : "ON THIS PAGE"}</p>
            <div className="grid gap-2.5">
              {pageLinks.map((link) => (
                <a className="text-[12px] text-white/50 transition-colors hover:text-white" href={link.href} key={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </aside>
      </div>
    </main>
  );
}
