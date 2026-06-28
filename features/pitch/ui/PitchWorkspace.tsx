"use client";

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

  function selectSlide(index: number) {
    props.setActiveSlideIndex(index);
    props.selectSingleBlock(null);
    props.setReplayNonce((value) => value + 1);
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-transparent font-sans text-neutral-300">
      <div className="fluid-aurora-bg" />
      <PitchHeader
        exportMenuRef={props.exportMenuRef}
        isExportMenuOpen={props.isExportMenuOpen}
        isMobileInspectorOpen={props.isMobileInspectorOpen}
        isMobileSidebarOpen={props.isMobileSidebarOpen}
        notice={props.notice}
        onExportHtml={props.exportHtmlFile}
        onExportMdx={props.exportMdxFile}
        onExportPdf={props.exportPdfFile}
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

      <div className="relative flex flex-1 animate-[bubble-appear_0.3s_ease-out] overflow-hidden bg-transparent" id="workspace-v4">
        <WorkspaceLayerSidebar {...props} onSelectSlide={selectSlide} />

        <PreviewCanvas
          activeSlide={props.activeSlide}
          activeSlideIndex={props.activeSlideIndex}
          isGridVisible={props.isCanvasGridVisible}
          onAddBlock={props.addBlockToActiveSlide}
          onAddTextAtPosition={props.addTextAtPosition}
          onBeginBlockTransform={props.beginBlockTransform}
          onClearSelection={props.clearBlockSelection}
          onNextSlide={props.goToNextSlide}
          onPreviousSlide={props.goToPreviousSlide}
          onSelectBlock={props.selectBlock}
          onSelectBlocks={props.selectBlocks}
          onSelectSlide={props.setActiveSlideIndex}
          onUpdateBlock={props.updateBlock}
          onUpdateBlockFrames={props.updatePositionedBlockFrames}
          replayNonce={props.replayNonce}
          sceneCount={sceneCount}
          selectedBlockIndex={props.selectedBlockIndex}
          selectedBlockIndices={props.selectedBlockIndices}
          slideRows={props.slideRows}
          source={props.canvasSource}
          totalDuration={props.totalDuration}
        />

        <WorkspaceInspectorPanel {...props} />
      </div>

      <WorkspaceCodeEditorOverlay {...props} sceneCount={sceneCount} />
      <WorkspaceTemplateDialog {...props} />
      <WorkspaceScrollbarStyle />
    </main>
  );
}
