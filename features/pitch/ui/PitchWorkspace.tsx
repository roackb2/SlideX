"use client";

import { useEffect, useState } from "react";
import { PitchHeader } from "@/features/pitch/ui/PitchHeader";
import { PreviewCanvas } from "@/features/pitch/ui/PreviewCanvas";
import { useMobileEdgePanels } from "@/features/pitch/ui/hooks/useMobileEdgePanels";
import { DesktopSlideNoteFab } from "@/features/pitch/ui/notes/DesktopSlideNoteFab";
import { WorkspaceCodeEditorOverlay } from "@/features/pitch/ui/workspace/WorkspaceCodeEditorOverlay";
import { WorkspaceInspectorPanel } from "@/features/pitch/ui/workspace/WorkspaceInspectorPanel";
import { WorkspaceLayerSidebar } from "@/features/pitch/ui/workspace/WorkspaceLayerSidebar";
import { WorkspaceScrollbarStyle } from "@/features/pitch/ui/workspace/WorkspaceScrollbarStyle";
import { WorkspaceTemplateDialog } from "@/features/pitch/ui/workspace/WorkspaceTemplateDialog";
import type { PitchWorkspaceProps } from "@/features/pitch/ui/workspace/PitchWorkspaceTypes";

export function PitchWorkspace({ commands, document, selection, view }: PitchWorkspaceProps) {
  const sceneCount = document.scenes.length;
  const setActiveCanvasTool = view.setActiveCanvasTool;
  const [zoomLevel, setZoomLevel] = useState<number | "fit">("fit");
  const [fitScale, setFitScale] = useState(1);

  useMobileEdgePanels({
    isLeftPanelOpen: view.isMobileSidebarOpen,
    isRightPanelOpen: view.isMobileInspectorOpen,
    setIsLeftPanelOpen: view.setIsMobileSidebarOpen,
    setIsRightPanelOpen: view.setIsMobileInspectorOpen
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
    commands.setActiveSlideIndex(index);
    selection.selectSingleBlock(null);
    view.setReplayNonce((value) => value + 1);
  }

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#000000] font-sans text-neutral-300">
      <PitchHeader
        accessMode={view.accessMode}
        actualScale={zoomLevel === "fit" ? fitScale : zoomLevel}
        exportMenuRef={view.exportMenuRef}
        isMobileInspectorOpen={view.isMobileInspectorOpen}
        isMobileSidebarOpen={view.isMobileSidebarOpen}
        notice={view.notice}
        onExport={commands.openExport}
        onPlay={commands.openPresentationPreview}
        onToggleInspector={() => {
          view.setIsMobileInspectorOpen((value) => !value);
          view.setIsMobileSidebarOpen(false);
        }}
        onToggleSidebar={() => {
          view.setIsMobileSidebarOpen((value) => !value);
          view.setIsMobileInspectorOpen(false);
        }}
        onUndo={commands.undoLastChange}
        projectName={`${document.projectName}${document.isProjectDirty ? " - Edited" : ""}`}
        setZoomLevel={setZoomLevel}
        zoomLevel={zoomLevel}
      />

      <div className="relative flex flex-1 animate-[bubble-appear_0.3s_ease-out] overflow-hidden bg-[#000000]" id="workspace-v4">
        <WorkspaceLayerSidebar
          commands={commands}
          document={document}
          onSelectSlide={selectSlide}
          selection={selection}
          view={view}
        />

        <div className="relative flex min-w-0 flex-1">
          <PreviewCanvas
            activeCanvasTool={view.activeCanvasTool}
            activeSlide={document.activeSlide}
            activeSlideIndex={document.activeSlideIndex}
            canPasteBlock={selection.hasCopiedBlock}
            isGridVisible={view.isCanvasGridVisible}
            onAddBlock={commands.addBlockToActiveSlide}
            onBeginBlockTransform={commands.beginBlockTransform}
            onCanvasToolChange={view.setActiveCanvasTool}
            onClearSelection={selection.clearBlockSelection}
            onCopySelectedBlock={commands.copySelectedBlock}
            onDeleteSelectedBlocks={commands.deleteSelectedBlocks}
            onDuplicateSelectedBlock={commands.duplicateSelectedBlock}
            onFitScaleChange={setFitScale}
            onGroupSelectedBlocks={commands.groupSelectedBlocks}
            onInsertSlideNearActive={commands.insertSlideNearActive}
            onMoveSelectedBlocksToEdge={commands.moveSelectedBlocksToEdge}
            onNextSlide={commands.goToNextSlide}
            onOpenMobileInspector={() => {
              view.setIsMobileInspectorOpen(true);
              view.setIsMobileSidebarOpen(false);
            }}
            onOpenMobileLayers={() => {
              view.setIsMobileSidebarOpen(true);
              view.setIsMobileInspectorOpen(false);
            }}
            onPasteCopiedBlock={commands.pasteCopiedBlock}
            onPreviousSlide={commands.goToPreviousSlide}
            onSelectBlock={selection.selectBlock}
            onSelectBlocks={selection.selectBlocks}
            onSelectSlide={selectSlide}
            onSetZoomLevel={setZoomLevel}
            onToggleSelectedBlocksPositionLock={commands.toggleSelectedBlocksPositionLock}
            onUndo={commands.undoLastChange}
            onUngroupSelectedBlocks={commands.ungroupSelectedBlocks}
            onUpdateBlock={commands.updateBlock}
            onUpdateBlockFrames={commands.updatePositionedBlockFrames}
            onUseSelectedImageAsBackground={commands.useSelectedImageAsBackground}
            replayNonce={view.replayNonce}
            sceneCount={sceneCount}
            scenes={document.scenes}
            selectedBlockIndex={selection.selectedBlockIndex}
            selectedBlockIndices={selection.selectedBlockIndices}
            selectedBlocksLocked={selection.selectedBlocksLocked}
            slideRows={document.slideRows}
            source={document.canvasSource}
            zoomLevel={zoomLevel}
          />
          <DesktopSlideNoteFab
            comments={document.activeSlideComments}
            onAddComment={commands.onAddActiveSlideComment}
            onPassComment={commands.onPassActiveSlideComment}
            slideNumber={document.activeSlideIndex + 1}
          />
        </div>

        <WorkspaceInspectorPanel commands={commands} document={document} selection={selection} view={view} />
      </div>

      <WorkspaceCodeEditorOverlay commands={commands} document={document} sceneCount={sceneCount} selection={selection} view={view} />
      <WorkspaceTemplateDialog commands={commands} document={document} view={view} />
      <WorkspaceScrollbarStyle />
    </main>
  );
}
