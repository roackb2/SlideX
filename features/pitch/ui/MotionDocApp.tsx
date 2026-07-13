"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DesktopWelcome } from "@/features/pitch/ui/DesktopWelcome";

import { PitchWorkspace } from "@/features/pitch/ui/PitchWorkspace";
import { ExportModal, type ExportFormat } from "@/features/pitch/ui/export/ExportModal";
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
import { defaultCanvasTool, type CanvasTool } from "@/features/pitch/application/canvasTools";
import type { AgentSession } from "@/features/pitch/domain/agentRun";
import { PitchAgentPanel } from "@/features/pitch/ui/agent/PitchAgentPanel";
import { importPitchProjectFile } from "@/features/pitch/infrastructure/pitchImport";
import { slideCommentsDeckId } from "@/features/pitch/infrastructure/slideComments";
import { useMobilePitchViewport } from "@/features/pitch/ui/hooks/useMobilePitchViewport";
import { useSlideComments } from "@/features/pitch/ui/hooks/useSlideComments";
import { MobilePitchViewer } from "@/features/pitch/ui/mobile/MobilePitchViewer";
import { MobilePitchWelcome } from "@/features/pitch/ui/mobile/MobilePitchWelcome";

const isSlideXAgentEnabled = process.env.NEXT_PUBLIC_SLIDEX_AGENT_ENABLED === "true";

export function MotionDocApp() {
  const isMobileViewport = useMobilePitchViewport();
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
  const [isExporting, setIsExporting] = useState(false);
  const [fileModalMode, setFileModalMode] = useState<"export" | "import">("export");
  const [isCanvasGridVisible, setIsCanvasGridVisible] = useState(false);
  const [activeCanvasTool, setActiveCanvasTool] = useState<CanvasTool>(defaultCanvasTool);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const undoStackRef = useRef<string[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false);

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
    activeSlideShaderAngle,
    activeSlideShaderColor1,
    activeSlideShaderColor2,
    activeSlideShaderColor3,
    activeSlideShaderColor4,
    activeSlideShaderColor5,
    activeSlideShaderColor6,

    activeSlideShaderDetail,
    activeSlideShaderEngine,
    activeSlideShaderIntensity,
    activeSlideShaderPreset,
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
  } = useLayerSelection(activeSlide?.blocks ?? []);
  const selectionMdx = useMemo(
    () => getSelectionMdx(activeSlide, selectedBlockIndex, activeSlideIndex, selectedBlockIndices),
    [activeSlide, activeSlideIndex, selectedBlockIndex, selectedBlockIndices]
  );
  const {
    isMounted,
    hasEnteredPitch,
    isProjectDirty,
    markProjectDirty,
    newProject,
    projectId,
    projectName,
    restoreProject,
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
  const commentsDeckId = useMemo(() => slideCommentsDeckId(projectName), [projectName]);
  const {
    addComment: addSlideComment,
    comments: slideComments,
    passComment: passSlideComment
  } = useSlideComments(commentsDeckId);
  const { commitSource, pushUndoSnapshot, undoLastChange } = usePitchUndo({
    clearBlockSelection,
    markProjectDirty,
    setNotice,
    setReplayNonce,
    setSource,
    source,
    undoStackRef
  });
  const { copySource, exportHtmlFile, exportMdxFile, exportPptxFile } = usePitchExport({
    canvasSource,
    documentTitle: sliderDocument.title,
    setNotice
  });
  const applyAgentMotionDoc = useCallback((motionDoc: string, summary: string) => {
    commitSource(motionDoc);
    setReplayNonce((value) => value + 1);
    clearBlockSelection();
    setNotice(summary || "Agent changes applied");
  }, [clearBlockSelection, commitSource]);
  const restoreAgentSession = useCallback((session: AgentSession): boolean => {
    return restoreProject({
      name: session.title,
      source: session.latestMotionDoc
    });
  }, [restoreProject]);

  const handleExportFromModal = useCallback(async (format: ExportFormat, filename: string) => {
    setIsExporting(true);
    try {
      let exportCompleted = false;

      switch (format) {
        case "pptx":
          await exportPptxFile(filename);
          break;
        case "html":
          await exportHtmlFile(filename);
          break;
        case "mdx":
          await exportMdxFile(filename);
          break;
      }
      exportCompleted = true;

      if (exportCompleted) {
        setIsExportMenuOpen(false);
      }
    } finally {
      setIsExporting(false);
    }
  }, [exportHtmlFile, exportMdxFile, exportPptxFile]);
  const pitchCommands = usePitchCommands({
    activeSlide,
    activeSlideIndex,
    commitSource,
    markProjectDirty,
    pushUndoSnapshot,
    scenes: sliderDocument.scenes,
    selectBlock,
    selectBlocks,
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

      // Safeguard: If click target is inside a dialog/modal container, do not close
      const target = event.target as HTMLElement | null;
      if (target?.closest?.('[role="dialog"]') || target?.closest?.('.fixed')) {
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

  const importPitchFile = useCallback(async (file: File) => {
    try {
      const importedProject = await importPitchProjectFile(file);
      startNewProject({
        name: importedProject.name,
        notice: `${file.name} imported`,
        source: importedProject.source
      });
    } catch (error) {
      const importError = error instanceof Error ? error : new Error("Import failed");
      setNotice(importError.message);
      throw importError;
    }
  }, [setNotice, startNewProject]);

  usePitchShortcuts({
    activeCanvasTool,
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
    goToNextSlide: pitchCommands.goToNextSlide,
    goToPreviousSlide: pitchCommands.goToPreviousSlide,
    groupSelectedBlocks: pitchCommands.groupSelectedBlocks,
    isCodeEditorOpen,
    isExportMenuOpen,
    isMobileInspectorOpen,
    isMobileSidebarOpen,
    isTemplateModalOpen,
    newProject: startNewProject,
    nudgeSelectedBlocks: pitchCommands.nudgeSelectedBlocks,
    pasteCopiedBlock: pitchCommands.pasteCopiedBlock,
    pasteImageFile: pitchCommands.pasteImageFile,
    selectedBlockIndex,
    selectedBlockIndices,
    setActiveCanvasTool,
    undoLastChange,
    ungroupSelectedBlocks: pitchCommands.ungroupSelectedBlocks
  });

  if (!isMounted) {
    return <div className="flex h-dvh w-full bg-[#050505]" />;
  }

  if (isMobileViewport && !hasEnteredPitch) {
    return <MobilePitchWelcome importPitchFile={importPitchFile} newProject={startNewProject} />;
  }

  if (!hasEnteredPitch) {
    return (
      <DesktopWelcome
        importPitchFile={importPitchFile}
        newProject={startNewProject}
      />
    );
  }

  if (isMobileViewport) {
    return (
      <>
        <MobilePitchViewer
          activeSlideIndex={activeSlideIndex}
          comments={(slideComments[activeSlideIndex] ?? []).filter((comment) => comment.status === "open")}
          documentTitle={sliderDocument.title}
          onAddComment={(comment) => addSlideComment(activeSlideIndex, comment)}
          onExport={() => {
            setFileModalMode("export");
            setIsExportMenuOpen(true);
          }}
          onImport={() => {
            setFileModalMode("import");
            setIsExportMenuOpen(true);
          }}
          onNextSlide={pitchCommands.goToNextSlide}
          onPreviousSlide={pitchCommands.goToPreviousSlide}
          onPassComment={(commentId) => passSlideComment(activeSlideIndex, commentId)}
          replayNonce={replayNonce}
          scene={activeSlide}
          sceneCount={sliderDocument.scenes.length}
          source={canvasSource}
        />
        <ExportModal
          documentTitle={sliderDocument.title}
          initialMode={fileModalMode}
          isExporting={isExporting}
          isOpen={isExportMenuOpen}
          onClose={() => setIsExportMenuOpen(false)}
          onExport={handleExportFromModal}
          onImport={importPitchFile}
        />
      </>
    );
  }

  return (
    <>
    <PitchWorkspace
      agentPanel={isSlideXAgentEnabled ? (
        <PitchAgentPanel
          isOpen={isAgentPanelOpen}
          onApplyMotionDoc={applyAgentMotionDoc}
          onRestoreSession={restoreAgentSession}
          projectId={projectId}
          projectName={projectName}
          source={source}
        />
      ) : null}
      activeSlide={activeSlide}
      activeSlideAccent={activeSlideAccent}
      activeSlideAlignX={activeSlideAlignX}
      activeSlideAlignY={activeSlideAlignY}
      activeSlideBackground={activeSlideBackground}
      activeSlideIndex={activeSlideIndex}
      activeSlideLayout={activeSlideLayout}
      activeSlideLayoutPreset={activeSlideLayoutPreset}
      activeSlideMutedColor={activeSlideMutedColor}
      activeSlideComments={(slideComments[activeSlideIndex] ?? []).filter((comment) => comment.status === "open")}
      activeSlideShader={activeSlideShader}
      activeSlideShaderAngle={activeSlideShaderAngle}
      activeSlideShaderColor1={activeSlideShaderColor1}
      activeSlideShaderColor2={activeSlideShaderColor2}
      activeSlideShaderColor3={activeSlideShaderColor3}
      activeSlideShaderColor4={activeSlideShaderColor4}
      activeSlideShaderColor5={activeSlideShaderColor5}
      activeSlideShaderColor6={activeSlideShaderColor6}

      activeSlideShaderDetail={activeSlideShaderDetail}
      activeSlideShaderEngine={activeSlideShaderEngine}
      activeSlideShaderIntensity={activeSlideShaderIntensity}
      activeSlideShaderPreset={activeSlideShaderPreset}
      activeSlideShaderScale={activeSlideShaderScale}
      activeSlideShaderSoftness={activeSlideShaderSoftness}
      activeSlideShaderSpeed={activeSlideShaderSpeed}
      activeSlideTextColor={activeSlideTextColor}
      activeSlideTheme={activeSlideTheme}
      activeCanvasTool={activeCanvasTool}
      addBlockToActiveSlide={pitchCommands.addBlockToActiveSlide}
      addSlide={pitchCommands.addSlide}
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
      groupSelectedBlocks={pitchCommands.groupSelectedBlocks}
      draggedBlockIndex={draggedBlockIndex}
      dragOverBlockIndex={dragOverBlockIndex}
      exportMenuRef={exportMenuRef}
      goToNextSlide={pitchCommands.goToNextSlide}
      goToPreviousSlide={pitchCommands.goToPreviousSlide}
      insertSnippet={pitchCommands.insertSnippet}
      insertSlideNearActive={pitchCommands.insertSlideNearActive}
      isCanvasGridVisible={isCanvasGridVisible}
      isAgentPanelOpen={isSlideXAgentEnabled && isAgentPanelOpen}
      isCodeEditorOpen={isCodeEditorOpen}
      isExportMenuOpen={isExportMenuOpen}
      isMobileInspectorOpen={isMobileInspectorOpen}
      isMobileSidebarOpen={isMobileSidebarOpen}
      isProjectDirty={isProjectDirty}
      isTemplateModalOpen={isTemplateModalOpen}
      hasCopiedBlock={pitchCommands.hasCopiedBlock}
      moveBlock={pitchCommands.moveBlock}
      moveBlockToEdge={pitchCommands.moveBlockToEdge}
      moveSelectedBlocksToEdge={pitchCommands.moveSelectedBlocksToEdge}
      newProject={startNewProject}
      notice={notice}
      onAddActiveSlideComment={(comment) => addSlideComment(activeSlideIndex, comment)}
      onPassActiveSlideComment={(commentId) => passSlideComment(activeSlideIndex, commentId)}
      projectName={projectName}
      pushUndoSnapshot={pushUndoSnapshot}
      pasteCopiedBlock={pitchCommands.pasteCopiedBlock}
      reorderBlock={pitchCommands.reorderBlock}
      renameBlock={pitchCommands.renameBlock}
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
      setActiveCanvasTool={setActiveCanvasTool}
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
      toggleAgentPanel={() => setIsAgentPanelOpen((current) => !current)}
      toggleBlockPositionLock={pitchCommands.toggleBlockPositionLock}
      ungroupSelectedBlocks={pitchCommands.ungroupSelectedBlocks}
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
    <ExportModal
      isOpen={isExportMenuOpen}
      onClose={() => setIsExportMenuOpen(false)}
      onExport={handleExportFromModal}
      onImport={importPitchFile}
      documentTitle={sliderDocument.title}
      isExporting={isExporting}
      initialMode={fileModalMode}
    />
    </>
  );
}
