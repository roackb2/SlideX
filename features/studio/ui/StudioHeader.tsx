"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { Download, FileCode2, FilePlus2, FileText, FolderOpen, Layers, PanelRight, RotateCcw, Save, Undo2 } from "lucide-react";

export function StudioHeader({
  exportMenuRef,
  isExportMenuOpen,
  isTauri,
  isMobileInspectorOpen,
  isMobileSidebarOpen,
  notice,
  projectName,
  onExportHtml,
  onExportMdx,
  onNewProject,
  onOpenProject,
  onReplay,
  onSaveProject,
  onUndo,
  onToggleInspector,
  onToggleSidebar,
  setIsExportMenuOpen
}: {
  exportMenuRef: RefObject<HTMLDivElement | null>;
  isExportMenuOpen: boolean;
  isTauri: boolean;
  isMobileInspectorOpen: boolean;
  isMobileSidebarOpen: boolean;
  notice: string;
  projectName: string;
  onExportHtml: () => void;
  onExportMdx: () => void;
  onNewProject: () => void;
  onOpenProject: () => void;
  onReplay: () => void;
  onSaveProject: () => void;
  onUndo: () => void;
  onToggleInspector: () => void;
  onToggleSidebar: () => void;
  setIsExportMenuOpen: (updater: (current: boolean) => boolean) => void;
}) {
  return (
    <header className="z-50 flex shrink-0 items-center justify-between border-b border-white/[0.04] bg-[#07080b]/90 backdrop-blur-md px-4 py-2.5 sm:px-6 md:py-3.5">
      
      {/* Left side actions */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          className={`md:hidden flex h-8.5 w-8.5 items-center justify-center rounded-lg transition-colors ${isMobileSidebarOpen ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"}`}
          onClick={onToggleSidebar}
          type="button"
          aria-label="Toggle layers"
        >
          <Layers size={15} />
        </button>

        {isTauri ? (
          <div className="flex items-center whitespace-nowrap text-sm font-semibold tracking-tight text-white">
            <img src="/logo.png" alt="SlideX" className="h-auto w-[72px] rounded object-contain sm:w-[84px]" />
          </div>
        ) : (
          <Link
            aria-label="SlideX home"
            className="flex items-center whitespace-nowrap text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-85 active:opacity-70"
            href="/"
          >
            <img src="/logo.png" alt="SlideX" className="h-auto w-[72px] rounded object-contain sm:w-[84px]" />
          </Link>
        )}
        <div className="hidden h-3.5 w-[1px] bg-white/[0.08] sm:block mx-1" />
        <span className="hidden max-w-[180px] truncate whitespace-nowrap rounded-md bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-neutral-400 sm:block border border-white/[0.04]">
          {projectName}
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
        <span className="hidden sm:block font-mono text-[10px] text-neutral-500 font-semibold tracking-wider">{notice}</span>

        {/* Tauri project actions in sleek unified capsule */}
        {isTauri && (
          <div className="hidden items-center gap-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] p-0.5 sm:flex">
            <button
              className="flex items-center justify-center rounded-full h-8 w-8 text-neutral-400 transition-all hover:bg-white/[0.05] hover:text-white cursor-pointer"
              onClick={onNewProject}
              type="button"
              title="New Project"
            >
              <FilePlus2 size={13.5} />
            </button>
            <button
              className="flex items-center justify-center rounded-full h-8 w-8 text-neutral-400 transition-all hover:bg-white/[0.05] hover:text-white cursor-pointer"
              onClick={onOpenProject}
              type="button"
              title="Open Project"
            >
              <FolderOpen size={13.5} />
            </button>
            <button
              className="flex items-center justify-center gap-1 rounded-full h-8 px-3 text-xs font-semibold text-neutral-400 transition-all hover:bg-white/[0.05] hover:text-white cursor-pointer"
              onClick={onSaveProject}
              type="button"
              title="Save Project"
            >
              <Save size={13.5} />
              <span className="hidden lg:inline">Save</span>
            </button>
          </div>
        )}

        {/* Undo action button */}
        <button
          className="flex h-8 px-2.5 sm:px-3 items-center justify-center gap-1 rounded-lg text-xs font-semibold text-neutral-400 transition-all hover:bg-white/[0.04] hover:text-white cursor-pointer"
          onClick={onUndo}
          type="button"
          title="Undo"
        >
          <Undo2 size={13.5} />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {/* Replay action button */}
        <button
          className="flex h-8 px-2.5 sm:px-3 items-center justify-center gap-1 rounded-lg text-xs font-semibold text-neutral-400 transition-all hover:bg-white/[0.04] hover:text-white cursor-pointer"
          onClick={onReplay}
          type="button"
          title="Replay"
        >
          <RotateCcw size={13.5} />
          <span className="hidden sm:inline">Replay</span>
        </button>

        {/* Export visual white pill */}
        <div className="relative" ref={exportMenuRef}>
          <button
            className="flex h-8 items-center justify-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-bold text-black transition-all hover:bg-neutral-200 active:scale-95 duration-200 cursor-pointer shadow-md"
            onClick={() => setIsExportMenuOpen((current) => !current)}
            type="button"
          >
            <Download size={13} className="text-black" />
            <span className="hidden sm:inline">Export</span>
          </button>
          {isExportMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[160px] sm:min-w-[180px] rounded-xl border border-white/[0.08] bg-[#0c0e14]/90 backdrop-blur-md p-1.5 shadow-2xl shadow-black/80 animate-[bubble-appear_0.2s_ease-out]">
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11.5px] font-semibold text-neutral-300 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer"
                onClick={onExportMdx}
                type="button"
              >
                <FileCode2 size={13} className="text-neutral-400" />
                Export `.mdx`
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11.5px] font-semibold text-neutral-300 transition-colors hover:bg-white/[0.04] hover:text-white cursor-pointer"
                onClick={onExportHtml}
                type="button"
              >
                <FileText size={13} className="text-neutral-400" />
                Export `.html`
              </button>
            </div>
          )}
        </div>

        {/* Mobile inspector toggle */}
        <button
          className={`md:hidden flex h-8.5 w-8.5 items-center justify-center rounded-lg transition-colors ${isMobileInspectorOpen ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"}`}
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
