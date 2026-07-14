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
        { label: "輸出", links: [{ href: "#powerpoint", label: "PowerPoint" }, { href: "#html", label: "互動 HTML" }] }
      ]
    : [
        { label: "Getting started", links: [{ href: "#overview", label: "Pitch overview" }, { href: "#workspace", label: "Workspace" }, { href: "#canvas", label: "Canvas" }] },
        { label: "Core concepts", links: [{ href: "#slides", label: "Slides and layers" }, { href: "#fill", label: "Solid fill" }, { href: "#shader", label: "Dynamic shader" }, { href: "#motion", label: "Text and motion" }] },
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
    ? [{ href: "#overview", label: "Pitch 是什麼" }, { href: "#workspace", label: "工作區" }, { href: "#fill", label: "背景模式" }, { href: "#powerpoint", label: "輸出" }]
    : [{ href: "#overview", label: "What is Pitch" }, { href: "#workspace", label: "Workspace" }, { href: "#fill", label: "Background modes" }, { href: "#powerpoint", label: "Export" }];

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
