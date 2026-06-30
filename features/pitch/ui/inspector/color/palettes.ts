import type { HexColor, ThemePalette } from "@/features/pitch/application/colorPalettes";

export const slidePalettePresets = [
  {
    id: "blank-white",
    name: "Blank",
    colors: { background: "#ffffff", text: "#111827", muted: "#71717a", accent: "#111111" }
  },
  {
    id: "black-boardroom",
    name: "Black Boardroom",
    colors: { background: "#030303", text: "#ffffff", muted: "#a1a1aa", accent: "#ffffff" }
  },
  {
    id: "white-executive",
    name: "White Executive",
    colors: { background: "#f8f9fa", text: "#111111", muted: "#71717a", accent: "#111111" }
  },
  {
    id: "revenue-command",
    name: "Revenue Command",
    colors: { background: "#07111f", text: "#f8fbff", muted: "#9fb7d8", accent: "#72a7ff" }
  },
  {
    id: "investor-update",
    name: "Investor Update",
    colors: { background: "#fff8ef", text: "#2f2418", muted: "#8b7358", accent: "#7a4f24" }
  },
  {
    id: "product-launch",
    name: "Product Launch",
    colors: { background: "#07120f", text: "#f4fff8", muted: "#9bb7aa", accent: "#7dd3a8" }
  },
  {
    id: "customer-success",
    name: "Mist QBR",
    colors: { background: "#f6faf8", text: "#10251f", muted: "#5d746c", accent: "#145c49" }
  },
  {
    id: "saas-review",
    name: "Electric Slate",
    colors: { background: "#081018", text: "#f5fbff", muted: "#99b5c5", accent: "#7dd3fc" }
  },
  {
    id: "market-entry",
    name: "Consulting Blue",
    colors: { background: "#f7fbff", text: "#10233c", muted: "#607895", accent: "#183b68" }
  },
  {
    id: "brand-pitch",
    name: "Luxury Plum",
    colors: { background: "#120815", text: "#fff7fb", muted: "#c49ab4", accent: "#f0a6ca" }
  },
  {
    id: "digital-transformation",
    name: "Signal White",
    colors: { background: "#f8faff", text: "#111827", muted: "#64748b", accent: "#3157ff" }
  },
  {
    id: "talent-strategy",
    name: "Forest Green",
    colors: { background: "#05110d", text: "#ffffff", muted: "#6b8e7d", accent: "#67e8a3" }
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
