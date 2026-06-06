"use client";

import { ChevronDown, Layers, Plus, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { LayerRow } from "@/features/studio/ui/LayerRow";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";

export type SlideRow = {
  duration: number;
  index: number;
  layers: number;
  title: string;
};

export function LayerSidebar({
  activeSlideIndex,
  deleteBlock,
  deleteSlide,
  draggedBlockIndex,
  dragOverBlockIndex,
  isTemplateModalOpen,
  moveBlock,
  onSelectBlock,
  onOpenTemplates,
  onSelectSlide,
  reorderBlock,
  reorderSlide,
  scenes,
  selectedBlockIndex,
  selectedBlockIndices,
  setDragOverBlockIndex,
  setDraggedBlockIndex,
  slideRows
}: {
  activeSlideIndex: number;
  deleteBlock: (index: number) => void;
  deleteSlide: (index: number) => void;
  draggedBlockIndex: number | null;
  dragOverBlockIndex: number | null;
  isTemplateModalOpen: boolean;
  moveBlock: (index: number, direction: -1 | 1) => void;
  onSelectBlock: (index: number, event: MouseEvent<HTMLDivElement>) => void;
  onOpenTemplates: () => void;
  onSelectSlide: (index: number) => void;
  reorderBlock: (fromIndex: number, toIndex: number) => void;
  reorderSlide: (fromIndex: number, toIndex: number) => void;
  scenes: MotionDocScene[];
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  setDragOverBlockIndex: (index: number | null) => void;
  setDraggedBlockIndex: (index: number | null) => void;
  slideRows: SlideRow[];
}) {
  const [activeTab, setActiveTab] = useState<"slides" | "layers">("slides");
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState<number | null>(null);

  return (
    <div id="sidebar-v4" className="flex w-[265px] shrink-0 flex-col overflow-hidden border border-white/[0.06] rounded-[2rem] ml-4 mb-4 bg-[#050505]/45 backdrop-blur-[32px] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_20px_40px_-10px_rgba(0,0,0,0.8)] select-none h-full relative z-10 transition-all duration-700">
      {/* Sidebar Header / Tabs */}
      <div className="flex shrink-0 items-center border-b border-white/[0.04] p-1.5 bg-white/[0.01]">
        <button
          className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize tracking-wide transition-all duration-300 ${
            activeTab === "slides"
              ? "bg-white/10 text-white shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]"
              : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300"
          }`}
          onClick={() => setActiveTab("slides")}
        >
          Slides
        </button>
        <button
          className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize tracking-wide transition-all duration-300 ${
            activeTab === "layers"
              ? "bg-white/10 text-white shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]"
              : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300"
          }`}
          onClick={() => setActiveTab("layers")}
        >
          Layers
        </button>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col p-3">
          
          {/* New Slide Button */}
          <button
            className={`group mb-6 flex items-center justify-between rounded-[1rem] border p-3.5 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-[0.96] ${
              isTemplateModalOpen
                ? "border-white/20 bg-white/10 text-white shadow-inner"
                : "border border-white/[0.04] bg-white/[0.02] text-neutral-400 hover:bg-white/[0.06] hover:text-white shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)]"
            }`}
            onClick={onOpenTemplates}
            type="button"
          >
            <span className="flex items-center gap-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/20 border border-white/[0.08] text-white shadow-inner transition-transform duration-500 group-hover:scale-110">
                <Plus size={14} className="stroke-[2]" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-white leading-none">New Slide</span>
                <span className="text-[10px] text-neutral-500 leading-none">Choose templates...</span>
              </span>
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/20 group-hover:bg-black/40 transition-colors">
              <ChevronDown size={12} className="text-neutral-400 group-hover:translate-y-[1px] transition-transform" />
            </span>
          </button>

          {/* Section Indicator */}
          <div className="mb-2 flex items-center justify-between px-1.5">
            <span className="text-sm font-bold text-neutral-400">Scenes</span>
            <span className="font-mono text-sm font-bold text-neutral-500">{scenes.length}</span>
          </div>

          {/* Slides List Grid */}
          <div className="flex flex-col gap-1">
            {slideRows.map((slide) => {
              const isActive = slide.index === activeSlideIndex;
              const currentSlide = scenes[slide.index];
              return (
                <div className="flex flex-col" key={slide.index}>
                  
                  {/* Scene Row item (Layers Tab) */}
                  {activeTab === "layers" && (
                    <div
                      className={`group/item flex cursor-pointer items-center justify-between rounded-[0.85rem] px-3 py-2.5 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] relative ${
                        isActive
                          ? "bg-white/[0.06] text-white shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)] border border-white/[0.04]"
                          : "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 border border-transparent"
                      }`}
                      onClick={() => onSelectSlide(slide.index)}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Layers size={13} className={isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300 transition-colors"} />
                        <span className={`truncate text-sm font-semibold tracking-wide ${isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"}`}>
                          Slide {slide.index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-neutral-400/80 bg-neutral-900/40 px-2 py-0.5 rounded-lg border border-white/[0.04]">
                          {slide.duration}s
                        </span>
                        {scenes.length > 1 && (
                          <button
                            className="text-neutral-500 opacity-0 transition-all hover:text-red-400 group-hover/item:opacity-100 cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteSlide(slide.index);
                            }}
                            type="button"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Scene Thumbnail (Slides Tab) */}
                  {activeTab === "slides" && (
                    <div 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        setDraggedSlideIndex(slide.index);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedSlideIndex !== null && draggedSlideIndex !== slide.index) {
                          setDragOverSlideIndex(slide.index);
                        }
                      }}
                      onDragLeave={() => {
                        setDragOverSlideIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedSlideIndex !== null && draggedSlideIndex !== slide.index) {
                          reorderSlide(draggedSlideIndex, slide.index);
                        }
                        setDraggedSlideIndex(null);
                        setDragOverSlideIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedSlideIndex(null);
                        setDragOverSlideIndex(null);
                      }}
                      className={`relative flex flex-col p-2.5 pb-6 mb-2 rounded-xl transition-all cursor-pointer ${
                        isActive ? "bg-[#1875ff] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" : "hover:bg-white/[0.04]"
                      } ${dragOverSlideIndex === slide.index ? (draggedSlideIndex! < slide.index ? "border-b-2 border-b-blue-400 border-b-solid" : "border-t-2 border-t-blue-400 border-t-solid") : ""}`}
                      onClick={() => onSelectSlide(slide.index)}
                    >
                      <div className={`relative aspect-video w-full rounded-[4px] shadow-sm overflow-hidden flex items-center justify-center ${isActive ? "bg-white border border-black/10" : "bg-neutral-800 border border-white/10"}`}>
                        {/* Optionally, we can render the LayoutThumbnail here if we know the layout. For now, white box */}
                      </div>
                      <span className={`absolute bottom-1.5 left-3 text-[11px] font-bold tracking-wider ${isActive ? "text-white" : "text-neutral-500"}`}>
                        {slide.index + 1}
                      </span>
                      {scenes.length > 1 && (
                        <button
                          className="absolute right-2 bottom-1.5 text-black/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteSlide(slide.index);
                          }}
                          type="button"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Active layers child lists */}
                  {activeTab === "layers" && isActive && currentSlide && currentSlide.blocks.length > 0 && (
                    <div className="ml-4.5 mt-1.5 flex flex-col gap-1 border-l border-white/[0.06] pl-2.5 animate-[bubble-appear_0.2s_ease-out]">
                      {currentSlide.blocks.map((block, blockIndex) => {
                        return (
                          <LayerRow
                            block={block}
                            deleteBlock={deleteBlock}
                            draggedBlockIndex={draggedBlockIndex}
                            dragOverBlockIndex={dragOverBlockIndex}
                            index={blockIndex}
                            key={blockIndex}
                            moveBlock={moveBlock}
                            onSelectBlock={onSelectBlock}
                            reorderBlock={reorderBlock}
                            selectedBlockIndex={selectedBlockIndex}
                            selectedBlockIndices={selectedBlockIndices}
                            setDraggedBlockIndex={setDraggedBlockIndex}
                            setDragOverBlockIndex={setDragOverBlockIndex}
                            totalBlocks={currentSlide.blocks.length}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
