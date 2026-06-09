import { useEffect } from "react";
import { arrowDelta, isArrowKey } from "@/features/studio/application/keyboard";

type UseStudioShortcutsArgs = {
  activeSlideIndex: number;
  closeCodeEditor: () => void;
  closeExportMenu: () => void;
  closeMobileInspector: () => void;
  closeMobileSidebar: () => void;
  closeTemplateModal: () => void;
  copySelectedBlock: () => void;
  deleteSelectedBlocks: () => void;
  deleteSlide: (slideIndex: number) => void;
  exportHtmlFile: () => void;
  exportMdxFile: () => void;
  goToNextSlide: () => void;
  goToPreviousSlide: () => void;
  isCodeEditorOpen: boolean;
  isExportMenuOpen: boolean;
  isMobileInspectorOpen: boolean;
  isMobileSidebarOpen: boolean;
  isTemplateModalOpen: boolean;
  newProject: () => void;
  nudgeSelectedBlocks: (delta: { x: number; y: number }) => void;
  pasteCopiedBlock: () => void;
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  undoLastChange: () => void;
};

export function useStudioShortcuts({
  activeSlideIndex,
  closeCodeEditor,
  closeExportMenu,
  closeMobileInspector,
  closeMobileSidebar,
  closeTemplateModal,
  copySelectedBlock,
  deleteSelectedBlocks,
  deleteSlide,
  goToNextSlide,
  goToPreviousSlide,
  isCodeEditorOpen,
  isExportMenuOpen,
  isMobileInspectorOpen,
  isMobileSidebarOpen,
  isTemplateModalOpen,
  nudgeSelectedBlocks,
  pasteCopiedBlock,
  selectedBlockIndex,
  selectedBlockIndices,
  undoLastChange
}: UseStudioShortcutsArgs) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;

      if (event.key === "Escape") {
        if (isCodeEditorOpen) {
          event.preventDefault();
          closeCodeEditor();
          return;
        }
        if (isExportMenuOpen) {
          event.preventDefault();
          closeExportMenu();
          return;
        }
        if (isTemplateModalOpen) {
          event.preventDefault();
          closeTemplateModal();
          return;
        }
        if (isMobileSidebarOpen) {
          event.preventDefault();
          closeMobileSidebar();
          return;
        }
        if (isMobileInspectorOpen) {
          event.preventDefault();
          closeMobileInspector();
          return;
        }
      }

      if (tagName === "TEXTAREA" || tagName === "INPUT" || tagName === "SELECT" || target?.isContentEditable) {
        return;
      }

      if (isCodeEditorOpen || isExportMenuOpen || isTemplateModalOpen || isMobileSidebarOpen || isMobileInspectorOpen) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
        copySelectedBlock();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undoLastChange();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteCopiedBlock();
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && (selectedBlockIndex !== null || selectedBlockIndices.length > 0)) {
        event.preventDefault();
        deleteSelectedBlocks();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSlide(activeSlideIndex);
        return;
      }

      if (isArrowKey(event.key) && (selectedBlockIndex !== null || selectedBlockIndices.length > 0)) {
        event.preventDefault();
        nudgeSelectedBlocks(arrowDelta(event.key, event.shiftKey, event.altKey));
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "<") {
        event.preventDefault();
        goToPreviousSlide();
      }

      if (event.key === "ArrowRight" || event.key === ">") {
        event.preventDefault();
        goToNextSlide();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeSlideIndex,
    closeCodeEditor,
    closeExportMenu,
    closeMobileInspector,
    closeMobileSidebar,
    closeTemplateModal,
    copySelectedBlock,
    deleteSelectedBlocks,
    deleteSlide,
    goToNextSlide,
    goToPreviousSlide,
    isCodeEditorOpen,
    isExportMenuOpen,
    isMobileInspectorOpen,
    isMobileSidebarOpen,
    isTemplateModalOpen,
    nudgeSelectedBlocks,
    pasteCopiedBlock,
    selectedBlockIndex,
    selectedBlockIndices,
    undoLastChange
  ]);
}
