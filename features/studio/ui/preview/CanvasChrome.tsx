"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SlideRow } from "@/features/studio/ui/LayerSidebar";
import { blockTools, type AddBlockType } from "@/features/studio/ui/studioOptions";

type CanvasSlideNavProps = {
  activeSlideIndex: number;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  sceneCount: number;
};

export function CanvasSlideNav({
  activeSlideIndex,
  onNextSlide,
  onPreviousSlide,
  sceneCount
}: CanvasSlideNavProps) {
  return (
    <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/[0.08] bg-[#0c0e14]/90 p-1 shadow-md shadow-black/30 backdrop-blur-md sm:top-5">
      <button
        aria-label="Previous slide"
        className="rounded-full p-1.5 text-neutral-400 transition-all hover:bg-white/[0.05] hover:text-white active:scale-90"
        onClick={onPreviousSlide}
        type="button"
      >
        <ChevronLeft size={10} strokeWidth={2.5} />
      </button>
      <div className="flex min-w-[36px] items-center justify-center px-2 py-0.5 sm:min-w-[48px]">
        <span className="font-mono text-[10px] font-bold text-neutral-300 sm:text-[11px]">
          {activeSlideIndex + 1} <span className="font-normal text-neutral-500">/</span> {sceneCount}
        </span>
      </div>
      <button
        aria-label="Next slide"
        className="rounded-full p-1.5 text-neutral-400 transition-all hover:bg-white/[0.05] hover:text-white active:scale-90"
        onClick={onNextSlide}
        type="button"
      >
        <ChevronRight size={10} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function CanvasBlockDock({ onAddBlock }: { onAddBlock: (type: AddBlockType) => void }) {
  return (
    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#0c0e14]/80 p-1.5 shadow-2xl shadow-black/80 backdrop-blur-xl sm:bottom-5 md:bottom-7">
      {blockTools.map((item) => (
        <button
          className="group relative flex h-8 w-8 cursor-pointer flex-col items-center justify-center overflow-visible rounded-xl text-neutral-400 transition-all duration-250 hover:bg-white/[0.06] hover:text-white active:scale-95 sm:h-9.5 sm:w-9.5 md:h-11 md:w-11"
          key={item.type}
          onClick={() => onAddBlock(item.type)}
          type="button"
        >
          <span className="scale-80 sm:scale-95 md:scale-105">{item.icon}</span>
          <span className="pointer-events-none absolute -top-8 origin-bottom scale-95 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-[9.5px] font-bold text-black opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 sm:-top-9">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function CanvasTimeline({
  activeSlideIndex,
  onSelectSlide,
  slideRows,
  totalDuration
}: {
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  slideRows: SlideRow[];
  totalDuration: number;
}) {
  return (
    <div className="relative z-10 flex h-1.5 w-full shrink-0 overflow-hidden border-t border-neutral-800 bg-neutral-900 sm:h-1.5">
      {slideRows.map((slide) => {
        const isActive = slide.index === activeSlideIndex;
        const widthPercent = Math.max((slide.duration / Math.max(totalDuration, 1)) * 100, 2);

        return (
          <button
            aria-label={`Go to slide ${slide.index + 1}`}
            className={`h-full border-r border-black transition-all ${isActive ? "bg-white" : "bg-neutral-700 hover:bg-neutral-500"}`}
            key={slide.index}
            onClick={() => onSelectSlide(slide.index)}
            style={{ width: `${widthPercent}%` }}
            type="button"
          />
        );
      })}
    </div>
  );
}
