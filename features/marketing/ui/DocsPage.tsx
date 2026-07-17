"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";

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

  const groups: DocsGroup[] = isZh
    ? [
        { label: "開始使用", links: [{ href: "#overview", label: "Pitch 總覽" }, { href: "#workspace", label: "工作區" }, { href: "#canvas", label: "畫布" }] },
        { label: "核心概念", links: [{ href: "#slides", label: "投影片與圖層" }, { href: "#fill", label: "單色 Fill" }, { href: "#shader", label: "動態 shader" }, { href: "#motion", label: "文字與動態" }] },
        { label: "MCP 與自動化", links: [{ href: "#mcp", label: "MCP Server" }, { href: "#mcp-local", label: "本機 MCP" }, { href: "#mcp-remote", label: "Remote MCP" }] },
        { label: "輸出", links: [{ href: "#powerpoint", label: "PowerPoint" }, { href: "#html", label: "互動 HTML" }] }
      ]
    : [
        { label: "Getting started", links: [{ href: "#overview", label: "Pitch overview" }, { href: "#workspace", label: "Workspace" }, { href: "#canvas", label: "Canvas" }] },
        { label: "Core concepts", links: [{ href: "#slides", label: "Slides and layers" }, { href: "#fill", label: "Solid fill" }, { href: "#shader", label: "Dynamic shader" }, { href: "#motion", label: "Text and motion" }] },
        { label: "MCP and automation", links: [{ href: "#mcp", label: "MCP Server" }, { href: "#mcp-local", label: "Local MCP" }, { href: "#mcp-remote", label: "Remote MCP" }] },
        { label: "Export", links: [{ href: "#powerpoint", label: "PowerPoint" }, { href: "#html", label: "Interactive HTML" }] }
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
    ? [{ href: "#overview", label: "Pitch 是什麼" }, { href: "#workspace", label: "工作區" }, { href: "#fill", label: "背景模式" }, { href: "#mcp", label: "MCP Server" }, { href: "#powerpoint", label: "輸出" }]
    : [{ href: "#overview", label: "What is Pitch" }, { href: "#workspace", label: "Workspace" }, { href: "#fill", label: "Background modes" }, { href: "#mcp", label: "MCP Server" }, { href: "#powerpoint", label: "Export" }];

  const localMcpConfig = `{
  "mcpServers": {
    "slidex": {
      "command": "npx",
      "args": ["-y", "@z7589xxz758/slidex-mcp-server"]
    }
  }
}`;

  return (
    <main className="min-h-[100dvh] bg-[#0b0c0f] pt-24 text-[#f4f4f1]">
      <div className="border-b border-white/[0.08] bg-[#0d0e11] px-5 sm:px-7 lg:px-10">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-6">
          <div>
            <p className="text-[14px] font-semibold text-white">Pitch Documentation</p>
            <p className="mt-0.5 text-[11px] text-white/36">Pitch Beta</p>
          </div>
          <label className="hidden h-9 w-full max-w-xs items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.035] px-3 text-white/40 focus-within:border-white/25 md:flex">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="sr-only">{isZh ? "搜尋文件" : "Search documentation"}</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-white/30"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isZh ? "搜尋 Pitch 文件" : "Search Pitch docs"}
              type="search"
              value={query}
            />
          </label>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_180px]">
        <aside className="hidden border-r border-white/[0.08] px-5 py-9 lg:block">
          <nav aria-label={isZh ? "文件章節" : "Documentation sections"} className="sticky top-32 space-y-8">
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-3 text-[11px] font-semibold text-white/35">{group.label}</p>
                <div className="grid gap-1">
                  {group.links.map((link) => (
                    <a className="rounded-md px-2 py-1.5 text-[13px] text-white/52 transition-colors hover:bg-white/[0.045] hover:text-white" href={link.href} key={link.href}>{link.label}</a>
                  ))}
                </div>
              </div>
            ))}
            {filteredGroups.length === 0 ? <p className="text-[12px] leading-5 text-white/35">{isZh ? "找不到符合的章節。" : "No matching sections."}</p> : null}
          </nav>
        </aside>

        <article className="min-w-0 px-5 py-12 sm:px-8 lg:px-12 lg:py-16 xl:px-16">
          <header id="overview" className="scroll-mt-44">
            <p className="text-[13px] font-semibold text-[#9ad7ff]">Pitch Documentation</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.06em]">
              {isZh ? "用 Pitch 建立清楚的簡報。" : "Build clear presentations with Pitch."}
            </h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-white/55">
              {isZh ? "從畫布、單色 Fill、動態 shader 到 PowerPoint 輸出，這裡整理 Pitch Beta 的核心工作方式。" : "Learn the Pitch Beta workflow, from canvas and solid fill to dynamic shaders and PowerPoint export."}
            </p>
          </header>

          <section className="mt-12 border-t border-white/[0.09] pt-8">
            <h2 className="text-[24px] font-semibold tracking-[-0.035em]">{isZh ? "快速連結" : "Quick links"}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {pageLinks.map((link) => (
                <a className="group flex min-h-20 items-center justify-between rounded-lg border border-white/[0.09] bg-white/[0.02] px-5 py-4 text-[14px] font-semibold text-white/75 transition-colors hover:border-white/[0.18] hover:bg-white/[0.04] hover:text-white" href={link.href} key={link.href}>
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 text-white/28 transition-colors group-hover:text-[#9ad7ff]" />
                </a>
              ))}
            </div>
          </section>

          <section className="mt-16 scroll-mt-40" id="workspace">
            <h2 className="text-[30px] font-semibold tracking-[-0.045em]">{isZh ? "工作區" : "Workspace"}</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/52">{isZh ? "左側管理投影片與圖層，中間是 1024 × 576 的 16:9 畫布，右側用來調整目前選取的投影片或元素。" : "Manage slides and layers on the left, work on the 1024 × 576 canvas in the center, and edit the current selection on the right."}</p>
          </section>

          <section className="mt-12 scroll-mt-40" id="canvas">
            <h3 className="text-[20px] font-semibold tracking-[-0.03em]">{isZh ? "畫布與定位" : "Canvas and positioning"}</h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/52">{isZh ? "元素的位置與尺寸會依照畫布百分比儲存，因此同一份 Pitch 在預覽與輸出時能維持相同構圖。" : "Element position and size are stored as canvas percentages so the same composition is preserved in preview and export."}</p>
          </section>

          <section className="mt-12 scroll-mt-40" id="slides">
            <h3 className="text-[20px] font-semibold tracking-[-0.03em]">{isZh ? "投影片與圖層" : "Slides and layers"}</h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/52">{isZh ? "每張投影片可以包含文字、圖片、影片、表格、圖示與形狀。圖層順序會決定畫布上的前後關係。" : "Each slide can contain text, images, video, tables, icons, and shapes. Layer order controls the visual stacking order."}</p>
          </section>

          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-40" id="fill">
            <h2 className="text-[30px] font-semibold tracking-[-0.045em]">{isZh ? "背景模式" : "Background modes"}</h2>
            <div className="mt-7 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-[17px] font-semibold">{isZh ? "靜態單色" : "Static solid fill"}</h3>
                <p className="mt-3 text-[14px] leading-7 text-white/50">{isZh ? "為目前投影片選擇一個 Fill，或將同一個顏色套用到整份 deck。" : "Choose one fill for the current slide, or apply the same color across the deck."}</p>
              </div>
              <div>
                <h3 className="scroll-mt-40 text-[17px] font-semibold" id="shader">{isZh ? "動態 shader" : "Dynamic shader"}</h3>
                <p className="mt-3 text-[14px] leading-7 text-white/50">{isZh ? "選擇 shader 材質並調整顏色、速度、強度、尺度與細節。" : "Choose a shader material and adjust its color, speed, intensity, scale, and detail."}</p>
              </div>
            </div>
          </section>

          <section className="mt-12 scroll-mt-40" id="motion">
            <h3 className="text-[20px] font-semibold tracking-[-0.03em]">{isZh ? "文字與動態" : "Text and motion"}</h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/52">{isZh ? "文字可調整字級、對齊、顏色與框架。元素進場與投影片轉場會在 Pitch 播放與互動 HTML 中保留。" : "Text supports size, alignment, color, and frame controls. Element entrances and slide transitions remain available in Pitch playback and interactive HTML."}</p>
          </section>

          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-40" id="mcp">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[30px] font-semibold tracking-[-0.045em]">SlideX MCP Server</h2>
              <a
                className="inline-flex items-center gap-1.5 rounded-full border border-[#9ad7ff]/20 bg-[#9ad7ff]/[0.08] px-2.5 py-1 text-[11px] font-semibold text-[#9ad7ff] transition-colors hover:border-[#9ad7ff]/40 hover:bg-[#9ad7ff]/[0.12]"
                href="https://www.npmjs.com/package/@z7589xxz758/slidex-mcp-server/v/0.4.0"
                rel="noreferrer"
                target="_blank"
              >
                v0.4.0 on npm
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/52">
              {isZh
                ? "透過 Model Context Protocol，讓相容的 AI 客戶端建立、檢查與編輯 MotionDoc 簡報。你可以選擇在電腦執行本機 MCP，或連接 SlideX 的受保護 Remote MCP。"
                : "Use the Model Context Protocol to let compatible AI clients create, validate, and edit MotionDoc presentations. Run the local MCP on your computer or connect to SlideX through the protected Remote MCP."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/[0.09] bg-white/[0.02] p-5">
                <p className="text-[12px] font-semibold text-[#9ad7ff]">{isZh ? "本機能力" : "Local capabilities"}</p>
                <p className="mt-2 text-[14px] leading-6 text-white/52">
                  {isZh
                    ? "建立與驗證 deck、編輯投影片與區塊、套用 Paper Shader、使用內建版型，並輸出互動 HTML 與可編輯 PPTX。"
                    : "Create and validate decks, edit slides and blocks, apply Paper Shaders, use built-in layouts, and export interactive HTML or editable PPTX files."}
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.09] bg-white/[0.02] p-5">
                <p className="text-[12px] font-semibold text-[#9ad7ff]">{isZh ? "可新增區塊" : "Insertable blocks"}</p>
                <p className="mt-2 text-[14px] leading-6 text-white/52">
                  {isZh ? (
                    <><code className="text-white/75">Text</code>、<code className="text-white/75">Image</code>、<code className="text-white/75">Video</code>、<code className="text-white/75">Icon</code>、<code className="text-white/75">Table</code>、<code className="text-white/75">ShapeRectangle</code></>
                  ) : (
                    <><code className="text-white/75">Text</code>, <code className="text-white/75">Image</code>, <code className="text-white/75">Video</code>, <code className="text-white/75">Icon</code>, <code className="text-white/75">Table</code>, and <code className="text-white/75">ShapeRectangle</code></>
                  )}
                </p>
                <p className="mt-2 text-[12px] leading-5 text-white/35">
                  {isZh ? "Metric、Card 與 Chart 不開放透過 MCP 新增。" : "Metric, Card, and Chart are not available as MCP insertion types."}
                </p>
              </div>
            </div>

            <div className="mt-10 scroll-mt-40" id="mcp-local">
              <h3 className="text-[20px] font-semibold tracking-[-0.03em]">{isZh ? "本機 MCP：直接執行" : "Local MCP: run directly"}</h3>
              <p className="mt-3 max-w-2xl text-[14px] leading-7 text-white/50">
                {isZh ? "不需要先安裝套件，使用 npx 即可啟動：" : "Start the server with npx without installing the package first:"}
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg border border-white/[0.09] bg-black/30 p-4 text-[13px] leading-6 text-white/70"><code>npx -y @z7589xxz758/slidex-mcp-server</code></pre>
              <p className="mt-6 max-w-2xl text-[14px] leading-7 text-white/50">
                {isZh ? "在支援 stdio 的 MCP 客戶端加入以下設定：" : "Add this configuration to an MCP client that supports stdio:"}
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg border border-white/[0.09] bg-black/30 p-4 text-[13px] leading-6 text-white/70"><code>{localMcpConfig}</code></pre>
              <p className="mt-4 text-[12px] leading-5 text-white/35">
                {isZh
                  ? "第一次處理不熟悉的區塊前，先呼叫 slidex_get_motion_doc_schema 取得目前欄位、型別與預設值。"
                  : "Before editing an unfamiliar block, call slidex_get_motion_doc_schema to get the current fields, types, and default values."}
              </p>
            </div>

            <div className="mt-10 scroll-mt-40" id="mcp-remote">
              <h3 className="text-[20px] font-semibold tracking-[-0.03em]">Remote MCP</h3>
              <p className="mt-3 max-w-2xl text-[14px] leading-7 text-white/50">
                {isZh
                  ? "Remote MCP 使用 OAuth 與 PKCE 驗證，讓支援 Streamable HTTP 的客戶端安全讀取或編輯你已登入的 SlideX 簡報。"
                  : "Remote MCP uses OAuth and PKCE so Streamable HTTP clients can securely read or edit presentations in your signed-in SlideX account."}
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg border border-white/[0.09] bg-black/30 p-4 text-[13px] leading-6 text-white/70"><code>https://slidexdeck.com/mcp/</code></pre>
              <div className="mt-5 rounded-lg border border-amber-200/15 bg-amber-100/[0.04] p-4 text-[13px] leading-6 text-white/48">
                {isZh
                  ? "Remote MCP 僅開放目前簡報的讀取與編輯，不提供建立 deck、本機 HTML／PPTX 輸出、工作區管理或刪除簡報。每次寫入都會檢查簡報版本，遇到版本衝突時需重新讀取後再提交。"
                  : "Remote MCP is limited to reading and editing presentations. It does not expose deck creation, local HTML/PPTX export, workspace management, or presentation deletion. Every write checks the presentation revision; clients must read again after a revision conflict."}
              </div>
            </div>
          </section>

          <section className="mt-16 border-t border-white/[0.09] pt-12 scroll-mt-40" id="powerpoint">
            <h2 className="text-[30px] font-semibold tracking-[-0.045em]">{isZh ? "輸出" : "Export"}</h2>
            <h3 className="mt-7 text-[20px] font-semibold tracking-[-0.03em]">PowerPoint</h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/52">{isZh ? "PPTX 可由 PowerPoint、Keynote 與 Google Slides 開啟。文字、表格與一般形狀保留為可編輯物件；套用濾鏡的圖片會烘焙成獨立 PNG 圖片物件，確保跨平台顯示一致，並可在簡報中移動、縮放或刪除。圖示會依投影片背景自動輸出成黑色或白色 PNG，影片則保留媒體物件與可點擊的封面連結。" : "PPTX files open in PowerPoint, Keynote, and Google Slides. Text, tables, and standard shapes remain editable; filtered images are baked into movable PNG image objects for reliable cross-platform display. Icons export as black or white PNGs based on the slide background, and videos retain their media object plus a clickable cover link."}</p>
          </section>

          <section className="mt-12 scroll-mt-40" id="html">
            <h3 className="text-[20px] font-semibold tracking-[-0.03em]">{isZh ? "互動 HTML" : "Interactive HTML"}</h3>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/52">{isZh ? "需要保留 shader、動態與播放行為時，選擇互動 HTML。檔案可以離線開啟。" : "Choose interactive HTML when shaders, motion, and playback behavior must remain active. The exported file opens offline."}</p>
          </section>

          <div className="mt-16 border-t border-white/[0.09] pt-8">
            <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-[#f4f4f1] px-4 text-[14px] font-semibold text-[#0b0c0f] transition-colors hover:bg-white active:translate-y-px" href={appRoutes.workspace}>
              {isZh ? "開啟 Pitch Beta" : "Open Pitch Beta"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <aside className="hidden border-l border-white/[0.08] px-5 py-12 xl:block">
          <nav aria-label={isZh ? "本頁內容" : "On this page"} className="sticky top-36">
            <p className="mb-4 text-[11px] font-semibold text-white/35">{isZh ? "本頁內容" : "On this page"}</p>
            <div className="grid gap-2.5">
              {pageLinks.map((link) => <a className="text-[12px] text-white/38 transition-colors hover:text-white" href={link.href} key={link.href}>{link.label}</a>)}
            </div>
          </nav>
        </aside>
      </div>
    </main>
  );
}
