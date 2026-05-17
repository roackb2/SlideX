"use client";

import { ChevronDown, Layers, Plus, Trash2 } from "lucide-react";
import { BlockLayerIcon, collectConsecutiveBlocks, LayerRow } from "@/components/studio/LayerRow";
import type { MotionDocScene } from "@/lib/motionDocParser";

export type SlideRow = {
  duration: number;
  index: number;
  layers: number;
  title: string;
};

export function LayerSidebar({
  activeSlideCardFlow,
  activeSlideIndex,
  activeSlideMetricFlow,
  deleteBlock,
  deleteSlide,
  draggedBlockIndex,
  dragOverBlockIndex,
  isTemplateModalOpen,
  moveBlock,
  onOpenTemplates,
  onSelectSlide,
  reorderBlock,
  scenes,
  selectedBlockIndex,
  setDragOverBlockIndex,
  setDraggedBlockIndex,
  setSelectedBlockIndex,
  slideRows
}: {
  activeSlideCardFlow: string;
  activeSlideIndex: number;
  activeSlideMetricFlow: string;
  deleteBlock: (index: number) => void;
  deleteSlide: (index: number) => void;
  draggedBlockIndex: number | null;
  dragOverBlockIndex: number | null;
  isTemplateModalOpen: boolean;
  moveBlock: (index: number, direction: -1 | 1) => void;
  onOpenTemplates: () => void;
  onSelectSlide: (index: number) => void;
  reorderBlock: (fromIndex: number, toIndex: number) => void;
  scenes: MotionDocScene[];
  selectedBlockIndex: number | null;
  setDragOverBlockIndex: (index: number | null) => void;
  setDraggedBlockIndex: (index: number | null) => void;
  setSelectedBlockIndex: (index: number) => void;
  slideRows: SlideRow[];
}) {
  return (
    <div id="sidebar-v4" className="flex w-[300px] shrink-0 flex-col overflow-hidden border-r border-neutral-800 bg-[#0a0a0a]">
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Layers</span>
        <span className="font-mono text-[10px] text-neutral-400">{scenes.length} scenes</span>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col p-2">
          <button
            className={`mb-3 flex items-center justify-between rounded-md border p-3 text-left transition-all ${
              isTemplateModalOpen
                ? "border-neutral-500 bg-neutral-900 text-white"
                : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900"
            }`}
            onClick={onOpenTemplates}
            type="button"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black">
                <Plus size={16} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[12px] font-semibold">New slide</span>
                <span className="text-[10px] text-neutral-400">Choose a presentation template</span>
              </span>
            </span>
            <ChevronDown size={14} className="text-neutral-400" />
          </button>

          <div className="mb-2 flex items-center justify-between p-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Scenes</span>
            <span className="font-mono text-[10px] text-neutral-400">{scenes.length}</span>
          </div>
          {slideRows.map((slide) => {
            const isActive = slide.index === activeSlideIndex;
            const currentSlide = scenes[slide.index];
            return (
              <div className="mb-1 flex flex-col" key={slide.index}>
                <div
                  className={`group flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors ${isActive ? "bg-neutral-900 text-white" : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200"}`}
                  onClick={() => onSelectSlide(slide.index)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Layers size={14} className={isActive ? "text-white" : "text-neutral-400"} />
                    <span className="truncate text-[12px] font-medium">Slide {slide.index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-neutral-400">{slide.duration}s</span>
                    {scenes.length > 1 && (
                      <button className="text-neutral-400 opacity-0 transition-all hover:text-white group-hover:opacity-100" onClick={(event) => { event.stopPropagation(); deleteSlide(slide.index); }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {isActive && currentSlide && currentSlide.blocks.length > 0 && (
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-neutral-800 pl-2">
                    {currentSlide.blocks.map((block, blockIndex) => {
                      const groupFlow =
                        block.type === "Card"
                          ? activeSlideCardFlow
                          : block.type === "Metric"
                            ? activeSlideMetricFlow
                            : "stack";

                      if (groupFlow !== "stack" && (block.type === "Card" || block.type === "Metric")) {
                        const previousBlock = currentSlide.blocks[blockIndex - 1];

                        if (previousBlock?.type === block.type) {
                          return null;
                        }

                        const groupedBlocks = collectConsecutiveBlocks(currentSlide.blocks, blockIndex, block.type);
                        const groupLabel = block.type === "Card" ? "Card group" : "Metric group";

                        return (
                          <div className="flex flex-col gap-1" key={`${block.type.toLowerCase()}-group-${blockIndex}`}>
                            <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-neutral-400">
                              <span className="flex min-w-0 items-center gap-2">
                                <BlockLayerIcon block={block} className="text-neutral-400" />
                                <span className="truncate text-[11px] font-medium">{groupLabel}</span>
                              </span>
                              <span className="font-mono text-[9px] uppercase text-neutral-400">{groupFlow}</span>
                            </div>
                            <div className="ml-3 flex flex-col gap-1 border-l border-neutral-800 pl-2">
                              {groupedBlocks.map(({ block: groupedBlock, index: groupedIndex }) => (
                                <LayerRow
                                  block={groupedBlock}
                                  deleteBlock={deleteBlock}
                                  draggedBlockIndex={draggedBlockIndex}
                                  dragOverBlockIndex={dragOverBlockIndex}
                                  index={groupedIndex}
                                  key={groupedIndex}
                                  moveBlock={moveBlock}
                                  reorderBlock={reorderBlock}
                                  selectedBlockIndex={selectedBlockIndex}
                                  setDraggedBlockIndex={setDraggedBlockIndex}
                                  setDragOverBlockIndex={setDragOverBlockIndex}
                                  setSelectedBlockIndex={setSelectedBlockIndex}
                                  totalBlocks={currentSlide.blocks.length}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <LayerRow
                          block={block}
                          deleteBlock={deleteBlock}
                          draggedBlockIndex={draggedBlockIndex}
                          dragOverBlockIndex={dragOverBlockIndex}
                          index={blockIndex}
                          key={blockIndex}
                          moveBlock={moveBlock}
                          reorderBlock={reorderBlock}
                          selectedBlockIndex={selectedBlockIndex}
                          setDraggedBlockIndex={setDraggedBlockIndex}
                          setDragOverBlockIndex={setDragOverBlockIndex}
                          setSelectedBlockIndex={setSelectedBlockIndex}
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
  );
}
