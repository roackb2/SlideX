"use client";

import { useEffect, useState } from "react";
import { PreviewCanvas } from "@/features/pitch/ui/PreviewCanvas";
import { PitchHeader } from "@/features/pitch/ui/PitchHeader";
import { WorkspaceCodeEditorOverlay } from "@/features/pitch/ui/workspace/WorkspaceCodeEditorOverlay";
import { WorkspaceInspectorPanel } from "@/features/pitch/ui/workspace/WorkspaceInspectorPanel";
import { WorkspaceLayerSidebar } from "@/features/pitch/ui/workspace/WorkspaceLayerSidebar";
import { WorkspaceScrollbarStyle } from "@/features/pitch/ui/workspace/WorkspaceScrollbarStyle";
import { WorkspaceTemplateDialog } from "@/features/pitch/ui/workspace/WorkspaceTemplateDialog";
import type { PitchWorkspaceProps } from "@/features/pitch/ui/workspace/PitchWorkspaceTypes";
import { useMobileEdgePanels } from "@/features/pitch/ui/hooks/useMobileEdgePanels";

export function PitchWorkspace(props: PitchWorkspaceProps) {
  const sceneCount = props.scenes.length;
  const setActiveCanvasTool = props.setActiveCanvasTool;
  const [zoomLevel, setZoomLevel] = useState<number | "fit">("fit");
  const [fitScale, setFitScale] = useState(1);
  useMobileEdgePanels({
    isLeftPanelOpen: props.isMobileSidebarOpen,
    isRightPanelOpen: props.isMobileInspectorOpen,
    setIsLeftPanelOpen: props.setIsMobileSidebarOpen,
    setIsRightPanelOpen: props.setIsMobileInspectorOpen
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 639px)");

    function syncMobileCanvasTool() {
      if (mobileQuery.matches) setActiveCanvasTool("select");
    }

    syncMobileCanvasTool();
    mobileQuery.addEventListener("change", syncMobileCanvasTool);
    return () => mobileQuery.removeEventListener("change", syncMobileCanvasTool);
  }, [setActiveCanvasTool]);

  function selectSlide(index: number) {
    props.setActiveSlideIndex(index);
    props.selectSingleBlock(null);
    props.setReplayNonce((value) => value + 1);
  }

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#000000] font-sans text-neutral-300">
      <PitchHeader
        exportMenuRef={props.exportMenuRef}
        isExportMenuOpen={props.isExportMenuOpen}
        isMobileInspectorOpen={props.isMobileInspectorOpen}
        isMobileSidebarOpen={props.isMobileSidebarOpen}
        notice={props.notice}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        actualScale={zoomLevel === "fit" ? fitScale : zoomLevel}
        onReplay={() => props.setReplayNonce((value) => value + 1)}
        onToggleInspector={() => {
          props.setIsMobileInspectorOpen((value) => !value);
          props.setIsMobileSidebarOpen(false);
        }}
        onToggleSidebar={() => {
          props.setIsMobileSidebarOpen((value) => !value);
          props.setIsMobileInspectorOpen(false);
        }}
        onUndo={props.undoLastChange}
        projectName={`${props.projectName}${props.isProjectDirty ? " - Edited" : ""}`}
        setIsExportMenuOpen={props.setIsExportMenuOpen}
      />

      <div className="relative flex flex-1 animate-[bubble-appear_0.3s_ease-out] overflow-hidden bg-[#000000]" id="workspace-v4">
        <WorkspaceLayerSidebar {...props} onSelectSlide={selectSlide} />

        <PreviewCanvas
          activeCanvasTool={props.activeCanvasTool}
          zoomLevel={zoomLevel}
          onFitScaleChange={setFitScale}
          onSetZoomLevel={setZoomLevel}
          activeSlide={props.activeSlide}
          activeSlideIndex={props.activeSlideIndex}
          canPasteBlock={props.hasCopiedBlock}
          isGridVisible={props.isCanvasGridVisible}
          onAddBlock={props.addBlockToActiveSlide}

          onBeginBlockTransform={props.beginBlockTransform}
          onClearSelection={props.clearBlockSelection}
          onCopySelectedBlock={props.copySelectedBlock}
          onDeleteSelectedBlocks={props.deleteSelectedBlocks}
          onDuplicateSelectedBlock={props.duplicateSelectedBlock}
          onGroupSelectedBlocks={props.groupSelectedBlocks}
          onMoveSelectedBlocksToEdge={props.moveSelectedBlocksToEdge}
          onOpenMobileInspector={() => {
            props.setIsMobileInspectorOpen(true);
            props.setIsMobileSidebarOpen(false);
          }}
          onOpenMobileLayers={() => {
            props.setIsMobileSidebarOpen(true);
            props.setIsMobileInspectorOpen(false);
          }}
          onNextSlide={props.goToNextSlide}
          onPasteCopiedBlock={props.pasteCopiedBlock}
          onPreviousSlide={props.goToPreviousSlide}
          onInsertSlideNearActive={props.insertSlideNearActive}
          onSelectBlock={props.selectBlock}
          onSelectBlocks={props.selectBlocks}
          onSelectSlide={selectSlide}
          onToggleSelectedBlocksPositionLock={props.toggleSelectedBlocksPositionLock}
          onUngroupSelectedBlocks={props.ungroupSelectedBlocks}
          onUndo={props.undoLastChange}
          onUpdateBlock={props.updateBlock}
          onUpdateBlockFrames={props.updatePositionedBlockFrames}
          onUseSelectedImageAsBackground={props.useSelectedImageAsBackground}
          replayNonce={props.replayNonce}
          sceneCount={sceneCount}
          selectedBlockIndex={props.selectedBlockIndex}
          selectedBlockIndices={props.selectedBlockIndices}
          selectedBlocksLocked={props.selectedBlocksLocked}
          scenes={props.scenes}
          slideRows={props.slideRows}
          source={props.canvasSource}
          onCanvasToolChange={setActiveCanvasTool}
        />

        <WorkspaceInspectorPanel {...props} />
      </div>

      <WorkspaceCodeEditorOverlay {...props} sceneCount={sceneCount} />
      <WorkspaceTemplateDialog {...props} />
      <WorkspaceScrollbarStyle />
    </main>
  );
}
