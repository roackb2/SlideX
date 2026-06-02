"use client";

import { useEffect, useRef, useState } from "react";
import { hexColorValue, uniqueColors } from "@/features/studio/application/colorPalettes";
import { Field, type PropValue } from "@/features/studio/ui/inspector/controls/BaseControls";
import { colorSwatchStyle } from "@/features/studio/ui/inspector/color/colorSwatchStyle";
import { defaultColorPresets } from "@/features/studio/ui/inspector/color/palettes";
import { useCustomSwatches } from "@/features/studio/ui/inspector/color/useCustomSwatches";

type ColorControlProps = {
  displayValue?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  presets?: readonly string[];
  value: PropValue | undefined;
};

export function ColorControl({
  displayValue,
  label,
  onChange,
  placeholder = "#ffffff",
  presets = defaultColorPresets,
  value
}: ColorControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { customSwatches } = useCustomSwatches();
  const colorValue = String(value ?? "");
  const resolvedValue = colorValue || displayValue || placeholder;
  const pickerValue = hexColorValue(colorValue) ?? hexColorValue(displayValue ?? "") ?? hexColorValue(placeholder) ?? "#ffffff";
  const swatchStyle = colorSwatchStyle(resolvedValue);
  const resolvedPresets = uniqueColors([...customSwatches, ...presets]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (popoverRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <Field label={label}>
      <div className="relative" ref={popoverRef}>
        <button
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between rounded-md border border-neutral-800 bg-black/30 px-2.5 py-2 text-left transition-colors hover:border-neutral-600 hover:bg-neutral-900/70"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-5 w-5 shrink-0 rounded border border-white/20 shadow-inner" style={swatchStyle} />
            <span className="truncate font-mono text-[11px] text-neutral-200">{colorValue || displayValue || "Default"}</span>
          </span>
          <span className="text-[10px] text-neutral-500">{isOpen ? "Close" : "Edit"}</span>
        </button>

        {isOpen ? (
          <div className="absolute right-0 top-full z-50 mt-2 w-[260px] rounded-lg border border-neutral-700 bg-[#111111] p-3 shadow-2xl shadow-black/60">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{label}</span>
              <button
                className="rounded border border-neutral-800 px-2 py-1 text-[10px] text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                onClick={() => onChange("")}
                type="button"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 shrink-0 rounded-md border border-white/15 shadow-inner" style={swatchStyle} />
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-500">CSS color</label>
                <input
                  className="w-full rounded border border-neutral-800 bg-black px-2 py-1.5 font-mono text-[11px] text-neutral-200 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-500"
                  onChange={(event) => onChange(event.target.value)}
                  placeholder={placeholder}
                  type="text"
                  value={colorValue}
                />
                {!colorValue && displayValue ? (
                  <p className="mt-1 truncate text-[9px] text-neutral-500">Current: {displayValue}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-500">Picker</label>
              <div className="flex items-center gap-2">
                <input
                  aria-label={`${label} picker`}
                  className="h-8 flex-1 cursor-pointer rounded border border-neutral-800 bg-transparent p-0"
                  onChange={(event) => onChange(event.target.value)}
                  type="color"
                  value={pickerValue}
                />
                <span className="font-mono text-[10px] text-neutral-500">{pickerValue.toUpperCase()}</span>
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-500">Presets</label>
              <div className="grid grid-cols-8 gap-1">
                {resolvedPresets.map((preset) => (
                  <button
                    aria-label={`Use ${preset}`}
                    className={`h-6 rounded border transition-transform hover:scale-110 ${
                      colorValue.toLowerCase() === preset.toLowerCase() ? "border-white" : "border-neutral-700"
                    }`}
                    key={preset}
                    onClick={() => onChange(preset)}
                    style={{ background: preset }}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Field>
  );
}
