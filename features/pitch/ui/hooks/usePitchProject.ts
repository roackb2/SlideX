import { useState, useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";

export type NewPitchProjectOptions = {
  name?: string;
  notice?: string;
  source?: string;
  templateId?: string;
};

type UsePitchProjectArgs = {
  canvasSource: string;
  documentTitle: string;
  resetSelection: () => void;
  setActiveSlideIndex: Dispatch<SetStateAction<number>>;
  setNotice: Dispatch<SetStateAction<string>>;
  setReplayNonce: Dispatch<SetStateAction<number>>;
  setSource: Dispatch<SetStateAction<string>>;
  undoStackRef: MutableRefObject<string[]>;
};

export function usePitchProject({
  resetSelection,
  setActiveSlideIndex,
  setNotice,
  setReplayNonce,
  setSource,
  undoStackRef
}: UsePitchProjectArgs) {
  const [projectName, setProjectName] = useState("Untitled");
  const [isProjectDirty, setIsProjectDirty] = useState(false);
  const [hasEnteredPitch, setHasEnteredPitch] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem("slidex_has_completed_onboarding") === "true") {
      setHasEnteredPitch(true);
    }
  }, []);

  function newProject(options: NewPitchProjectOptions = {}) {
    setSource(options.source ?? defaultMdx);
    setProjectName(options.name ?? "Untitled");
    setIsProjectDirty(false);
    setHasEnteredPitch(true);
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
    hasEnteredPitch,
    isProjectDirty,
    markProjectDirty: () => setIsProjectDirty(true),
    newProject,
    projectName
  };
}
