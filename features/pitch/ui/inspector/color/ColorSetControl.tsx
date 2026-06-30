"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  type PaletteScope,
  type ThemePaletteColors
} from "@/features/pitch/application/colorPalettes";
import type { PropValue } from "@/features/pitch/ui/inspector/controls/BaseControls";
import { slidePalettePresets } from "@/features/pitch/ui/inspector/color/palettes";

type ColorSetItem = {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: PropValue | undefined;
};

type ColorSetControlProps = {
  items: ColorSetItem[];
  label: string;
  onApplyPalette?: (colors: ThemePaletteColors, scope: PaletteScope) => void;
};

export function ColorSetControl({ items, label, onApplyPalette }: ColorSetControlProps) {
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isColorsOpen, setIsColorsOpen] = useState(false);

  function applyPalette(colors: ThemePaletteColors, scope: PaletteScope) {
    if (onApplyPalette) {
      onApplyPalette(colors, scope);
      return;
    }

    items[0]?.onChange(colors.background);
    items[1]?.onChange(colors.text);
    items[2]?.onChange(colors.muted);
    items[3]?.onChange(colors.accent);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Current Theme Colors */}
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setIsColorsOpen(!isColorsOpen)}
          className="group flex w-full items-center justify-between rounded-lg border border-white/[0.04] bg-[#0c0c0c] p-3 text-left transition-colors hover:bg-white/[0.02]"
        >
          <span className="text-[12px] font-medium text-neutral-300">Theme Colors</span>
          <ChevronDown 
            size={14} 
            className={`text-neutral-500 transition-transform duration-300 ${isColorsOpen ? "rotate-180" : ""}`} 
          />
        </button>
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: isColorsOpen ? "1fr" : "0fr", opacity: isColorsOpen ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <div className="mt-1 flex flex-col gap-1 rounded-xl border border-white/[0.04] bg-[#050505] p-1.5 shadow-inner">
              {items.map((item) => {
                const colorValue = String(item.value || item.placeholder || "#ffffff");
                return (
                  <label key={item.id} className="group flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/[0.04]">
                    <span className="text-[11.5px] font-medium text-neutral-400 group-hover:text-neutral-200">
                      {item.label}
                    </span>
                    <div className="relative flex items-center justify-center">
                      <span 
                        className="absolute h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] pointer-events-none" 
                        style={{ backgroundColor: colorValue }} 
                      />
                      <input
                        className="h-5 w-5 cursor-pointer opacity-0"
                        onChange={(event) => item.onChange(event.target.value)}
                        type="color"
                        value={colorValue}
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Color Presets */}
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setIsPresetsOpen(!isPresetsOpen)}
          className="group flex w-full items-center justify-between rounded-lg border border-white/[0.04] bg-[#0c0c0c] p-3 text-left transition-colors hover:bg-white/[0.02]"
        >
          <span className="text-[12px] font-medium text-neutral-300">{label}</span>
          <ChevronDown 
            size={14} 
            className={`text-neutral-500 transition-transform duration-300 ${isPresetsOpen ? "rotate-180" : ""}`} 
          />
        </button>

        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: isPresetsOpen ? "1fr" : "0fr", opacity: isPresetsOpen ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <div className="mt-1 grid grid-cols-4 gap-1.5 rounded-xl border border-white/[0.04] bg-[#050505] p-2 shadow-inner">
              {slidePalettePresets.map((palette) => (
                <button
                  key={palette.id}
                  aria-label={`Use ${palette.name} theme`}
                  className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border border-white/[0.08] outline-none transition-all duration-300 hover:scale-105 hover:border-white/20 active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  onClick={() => applyPalette(palette.colors, "deck")}
                  style={{ backgroundColor: palette.colors.background }}
                  title={palette.name}
                  type="button"
                >
                  {/* Abstract layout representation of the theme */}
                  <div 
                    className="absolute top-1.5 left-1.5 h-1.5 w-6 rounded-full opacity-80" 
                    style={{ backgroundColor: palette.colors.text }} 
                  />
                  <div 
                    className="absolute top-4 left-1.5 h-1 w-4 rounded-full opacity-50" 
                    style={{ backgroundColor: palette.colors.muted }} 
                  />
                  <div 
                    className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]" 
                    style={{ backgroundColor: palette.colors.accent }} 
                  />
                  
                  {/* Tooltip hover effect */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-center text-[9px] font-semibold leading-tight text-white drop-shadow-md px-1">
                      {palette.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
