"use client";

import { ChevronDown, Layers, Plus, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { collectBlocksOfType, GroupLayerRow, LayerRow, type GroupableLayerType } from "@/features/studio/ui/LayerRow";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";

export type SlideRow = {
  duration: number;
  index: number;
  layers: number;
  title: string;
};

export function LayerSidebar({
  activeSlideCardFlow,
  activeSlideChartFlow,
  activeSlideIndex,
  activeSlideMetricFlow,
  deleteBlock,
  deleteSlide,
  draggedBlockIndex,
  dragOverBlockIndex,
  isTemplateModalOpen,
  moveBlock,
  onSelectBlock,
  onSelectBlocks,
  onOpenTemplates,
  onSelectSlide,
  reorderBlock,
  scenes,
  selectedBlockIndex,
  selectedBlockIndices,
  setDragOverBlockIndex,
  setDraggedBlockIndex,
  slideRows
}: {
  activeSlideCardFlow: string;
  activeSlideChartFlow: string;
  activeSlideIndex: number;
  activeSlideMetricFlow: string;
  deleteBlock: (index: number) => void;
  deleteSlide: (index: number) => void;
  draggedBlockIndex: number | null;
  dragOverBlockIndex: number | null;
  isTemplateModalOpen: boolean;
  moveBlock: (index: number, direction: -1 | 1) => void;
  onSelectBlock: (index: number, event: MouseEvent<HTMLDivElement>) => void;
  onSelectBlocks: (indices: number[], options?: { additive?: boolean }) => void;
  onOpenTemplates: () => void;
  onSelectSlide: (index: number) => void;
  reorderBlock: (fromIndex: number, toIndex: number) => void;
  scenes: MotionDocScene[];
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  setDragOverBlockIndex: (index: number | null) => void;
  setDraggedBlockIndex: (index: number | null) => void;
  slideRows: SlideRow[];
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(groupKey: string) {
    setExpandedGroups((current) => {
      const next = new Set(current);

      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }

      return next;
    });
  }

  return (
    <div id="sidebar-v4" className="premium-glass-panel flex w-[265px] shrink-0 flex-col overflow-hidden rounded-2xl m-3 mr-1.5 shadow-black/80 select-none animate-[bubble-appear_0.2s_ease-out]">
      {/* Sidebar Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.04] px-4 py-3.5 bg-white/[0.01]">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">Layers</span>
        <span className="font-mono text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/[0.04]">
          {scenes.length} scenes
        </span>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col p-3">
          
          {/* New Slide Button */}
          <button
            className={`mb-4.5 flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-300 cursor-pointer hover:shadow-lg active:scale-[0.98] ${
              isTemplateModalOpen
                ? "border-white/[0.16] bg-white/[0.08] text-white shadow-inner"
                : "border-white/[0.06] bg-white/[0.02] text-neutral-300 hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
            }`}
            onClick={onOpenTemplates}
            type="button"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-white text-black shadow shadow-black/25">
                <Plus size={14} className="stroke-[3]" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[11.5px] font-bold text-white leading-none">New slide</span>
                <span className="text-[9.5px] text-neutral-500 leading-none">Choose templates...</span>
              </span>
            </span>
            <ChevronDown size={12} className="text-neutral-500" />
          </button>

          {/* Section Indicator */}
          <div className="mb-2 flex items-center justify-between px-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Scenes</span>
            <span className="font-mono text-[9px] font-bold text-neutral-500">{scenes.length}</span>
          </div>

          {/* Slides List Grid */}
          <div className="flex flex-col gap-1">
            {slideRows.map((slide) => {
              const isActive = slide.index === activeSlideIndex;
              const currentSlide = scenes[slide.index];
              const renderedGroupedTypes = new Set<GroupableLayerType>();
              return (
                <div className="flex flex-col" key={slide.index}>
                  
                  {/* Scene Row item */}
                  <div
                    className={`group/item flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2.5 transition-all duration-300 active:scale-[0.98] relative ${
                      isActive
                        ? "bg-gradient-to-r from-[#8ea5ff]/12 via-[#8ea5ff]/4 to-transparent text-white border-l-2 border-[#8ea5ff] pl-2 shadow-[inset_1px_0_0_0_rgba(255,255,255,0.05)]"
                        : "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 border-l-2 border-transparent pl-2"
                    }`}
                    onClick={() => onSelectSlide(slide.index)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Layers size={13} className={isActive ? "text-[#8ea5ff]" : "text-neutral-500 group-hover:text-neutral-300 transition-colors"} />
                      <span className={`truncate text-[12px] font-semibold tracking-wide ${isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"}`}>
                        Slide {slide.index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">
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

                  {/* Active layers child lists */}
                  {isActive && currentSlide && currentSlide.blocks.length > 0 && (
                    <div className="ml-4.5 mt-1.5 flex flex-col gap-1 border-l border-white/[0.06] pl-2.5 animate-[bubble-appear_0.2s_ease-out]">
                      {currentSlide.blocks.map((block, blockIndex) => {
                        const groupType = groupableLayerType(block.type);
                        const groupFlow = groupType === "Card"
                          ? activeSlideCardFlow
                          : groupType === "Metric"
                            ? activeSlideMetricFlow
                            : groupType === "Chart"
                              ? activeSlideChartFlow
                              : "stack";

                        if (groupType && groupFlow !== "stack") {
                          if (renderedGroupedTypes.has(groupType)) {
                            return null;
                          }

                          renderedGroupedTypes.add(groupType);

                          const groupedBlocks = collectBlocksOfType(currentSlide.blocks, groupType);
                          const groupIndices = groupedBlocks.map(({ index }) => index);
                          const isGroupSelected = groupIndices.length > 0 && groupIndices.every((index) => selectedBlockIndices.includes(index));
                          const groupKey = `${slide.index}-${groupType}`;
                          const isExpanded = expandedGroups.has(groupKey);

                          return (
                            <div className="flex flex-col gap-1" key={`${groupType.toLowerCase()}-stack`}>
                              <GroupLayerRow
                                count={groupedBlocks.length}
                                flow={groupFlow}
                                indices={groupIndices}
                                isExpanded={isExpanded}
                                isSelected={isGroupSelected}
                                label={`${groupType} stack`}
                                onSelectBlocks={onSelectBlocks}
                                onToggleExpanded={() => toggleGroup(groupKey)}
                              />
                              {isExpanded ? (
                                <div className="ml-3 flex flex-col gap-1 border-l border-white/[0.06] pl-2.5 animate-[bubble-appear_0.15s_ease-out]">
                                  {groupedBlocks.map(({ block: groupedBlock, index: groupedIndex }) => (
                                    <LayerRow
                                      block={groupedBlock}
                                      deleteBlock={deleteBlock}
                                      draggedBlockIndex={draggedBlockIndex}
                                      dragOverBlockIndex={dragOverBlockIndex}
                                      index={groupedIndex}
                                      key={groupedIndex}
                                      moveBlock={moveBlock}
                                      onSelectBlock={onSelectBlock}
                                      reorderBlock={reorderBlock}
                                      selectedBlockIndex={selectedBlockIndex}
                                      selectedBlockIndices={selectedBlockIndices}
                                      setDraggedBlockIndex={setDraggedBlockIndex}
                                      setDragOverBlockIndex={setDragOverBlockIndex}
                                      totalBlocks={currentSlide.blocks.length}
                                    />
                                  ))}
                                </div>
                              ) : null}
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

function groupableLayerType(type: string): GroupableLayerType | null {
  if (type === "Card" || type === "Metric" || type === "Chart") {
    return type;
  }

  return null;
}
