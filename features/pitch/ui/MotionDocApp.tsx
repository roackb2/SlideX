"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { importPitchProjectFile } from "@/features/pitch/infrastructure/pitchImport";
import { slideCommentsDeckId } from "@/features/pitch/infrastructure/slideComments";
import { embedPitchLocalImagesForPersistence } from "@/features/pitch/infrastructure/pitchLocalAssets";
import { useMobilePitchViewport } from "@/features/pitch/ui/hooks/useMobilePitchViewport";
import { useSlideComments } from "@/features/pitch/ui/hooks/useSlideComments";
import { MobilePitchViewer } from "@/features/pitch/ui/mobile/MobilePitchViewer";
import { PresentationPreviewModal } from "@/features/pitch/ui/PresentationPreviewModal";
import {
  GuestSignInDialog,
  type GuestSignInIntent
} from "@/features/pitch/ui/GuestSignInDialog";

export type MotionDocInitialProject = {
  name: string;
  source: string;
  templateId?: string;
};

type MotionDocAppProps = {
  accessMode?: "authenticated" | "guest";
  initialProject?: MotionDocInitialProject;
  initialResumeIntent?: "export" | "preview";
  onSignInRequested?: (intent: GuestSignInIntent) => void;
  onProjectSourceChange?: (source: string, title: string) => void;
};

const guestLockedExportFormats = ["html", "mdx"] as const satisfies readonly ExportFormat[];

export function MotionDocApp({
  accessMode = "authenticated",
  initialProject,
  initialResumeIntent,
  onProjectSourceChange,
  onSignInRequested
}: MotionDocAppProps = {}) {
  const isMobileViewport = useMobilePitchViewport();
  const [source, setSource] = useState(initialProject?.source ?? defaultMdx);
  const [replayNonce, setReplayNonce] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialProject?.templateId ?? defaultTemplate.id);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [notice, setNotice] = useState("Ready");
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState<number | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(initialResumeIntent === "export");
  const [isPresentationPreviewOpen, setIsPresentationPreviewOpen] = useState(initialResumeIntent === "preview");
  const [isExporting, setIsExporting] = useState(false);
  const [fileModalMode, setFileModalMode] = useState<"export" | "import">("export");
  const [isCanvasGridVisible, setIsCanvasGridVisible] = useState(false);
  const [activeCanvasTool, setActiveCanvasTool] = useState<CanvasTool>(defaultCanvasTool);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const undoStackRef = useRef<string[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);
  const [guestSignInIntent, setGuestSignInIntent] = useState<GuestSignInIntent | null>(null);

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
    isProjectDirty,
    markProjectDirty,
    newProject,
    projectName,
  } = usePitchProject({
    canvasSource,
    documentTitle: sliderDocument.title,
    initialProject,
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

  const openExport = useCallback(() => {
    setFileModalMode("export");
    setIsExportMenuOpen(true);
  }, []);

  const requestRestrictedExportSignIn = useCallback(() => {
    setIsExportMenuOpen(false);
    setGuestSignInIntent("export");
  }, []);

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
    if (!onProjectSourceChange || !initialProject) return;
    let isCancelled = false;
    const saveTimer = window.setTimeout(() => {
      void (async () => {
        try {
          const persistedSource = accessMode === "guest"
            ? await embedPitchLocalImagesForPersistence(source)
            : source;
          if (!isCancelled) onProjectSourceChange(persistedSource, projectName);
        } catch {
          if (!isCancelled) setNotice("This browser could not save the demo draft");
        }
      })();
    }, 450);
    return () => {
      isCancelled = true;
      window.clearTimeout(saveTimer);
    };
  }, [accessMode, initialProject, onProjectSourceChange, projectName, source]);

  const continueGuestSignIn = useCallback(async (intent: GuestSignInIntent) => {
    try {
      if (onProjectSourceChange) {
        const persistedSource = await embedPitchLocalImagesForPersistence(source);
        await onProjectSourceChange(persistedSource, projectName);
      }
      onSignInRequested?.(intent);
    } catch {
      setGuestSignInIntent(null);
      setNotice("This browser could not save the demo draft. Free some storage and try again.");
    }
  }, [onProjectSourceChange, onSignInRequested, projectName, source]);

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
    closePresentationPreview: () => setIsPresentationPreviewOpen(false),
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
    isPresentationPreviewOpen,
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
    return <div className="flex h-screen w-full bg-[#050505]" />;
  }

  if (isMobileViewport) {
    return (
      <>
        <MobilePitchViewer
          activeSlideIndex={activeSlideIndex}
          comments={(slideComments[activeSlideIndex] ?? []).filter((comment) => comment.status === "open")}
          documentTitle={sliderDocument.title}
          onAddComment={(comment) => addSlideComment(activeSlideIndex, comment)}
          onExport={openExport}
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
          lockedFormats={accessMode === "guest" ? guestLockedExportFormats : undefined}
          onClose={() => setIsExportMenuOpen(false)}
          onExport={handleExportFromModal}
          onImport={importPitchFile}
          onLockedFormat={requestRestrictedExportSignIn}
        />
        <GuestSignInDialog
          intent={guestSignInIntent}
          onClose={() => setGuestSignInIntent(null)}
          onContinue={(intent) => void continueGuestSignIn(intent)}
        />
      </>
    );
  }

  return (
    <>
    <PitchWorkspace
      accessMode={accessMode}
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
      openExport={openExport}
      openPresentationPreview={() => setIsPresentationPreviewOpen(true)}
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
    <PresentationPreviewModal
      activeSlideIndex={activeSlideIndex}
      documentTitle={sliderDocument.title}
      isOpen={isPresentationPreviewOpen}
      onClose={() => setIsPresentationPreviewOpen(false)}
      onExport={() => {
        setIsPresentationPreviewOpen(false);
        openExport();
      }}
      scenes={sliderDocument.scenes}
      source={canvasSource}
    />
    <ExportModal
      isOpen={isExportMenuOpen}
      onClose={() => setIsExportMenuOpen(false)}
      onExport={handleExportFromModal}
      onImport={importPitchFile}
      documentTitle={sliderDocument.title}
      isExporting={isExporting}
      initialMode={fileModalMode}
      lockedFormats={accessMode === "guest" ? guestLockedExportFormats : undefined}
      onLockedFormat={requestRestrictedExportSignIn}
    />
    <GuestSignInDialog
      intent={guestSignInIntent}
      onClose={() => setGuestSignInIntent(null)}
      onContinue={(intent) => void continueGuestSignIn(intent)}
    />
    </>
  );
}
