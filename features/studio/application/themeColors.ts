import type { PaletteScope, ThemePaletteColors } from "@/features/studio/application/colorPalettes";

export type PropRecord = Record<string, string | number>;

export type CustomTheme = {
  colors: ThemePaletteColors;
  createdAt: number;
  id: string;
  name: string;
};

export function themeUpdates(colors: ThemePaletteColors): PropRecord {
  return {
    accent: colors.accent,
    background: colors.background,
    mutedColor: colors.muted,
    textColor: colors.text,
    theme: isLightTheme(colors.background) ? "light" : "dark"
  };
}

export function currentThemeColors({
  accent,
  background,
  mutedColor,
  textColor,
  theme
}: {
  accent: string;
  background: string;
  mutedColor: string;
  textColor: string;
  theme: string;
}): ThemePaletteColors {
  const isLight = theme === "light" || theme === "paper";

  return {
    accent: accent || "#7c3aed",
    background: background || "#050505",
    muted: mutedColor || (isLight ? "#475569" : "#cbd5e1"),
    text: textColor || (isLight ? "#111827" : "#ffffff")
  };
}

export function isLightTheme(background: string) {
  const hex = background.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return false;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.62;
}

export function isThemePaletteColors(value: unknown): value is ThemePaletteColors {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as ThemePaletteColors;

  return (
    typeof candidate.accent === "string" &&
    typeof candidate.background === "string" &&
    typeof candidate.muted === "string" &&
    typeof candidate.text === "string"
  );
}

export function isCustomTheme(value: unknown): value is CustomTheme {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as CustomTheme;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.createdAt === "number" &&
    isThemePaletteColors(candidate.colors)
  );
}

export type { PaletteScope, ThemePaletteColors };
