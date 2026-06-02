import type { SlidexProject, SlidexRecentProject } from "@/features/studio/infrastructure/tauriProject";

const RECENT_PROJECTS_KEY = "slidex.recentProjects.v1";
const MAX_RECENT_PROJECTS = 8;

export function loadRecentProjects() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_PROJECTS_KEY) ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is SlidexRecentProject => typeof item?.name === "string" && typeof item?.path === "string" && typeof item?.updatedAt === "number")
      .slice(0, MAX_RECENT_PROJECTS);
  } catch {
    return [];
  }
}

export function saveRecentProjects(projects: SlidexRecentProject[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(projects.slice(0, MAX_RECENT_PROJECTS)));
}

export function upsertRecentProject(projects: SlidexRecentProject[], project: SlidexProject) {
  return [
    {
      name: project.name,
      path: project.path,
      updatedAt: Date.now()
    },
    ...projects.filter((item) => item.path !== project.path)
  ].slice(0, MAX_RECENT_PROJECTS);
}
