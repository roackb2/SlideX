export const appearanceModes = ["system", "dark", "light"] as const;

export type AppearanceMode = (typeof appearanceModes)[number];
export type ResolvedAppearance = Exclude<AppearanceMode, "system">;

const appearanceStorageKey = "briefly-appearance-mode";

export function isAppearanceMode(value: string | null | undefined): value is AppearanceMode {
  return value === "system" || value === "dark" || value === "light";
}

export function readAppearanceMode(): AppearanceMode {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const storedMode = window.localStorage.getItem(appearanceStorageKey);
    return isAppearanceMode(storedMode) ? storedMode : "system";
  } catch {
    return "system";
  }
}

export function saveAppearanceMode(mode: AppearanceMode) {
  try {
    window.localStorage.setItem(appearanceStorageKey, mode);
  } catch {
    // Keep the in-memory preference active when storage is unavailable.
  }
}

export function getSystemAppearance(): ResolvedAppearance {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function watchSystemAppearance(onChange: (appearance: ResolvedAppearance) => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
  const update = () => onChange(mediaQuery.matches ? "light" : "dark");

  update();
  mediaQuery.addEventListener("change", update);

  return () => mediaQuery.removeEventListener("change", update);
}
