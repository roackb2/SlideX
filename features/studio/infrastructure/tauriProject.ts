export type SlidexProject = {
  name: string;
  path: string;
  source: string;
};

export type SlidexRecentProject = {
  name: string;
  path: string;
  updatedAt: number;
};

type TauriWindow = Window & {
  __TAURI__?: unknown;
  __TAURI_INTERNALS__?: unknown;
  isTauri?: boolean;
};

export function isTauriRuntime() {
  if (typeof window === "undefined") {
    return false;
  }

  const tauriWindow = window as TauriWindow;
  return Boolean(tauriWindow.isTauri || tauriWindow.__TAURI__ || tauriWindow.__TAURI_INTERNALS__);
}

export async function openSlidexProject() {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<SlidexProject | null>("open_slidex_project");
}

export async function openSlidexProjectAt(projectPath: string) {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<SlidexProject>("open_slidex_project_at", {
    projectPath
  });
}

export async function saveSlidexProject({
  projectName,
  projectPath,
  source
}: {
  projectName?: string;
  projectPath?: string | null;
  source: string;
}) {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<SlidexProject | null>("save_slidex_project", {
    projectName,
    projectPath,
    source
  });
}

export async function exportSlidexFile({
  content,
  defaultFilename,
  extension
}: {
  content: string;
  defaultFilename: string;
  extension: "html" | "mdx";
}) {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<string | null>("export_slidex_file", {
    content,
    defaultFilename,
    extension
  });
}

export async function listenToTauriMenu(
  handler: (action: "new" | "open" | "save" | "export-html" | "export-mdx") => void
) {
  const { listen } = await import("@tauri-apps/api/event");
  return listen<string>("slidex://menu", (event) => {
    if (
      event.payload === "new" ||
      event.payload === "open" ||
      event.payload === "save" ||
      event.payload === "export-html" ||
      event.payload === "export-mdx"
    ) {
      handler(event.payload);
    }
  });
}
