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
    <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/[0.08] bg-[#0c0e14]/75 p-1 shadow-lg shadow-black/45 backdrop-blur-xl sm:top-5">
      <button
        aria-label="Previous slide"
        className="rounded-full p-1.5 text-neutral-400 transition-all hover:bg-white/[0.05] hover:text-white active:scale-90 cursor-pointer"
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
        className="rounded-full p-1.5 text-neutral-400 transition-all hover:bg-white/[0.05] hover:text-white active:scale-90 cursor-pointer"
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
    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#0a0c14]/70 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:bottom-5 md:bottom-7">
      {blockTools.map((item) => (
        <button
          className="group relative flex h-8 w-8 cursor-pointer flex-col items-center justify-center overflow-visible rounded-xl text-neutral-400 transition-all duration-250 hover:bg-white/[0.06] hover:text-white active:scale-95 sm:h-9.5 sm:w-9.5 md:h-11 md:w-11"
          key={item.type}
          onClick={() => onAddBlock(item.type)}
          type="button"
        >
          <span className="scale-80 sm:scale-95 md:scale-105">{item.icon}</span>
          <span className="pointer-events-none absolute -top-9 origin-bottom scale-90 whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#0f111a] px-2.5 py-1 text-[9px] font-bold text-white tracking-wide opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 sm:-top-10">
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
    <div className="relative z-10 flex h-4 w-full shrink-0 overflow-hidden border-t border-white/[0.04] bg-[#08090d] select-none sm:h-5">
      {slideRows.map((slide) => {
        const isActive = slide.index === activeSlideIndex;
        const widthPercent = Math.max((slide.duration / Math.max(totalDuration, 1)) * 100, 2);

        return (
          <button
            aria-label={`Go to slide ${slide.index + 1}`}
            className={`group/time h-full border-r border-white/[0.04] transition-all relative flex flex-col justify-between p-0.5 cursor-pointer ${
              isActive 
                ? "bg-[#8ea5ff]/12 shadow-[inset_0_1px_0_rgba(142,165,255,0.18)]" 
                : "bg-transparent hover:bg-white/[0.02]"
            }`}
            key={slide.index}
            onClick={() => onSelectSlide(slide.index)}
            style={{ width: `${widthPercent}%` }}
            type="button"
          >
            {/* Active glowing indicator block */}
            <span className={`absolute top-0 left-0 right-0 h-[2px] transition-all ${isActive ? "bg-[#8ea5ff]" : "bg-transparent"}`} />
            
            {/* Tick marks inside timeline */}
            <div className="flex w-full justify-between px-1 opacity-20 group-hover/time:opacity-40 transition-opacity">
              <span className="h-1.5 w-[1px] bg-white" />
              <span className="h-1 w-[1px] bg-white" />
              <span className="h-1 w-[1px] bg-white" />
              <span className="h-1 w-[1px] bg-white" />
            </div>
            
            <div className="flex w-full items-center justify-between px-1.5 pb-0.5 font-mono text-[8px] font-bold">
              <span className={isActive ? "text-[#8ea5ff]" : "text-neutral-600 group-hover/time:text-neutral-400"}>
                S{slide.index + 1}
              </span>
              <span className="text-neutral-700 group-hover/time:text-neutral-500 font-normal">
                {slide.duration}s
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
