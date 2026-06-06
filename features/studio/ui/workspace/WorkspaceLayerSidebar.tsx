"use client";

import { LayerSidebar } from "@/features/studio/ui/LayerSidebar";
import type { StudioWorkspaceProps } from "@/features/studio/ui/workspace/StudioWorkspaceTypes";

type WorkspaceLayerSidebarProps = Pick<
  StudioWorkspaceProps,
  | "activeSlideIndex"
  | "deleteBlock"
  | "deleteSlide"
  | "draggedBlockIndex"
  | "dragOverBlockIndex"
  | "isMobileSidebarOpen"
  | "isTemplateModalOpen"
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
  | "setIsTemplateModalOpen"
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
  deleteBlock,
  deleteSlide,
  draggedBlockIndex,
  dragOverBlockIndex,
  isTemplateModalOpen,
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
  setIsTemplateModalOpen,
  slideRows
}: WorkspaceLayerSidebarProps) {
  return (
    <LayerSidebar
      activeSlideIndex={activeSlideIndex}
      deleteBlock={deleteBlock}
      deleteSlide={deleteSlide}
      draggedBlockIndex={draggedBlockIndex}
      dragOverBlockIndex={dragOverBlockIndex}
      isTemplateModalOpen={isTemplateModalOpen}
      moveBlock={moveBlock}
      onOpenTemplates={() => setIsTemplateModalOpen(true)}
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
