import type { ReactNode } from "react";
import { BarChart3, CreditCard, Gauge, Image as ImageIcon } from "lucide-react";
import type { AddBlockType } from "@/lib/motionDocBlockFactory";

export type { AddBlockType };

export const stylePresets = [
  { id: "black", name: "Black", theme: "dark", background: "#030303", accent: "#ffffff" },
  { id: "white", name: "White", theme: "light", background: "#ffffff", accent: "#111111" }
];

export const blockTools: Array<{ icon: ReactNode; label: string; type: AddBlockType }> = [
  { icon: <span className="font-serif text-[18px] font-bold leading-none">H</span>, label: "Title", type: "Title" },
  { icon: <span className="font-serif text-[17px] font-semibold leading-none">T</span>, label: "Text", type: "Text" },
  { icon: <CreditCard size={16} className="transition-all duration-200" />, label: "Card", type: "Card" },
  { icon: <Gauge size={16} className="transition-all duration-200" />, label: "Metric", type: "Metric" },
  { icon: <BarChart3 size={16} className="transition-all duration-200" />, label: "Chart", type: "Chart" },
  { icon: <ImageIcon size={16} className="transition-all duration-200" />, label: "Image", type: "Image" }
];

export const imageFitOptions = ["cover", "contain", "fill", "scale-down"] as const;

export const imageModeOptions = [
  { label: "Contained", value: "false" },
  { label: "Full slide", value: "true" }
] as const;

export const cardLayoutOptions = [
  { label: "Vertical", value: "vertical" },
  { label: "Horizontal", value: "horizontal" }
] as const;

export const cardFlowOptions = [
  { label: "Stack", value: "stack" },
  { label: "Row", value: "row" },
  { label: "Grid", value: "grid" }
] as const;

export const cardWidthOptions = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "Full", value: "full" }
] as const;
