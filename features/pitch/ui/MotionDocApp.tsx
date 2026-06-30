"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DesktopWelcome } from "@/features/pitch/ui/DesktopWelcome";

import { PitchWorkspace } from "@/features/pitch/ui/PitchWorkspace";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";
import { getSelectionMdx } from "@/core/motion-doc/application/motionDocSerialize";
import { useLayerSelection } from "@/features/pitch/ui/hooks/useLayerSelection";
import { useMotionDocDocument } from "@/features/pitch/ui/hooks/useMotionDocDocument";
import { usePitchCommands } from "@/features/pitch/ui/hooks/usePitchCommands";
import { usePitchExport } from "@/features/pitch/ui/hooks/usePitchExport";
import { usePitchProject, type NewPitchProjectOptions } from "@/features/pitch/ui/hooks/usePitchProject";
import { usePitchShortcuts } from "@/features/pitch/ui/hooks/usePitchShortcuts";
import { usePitchUndo } from "@/features/pitch/ui/hooks/usePitchUndo";
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
    activeSlideLayoutPreset,
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
    hasEnteredPitch,
    isProjectDirty,
    markProjectDirty,
    newProject,
    projectName,
  } = usePitchProject({
    canvasSource,
    documentTitle: sliderDocument.title,
    resetSelection: clearBlockSelection,
    setActiveSlideIndex,
    setNotice,
    setReplayNonce,
    setSource,
    undoStackRef
  });
  const { commitSource, pushUndoSnapshot, undoLastChange } = usePitchUndo({
    clearBlockSelection,
    markProjectDirty,
    setNotice,
    setReplayNonce,
    setSource,
    source,
    undoStackRef
  });
  const { copySource, exportHtmlFile, exportMdxFile, exportPdfFile } = usePitchExport({
    canvasSource,
    documentTitle: sliderDocument.title,
    setIsExportMenuOpen,
    setNotice
  });
  const pitchCommands = usePitchCommands({
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
    (options?: NewPitchProjectOptions) => {
      setSelectedTemplateId(options?.templateId ?? defaultTemplate.id);
      newProject(options);
    },
    [newProject]
  );

  usePitchShortcuts({
    activeSlideIndex,
    closeCodeEditor: () => setIsCodeEditorOpen(false),
    closeExportMenu: () => setIsExportMenuOpen(false),
    closeMobileInspector: () => setIsMobileInspectorOpen(false),
    closeMobileSidebar: () => setIsMobileSidebarOpen(false),
    closeTemplateModal: () => setIsTemplateModalOpen(false),
    copySelectedBlock: pitchCommands.copySelectedBlock,
    cutSelectedBlocks: pitchCommands.cutSelectedBlocks,
    deleteSelectedBlocks: pitchCommands.deleteSelectedBlocks,
    deleteSlide: pitchCommands.deleteSlide,
    duplicateSelectedBlock: pitchCommands.duplicateSelectedBlock,
    exportHtmlFile,
    exportMdxFile,
    goToNextSlide: pitchCommands.goToNextSlide,
    goToPreviousSlide: pitchCommands.goToPreviousSlide,
    isCodeEditorOpen,
    isExportMenuOpen,
    isMobileInspectorOpen,
    isMobileSidebarOpen,
    isTemplateModalOpen,
    newProject: startNewProject,
    nudgeSelectedBlocks: pitchCommands.nudgeSelectedBlocks,
    pasteCopiedBlock: pitchCommands.pasteCopiedBlock,
    selectedBlockIndex,
    selectedBlockIndices,
    undoLastChange
  });

  if (!isMounted) {
    return <div className="flex h-screen w-full bg-[#050505]" />;
  }

  if (!hasEnteredPitch) {
    return (
      <DesktopWelcome
        newProject={startNewProject}
      />
    );
  }

  return (
    <PitchWorkspace
      activeSlide={activeSlide}
      activeSlideAccent={activeSlideAccent}
      activeSlideAlignX={activeSlideAlignX}
      activeSlideAlignY={activeSlideAlignY}
      activeSlideBackground={activeSlideBackground}
      activeSlideIndex={activeSlideIndex}
      activeSlideLayout={activeSlideLayout}
      activeSlideLayoutPreset={activeSlideLayoutPreset}
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
      addBlockToActiveSlide={pitchCommands.addBlockToActiveSlide}
      addSlide={pitchCommands.addSlide}
      addTextAtPosition={pitchCommands.addTextAtPosition}
      applyLayoutToActiveSlide={pitchCommands.applyLayoutToActiveSlide}
      applyTemplate={pitchCommands.applyTemplate}
      beginBlockTransform={pitchCommands.beginBlockTransform}
      canvasSource={canvasSource}
      clearBlockSelection={clearBlockSelection}
      commitMdxSource={(value) => {
        setSource(value);
        markProjectDirty();
      }}
      copySource={copySource}
      copySelectedBlock={pitchCommands.copySelectedBlock}
      deleteBlock={pitchCommands.deleteBlock}
      deleteSelectedBlocks={pitchCommands.deleteSelectedBlocks}
      deleteSlide={pitchCommands.deleteSlide}
      duplicateSelectedBlock={pitchCommands.duplicateSelectedBlock}
      draggedBlockIndex={draggedBlockIndex}
      dragOverBlockIndex={dragOverBlockIndex}
      exportHtmlFile={exportHtmlFile}
      exportMdxFile={exportMdxFile}
      exportPdfFile={exportPdfFile}
      exportMenuRef={exportMenuRef}
      goToNextSlide={pitchCommands.goToNextSlide}
      goToPreviousSlide={pitchCommands.goToPreviousSlide}
      insertSnippet={pitchCommands.insertSnippet}
      isCanvasGridVisible={isCanvasGridVisible}
      isCodeEditorOpen={isCodeEditorOpen}
      isExportMenuOpen={isExportMenuOpen}
      isMobileInspectorOpen={isMobileInspectorOpen}
      isMobileSidebarOpen={isMobileSidebarOpen}
      isProjectDirty={isProjectDirty}
      isTemplateModalOpen={isTemplateModalOpen}
      hasCopiedBlock={pitchCommands.hasCopiedBlock}
      moveBlock={pitchCommands.moveBlock}
      newProject={startNewProject}
      notice={notice}
      projectName={projectName}
      pushUndoSnapshot={pushUndoSnapshot}
      pasteCopiedBlock={pitchCommands.pasteCopiedBlock}
      reorderBlock={pitchCommands.reorderBlock}
      reorderSlide={pitchCommands.reorderSlide}
      replayNonce={replayNonce}
      scenes={sliderDocument.scenes}
      selectBlock={selectBlock}
      selectBlockFromLayer={pitchCommands.selectBlockFromLayer}
      selectBlocks={selectBlocks}
      selectedBlockIndex={selectedBlockIndex}
      selectedBlockIndices={selectedBlockIndices}
      selectedBlocksLocked={pitchCommands.selectedBlocksLocked}
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
      toggleSelectedBlocksPositionLock={pitchCommands.toggleSelectedBlocksPositionLock}
      totalDuration={stats.totalDuration}
      undoLastChange={undoLastChange}
      updateActiveSlideStyle={pitchCommands.updateActiveSlideStyle}
      updateAllSlidesStyle={pitchCommands.updateAllSlidesStyle}
      updateBlock={pitchCommands.updateBlock}
      updatePositionedBlockFrames={pitchCommands.updatePositionedBlockFrames}
      updateSelectionMdx={pitchCommands.updateSelectionMdx}
      useSelectedImageAsBackground={pitchCommands.useSelectedImageAsBackground}
      uploadImageForBlock={pitchCommands.uploadImageForBlock}
      uploadVideoForBlock={pitchCommands.uploadVideoForBlock}
    />
  );
}
