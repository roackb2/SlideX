"use client";

import { type MouseEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search, FileSpreadsheet, Palette, Sparkles, Code } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import { CodeCard, MktgPrimaryLink } from "@/features/marketing/ui/primitives";

const localMcpCommand = "npx -y @z7589xxz758/slidex-mcp-server";
const remoteMcpEndpoint = "https://slidexdeck.com/mcp/";
const localMcpConfig = `{
  "mcpServers": {
    "slidex": {
      "command": "npx",
      "args": ["-y", "@z7589xxz758/slidex-mcp-server"]
    }
  }
}`;

type DocsLink = {
  href: string;
  label: string;
};

type DocsGroup = {
  label: string;
  links: DocsLink[];
};

export function DocsPage() {
  const { locale } = useI18n();
  const [query, setQuery] = useState("");
  const isZh = locale === "zh-TW";

  useEffect(() => {
    const { hash, pathname, search } = window.location;

    if (!hash) return;

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));

    requestAnimationFrame(() => target?.scrollIntoView());
    window.history.replaceState(window.history.state, "", `${pathname}${search}`);
  }, []);

  function handleSectionNavigation(event: MouseEvent<HTMLAnchorElement>) {
    const sectionId = event.currentTarget.hash.slice(1);
    const target = document.getElementById(sectionId);

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
  }

  const groups: DocsGroup[] = isZh
    ? [
        { label: "開始使用", links: [{ href: "#overview", label: "SlideX 簡介" }, { href: "#workspace", label: "工作區架構" }, { href: "#canvas", label: "16:9 畫布定位" }] },
        { label: "核心概念", links: [{ href: "#slides", label: "投影片與圖層" }, { href: "#fill", label: "單色 Fill" }, { href: "#shader", label: "GLSL Paper Shaders" }, { href: "#motion", label: "文字與動態轉場" }] },
        { label: "AI 連線", links: [{ href: "#mcp-server", label: "MCP Server" }] },
        { label: "輸出格式", links: [{ href: "#powerpoint", label: "PowerPoint (PPTX)" }, { href: "#html", label: "互動 HTML" }] }
      ]
    : [
        { label: "Getting Started", links: [{ href: "#overview", label: "SlideX Overview" }, { href: "#workspace", label: "Workspace Architecture" }, { href: "#canvas", label: "16:9 Canvas Positioning" }] },
        { label: "Core Concepts", links: [{ href: "#slides", label: "Slides & Layers" }, { href: "#fill", label: "Solid Fills" }, { href: "#shader", label: "GLSL Paper Shaders" }, { href: "#motion", label: "Text & Motion" }] },
        { label: "AI Connection", links: [{ href: "#mcp-server", label: "MCP Server" }] },
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
    ? [{ href: "#overview", label: "SlideX 是什麼" }, { href: "#workspace", label: "工作區導覽" }, { href: "#fill", label: "背景模式" }, { href: "#mcp-server", label: "MCP Server" }, { href: "#powerpoint", label: "匯出格式" }]
    : [{ href: "#overview", label: "What is SlideX" }, { href: "#workspace", label: "Workspace Tour" }, { href: "#fill", label: "Background Modes" }, { href: "#mcp-server", label: "MCP Server" }, { href: "#powerpoint", label: "Export Formats" }];

  return (
    <main className="min-h-[100dvh] bg-canvas text-ink selection:bg-accent/30 pt-20">
      {/* Documentation Sub-Header */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-canvas/80 px-5 backdrop-blur-xl sm:px-7 lg:px-10">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono-geist text-[13px] font-bold text-white tracking-wider">SlideX Docs</span>
            <span className="rounded-sm border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono-geist text-[10px] font-semibold text-white">
              v0.6.0
            </span>
          </div>

          <label className="hidden h-9 w-full max-w-xs items-center gap-2.5 rounded-xl border border-white/14 bg-white/[0.04] hover:bg-white/[0.06] px-3.5 text-white/50 focus-within:border-white/60 md:flex transition-colors">
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
                <p className="mb-3 text-[11px] font-bold tracking-widest text-white/60 uppercase">{group.label}</p>
                <div className="grid gap-1">
                  {group.links.map((link) => (
                    <a
                      className="rounded-lg px-2.5 py-1.5 text-[13px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
                      href={link.href}
                      key={link.href}
                      onClick={handleSectionNavigation}
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
        <article className="min-w-0 px-6 py-12 text-[16px] sm:px-10 lg:px-14 lg:py-16 xl:px-16">
          <header id="overview" className="scroll-mt-36">
            <h1 className="max-w-3xl text-[clamp(40px,5.2vw,70px)] font-semibold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
              {isZh ? "用 SlideX 做出清楚的簡報" : "Build clear presentations with SlideX"}
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink/70 sm:text-[19px]">
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
                  className="group flex min-h-20 items-center justify-between rounded-2xl border border-white/12 bg-white/[0.02] backdrop-blur-md px-5 py-4 text-[16px] font-semibold text-white/80 transition-all hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
                  href={link.href}
                  key={link.href}
                  onClick={handleSectionNavigation}
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 text-white/40 transition-transform group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </section>

          {/* Workspace Section */}
          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-32" id="workspace">
            <h2 className="text-[30px] font-semibold tracking-[-0.04em] text-white">{isZh ? "工作區架構" : "Workspace Architecture"}</h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink/65">
              {isZh
                ? "左側側邊欄負責管理投影片巡覽與圖層結構，中間為 1024 × 576 標準 16:9 編輯畫布，右側 Inspector 面板用於微調選取元素或背景參數。"
                : "Manage slides and layer order on the left panel, design on the 1024 × 576 (16:9) canvas in the center, and adjust fine controls on the right Inspector panel."}
            </p>
          </section>

          {/* Canvas Section */}
          <section className="mt-12 scroll-mt-32" id="canvas">
            <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-white">{isZh ? "畫布與百分比定位" : "Canvas & Percentage Positioning"}</h3>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink/65">
              {isZh
                ? "所有元素位置與寬高皆依據畫布百分比（Percentage Coordinates）精確儲存，確保簡報在網頁預覽、即時播放與匯出成可編輯 PPTX 時維持一致構圖。"
                : "Element positions and dimensions are stored as exact canvas percentage coordinates, preserving composition accuracy across web playback and PPTX export."}
            </p>
          </section>

          {/* Slides Section */}
          <section className="mt-12 scroll-mt-32" id="slides">
            <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-white">{isZh ? "投影片與圖層控制" : "Slides & Layer Control"}</h3>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink/65">
              {isZh
                ? "每頁投影片可容納文字、圖片、影片、圖示、表格與向量幾何形狀。圖層清單支援拖曳重排，即時調整畫布上的前後覆蓋關係。"
                : "Each slide supports text, images, video, icons, tables, and vector shapes. Reorder layers smoothly to adjust visual stacking."}
            </p>
          </section>

          {/* Background Modes Section */}
          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-32" id="fill">
            <h2 className="text-[30px] font-semibold tracking-[-0.04em] text-white">{isZh ? "背景模式" : "Background Modes"}</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/12 bg-white/[0.02] p-8 backdrop-blur-md transition-colors hover:border-accent/40">
                <div className="flex items-center gap-2 font-mono-geist text-[12px] font-bold text-accent">
                  <Palette className="h-4 w-4" />
                  <span>STATIC SOLID FILL</span>
                </div>
                <h3 className="mt-3 text-[18px] font-semibold text-white">{isZh ? "靜態單色填滿" : "Solid Color Fill"}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/60">
                  {isZh
                    ? "為單一投影片設定專屬填滿色彩，或將統一色調一鍵套用至全份簡報。"
                    : "Assign custom background colors to individual slides or apply a theme color across the whole deck."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/12 bg-white/[0.02] p-8 backdrop-blur-md scroll-mt-32 transition-colors hover:border-accent/40" id="shader">
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

          <section className="mt-16 scroll-mt-32 border-t border-white/[0.09] pt-12" id="mcp-server">
            <h2 className="max-w-2xl text-[30px] font-semibold tracking-[-0.04em] text-white">
              {isZh ? "讓 AI client 操作 SlideX 簡報" : "Work on real SlideX presentations from your AI client"}
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink/65">
              {isZh
                ? "MCP Server 讓相容的 client 建立、檢查與修改投影片。每次安全寫入都會使用 revision，避免覆蓋較新的內容。"
                : "MCP Server lets compatible clients create, inspect, and update slides. Revision-aware writes prevent newer work from being overwritten."}
            </p>

            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5">
                <h3 className="text-[18px] font-semibold text-white">{isZh ? "本機連線" : "Local connection"}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/58">
                  {isZh ? "透過 stdio 在本機執行，不需要全域安裝。" : "Run through stdio locally with no global installation."}
                </p>
                <div className="mt-5 space-y-3">
                  <CodeCard code={localMcpCommand} copiedLabel={isZh ? "已複製" : "Copied"} copyLabel={isZh ? "複製" : "Copy"} title="RUN LOCALLY" />
                  <CodeCard code={localMcpConfig} copiedLabel={isZh ? "已複製" : "Copied"} copyLabel={isZh ? "複製" : "Copy"} title="MCP CLIENT CONFIG" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5">
                <h3 className="text-[18px] font-semibold text-white">{isZh ? "遠端連線" : "Remote connection"}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/58">
                  {isZh
                    ? "支援 Streamable HTTP 的 client 可透過 OAuth 與 PKCE 連線，只存取你已授權的雲端簡報。"
                    : "Streamable HTTP clients connect through OAuth and PKCE, and access only the cloud presentations you authorize."}
                </p>
                <div className="mt-5">
                  <CodeCard code={remoteMcpEndpoint} copiedLabel={isZh ? "已複製" : "Copied"} copyLabel={isZh ? "複製" : "Copy"} title="REMOTE MCP ENDPOINT" />
                </div>
                <a
                  className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-accent transition-colors hover:text-accent-hover"
                  href="https://www.npmjs.com/package/@z7589xxz758/slidex-mcp-server"
                  rel="noreferrer"
                  target="_blank"
                >
                  {isZh ? "在 npm 查看套件" : "View the package on npm"}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>

          {/* Export Formats Section */}
          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-32" id="powerpoint">
            <h2 className="text-[30px] font-semibold tracking-[-0.04em] text-white">{isZh ? "匯出與交付" : "Export & Delivery"}</h2>

            <div className="mt-7 space-y-8">
              <div className="rounded-3xl border border-white/12 bg-white/[0.02] p-8 backdrop-blur-md transition-colors hover:border-accent/40">
                <div className="flex items-center gap-2.5 font-mono-geist text-[12px] font-bold text-accent">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>POWERPOINT (PPTX)</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-white/60">
                  {isZh
                    ? "匯出的 PPTX 檔案可於 PowerPoint、Keynote 與 Google Slides 中開啟。文字、表格與形狀皆保留為純向量物件；套用動態效果的圖片會自動渲染成獨立 PNG 物件，保障跨平台排版 100% 精準。"
                    : "Exported PPTX files open cleanly in PowerPoint, Keynote, and Google Slides. Text, tables, and shapes remain vector editable objects."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/12 bg-white/[0.02] p-8 backdrop-blur-md scroll-mt-32 transition-colors hover:border-accent/40" id="html">
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
            <p className="mb-4 text-[11px] font-bold tracking-widest text-white uppercase">{isZh ? "本頁導覽" : "ON THIS PAGE"}</p>
            <div className="grid gap-2.5">
              {pageLinks.map((link) => (
                <a
                  className="text-[12px] text-white/50 transition-colors hover:text-white"
                  href={link.href}
                  key={link.href}
                  onClick={handleSectionNavigation}
                >
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
