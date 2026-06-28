import type { HexColor, ThemePalette } from "@/features/pitch/application/colorPalettes";

export const slidePalettePresets = [
  {
    id: "midnight",
    name: "Midnight",
    colors: { background: "#030303", text: "#ffffff", muted: "#cbd5e1", accent: "#7dd3fc" }
  },
  {
    id: "editorial",
    name: "Editorial",
    colors: { background: "#f8fafc", text: "#111827", muted: "#475569", accent: "#2563eb" }
  },
  {
    id: "portfolio",
    name: "Portfolio",
    colors: { background: "#101820", text: "#f8fafc", muted: "#b7c4c9", accent: "#f2aa4c" }
  },
  {
    id: "sage",
    name: "Sage",
    colors: { background: "#eef4ef", text: "#102018", muted: "#52685c", accent: "#2f855a" }
  },
  {
    id: "plum",
    name: "Plum",
    colors: { background: "#1d1425", text: "#fff7ed", muted: "#d8c6e2", accent: "#fb7185" }
  },
  {
    id: "steel",
    name: "Steel",
    colors: { background: "#e7eef5", text: "#172033", muted: "#64748b", accent: "#0f766e" }
  }
] satisfies readonly ThemePalette[];

export const defaultColorPresets = [
  "#ffffff",
  "#111827",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#14b8a6",
  "#38bdf8",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f8fafc",
  "#e2e8f0",
  "#64748b",
  "#1f2937",
  "#020617"
] satisfies readonly HexColor[];
