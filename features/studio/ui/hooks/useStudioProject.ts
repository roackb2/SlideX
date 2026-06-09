import { useState, useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";

export type NewStudioProjectOptions = {
  name?: string;
  notice?: string;
  source?: string;
  templateId?: string;
};

type UseStudioProjectArgs = {
  canvasSource: string;
  documentTitle: string;
  resetSelection: () => void;
  setActiveSlideIndex: Dispatch<SetStateAction<number>>;
  setNotice: Dispatch<SetStateAction<string>>;
  setReplayNonce: Dispatch<SetStateAction<number>>;
  setSource: Dispatch<SetStateAction<string>>;
  undoStackRef: MutableRefObject<string[]>;
};

export function useStudioProject({
  resetSelection,
  setActiveSlideIndex,
  setNotice,
  setReplayNonce,
  setSource,
  undoStackRef
}: UseStudioProjectArgs) {
  const [projectName, setProjectName] = useState("Untitled");
  const [isProjectDirty, setIsProjectDirty] = useState(false);
  const [hasEnteredStudio, setHasEnteredStudio] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem("slidex_has_completed_onboarding") === "true") {
      setHasEnteredStudio(true);
    }
  }, []);

  function newProject(options: NewStudioProjectOptions = {}) {
    setSource(options.source ?? defaultMdx);
    setProjectName(options.name ?? "Untitled");
    setIsProjectDirty(false);
    setHasEnteredStudio(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("slidex_has_completed_onboarding", "true");
    }
    undoStackRef.current = [];
    setActiveSlideIndex(0);
    resetSelection();
    setReplayNonce((value) => value + 1);
    setNotice(options.notice ?? "New project");
  }

  return {
    isMounted,
    hasEnteredStudio,
    isProjectDirty,
    markProjectDirty: () => setIsProjectDirty(true),
    newProject,
    projectName
  };
}
