"use client";

import { PreviewPane } from "@/components/PreviewPane";
import { blockTools, type AddBlockType } from "@/components/studio/studioOptions";
import type { SlideRow } from "@/components/studio/LayerSidebar";

export function PreviewCanvas({
  activeSlideIndex,
  onAddBlock,
  onNextSlide,
  onPreviousSlide,
  onSelectSlide,
  replayNonce,
  sceneCount,
  slideRows,
  source,
  totalDuration
}: {
  activeSlideIndex: number;
  onAddBlock: (type: AddBlockType) => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  onSelectSlide: (index: number) => void;
  replayNonce: number;
  sceneCount: number;
  slideRows: SlideRow[];
  source: string;
  totalDuration: number;
}) {
  return (
    <div id="canvas-v4" className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#050505]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Slide counter nav - compact on mobile */}
      <div className="absolute left-1/2 top-2 sm:top-4 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-md border border-neutral-800 bg-[#0a0a0a] p-0.5 shadow-sm">
        <button aria-label="Previous slide" className="rounded p-1 sm:p-1.5 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white active:bg-neutral-700" onClick={onPreviousSlide}>
          <svg fill="none" height="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="10"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="flex min-w-[36px] sm:min-w-[48px] items-center justify-center px-1.5 sm:px-3 py-0.5">
          <span className="font-mono text-[10px] sm:text-[11px] font-medium text-neutral-300">
            {activeSlideIndex + 1} <span className="text-neutral-500">/</span> {sceneCount}
          </span>
        </div>
        <button aria-label="Next slide" className="rounded p-1 sm:p-1.5 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white active:bg-neutral-700" onClick={onNextSlide}>
          <svg fill="none" height="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="10"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Canvas area - mobile: more vertical space, allow scroll */}
      <div className="custom-scrollbar relative z-0 flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-3 pb-14 pt-9 sm:p-4 sm:pb-20 sm:pt-12 md:p-8 md:pb-24 md:pt-16">
        {/* Mobile: no aspect-video, just fill width with min-height for scroll */}
        <div className="group relative w-full md:aspect-video max-w-[64rem] overflow-visible bg-black shadow-xl ring-1 ring-neutral-800">
          <PreviewPane
            activeSlideIndex={activeSlideIndex}
            autoHeight
            replayNonce={replayNonce}
            source={source}
          />
        </div>

        {/* Bottom block tools - smaller on mobile */}
        <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-md border border-neutral-800 bg-[#0a0a0a] p-0.5 shadow-lg">
          {blockTools.map((item) => (
            <button className="group relative flex h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-col items-center justify-center overflow-visible rounded text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white active:bg-neutral-700" key={item.type} onClick={() => onAddBlock(item.type)}>
              <span className="scale-75 sm:scale-90 md:scale-100">{item.icon}</span>
              <span className="pointer-events-none absolute -top-7 sm:-top-8 whitespace-nowrap rounded bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] font-medium text-black opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline - slightly taller on mobile */}
      <div className="relative z-10 flex h-1.5 sm:h-1.5 w-full shrink-0 overflow-hidden border-t border-neutral-800 bg-neutral-900">
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
            />
          );
        })}
      </div>
    </div>
  );
}
