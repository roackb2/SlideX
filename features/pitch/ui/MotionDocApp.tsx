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
import { PitchAgentPanel } from "@/features/pitch/ui/agent/PitchAgentPanel";
import { PitchAgentProvider } from "@/features/pitch/ui/agent/PitchAgentProvider";
import { importPitchProjectFile } from "@/features/pitch/infrastructure/pitchImport";
import { slideCommentsDeckId } from "@/features/pitch/infrastructure/slideComments";
import { embedPitchLocalImagesForPersistence } from "@/features/pitch/infrastructure/pitchLocalAssets";
import { useMobilePitchViewport } from "@/features/pitch/ui/hooks/useMobilePitchViewport";
import { useSlideComments } from "@/features/pitch/ui/hooks/useSlideComments";
import { usePitchPersistence } from "@/features/pitch/ui/hooks/usePitchPersistence";
import { usePitchWorkspaceViewState } from "@/features/pitch/ui/hooks/usePitchWorkspaceViewState";
import { MobilePitchViewer } from "@/features/pitch/ui/mobile/MobilePitchViewer";
import { PresentationPreviewModal } from "@/features/pitch/ui/PresentationPreviewModal";
import {
  GuestSignInDialog,
  type GuestSignInIntent
} from "@/features/pitch/ui/GuestSignInDialog";
import type { AgentSessionSummary } from "@/features/pitch/domain/agentRun";

const isSlideXAgentEnabled = process.env.NEXT_PUBLIC_SLIDEX_AGENT_ENABLED === "true";

export type MotionDocInitialProject = {
  name: string;
  source: string;
  templateId?: string;
};

type MotionDocAppProps = {
  accessMode?: "authenticated" | "guest";
  initialAgentSessionId?: string;
  initialProject?: MotionDocInitialProject;
  initialResumeIntent?: "export" | "preview";
  onOpenAgentSession?: (presentationId: string, sessionId: string) => void;
  onSignInRequested?: (intent: GuestSignInIntent) => void;
  onProjectSourceChange?: (
    source: string,
    title: string
  ) => void | Promise<void>;
  onSelectedAgentSessionChange?: (sessionId?: string) => void;
  presentationId?: string;
};

const guestLockedExportFormats = ["html", "mdx"] as const satisfies readonly ExportFormat[];

export function MotionDocApp({
  accessMode = "authenticated",
  initialAgentSessionId,
  initialProject,
  initialResumeIntent,
  onOpenAgentSession,
  onProjectSourceChange,
  onSignInRequested,
  onSelectedAgentSessionChange,
  presentationId
}: MotionDocAppProps = {}) {
  const isMobileViewport = useMobilePitchViewport();
  const [source, setSource] = useState(initialProject?.source ?? defaultMdx);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialProject?.templateId ?? defaultTemplate.id);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState<number | null>(null);
  const undoStackRef = useRef<string[]>([]);
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false);
  const {
    activeCanvasTool,
    exportMenuRef,
    fileModalMode,
    guestSignInIntent,
    isCanvasGridVisible,
    isCodeEditorOpen,
    isExporting,
    isExportMenuOpen,
    isMobileInspectorOpen,
    isMobileSidebarOpen,
    isPresentationPreviewOpen,
    isTemplateModalOpen,
    notice,
    replayNonce,
    setActiveCanvasTool,
    setFileModalMode,
    setGuestSignInIntent,
    setIsCanvasGridVisible,
    setIsCodeEditorOpen,
    setIsExporting,
    setIsExportMenuOpen,
    setIsMobileInspectorOpen,
    setIsMobileSidebarOpen,
    setIsPresentationPreviewOpen,
    setIsTemplateModalOpen,
    setNotice,
    setReplayNonce
  } = usePitchWorkspaceViewState(initialResumeIntent);

  const {
    activeSlide,
    activeSlideAccent,
    activeSlideBackground,
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
  const applyAgentMotionDoc = useCallback(async (
    motionDoc: string,
    summary: string
  ) => {
    if (onProjectSourceChange) {
      const persistedSource = await embedPitchLocalImagesForPersistence(motionDoc);
      await onProjectSourceChange(persistedSource, projectName);
    }
    commitSource(motionDoc);
    clearBlockSelection();
    setReplayNonce((value) => value + 1);
    setNotice(summary || "Agent changes applied");
  }, [
    clearBlockSelection,
    commitSource,
    onProjectSourceChange,
    projectName,
    setNotice,
    setReplayNonce
  ]);

  const openAgentSession = useCallback((session: AgentSessionSummary) => {
    onProjectSourceChange?.(source, projectName);
    onOpenAgentSession?.(session.presentation.id, session.id);
  }, [onOpenAgentSession, onProjectSourceChange, projectName, source]);

  const openExport = useCallback(() => {
    setFileModalMode("export");
    setIsExportMenuOpen(true);
  }, [setFileModalMode, setIsExportMenuOpen]);

  const requestRestrictedExportSignIn = useCallback(() => {
    setIsExportMenuOpen(false);
    setGuestSignInIntent("export");
  }, [setGuestSignInIntent, setIsExportMenuOpen]);

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
  }, [exportHtmlFile, exportMdxFile, exportPptxFile, setIsExportMenuOpen, setIsExporting]);
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

  usePitchPersistence({
    enabled: Boolean(initialProject),
    onProjectSourceChange,
    projectName,
    setNotice,
    source
  });

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
  }, [onProjectSourceChange, onSignInRequested, projectName, setGuestSignInIntent, setNotice, source]);

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
  }, [exportMenuRef, isExportMenuOpen, setIsExportMenuOpen]);

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

  const isAgentAvailable = isSlideXAgentEnabled && Boolean(presentationId);
  const desktopExperience = (
    <>
    <PitchWorkspace
      agent={{
        isEnabled: isAgentAvailable,
        isPanelOpen: isAgentAvailable && isAgentPanelOpen,
        panel: isAgentAvailable && isAgentPanelOpen ? <PitchAgentPanel /> : undefined,
        togglePanel: () => setIsAgentPanelOpen((current) => !current)
      }}
      commands={{
        addBlockToActiveSlide: pitchCommands.addBlockToActiveSlide,
        addSlide: pitchCommands.addSlide,
        applyLayoutToActiveSlide: pitchCommands.applyLayoutToActiveSlide,
        applyTemplate: pitchCommands.applyTemplate,
        beginBlockTransform: pitchCommands.beginBlockTransform,
        commitMdxSource: (value) => {
          setSource(value);
          markProjectDirty();
        },
        copySelectedBlock: pitchCommands.copySelectedBlock,
        copySource,
        deleteBlock: pitchCommands.deleteBlock,
        deleteSelectedBlocks: pitchCommands.deleteSelectedBlocks,
        deleteSlide: pitchCommands.deleteSlide,
        duplicateSelectedBlock: pitchCommands.duplicateSelectedBlock,
        goToNextSlide: pitchCommands.goToNextSlide,
        goToPreviousSlide: pitchCommands.goToPreviousSlide,
        groupSelectedBlocks: pitchCommands.groupSelectedBlocks,
        importImageUrlForBlock: pitchCommands.importImageUrlForBlock,
        insertSlideNearActive: pitchCommands.insertSlideNearActive,
        moveBlock: pitchCommands.moveBlock,
        moveBlockToEdge: pitchCommands.moveBlockToEdge,
        moveSelectedBlocksToEdge: pitchCommands.moveSelectedBlocksToEdge,
        newProject: startNewProject,
        onAddActiveSlideComment: (comment) => addSlideComment(activeSlideIndex, comment),
        onPassActiveSlideComment: (commentId) => passSlideComment(activeSlideIndex, commentId),
        openExport,
        openPresentationPreview: () => setIsPresentationPreviewOpen(true),
        pasteCopiedBlock: pitchCommands.pasteCopiedBlock,
        pushUndoSnapshot,
        renameBlock: pitchCommands.renameBlock,
        reorderBlock: pitchCommands.reorderBlock,
        reorderSlide: pitchCommands.reorderSlide,
        setActiveSlideIndex,
        toggleBlockPositionLock: pitchCommands.toggleBlockPositionLock,
        toggleSelectedBlocksPositionLock: pitchCommands.toggleSelectedBlocksPositionLock,
        undoLastChange,
        ungroupSelectedBlocks: pitchCommands.ungroupSelectedBlocks,
        updateActiveSlideStyle: pitchCommands.updateActiveSlideStyle,
        updateAllSlidesStyle: pitchCommands.updateAllSlidesStyle,
        updateBlock: pitchCommands.updateBlock,
        updatePositionedBlockFrames: pitchCommands.updatePositionedBlockFrames,
        updateSelectionMdx: pitchCommands.updateSelectionMdx,
        uploadImageForBlock: pitchCommands.uploadImageForBlock,
        uploadVideoForBlock: pitchCommands.uploadVideoForBlock,
        useSelectedImageAsBackground: pitchCommands.useSelectedImageAsBackground
      }}
      document={{
        activeSlide,
        activeSlideAccent,
        activeSlideBackground,
        activeSlideComments: (slideComments[activeSlideIndex] ?? []).filter((comment) => comment.status === "open"),
        activeSlideIndex,
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
        isProjectDirty,
        projectName,
        scenes: sliderDocument.scenes,
        selectedTemplateId,
        slideRows,
        source,
        totalDuration: stats.totalDuration
      }}
      selection={{
        clearBlockSelection,
        draggedBlockIndex,
        dragOverBlockIndex,
        hasCopiedBlock: pitchCommands.hasCopiedBlock,
        selectBlock,
        selectBlockFromLayer: pitchCommands.selectBlockFromLayer,
        selectBlocks,
        selectedBlockIndex,
        selectedBlockIndices,
        selectedBlocksLocked: pitchCommands.selectedBlocksLocked,
        selectionMdx,
        selectSingleBlock,
        setDraggedBlockIndex,
        setDragOverBlockIndex
      }}
      view={{
        accessMode,
        activeCanvasTool,
        exportMenuRef,
        isCanvasGridVisible,
        isCodeEditorOpen,
        isExportMenuOpen,
        isMobileInspectorOpen,
        isMobileSidebarOpen,
        isTemplateModalOpen,
        notice,
        replayNonce,
        setActiveCanvasTool,
        setIsCanvasGridVisible,
        setIsCodeEditorOpen,
        setIsExportMenuOpen,
        setIsMobileInspectorOpen,
        setIsMobileSidebarOpen,
        setIsTemplateModalOpen,
        setReplayNonce
      }}
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
  return isAgentAvailable && presentationId ? (
    <PitchAgentProvider
      initialSessionId={initialAgentSessionId}
      onApplyMotionDoc={applyAgentMotionDoc}
      onOpenSession={openAgentSession}
      onSelectedSessionChange={onSelectedAgentSessionChange}
      presentationId={presentationId}
      presentationTitle={projectName}
      source={source}
    >
      {desktopExperience}
    </PitchAgentProvider>
  ) : desktopExperience;
}
