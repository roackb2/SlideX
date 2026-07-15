"use client";

import { X } from "lucide-react";
import { LayerSidebar } from "@/features/pitch/ui/LayerSidebar";
import type { PitchWorkspaceProps } from "@/features/pitch/ui/workspace/PitchWorkspaceTypes";
import { usePitchI18n } from "@/features/pitch/ui/pitchI18n";

type WorkspaceLayerSidebarProps = Pick<PitchWorkspaceProps, "commands" | "document" | "selection" | "view"> & {
  onSelectSlide: (index: number) => void;
};

export function WorkspaceLayerSidebar(props: WorkspaceLayerSidebarProps) {
  const { view } = props;
  const { locale, tx } = usePitchI18n();

  return (
    <>
      <div className="hidden h-full md:flex">
        <LayerSidebarContent {...props} />
      </div>

      {view.isMobileSidebarOpen ? (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => view.setIsMobileSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-[80] flex w-[min(88vw,340px)] flex-col overflow-hidden rounded-r-[1.5rem] border-r border-white/[0.12] bg-[#0a0a0a] shadow-[24px_0_80px_rgba(0,0,0,0.72)] md:hidden" aria-label={tx("Slides & Layers")}>
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
              <div>
                <p className="text-sm font-semibold text-white">{tx("Slides & Layers")}</p>
                <p className="text-[10px] text-neutral-500">{locale === "zh-TW" ? "向左滑動即可關閉" : "Swipe left to close"}</p>
              </div>
              <button
                aria-label={locale === "zh-TW" ? "關閉投影片與圖層" : "Close slides and layers"}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 transition active:scale-95 active:bg-white/[0.08] active:text-white"
                onClick={() => view.setIsMobileSidebarOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <LayerSidebarContent
              {...props}
              onSelectSlide={(index) => {
                props.onSelectSlide(index);
                view.setIsMobileSidebarOpen(false);
              }}
            />
          </aside>
        </>
      ) : null}
    </>
  );
}

function LayerSidebarContent({ commands, document, onSelectSlide, selection, view }: WorkspaceLayerSidebarProps) {
  return (
    <LayerSidebar
      activeSlideIndex={document.activeSlideIndex}
      deleteBlock={commands.deleteBlock}
      deleteSlide={commands.deleteSlide}
      draggedBlockIndex={selection.draggedBlockIndex}
      dragOverBlockIndex={selection.dragOverBlockIndex}
      moveBlock={commands.moveBlock}
      moveBlockToEdge={commands.moveBlockToEdge}
      onAddSlide={() => {
        commands.addSlide();
        view.setIsMobileSidebarOpen(false);
      }}
      onSelectBlock={selection.selectBlockFromLayer}
      onSelectSlide={onSelectSlide}
      renameBlock={commands.renameBlock}
      reorderBlock={commands.reorderBlock}
      reorderSlide={commands.reorderSlide}
      replayNonce={view.replayNonce}
      scenes={document.scenes}
      selectedBlockIndex={selection.selectedBlockIndex}
      selectedBlockIndices={selection.selectedBlockIndices}
      setDraggedBlockIndex={selection.setDraggedBlockIndex}
      setDragOverBlockIndex={selection.setDragOverBlockIndex}
      slideRows={document.slideRows}
      source={document.canvasSource}
      toggleBlockPositionLock={commands.toggleBlockPositionLock}
    />
  );
}
