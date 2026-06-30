"use client";

import { LayerSidebar } from "@/features/pitch/ui/LayerSidebar";
import type { PitchWorkspaceProps } from "@/features/pitch/ui/workspace/PitchWorkspaceTypes";

type WorkspaceLayerSidebarProps = Pick<
  PitchWorkspaceProps,
  | "activeSlideIndex"
  | "addSlide"
  | "deleteBlock"
  | "deleteSlide"
  | "draggedBlockIndex"
  | "dragOverBlockIndex"
  | "isMobileSidebarOpen"
  | "moveBlock"
  | "reorderBlock"
  | "reorderSlide"
  | "scenes"
  | "selectBlockFromLayer"
  | "selectedBlockIndex"
  | "selectedBlockIndices"
  | "setDraggedBlockIndex"
  | "setDragOverBlockIndex"
  | "setIsMobileSidebarOpen"
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
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => props.setIsMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/[0.12] bg-[#0a0a0a] shadow-2xl sm:w-[280px] md:hidden">
            <LayerSidebarContent
              {...props}
              onSelectSlide={(index) => {
                props.onSelectSlide(index);
                props.setIsMobileSidebarOpen(false);
              }}
            />
          </div>
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
  onSelectSlide,
  reorderBlock,
  reorderSlide,
  scenes,
  selectBlockFromLayer,
  selectedBlockIndex,
  selectedBlockIndices,
  setDraggedBlockIndex,
  setDragOverBlockIndex,
  setIsMobileSidebarOpen,
  slideRows
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
      onSelectBlock={selectBlockFromLayer}
      onSelectSlide={onSelectSlide}
      reorderBlock={reorderBlock}
      reorderSlide={reorderSlide}
      scenes={scenes}
      selectedBlockIndex={selectedBlockIndex}
      selectedBlockIndices={selectedBlockIndices}
      setDraggedBlockIndex={setDraggedBlockIndex}
      setDragOverBlockIndex={setDragOverBlockIndex}
      slideRows={slideRows}
    />
  );
}
