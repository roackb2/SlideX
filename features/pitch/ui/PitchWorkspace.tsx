"use client";

import { useState } from "react";
import { PreviewCanvas } from "@/features/pitch/ui/PreviewCanvas";
import { PitchHeader } from "@/features/pitch/ui/PitchHeader";
import { WorkspaceCodeEditorOverlay } from "@/features/pitch/ui/workspace/WorkspaceCodeEditorOverlay";
import { WorkspaceInspectorPanel } from "@/features/pitch/ui/workspace/WorkspaceInspectorPanel";
import { WorkspaceLayerSidebar } from "@/features/pitch/ui/workspace/WorkspaceLayerSidebar";
import { WorkspaceScrollbarStyle } from "@/features/pitch/ui/workspace/WorkspaceScrollbarStyle";
import { WorkspaceTemplateDialog } from "@/features/pitch/ui/workspace/WorkspaceTemplateDialog";
import type { PitchWorkspaceProps } from "@/features/pitch/ui/workspace/PitchWorkspaceTypes";

export function PitchWorkspace(props: PitchWorkspaceProps) {
  const sceneCount = props.scenes.length;
  const isAgentEnabled = Boolean(props.agentPanel);
  const [zoomLevel, setZoomLevel] = useState<number | "fit">("fit");
  const [fitScale, setFitScale] = useState(1);

  function selectSlide(index: number) {
    props.setActiveSlideIndex(index);
    props.selectSingleBlock(null);
    props.setReplayNonce((value) => value + 1);
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#000000] font-sans text-neutral-300">
      <PitchHeader
        exportMenuRef={props.exportMenuRef}
        isExportMenuOpen={props.isExportMenuOpen}
        isMobileInspectorOpen={props.isMobileInspectorOpen}
        isMobileSidebarOpen={props.isMobileSidebarOpen}
        notice={props.notice}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        actualScale={zoomLevel === "fit" ? fitScale : zoomLevel}
        isAgentEnabled={isAgentEnabled}
        isAgentPanelOpen={props.isAgentPanelOpen}
        onReplay={() => props.setReplayNonce((value) => value + 1)}
        onToggleInspector={() => {
          props.setIsMobileInspectorOpen((value) => !value);
          props.setIsMobileSidebarOpen(false);
        }}
        onToggleSidebar={() => {
          props.setIsMobileSidebarOpen((value) => !value);
          props.setIsMobileInspectorOpen(false);
        }}
        onToggleAgentPanel={props.toggleAgentPanel}
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
          onNextSlide={props.goToNextSlide}
          onPasteCopiedBlock={props.pasteCopiedBlock}
          onPreviousSlide={props.goToPreviousSlide}
          onInsertSlideNearActive={props.insertSlideNearActive}
          onSelectBlock={props.selectBlock}
          onSelectBlocks={props.selectBlocks}
          onSelectSlide={selectSlide}
          onToggleSelectedBlocksPositionLock={props.toggleSelectedBlocksPositionLock}
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
          onCanvasToolChange={props.setActiveCanvasTool}
        />

        <WorkspaceInspectorPanel {...props} />
        {isAgentEnabled ? (
          <div className="absolute inset-y-0 right-0 z-[70] shadow-[-20px_0_50px_rgba(0,0,0,0.45)]">
            {props.agentPanel}
          </div>
        ) : null}
      </div>

      <WorkspaceCodeEditorOverlay {...props} sceneCount={sceneCount} />
      <WorkspaceTemplateDialog {...props} />
      <WorkspaceScrollbarStyle />
    </main>
  );
}
