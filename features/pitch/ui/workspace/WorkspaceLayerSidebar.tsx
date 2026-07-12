"use client";

import { LayerSidebar } from "@/features/pitch/ui/LayerSidebar";
import { X } from "lucide-react";
import type { PitchWorkspaceProps } from "@/features/pitch/ui/workspace/PitchWorkspaceTypes";

type WorkspaceLayerSidebarProps = Pick<
  PitchWorkspaceProps,
  | "activeSlideIndex"
  | "addSlide"
  | "canvasSource"
  | "deleteBlock"
  | "deleteSlide"
  | "draggedBlockIndex"
  | "dragOverBlockIndex"
  | "isMobileSidebarOpen"
  | "moveBlock"
  | "moveBlockToEdge"
  | "renameBlock"
  | "reorderBlock"
  | "reorderSlide"
  | "replayNonce"
  | "scenes"
  | "selectBlockFromLayer"
  | "selectedBlockIndex"
  | "selectedBlockIndices"
  | "setDraggedBlockIndex"
  | "setDragOverBlockIndex"
  | "setIsMobileSidebarOpen"
  | "toggleBlockPositionLock"
  | "slideRows"
> & {
  onSelectSlide: (index: number) => void;
};

export function WorkspaceLayerSidebar(props: WorkspaceLayerSidebarProps) {
  return (
    <>
      <div className="hidden h-full md:flex">
        <LayerSidebarContent {...props} />
      </div>

      {props.isMobileSidebarOpen ? (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => props.setIsMobileSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-[80] flex w-[min(88vw,340px)] flex-col overflow-hidden rounded-r-[1.5rem] border-r border-white/[0.12] bg-[#0a0a0a] shadow-[24px_0_80px_rgba(0,0,0,0.72)] md:hidden" aria-label="Slides and layers panel">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
              <div>
                <p className="text-sm font-semibold text-white">Slides & Layers</p>
                <p className="text-[10px] text-neutral-500">Swipe left to close</p>
              </div>
              <button
                aria-label="Close slides and layers"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 transition active:scale-95 active:bg-white/[0.08] active:text-white"
                onClick={() => props.setIsMobileSidebarOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <LayerSidebarContent
              {...props}
              onSelectSlide={(index) => {
                props.onSelectSlide(index);
                props.setIsMobileSidebarOpen(false);
              }}
            />
          </aside>
        </>
      ) : null}
    </>
  );
}

function LayerSidebarContent({
  activeSlideIndex,
  addSlide,
  deleteBlock,
  deleteSlide,
  draggedBlockIndex,
  dragOverBlockIndex,
  moveBlock,
  moveBlockToEdge,
  onSelectSlide,
  reorderBlock,
  reorderSlide,
  renameBlock,
  replayNonce,
  scenes,
  selectBlockFromLayer,
  selectedBlockIndex,
  selectedBlockIndices,
  setDraggedBlockIndex,
  setDragOverBlockIndex,
  setIsMobileSidebarOpen,
  toggleBlockPositionLock,
  slideRows,
  canvasSource
}: WorkspaceLayerSidebarProps) {
  return (
    <LayerSidebar
      activeSlideIndex={activeSlideIndex}
      onAddSlide={() => {
        addSlide();
        setIsMobileSidebarOpen(false);
      }}
      deleteBlock={deleteBlock}
      deleteSlide={deleteSlide}
      draggedBlockIndex={draggedBlockIndex}
      dragOverBlockIndex={dragOverBlockIndex}
      moveBlock={moveBlock}
      moveBlockToEdge={moveBlockToEdge}
      onSelectBlock={selectBlockFromLayer}
      onSelectSlide={onSelectSlide}
      reorderBlock={reorderBlock}
      reorderSlide={reorderSlide}
      renameBlock={renameBlock}
      replayNonce={replayNonce}
      scenes={scenes}
      selectedBlockIndex={selectedBlockIndex}
      selectedBlockIndices={selectedBlockIndices}
      setDraggedBlockIndex={setDraggedBlockIndex}
      setDragOverBlockIndex={setDragOverBlockIndex}
      slideRows={slideRows}
      source={canvasSource}
      toggleBlockPositionLock={toggleBlockPositionLock}
    />
  );
}
