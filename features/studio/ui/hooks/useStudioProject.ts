import { useEffect, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";
import { loadRecentProjects, saveRecentProjects, upsertRecentProject } from "@/features/studio/infrastructure/recentProjects";
import {
  isTauriRuntime,
  openSlidexProject,
  openSlidexProjectAt,
  saveSlidexProject,
  type SlidexProject,
  type SlidexRecentProject
} from "@/features/studio/infrastructure/tauriProject";

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
  canvasSource,
  documentTitle,
  resetSelection,
  setActiveSlideIndex,
  setNotice,
  setReplayNonce,
  setSource,
  undoStackRef
}: UseStudioProjectArgs) {
  const [projectName, setProjectName] = useState("Untitled");
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<SlidexRecentProject[]>([]);
  const [isProjectDirty, setIsProjectDirty] = useState(false);
  const [isTauri, setIsTauri] = useState(false);
  const [isRuntimeChecked, setIsRuntimeChecked] = useState(false);
  const [hasEnteredStudio, setHasEnteredStudio] = useState(false);

  useEffect(() => {
    setIsTauri(isTauriRuntime());
    setRecentProjects(loadRecentProjects());
    setIsRuntimeChecked(true);
  }, []);

  function rememberProject(project: SlidexProject) {
    setRecentProjects((current) => {
      const nextProjects = upsertRecentProject(current, project);

      saveRecentProjects(nextProjects);
      return nextProjects;
    });
  }

  function loadProject(project: SlidexProject, noticeSuffix: "opened" | "saved") {
    setSource(project.source);
    setProjectName(project.name);
    setProjectPath(project.path);
    setIsProjectDirty(false);
    setHasEnteredStudio(true);
    undoStackRef.current = [];
    setActiveSlideIndex(0);
    resetSelection();
    setReplayNonce((value) => value + 1);
    rememberProject(project);
    setNotice(`${project.name} ${noticeSuffix}`);
  }

  function newProject() {
    setSource(defaultMdx);
    setProjectName("Untitled");
    setProjectPath(null);
    setIsProjectDirty(false);
    setHasEnteredStudio(true);
    undoStackRef.current = [];
    setActiveSlideIndex(0);
    resetSelection();
    setReplayNonce((value) => value + 1);
    setNotice("New project");
  }

  async function openProject() {
    if (!isTauri) {
      return;
    }

    try {
      const project = await openSlidexProject();

      if (!project) {
        setNotice("Open canceled");
        return;
      }

      loadProject(project, "opened");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Open failed");
    }
  }

  async function openRecentProject(recentProject: SlidexRecentProject) {
    if (!isTauri) {
      return;
    }

    try {
      const project = await openSlidexProjectAt(recentProject.path);
      loadProject(project, "opened");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Recent project unavailable");
      setRecentProjects((current) => {
        const nextProjects = current.filter((item) => item.path !== recentProject.path);
        saveRecentProjects(nextProjects);
        return nextProjects;
      });
    }
  }

  async function saveProject() {
    if (!isTauri) {
      return;
    }

    try {
      const project = await saveSlidexProject({
        projectName: documentTitle || projectName,
        projectPath,
        source: canvasSource
      });

      if (!project) {
        setNotice("Save canceled");
        return;
      }

      setProjectName(project.name);
      setProjectPath(project.path);
      setIsProjectDirty(false);
      rememberProject(project);
      setNotice(`${project.name} saved`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed");
    }
  }

  return {
    hasEnteredStudio,
    isProjectDirty,
    isRuntimeChecked,
    isTauri,
    markProjectDirty: () => setIsProjectDirty(true),
    newProject,
    openProject,
    openRecentProject,
    projectName,
    recentProjects,
    saveProject
  };
}
