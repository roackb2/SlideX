"use client";

import { FilePlus2, FolderOpen, History } from "lucide-react";
import type { SlidexRecentProject } from "@/features/studio/infrastructure/tauriProject";

type DesktopWelcomeProps = {
  newProject: () => void;
  openProject: () => void;
  openRecentProject: (project: SlidexRecentProject) => void;
  recentProjects: SlidexRecentProject[];
};

export function DesktopWelcome({
  newProject,
  openProject,
  openRecentProject,
  recentProjects
}: DesktopWelcomeProps) {
  return (
    <main className="flex h-screen bg-[#0f1017] text-neutral-200 font-sans">
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-white/[0.08] bg-[#111118] px-6 py-7">
        <img src="/logo.png" alt="SlideX" className="mb-9 w-[96px] rounded-md object-contain" />

        <div className="space-y-1">
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.07] hover:text-white"
            onClick={newProject}
            type="button"
          >
            <FilePlus2 size={16} />
            New Project
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.07] hover:text-white"
            onClick={openProject}
            type="button"
          >
            <FolderOpen size={16} />
            Open Project
          </button>
        </div>

        <div className="mt-auto rounded-md border border-white/[0.08] bg-black/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-neutral-400">
            <History size={13} />
            Recent
          </div>
          {recentProjects.length > 0 ? (
            <div className="space-y-1">
              {recentProjects.slice(0, 5).map((project) => (
                <button
                  className="block w-full rounded px-2 py-2 text-left transition-colors hover:bg-white/[0.07]"
                  key={project.path}
                  onClick={() => openRecentProject(project)}
                  type="button"
                >
                  <span className="block truncate text-xs font-medium text-neutral-300">{project.name}</span>
                  <span className="block truncate text-[10px] text-neutral-500">{project.path}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-white/[0.10] px-3 py-4 text-xs text-neutral-500">
              No recent projects
            </div>
          )}
        </div>
      </aside>

      <section className="flex flex-1 items-center justify-center px-10">
        <div className="w-full max-w-3xl">
          <div className="mb-10">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-neutral-500">SlideX Desktop</p>
            <h1 className="text-5xl font-semibold tracking-normal text-white">Welcome</h1>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              className="group rounded-lg border border-white/[0.10] bg-[#161720] p-5 text-left transition-colors hover:border-white/[0.18] hover:bg-[#1b1c26]"
              onClick={newProject}
              type="button"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-white text-black">
                <FilePlus2 size={18} />
              </div>
              <div className="text-base font-semibold text-white">New Project</div>
              <div className="mt-1 text-sm text-neutral-500">Default Deck</div>
            </button>

            <button
              className="group rounded-lg border border-white/[0.10] bg-[#161720] p-5 text-left transition-colors hover:border-white/[0.18] hover:bg-[#1b1c26]"
              onClick={openProject}
              type="button"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-white text-black">
                <FolderOpen size={18} />
              </div>
              <div className="text-base font-semibold text-white">Open Project</div>
              <div className="mt-1 text-sm text-neutral-500">.slidex Folder</div>
            </button>
          </div>

          {recentProjects.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
                <History size={13} />
                Recent Projects
              </div>
              <div className="overflow-hidden rounded-lg border border-white/[0.08]">
                {recentProjects.slice(0, 4).map((project) => (
                  <button
                    className="flex w-full items-center justify-between gap-5 border-b border-white/[0.06] bg-[#14151d] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#1b1c26]"
                    key={project.path}
                    onClick={() => openRecentProject(project)}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-neutral-200">{project.name}</span>
                      <span className="block truncate text-xs text-neutral-500">{project.path}</span>
                    </span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
