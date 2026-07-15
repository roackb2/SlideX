"use client";

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { ensureMotionDocSourceBlockIds } from "@/core/motion-doc/application/motionDocSerialize";

type UsePitchUndoArgs = {
  clearBlockSelection: () => void;
  markProjectDirty: () => void;
  setNotice: Dispatch<SetStateAction<string>>;
  setSource: Dispatch<SetStateAction<string>>;
  source: string;
  undoStackRef: MutableRefObject<string[]>;
};

export function usePitchUndo({
  clearBlockSelection,
  markProjectDirty,
  setNotice,
  setSource,
  source,
  undoStackRef
}: UsePitchUndoArgs) {
  const pushUndoSnapshot = useCallback(
    (snapshot = source) => {
      const undoStack = undoStackRef.current;

      if (undoStack[undoStack.length - 1] === snapshot) {
        return;
      }

      undoStackRef.current = [...undoStack.slice(-79), snapshot];
    },
    [source, undoStackRef]
  );

  const commitSource = useCallback(
    (nextSource: string | ((current: string) => string)) => {
      setSource((current) => {
        const resolvedSource = ensureMotionDocSourceBlockIds(
          typeof nextSource === "function" ? nextSource(current) : nextSource
        );

        if (resolvedSource !== current) {
          pushUndoSnapshot(current);
        }

        return resolvedSource;
      });
      markProjectDirty();
    },
    [markProjectDirty, pushUndoSnapshot, setSource]
  );

  const undoLastChange = useCallback(() => {
    const previousSource = undoStackRef.current.pop();

    if (!previousSource) {
      setNotice("Nothing to undo");
      return;
    }

    setSource(previousSource);
    markProjectDirty();
    clearBlockSelection();
    setNotice("Undo");
  }, [clearBlockSelection, markProjectDirty, setNotice, setSource, undoStackRef]);

  return {
    commitSource,
    pushUndoSnapshot,
    undoLastChange,
    undoStackRef
  };
}
