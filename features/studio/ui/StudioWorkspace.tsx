"use client";

import { PreviewCanvas } from "@/features/studio/ui/PreviewCanvas";
import { StudioHeader } from "@/features/studio/ui/StudioHeader";
import { WorkspaceCodeEditorOverlay } from "@/features/studio/ui/workspace/WorkspaceCodeEditorOverlay";
import { WorkspaceInspectorPanel } from "@/features/studio/ui/workspace/WorkspaceInspectorPanel";
import { WorkspaceLayerSidebar } from "@/features/studio/ui/workspace/WorkspaceLayerSidebar";
import { WorkspaceScrollbarStyle } from "@/features/studio/ui/workspace/WorkspaceScrollbarStyle";
import { WorkspaceTemplateDialog } from "@/features/studio/ui/workspace/WorkspaceTemplateDialog";
import type { StudioWorkspaceProps } from "@/features/studio/ui/workspace/StudioWorkspaceTypes";

export function StudioWorkspace(props: StudioWorkspaceProps) {
  const sceneCount = props.scenes.length;

  function selectSlide(index: number) {
    props.setActiveSlideIndex(index);
    props.selectSingleBlock(null);
    props.setReplayNonce((value) => value + 1);
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-transparent font-sans text-neutral-300">
      <div className="fluid-aurora-bg" />
      <StudioHeader
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
