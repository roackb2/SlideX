"use client";

import Link from "next/link";
import { useState, type RefObject } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Download, Layers, PanelRight, Play, Undo2 } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";

export function PitchHeader({
  accessMode,
  exportMenuRef,
  isMobileInspectorOpen,
  isMobileSidebarOpen,
  notice,
  projectName,
  zoomLevel,
  setZoomLevel,
  actualScale,

  onExport,
  onPlay,
  onUndo,
  onToggleInspector,
  onToggleSidebar
}: {
  accessMode: "authenticated" | "guest";
  exportMenuRef: RefObject<HTMLDivElement | null>;
  isMobileInspectorOpen: boolean;
  isMobileSidebarOpen: boolean;
  notice: string;
  projectName: string;
  zoomLevel: number | "fit";
  setZoomLevel: (z: number | "fit") => void;
  actualScale: number;

  onExport: () => void;
  onPlay: () => void;
  onUndo: () => void;
  onToggleInspector: () => void;
  onToggleSidebar: () => void;
}) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const zoomOptions = ["fit", 0.5, 0.75, 1, 1.25, 1.5, 2] as const;

  return (
    <header className="z-50 flex h-11 shrink-0 select-none items-center justify-between border-b border-white/[0.1] bg-[#111111] px-3 py-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] sm:h-[52px] sm:px-6 sm:py-2.5">
      
      {/* Left side actions */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          className={`hidden h-8.5 w-8.5 items-center justify-center rounded-xl transition-all active:scale-95 sm:flex md:hidden ${isMobileSidebarOpen ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"}`}
          onClick={onToggleSidebar}
          type="button"
          aria-label="Toggle layers"
        >
          <Layers size={15} />
        </button>

        <Link
          aria-label="SlideX workspace home"
          className="flex items-center whitespace-nowrap text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-85 active:opacity-70"
          href={accessMode === "guest" ? "/" : appRoutes.workspace}
        >
          <img src="/logo.png" alt="SlideX" className="h-auto w-[68px] rounded object-contain sm:w-[84px]" />
        </Link>
        <span className={`hidden whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-semibold sm:inline-flex ${accessMode === "guest" ? "border-[#c4ee87]/28 bg-[#c4ee87]/[0.07] text-[#c4ee87]" : "border-white/[0.12] text-neutral-500"}`}>
          {accessMode === "guest" ? "Live Demo" : "Pitch Beta"}
        </span>
        <div className="hidden h-3.5 w-[1px] bg-white/[0.08] sm:block mx-1" />
        <span className="hidden max-w-[180px] truncate whitespace-nowrap rounded-xl bg-neutral-900/40 px-3 py-1 text-sm font-semibold tracking-wide text-neutral-300 sm:block border border-white/[0.04] shadow-inner">
          {projectName}
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
        <span className="hidden max-w-[180px] truncate text-[11px] text-neutral-500 xl:block" title={notice}>{notice}</span>
        <Popover.Root onOpenChange={setIsZoomOpen} open={isZoomOpen}>
          <Popover.Trigger asChild>
            <button
              className="hidden sm:flex h-8.5 min-w-[76px] items-center justify-between gap-1 rounded-xl bg-white/[0.04] px-2.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white outline-none focus-visible:ring-1 focus-visible:ring-white/50"
              title="Zoom Level"
              type="button"
            >
              <span>{zoomDisplayLabel(zoomLevel, actualScale)}</span>
              <ChevronDown className="shrink-0 text-neutral-500" size={14} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              className="z-[100] flex w-[140px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#18181b] p-1 shadow-2xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
              sideOffset={8}
            >
              <div className="flex flex-col">
                {zoomOptions.map((option) => (
                  <button
                    key={option}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/10 ${
                      zoomLevel === option ? "bg-white/5 text-white font-medium" : "text-neutral-300"
                    }`}
                    onClick={() => {
                      setZoomLevel(option);
                      setIsZoomOpen(false);
                    }}
                    type="button"
                  >
                    <span>{option === "fit" ? "Fit to Screen" : `${option * 100}%`}</span>
                    {zoomLevel === option && <Check size={14} />}
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Undo action button */}
        <button
          className="hidden h-8.5 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:bg-neutral-900/50 hover:text-neutral-200 active:scale-[0.96] sm:flex"
          onClick={onUndo}
          type="button"
          title="Undo"
        >
          <Undo2 size={14} />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {/* Presentation preview action button */}
        <button
          className="hidden h-8.5 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:bg-neutral-900/50 hover:text-neutral-200 active:scale-[0.96] sm:flex"
          onClick={onPlay}
          type="button"
          title="Play presentation"
        >
          <Play size={14} fill="currentColor" />
          <span className="hidden sm:inline">Play</span>
        </button>

        {/* Export visual white pill */}
        <div className="relative" ref={exportMenuRef}>
          <button
            aria-label="Export presentation"
            className="flex h-8 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-black shadow-md shadow-white/[0.01] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:bg-neutral-100 active:scale-[0.96] sm:h-8.5 sm:px-4"
            onClick={onExport}
            type="button"
          >
            <Download size={14} className="text-black" />
            <span className="hidden sm:inline">Export</span>
          </button>

        </div>

        {/* Mobile inspector toggle */}
        <button
          className={`hidden h-8.5 w-8.5 items-center justify-center rounded-xl transition-all active:scale-95 sm:flex md:hidden ${isMobileInspectorOpen ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"}`}
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

function zoomDisplayLabel(zoomLevel: number | "fit", actualScale: number) {
  if (zoomLevel === "fit") {
    return `Fit ${formatZoomPercent(actualScale)}`;
  }

  return formatZoomPercent(zoomLevel);
}

function formatZoomPercent(scale: number) {
  const percent = scale * 100;

  if (percent < 10) {
    return `${Math.round(percent * 10) / 10}%`;
  }

  return `${Math.round(percent)}%`;
}
