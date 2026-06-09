"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DesktopWelcome } from "@/features/studio/ui/DesktopWelcome";

import { StudioWorkspace } from "@/features/studio/ui/StudioWorkspace";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";
import { getSelectionMdx } from "@/core/motion-doc/application/motionDocSerialize";
import { useLayerSelection } from "@/features/studio/ui/hooks/useLayerSelection";
import { useMotionDocDocument } from "@/features/studio/ui/hooks/useMotionDocDocument";
import { useStudioCommands } from "@/features/studio/ui/hooks/useStudioCommands";
import { useStudioExport } from "@/features/studio/ui/hooks/useStudioExport";
import { useStudioProject, type NewStudioProjectOptions } from "@/features/studio/ui/hooks/useStudioProject";
import { useStudioShortcuts } from "@/features/studio/ui/hooks/useStudioShortcuts";
import { useStudioUndo } from "@/features/studio/ui/hooks/useStudioUndo";
import { defaultTemplate } from "@/core/motion-doc/presets/templates";

export function MotionDocApp() {
  const [source, setSource] = useState(defaultMdx);
  const [replayNonce, setReplayNonce] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [notice, setNotice] = useState("Ready");
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState<number | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isCanvasGridVisible, setIsCanvasGridVisible] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const undoStackRef = useRef<string[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);

  const {
    activeSlide,
    activeSlideAccent,
    activeSlideAlignX,
    activeSlideAlignY,
    activeSlideBackground,
    activeSlideLayout,
    activeSlideMutedColor,
    activeSlideShader,
    activeSlideShaderColor1,
    activeSlideShaderColor2,
    activeSlideShaderColor3,
    activeSlideShaderDetail,
    activeSlideShaderEngine,
    activeSlideShaderIntensity,
    activeSlideShaderScale,
    activeSlideShaderSoftness,
    activeSlideShaderSpeed,
    activeSlideTextColor,
    activeSlideTheme,
    canvasSource,
    slideRows,
    sliderDocument,
    stats
  } = useMotionDocDocument({
    activeSlideIndex,
    source
  });
  const {
    clearBlockSelection,
    selectBlock,
    selectBlocks,
    selectedBlockIndex,
    selectedBlockIndices,
    selectSingleBlock
  } = useLayerSelection(activeSlide?.blocks.length ?? 0);
  const selectionMdx = useMemo(
    () => getSelectionMdx(activeSlide, selectedBlockIndex, activeSlideIndex),
    [activeSlide, activeSlideIndex, selectedBlockIndex]
  );
  const {
    isMounted,
    hasEnteredStudio,
    isProjectDirty,
    markProjectDirty,
    newProject,
    projectName,
  } = useStudioProject({
    canvasSource,
    documentTitle: sliderDocument.title,
    resetSelection: clearBlockSelection,
    setActiveSlideIndex,
    setNotice,
    setReplayNonce,
    setSource,
    undoStackRef
  });
  const { commitSource, pushUndoSnapshot, undoLastChange } = useStudioUndo({
    clearBlockSelection,
    markProjectDirty,
    setNotice,
    setReplayNonce,
    setSource,
    source,
    undoStackRef
  });
  const { copySource, exportHtmlFile, exportMdxFile } = useStudioExport({
    canvasSource,
    documentTitle: sliderDocument.title,
    setIsExportMenuOpen,
    setNotice
  });
  const studioCommands = useStudioCommands({
    activeSlide,
    activeSlideIndex,
    commitSource,
    markProjectDirty,
    pushUndoSnapshot,
    scenes: sliderDocument.scenes,
    selectBlock,
    selectedBlockIndex,
    selectedBlockIndices,
    selectSingleBlock,
    setActiveSlideIndex,
    setIsTemplateModalOpen,
    setNotice,
    setReplayNonce,
    setSelectedTemplateId,
    setSource,
    source
  });

  useEffect(() => {
    setActiveSlideIndex((current) => {
      const maxIndex = Math.max(sliderDocument.scenes.length - 1, 0);
      return Math.min(current, maxIndex);
    });
  }, [sliderDocument.scenes.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!isExportMenuOpen) {
        return;
      }

      if (exportMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsExportMenuOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isExportMenuOpen]);

  const startNewProject = useCallback(
    (options?: NewStudioProjectOptions) => {
      setSelectedTemplateId(options?.templateId ?? defaultTemplate.id);
      newProject(options);
    },
    [newProject]
  );

  useStudioShortcuts({
    activeSlideIndex,
    closeCodeEditor: () => setIsCodeEditorOpen(false),
    closeExportMenu: () => setIsExportMenuOpen(false),
    closeMobileInspector: () => setIsMobileInspectorOpen(false),
    closeMobileSidebar: () => setIsMobileSidebarOpen(false),
    closeTemplateModal: () => setIsTemplateModalOpen(false),
    copySelectedBlock: studioCommands.copySelectedBlock,
    deleteSelectedBlocks: studioCommands.deleteSelectedBlocks,
    deleteSlide: studioCommands.deleteSlide,
    exportHtmlFile,
    exportMdxFile,
    goToNextSlide: studioCommands.goToNextSlide,
    goToPreviousSlide: studioCommands.goToPreviousSlide,
    isCodeEditorOpen,
    isExportMenuOpen,
    isMobileInspectorOpen,
    isMobileSidebarOpen,
    isTemplateModalOpen,
    newProject: startNewProject,
    nudgeSelectedBlocks: studioCommands.nudgeSelectedBlocks,
    pasteCopiedBlock: studioCommands.pasteCopiedBlock,
    selectedBlockIndex,
    selectedBlockIndices,
    undoLastChange
  });

  if (!isMounted) {
    return <div className="flex h-screen w-full bg-[#050505]" />;
  }

  if (!hasEnteredStudio) {
    return (
      <DesktopWelcome
        newProject={startNewProject}
      />
    );
  }

  return (
    <StudioWorkspace
      activeSlide={activeSlide}
      activeSlideAccent={activeSlideAccent}
      activeSlideAlignX={activeSlideAlignX}
      activeSlideAlignY={activeSlideAlignY}
      activeSlideBackground={activeSlideBackground}
      activeSlideIndex={activeSlideIndex}
      activeSlideLayout={activeSlideLayout}
      activeSlideMutedColor={activeSlideMutedColor}
      activeSlideShader={activeSlideShader}
      activeSlideShaderColor1={activeSlideShaderColor1}
      activeSlideShaderColor2={activeSlideShaderColor2}
      activeSlideShaderColor3={activeSlideShaderColor3}
      activeSlideShaderDetail={activeSlideShaderDetail}
      activeSlideShaderEngine={activeSlideShaderEngine}
      activeSlideShaderIntensity={activeSlideShaderIntensity}
      activeSlideShaderScale={activeSlideShaderScale}
      activeSlideShaderSoftness={activeSlideShaderSoftness}
      activeSlideShaderSpeed={activeSlideShaderSpeed}
      activeSlideTextColor={activeSlideTextColor}
      activeSlideTheme={activeSlideTheme}
      addBlockToActiveSlide={studioCommands.addBlockToActiveSlide}
      addSlide={studioCommands.addSlide}
      addSlideWithLayout={studioCommands.addSlideWithLayout}
      addTextAtPosition={studioCommands.addTextAtPosition}
      applyTemplate={studioCommands.applyTemplate}
      beginBlockTransform={studioCommands.beginBlockTransform}
      canvasSource={canvasSource}
      clearBlockSelection={clearBlockSelection}
      commitMdxSource={(value) => {
        setSource(value);
        markProjectDirty();
      }}
      copySource={copySource}
      deleteBlock={studioCommands.deleteBlock}
      deleteSlide={studioCommands.deleteSlide}
      draggedBlockIndex={draggedBlockIndex}
      dragOverBlockIndex={dragOverBlockIndex}
      exportHtmlFile={exportHtmlFile}
      exportMdxFile={exportMdxFile}
      exportMenuRef={exportMenuRef}
      goToNextSlide={studioCommands.goToNextSlide}
      goToPreviousSlide={studioCommands.goToPreviousSlide}
      insertSnippet={studioCommands.insertSnippet}
      isCanvasGridVisible={isCanvasGridVisible}
      isCodeEditorOpen={isCodeEditorOpen}
      isExportMenuOpen={isExportMenuOpen}
      isMobileInspectorOpen={isMobileInspectorOpen}
      isMobileSidebarOpen={isMobileSidebarOpen}
      isProjectDirty={isProjectDirty}
      isTemplateModalOpen={isTemplateModalOpen}
      moveBlock={studioCommands.moveBlock}
      newProject={startNewProject}
      notice={notice}
      projectName={projectName}
      pushUndoSnapshot={pushUndoSnapshot}
      reorderBlock={studioCommands.reorderBlock}
      reorderSlide={studioCommands.reorderSlide}
      replayNonce={replayNonce}
      scenes={sliderDocument.scenes}
      selectBlock={selectBlock}
      selectBlockFromLayer={studioCommands.selectBlockFromLayer}
      selectBlocks={selectBlocks}
      selectedBlockIndex={selectedBlockIndex}
      selectedBlockIndices={selectedBlockIndices}
      selectedTemplateId={selectedTemplateId}
      selectionMdx={selectionMdx}
      selectSingleBlock={selectSingleBlock}
      setActiveSlideIndex={setActiveSlideIndex}
      setDraggedBlockIndex={setDraggedBlockIndex}
      setDragOverBlockIndex={setDragOverBlockIndex}
      setIsCanvasGridVisible={setIsCanvasGridVisible}
      setIsCodeEditorOpen={setIsCodeEditorOpen}
      setIsExportMenuOpen={setIsExportMenuOpen}
      setIsMobileInspectorOpen={setIsMobileInspectorOpen}
      setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      setIsTemplateModalOpen={setIsTemplateModalOpen}
      setReplayNonce={setReplayNonce}
      slideRows={slideRows}
      source={source}
      totalDuration={stats.totalDuration}
      undoLastChange={undoLastChange}
      updateActiveSlideStyle={studioCommands.updateActiveSlideStyle}
      updateAllSlidesStyle={studioCommands.updateAllSlidesStyle}
      updateBlock={studioCommands.updateBlock}
      updatePositionedBlockFrames={studioCommands.updatePositionedBlockFrames}
      updateSelectionMdx={studioCommands.updateSelectionMdx}
      uploadImageForBlock={studioCommands.uploadImageForBlock}
      uploadVideoForBlock={studioCommands.uploadVideoForBlock}
    />
  );
}
