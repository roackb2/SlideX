import { isCustomTheme, type CustomTheme } from "@/features/studio/application/themeColors";

const CUSTOM_THEMES_KEY = "slidex.customThemes.v1";
const MAX_CUSTOM_THEMES = 12;

export function loadCustomThemes() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CUSTOM_THEMES_KEY) ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCustomTheme).slice(0, MAX_CUSTOM_THEMES);
  } catch {
    return [];
  }
}

export function saveCustomThemes(themes: readonly CustomTheme[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes.slice(0, MAX_CUSTOM_THEMES)));
}
