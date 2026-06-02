"use client";

import { useEffect, useState } from "react";
import { currentThemeColors, type CustomTheme } from "@/features/studio/application/themeColors";
import { loadCustomThemes, saveCustomThemes } from "@/features/studio/infrastructure/customThemes";

type UseCustomThemesArgs = {
  accent: string;
  background: string;
  mutedColor: string;
  textColor: string;
  theme: string;
};

export function useCustomThemes({ accent, background, mutedColor, textColor, theme }: UseCustomThemesArgs) {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [customThemeName, setCustomThemeName] = useState("");

  useEffect(() => {
    setCustomThemes(loadCustomThemes());
  }, []);

  function saveCurrentTheme() {
    const trimmedName = customThemeName.trim();
    const nextTheme: CustomTheme = {
      colors: currentThemeColors({ accent, background, mutedColor, textColor, theme }),
      createdAt: Date.now(),
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmedName || `Custom ${customThemes.length + 1}`
    };
    const nextThemes = [nextTheme, ...customThemes].slice(0, 12);

    setCustomThemes(nextThemes);
    saveCustomThemes(nextThemes);
    setCustomThemeName("");
  }

  function deleteCustomTheme(themeId: string) {
    const nextThemes = customThemes.filter((item) => item.id !== themeId);

    setCustomThemes(nextThemes);
    saveCustomThemes(nextThemes);
  }

  return {
    customThemeName,
    customThemes,
    deleteCustomTheme,
    saveCurrentTheme,
    setCustomThemeName
  };
}
