"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { Download, FileCode2, FileText, Layers, PanelRight, RotateCcw, Undo2 } from "lucide-react";

export function StudioHeader({
  exportMenuRef,
  isExportMenuOpen,
  isMobileInspectorOpen,
  isMobileSidebarOpen,
  notice,
  projectName,
  onExportHtml,
  onExportMdx,
  onExportPdf,
  onReplay,
  onUndo,
  onToggleInspector,
  onToggleSidebar,
  setIsExportMenuOpen
}: {
  exportMenuRef: RefObject<HTMLDivElement | null>;
  isExportMenuOpen: boolean;
  isMobileInspectorOpen: boolean;
  isMobileSidebarOpen: boolean;
  notice: string;
  projectName: string;
  onExportHtml: () => void;
  onExportMdx: () => void;
  onExportPdf: () => void;
  onReplay: () => void;
  onUndo: () => void;
  onToggleInspector: () => void;
  onToggleSidebar: () => void;
  setIsExportMenuOpen: (updater: (current: boolean) => boolean) => void;
}) {
  return (
    <header className="z-50 mx-4 mt-4 mb-2 flex shrink-0 items-center justify-between rounded-[2rem] border border-white/[0.06] bg-[#050505]/45 backdrop-blur-[32px] px-4 py-2.5 sm:px-6 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_20px_40px_-10px_rgba(0,0,0,0.8)] select-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
      
      {/* Left side actions */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          className={`md:hidden flex h-8.5 w-8.5 items-center justify-center rounded-xl transition-all active:scale-95 ${isMobileSidebarOpen ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"}`}
          onClick={onToggleSidebar}
          type="button"
          aria-label="Toggle layers"
        >
          <Layers size={15} />
        </button>

        <Link
          aria-label="SlideX home"
          className="flex items-center whitespace-nowrap text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-85 active:opacity-70"
          href="/"
        >
          <img src="/logo.png" alt="SlideX" className="h-auto w-[72px] rounded object-contain sm:w-[84px]" />
        </Link>
        <div className="hidden h-3.5 w-[1px] bg-white/[0.08] sm:block mx-1" />
        <span className="hidden max-w-[180px] truncate whitespace-nowrap rounded-xl bg-neutral-900/40 px-3 py-1 text-sm font-semibold tracking-wide text-neutral-300 sm:block border border-white/[0.04] shadow-inner">
          {projectName}
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
        <span className="hidden sm:block font-mono text-sm text-neutral-400/80 font-medium">{notice}</span>

        {/* Undo action button */}
        <button
          className="flex h-8.5 px-3 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-neutral-900/50 hover:text-neutral-200 hover:scale-[1.02] cursor-pointer active:scale-[0.96]"
          onClick={onUndo}
          type="button"
          title="Undo"
        >
          <Undo2 size={14} />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {/* Replay action button */}
        <button
          className="flex h-8.5 px-3 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-neutral-900/50 hover:text-neutral-200 hover:scale-[1.02] cursor-pointer active:scale-[0.96]"
          onClick={onReplay}
          type="button"
          title="Replay"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Replay</span>
        </button>

        {/* Export visual white pill */}
        <div className="relative" ref={exportMenuRef}>
          <button
            className="flex h-8.5 items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-sm font-bold text-black transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.96] cursor-pointer shadow-md shadow-white/[0.01]"
            onClick={() => setIsExportMenuOpen((current) => !current)}
            type="button"
          >
            <Download size={14} className="text-black" />
            <span className="hidden sm:inline">Export</span>
          </button>
          {isExportMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[160px] sm:min-w-[180px] rounded-2xl border border-white/[0.04] bg-neutral-950/90 backdrop-blur-xl p-[5px] shadow-2xl shadow-black/60 animate-[bubble-appear_0.2s_cubic-bezier(0.16,1,0.3,1)]">
              <button
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-neutral-300 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer duration-150"
                onClick={onExportMdx}
                type="button"
              >
                <FileCode2 size={14} className="text-neutral-400" />
                Export `.mdx`
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-neutral-300 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer duration-150"
                onClick={onExportHtml}
                type="button"
              >
                <FileText size={14} className="text-neutral-400" />
                Export `.html`
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-neutral-300 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer duration-150"
                onClick={onExportPdf}
                type="button"
              >
                <FileText size={14} className="text-neutral-400" />
                Export `.pdf`
              </button>
            </div>
          )}
        </div>

        {/* Mobile inspector toggle */}
        <button
          className={`md:hidden flex h-8.5 w-8.5 items-center justify-center rounded-xl transition-all active:scale-95 ${isMobileInspectorOpen ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"}`}
          onClick={onToggleInspector}
          type="button"
          aria-label="Toggle properties"
        >
          <PanelRight size={15} />
        </button>
      </div>
    </header>
  );
}
