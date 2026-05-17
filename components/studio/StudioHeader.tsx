"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { Download, FileCode2, FileText, Layers, PanelRight, RotateCcw } from "lucide-react";

export function StudioHeader({
  exportMenuRef,
  isExportMenuOpen,
  isMobileInspectorOpen,
  isMobileSidebarOpen,
  notice,
  onExportHtml,
  onExportMdx,
  onReplay,
  onToggleInspector,
  onToggleSidebar,
  setIsExportMenuOpen
}: {
  exportMenuRef: RefObject<HTMLDivElement | null>;
  isExportMenuOpen: boolean;
  isMobileInspectorOpen: boolean;
  isMobileSidebarOpen: boolean;
  notice: string;
  onExportHtml: () => void;
  onExportMdx: () => void;
  onReplay: () => void;
  onToggleInspector: () => void;
  onToggleSidebar: () => void;
  setIsExportMenuOpen: (updater: (current: boolean) => boolean) => void;
}) {
  return (
    <header className="z-50 flex shrink-0 items-center justify-between border-b border-white/[0.10] bg-[#111118] px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3">
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
        {/* Mobile sidebar toggle */}
        <button
          className={`md:hidden flex h-8 w-8 items-center justify-center rounded-md transition-colors ${isMobileSidebarOpen ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.07] hover:text-white"}`}
          onClick={onToggleSidebar}
          type="button"
          aria-label="Toggle layers"
        >
          <Layers size={16} />
        </button>

        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm font-semibold tracking-tight text-white transition hover:text-neutral-300">
          <img src="/logo.png" alt="SlideX" className="w-[72px] sm:w-[88px] h-auto rounded-md object-contain" />
        </Link>
        <div className="hidden h-4 w-[1px] bg-white/[0.08] sm:block" />
        <span className="hidden whitespace-nowrap text-[11px] sm:text-[12px] font-medium text-neutral-400 sm:block">Project Alpha</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
        <span className="hidden sm:block font-mono text-[10px] sm:text-[11px] text-neutral-400">{notice}</span>

        {/* Replay - icon only on mobile */}
        <button
          className="flex items-center justify-center rounded-md px-2 py-1.5 sm:px-3 text-xs font-medium text-neutral-400 transition-all hover:bg-white/[0.07] hover:text-white"
          onClick={onReplay}
          type="button"
          title="Replay"
        >
          <RotateCcw size={14} className="sm:hidden" />
          <span className="hidden sm:inline">Replay</span>
        </button>

        <div className="relative" ref={exportMenuRef}>
          <button
            className="flex items-center justify-center gap-1 rounded-md bg-white px-2.5 py-1.5 sm:px-3 text-xs font-medium text-black transition-all hover:bg-neutral-200"
            onClick={() => setIsExportMenuOpen((current) => !current)}
            type="button"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
          {isExportMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[160px] sm:min-w-[180px] rounded-lg border border-white/[0.12] bg-[#0c0b10] p-1.5 shadow-2xl shadow-black/50">
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[11px] text-neutral-300 transition-colors hover:bg-white/[0.07] hover:text-white"
                onClick={onExportMdx}
                type="button"
              >
                <FileCode2 size={13} />
                Export `.mdx`
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[11px] text-neutral-300 transition-colors hover:bg-white/[0.07] hover:text-white"
                onClick={onExportHtml}
                type="button"
              >
                <FileText size={13} />
                Export `.html`
              </button>
            </div>
          )}
        </div>

        {/* Mobile inspector toggle */}
        <button
          className={`md:hidden flex h-8 w-8 items-center justify-center rounded-md transition-colors ${isMobileInspectorOpen ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.07] hover:text-white"}`}
          onClick={onToggleInspector}
          type="button"
          aria-label="Toggle properties"
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
}
