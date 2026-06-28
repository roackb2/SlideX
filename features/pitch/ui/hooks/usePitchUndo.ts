"use client";

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";

type UsePitchUndoArgs = {
  clearBlockSelection: () => void;
  markProjectDirty: () => void;
  setNotice: Dispatch<SetStateAction<string>>;
  setReplayNonce: Dispatch<SetStateAction<number>>;
  setSource: Dispatch<SetStateAction<string>>;
  source: string;
  undoStackRef: MutableRefObject<string[]>;
};

export function usePitchUndo({
  clearBlockSelection,
  markProjectDirty,
  setNotice,
  setReplayNonce,
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
        const resolvedSource = typeof nextSource === "function" ? nextSource(current) : nextSource;

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
    setReplayNonce((value) => value + 1);
    clearBlockSelection();
    setNotice("Undo");
  }, [clearBlockSelection, markProjectDirty, setNotice, setReplayNonce, setSource, undoStackRef]);

  return {
    commitSource,
    pushUndoSnapshot,
    undoLastChange,
    undoStackRef
  };
}
