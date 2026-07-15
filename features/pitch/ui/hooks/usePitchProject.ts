import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction
} from "react";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";
import { ensureMotionDocSourceBlockIds } from "@/core/motion-doc/application/motionDocSerialize";

export type NewPitchProjectOptions = {
  name?: string;
  notice?: string;
  source?: string;
  templateId?: string;
};

type UsePitchProjectArgs = {
  canvasSource: string;
  documentTitle: string;
  initialProject?: {
    name: string;
    source: string;
  };
  resetSelection: () => void;
  setActiveSlideIndex: Dispatch<SetStateAction<number>>;
  setNotice: Dispatch<SetStateAction<string>>;
  setSource: Dispatch<SetStateAction<string>>;
  undoStackRef: MutableRefObject<string[]>;
};

export function usePitchProject({
  resetSelection,
  initialProject,
  setActiveSlideIndex,
  setNotice,
  setSource,
  undoStackRef
}: UsePitchProjectArgs) {
  const [projectName, setProjectName] = useState(initialProject?.name ?? "Untitled");
  const [isProjectDirty, setIsProjectDirty] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const applyProject = useCallback((options: NewPitchProjectOptions, resetActiveSlide: boolean) => {
    setSource(ensureMotionDocSourceBlockIds(options.source ?? defaultMdx));
    setProjectName(options.name ?? "Untitled");
    setIsProjectDirty(false);
    undoStackRef.current = [];
    if (resetActiveSlide) setActiveSlideIndex(0);
    resetSelection();
    setNotice(options.notice ?? "New project");
  }, [
    resetSelection,
    setActiveSlideIndex,
    setNotice,
    setSource,
    undoStackRef
  ]);

  const newProject = useCallback((options: NewPitchProjectOptions = {}) => {
    applyProject(options, true);
  }, [applyProject]);

  const syncProject = useCallback((options: NewPitchProjectOptions) => {
    applyProject(options, false);
  }, [applyProject]);

  const markProjectDirty = useCallback(() => {
    setIsProjectDirty(true);
  }, []);

  return {
    isMounted,
    isProjectDirty,
    markProjectDirty,
    newProject,
    projectName,
    syncProject
  };
}
