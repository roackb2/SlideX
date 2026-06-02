"use client";

import { useState } from "react";
import {
  hexColorValue,
  type HexColor,
  type PaletteScope,
  type ThemePaletteColors
} from "@/features/studio/application/colorPalettes";
import { Field, type PropValue } from "@/features/studio/ui/inspector/controls/BaseControls";
import { colorSwatchStyle } from "@/features/studio/ui/inspector/color/colorSwatchStyle";
import { slidePalettePresets } from "@/features/studio/ui/inspector/color/palettes";
import { useCustomSwatches } from "@/features/studio/ui/inspector/color/useCustomSwatches";

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
  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false);
  const [isSwatchesOpen, setIsSwatchesOpen] = useState(false);
  const [swatchValue, setSwatchValue] = useState("#ffffff");
  const { customSwatches, persistSwatches } = useCustomSwatches();

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

  function addSwatch(value = swatchValue) {
    const normalized = hexColorValue(value);

    if (!normalized) {
      return;
    }

    persistSwatches([normalized, ...customSwatches]);
    setSwatchValue(normalized);
  }

  function addCurrentThemeSwatches() {
    const currentColors = items
      .map((item) => String(item.value ?? item.placeholder ?? ""))
      .map((color) => hexColorValue(color))
      .filter((color): color is HexColor => Boolean(color));

    persistSwatches([...currentColors, ...customSwatches]);
  }

  function deleteSwatch(color: string) {
    persistSwatches(customSwatches.filter((item) => item.toLowerCase() !== color.toLowerCase()));
  }

  return (
    <Field label={label}>
      <div className="grid gap-1 rounded-md border border-neutral-800 bg-black p-1">
        {slidePalettePresets.map((palette) => (
          <div
            className="grid grid-cols-[1fr_auto] items-center gap-1 rounded border border-transparent transition-colors hover:border-neutral-700 hover:bg-neutral-900"
            key={palette.id}
          >
            <button
              aria-label={`Use ${palette.name} theme on current slide`}
              className="flex min-w-0 items-center justify-between gap-2 px-2 py-1.5 text-left"
              onClick={() => applyPalette(palette.colors, "slide")}
              title={palette.name}
              type="button"
            >
              <span className="truncate text-[11px] text-neutral-200">{palette.name}</span>
              <span className="flex -space-x-1">
                {Object.values(palette.colors).map((color) => (
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 rounded border border-white/20 shadow-inner"
                    key={color}
                    style={colorSwatchStyle(color)}
                  />
                ))}
              </span>
            </button>
            <button
              aria-label={`Use ${palette.name} theme on all slides`}
              className="mr-1 rounded border border-neutral-800 px-1.5 py-1 text-[9px] font-medium text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
              onClick={() => applyPalette(palette.colors, "deck")}
              type="button"
            >
              All
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 rounded-md border border-neutral-800 bg-black/30">
        <button
          className="flex w-full items-center justify-between px-2.5 py-2 text-left text-[11px] text-neutral-300 transition-colors hover:bg-neutral-900"
          onClick={() => setIsFineTuneOpen((current) => !current)}
          type="button"
        >
          <span>Theme colors</span>
          <span className="text-[10px] text-neutral-500">{isFineTuneOpen ? "Hide" : "Show"}</span>
        </button>
        {isFineTuneOpen ? (
          <div className="grid gap-1 border-t border-neutral-800 p-2">
            {items.map((item) => {
              const colorValue = String(item.value ?? "");
              const pickerValue = hexColorValue(colorValue) ?? hexColorValue(item.placeholder ?? "") ?? "#ffffff";

              return (
                <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded border border-neutral-800 bg-black/40 px-2 py-1.5" key={item.id}>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-4 w-4 rounded border border-white/20 shadow-inner" style={colorSwatchStyle(colorValue)} />
                    <span className="truncate text-[10px] text-neutral-300">{item.label}</span>
                  </span>
                  <input
                    aria-label={`${item.label} picker`}
                    className="h-6 w-8 cursor-pointer rounded border border-neutral-800 bg-transparent p-0"
                    onChange={(event) => item.onChange(event.target.value)}
                    type="color"
                    value={pickerValue}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-2 rounded-md border border-neutral-800 bg-black/30">
        <button
          className="flex w-full items-center justify-between px-2.5 py-2 text-left text-[11px] text-neutral-300 transition-colors hover:bg-neutral-900"
          onClick={() => setIsSwatchesOpen((current) => !current)}
          type="button"
        >
          <span>Saved swatches</span>
          <span className="text-[10px] text-neutral-500">{isSwatchesOpen ? "Hide" : "Show"}</span>
        </button>
        {isSwatchesOpen ? (
          <div className="border-t border-neutral-800 p-2">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <input
                className="min-w-0 rounded border border-neutral-800 bg-black px-2 py-1.5 font-mono text-[11px] text-neutral-200 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-500"
                onChange={(event) => setSwatchValue(event.target.value)}
                placeholder="#ffffff"
                type="text"
                value={swatchValue}
              />
              <input
                aria-label="Swatch color picker"
                className="h-8 w-9 cursor-pointer rounded border border-neutral-800 bg-transparent p-0"
                onChange={(event) => setSwatchValue(event.target.value)}
                type="color"
                value={hexColorValue(swatchValue) ?? "#ffffff"}
              />
              <button
                className="rounded border border-neutral-800 px-2 py-1.5 text-[10px] text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
                onClick={() => addSwatch()}
                type="button"
              >
                Add
              </button>
            </div>
            <button
              className="mt-2 w-full rounded border border-neutral-800 px-2 py-1.5 text-[10px] text-neutral-400 transition-colors hover:border-neutral-600 hover:bg-neutral-900 hover:text-white"
              onClick={addCurrentThemeSwatches}
              type="button"
            >
              Add current theme colors
            </button>
            {customSwatches.length > 0 ? (
              <div className="mt-3 grid grid-cols-8 gap-1">
                {customSwatches.map((swatch) => (
                  <button
                    aria-label={`Remove ${swatch}`}
                    className="group relative h-6 rounded border border-neutral-700 transition-transform hover:scale-110"
                    key={swatch}
                    onClick={() => deleteSwatch(swatch)}
                    style={{ background: swatch }}
                    title={`${swatch} - click to remove`}
                    type="button"
                  >
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-[9px] font-semibold text-white group-hover:flex">×</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded border border-dashed border-neutral-800 px-2 py-2 text-[10px] text-neutral-500">No saved swatches yet.</p>
            )}
          </div>
        ) : null}
      </div>
    </Field>
  );
}
