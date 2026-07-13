import {
  useCallback,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction
} from "react";
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
  initialProject?: {
    name: string;
    source: string;
  };
  resetSelection: () => void;
  setActiveSlideIndex: Dispatch<SetStateAction<number>>;
  setNotice: Dispatch<SetStateAction<string>>;
  setReplayNonce: Dispatch<SetStateAction<number>>;
  setSource: Dispatch<SetStateAction<string>>;
  undoStackRef: MutableRefObject<string[]>;
};

export function usePitchProject({
  resetSelection,
  initialProject,
  setActiveSlideIndex,
  setNotice,
  setReplayNonce,
  setSource,
  undoStackRef
}: UsePitchProjectArgs) {
  const [projectName, setProjectName] = useState(initialProject?.name ?? "Untitled");
  const [isProjectDirty, setIsProjectDirty] = useState(false);

  const applyProject = useCallback((options: NewPitchProjectOptions) => {
    setSource(options.source ?? defaultMdx);
    setProjectName(options.name ?? "Untitled");
    setIsProjectDirty(false);
    undoStackRef.current = [];
    setActiveSlideIndex(0);
    resetSelection();
    setReplayNonce((value) => value + 1);
    setNotice(options.notice ?? "New project");
  }, [
    resetSelection,
    setActiveSlideIndex,
    setNotice,
    setReplayNonce,
    setSource,
    undoStackRef
  ]);

  const newProject = useCallback((options: NewPitchProjectOptions = {}) => {
    applyProject(options);
  }, [applyProject]);

  const markProjectDirty = useCallback(() => {
    setIsProjectDirty(true);
  }, []);

  return {
    isProjectDirty,
    markProjectDirty,
    newProject,
    projectName
  };
}
