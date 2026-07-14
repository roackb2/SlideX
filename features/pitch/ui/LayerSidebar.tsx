"use client";

import { Group, Layers, Plus, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { LayerRow } from "@/features/pitch/ui/LayerRow";
import type { MotionDocBlock, MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import { SlideThumbnailPreview } from "@/features/pitch/ui/preview/SlideThumbnailPreview";
import type { SlideRow } from "@/features/pitch/application/slideRows";

export function LayerSidebar({
  activeSlideIndex,
  deleteBlock,
  deleteSlide,
  draggedBlockIndex,
  dragOverBlockIndex,
  moveBlock,
  moveBlockToEdge,
  onAddSlide,
  onSelectBlock,
  onSelectSlide,
  reorderBlock,
  reorderSlide,
  renameBlock,
  replayNonce,
  scenes,
  selectedBlockIndex,
  selectedBlockIndices,
  setDragOverBlockIndex,
  setDraggedBlockIndex,
  slideRows,
  source,
  toggleBlockPositionLock
}: {
  activeSlideIndex: number;
  deleteBlock: (index: number) => void;
  deleteSlide: (index: number) => void;
  draggedBlockIndex: number | null;
  dragOverBlockIndex: number | null;
  moveBlock: (index: number, direction: -1 | 1) => void;
  moveBlockToEdge: (index: number, edge: "back" | "front") => void;
  onAddSlide: () => void;
  onSelectBlock: (index: number, event: MouseEvent<HTMLDivElement>) => void;
  onSelectSlide: (index: number) => void;
  reorderBlock: (fromIndex: number, toIndex: number) => void;
  reorderSlide: (fromIndex: number, toIndex: number) => void;
  renameBlock: (index: number, name: string) => void;
  replayNonce: number;
  scenes: MotionDocScene[];
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  setDragOverBlockIndex: (index: number | null) => void;
  setDraggedBlockIndex: (index: number | null) => void;
  slideRows: SlideRow[];
  source: string;
  toggleBlockPositionLock: (index: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<"slides" | "layers">("slides");
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState<number | null>(null);

  return (
    <div id="sidebar-v4" className="relative z-10 flex h-full w-full shrink-0 select-none flex-col overflow-hidden bg-[#111111] transition-all duration-700 md:w-[265px] md:border-r md:border-white/[0.12]">
      {/* Sidebar Header / Tabs */}
      <div className="flex shrink-0 items-center border-b border-white/[0.08] p-1.5 bg-white/[0.01]">
        <button
          className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all duration-300 ${
            activeTab === "slides"
              ? "bg-white/10 text-white shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]"
              : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300"
          }`}
          onClick={() => setActiveTab("slides")}
        >
          Slides
        </button>
        <button
          className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all duration-300 ${
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
            className="group mb-6 flex items-center justify-between rounded-[1rem] border border-white/[0.04] bg-white/[0.02] p-3.5 text-left text-neutral-400 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] hover:text-white active:scale-[0.96]"
            onClick={onAddSlide}
            type="button"
          >
            <span className="flex items-center gap-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/20 border border-white/[0.08] text-white shadow-inner transition-transform duration-500 group-hover:scale-110">
                <Plus size={14} className="stroke-[2]" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white leading-none">New Slide</span>
                <span className="text-[10px] text-neutral-500 leading-none">Blank slide</span>
              </span>
            </span>
          </button>

          {/* Section Indicator */}
          <div className="mb-2 flex items-center justify-between px-1.5">
            <span className="text-xs font-semibold text-neutral-400">Scenes</span>
            <span className="font-mono text-xs font-medium text-neutral-500">{scenes.length}</span>
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
                          ? "bg-white/[0.08] text-white shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)] border border-white/[0.04]"
                          : "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200 border border-transparent"
                      }`}
                      onClick={() => onSelectSlide(slide.index)}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Layers size={13} className={isActive ? "text-[#8ea5ff]" : "text-neutral-500 group-hover:text-neutral-300 transition-colors"} />
                        <span className={`truncate text-sm font-medium ${isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"}`}>
                          Slide {slide.index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-neutral-400/80 bg-neutral-900/40 px-2 py-0.5 rounded-lg border border-white/[0.04]">
                          {slide.duration}s
                        </span>
                        {scenes.length > 1 && (
                          <button
                            aria-label={`Delete slide ${slide.index + 1}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-red-300/80 transition active:scale-95 active:bg-red-500/15 sm:h-auto sm:w-auto sm:rounded-none sm:text-neutral-500 sm:opacity-0 sm:hover:text-red-400 sm:group-hover/item:opacity-100"
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
                      className={`relative flex flex-col p-2 pb-6 mb-2 rounded-xl transition-all cursor-pointer ${
                        isActive ? "bg-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" : "hover:bg-white/[0.04]"
                      } ${dragOverSlideIndex === slide.index ? (draggedSlideIndex! < slide.index ? "border-b-2 border-b-[#8ea5ff] border-b-solid" : "border-t-2 border-t-[#8ea5ff] border-t-solid") : ""}`}
                      onClick={() => onSelectSlide(slide.index)}
                    >
                      {isActive && <div className="absolute left-0 top-3 bottom-8 w-[3px] rounded-r bg-[#8ea5ff] z-10" />}
                      <div className={`relative aspect-video w-full overflow-hidden rounded-lg border shadow-sm transition-colors ${isActive ? "border-white/20 bg-black/60" : "border-white/5 bg-black/40 hover:border-white/10"}`}>
                        <SlideThumbnailPreview
                          activeSlideIndex={slide.index}
                          eager={isActive}
                          replayNonce={replayNonce}
                          scene={currentSlide}
                          source={source}
                        />
                      </div>
                      <span className={`absolute bottom-1.5 left-2.5 text-[11px] font-medium ${isActive ? "text-[#8ea5ff]" : "text-neutral-500"}`}>
                        {slide.index + 1}
                      </span>
                      {scenes.length > 1 && (
                        <button
                          aria-label={`Delete slide ${slide.index + 1}`}
                          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-black/70 text-red-300 shadow-lg backdrop-blur transition active:scale-95 active:bg-red-500/20 sm:right-2 sm:top-auto sm:bottom-1.5 sm:h-auto sm:w-auto sm:rounded-none sm:border-0 sm:bg-transparent sm:text-black/40 sm:opacity-0 sm:shadow-none sm:backdrop-blur-none sm:hover:text-white sm:group-hover:opacity-100"
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
                      {layerTreeEntries(currentSlide.blocks).map((entry) => {
                        if (entry.kind === "group") {
                          const isGroupSelected = entry.layers.every(({ blockIndex }) => selectedBlockIndices.includes(blockIndex));
                          return (
                            <div className={`overflow-hidden rounded-xl border ${isGroupSelected ? "border-[#8ea5ff]/35 bg-[#8ea5ff]/[0.07]" : "border-white/[0.07] bg-white/[0.018]"}`} key={entry.id}>
                              <div className="flex h-9 cursor-pointer items-center gap-2 border-b border-white/[0.06] px-3 text-[12px] font-semibold text-neutral-300 hover:bg-white/[0.04]" onClick={(event) => onSelectBlock(entry.layers[0].blockIndex, event)}>
                                <Group className="text-[#8ea5ff]" size={13} />
                                <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                                <span className="font-mono text-[10px] text-neutral-600">{entry.layers.length}</span>
                              </div>
                              <div className="flex flex-col gap-0.5 p-1.5 pl-3">
                                {entry.layers.map(({ block, blockIndex }) => (
                                  <LayerRow
                                    block={block}
                                    deleteBlock={deleteBlock}
                                    draggedBlockIndex={draggedBlockIndex}
                                    dragOverBlockIndex={dragOverBlockIndex}
                                    index={blockIndex}
                                    key={blockIndex}
                                    moveBlock={moveBlock}
                                    moveBlockToEdge={moveBlockToEdge}
                                    onSelectBlock={onSelectBlock}
                                    reorderBlock={reorderBlock}
                                    renameBlock={renameBlock}
                                    selectedBlockIndex={selectedBlockIndex}
                                    selectedBlockIndices={selectedBlockIndices}
                                    setDraggedBlockIndex={setDraggedBlockIndex}
                                    setDragOverBlockIndex={setDragOverBlockIndex}
                                    totalBlocks={currentSlide.blocks.length}
                                    toggleBlockPositionLock={toggleBlockPositionLock}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        }

                        const { block, blockIndex } = entry;
                        return (
                          <LayerRow
                            block={block}
                            deleteBlock={deleteBlock}
                            draggedBlockIndex={draggedBlockIndex}
                            dragOverBlockIndex={dragOverBlockIndex}
                            index={blockIndex}
                            key={blockIndex}
                            moveBlock={moveBlock}
                            moveBlockToEdge={moveBlockToEdge}
                            onSelectBlock={onSelectBlock}
                            reorderBlock={reorderBlock}
                            renameBlock={renameBlock}
                            selectedBlockIndex={selectedBlockIndex}
                            selectedBlockIndices={selectedBlockIndices}
                            setDraggedBlockIndex={setDraggedBlockIndex}
                            setDragOverBlockIndex={setDragOverBlockIndex}
                            totalBlocks={currentSlide.blocks.length}
                            toggleBlockPositionLock={toggleBlockPositionLock}
                          />
                        );
                      })}
                    </div>
                  )}
                  {activeTab === "layers" && isActive && currentSlide && currentSlide.blocks.length === 0 ? (
                    <div className="ml-4 mt-2 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.025] px-4 py-5 text-center">
                      <p className="text-xs font-semibold text-neutral-300">No layers yet</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">Use the center + button to add text, images, or other content.</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

type LayerTreeEntry =
  | { block: MotionDocBlock; blockIndex: number; kind: "layer" }
  | { id: string; kind: "group"; layers: Array<{ block: MotionDocBlock; blockIndex: number }>; name: string };

function layerTreeEntries(blocks: MotionDocBlock[]): LayerTreeEntry[] {
  const entries: LayerTreeEntry[] = [];
  const seenGroups = new Set<string>();

  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index];
    const groupId = "props" in block && typeof block.props.groupId === "string" ? block.props.groupId : "";
    if (!groupId) {
      entries.push({ block, blockIndex: index, kind: "layer" });
      continue;
    }
    if (seenGroups.has(groupId)) continue;
    seenGroups.add(groupId);
    const layers = blocks.flatMap((candidate, blockIndex) => (
      "props" in candidate && candidate.props.groupId === groupId ? [{ block: candidate, blockIndex }] : []
    )).reverse();
    const groupName = "props" in block && typeof block.props.groupName === "string" && block.props.groupName.trim()
      ? block.props.groupName
      : "Group";
    entries.push({ id: groupId, kind: "group", layers, name: groupName });
  }

  return entries;
}
