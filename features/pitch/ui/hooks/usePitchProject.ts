import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction
} from "react";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";
import {
  resolveProjectInstanceId,
  rotateProjectInstanceId
} from "@/features/pitch/infrastructure/slidexAgentPersistence";

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
  const [projectId, setProjectId] = useState("");
  const [isProjectDirty, setIsProjectDirty] = useState(false);
  const isProjectDirtyRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setProjectId(resolveProjectInstanceId(window.sessionStorage));
    setIsMounted(true);
  }, []);

  const applyProject = useCallback((options: NewPitchProjectOptions) => {
    setSource(options.source ?? defaultMdx);
    setProjectName(options.name ?? "Untitled");
    isProjectDirtyRef.current = false;
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
    setProjectId(rotateProjectInstanceId(window.sessionStorage));
    applyProject(options);
  }, [applyProject]);

  const restoreProject = useCallback((options: {
    name: string;
    source: string;
  }): boolean => {
    if (isProjectDirtyRef.current) {
      return false;
    }
    applyProject({
      name: options.name,
      source: options.source,
      notice: "Conversation restored"
    });
    return true;
  }, [applyProject]);

  const markProjectDirty = useCallback(() => {
    isProjectDirtyRef.current = true;
    setIsProjectDirty(true);
  }, []);

  return {
    isMounted,
    isProjectDirty,
    markProjectDirty,
    newProject,
    projectId,
    restoreProject,
    projectName
  };
}
