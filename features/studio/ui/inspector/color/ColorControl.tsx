"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
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
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
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

    function updatePopoverPosition() {
      const rect = buttonRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const width = 260;
      const margin = 12;
      const left = Math.min(Math.max(rect.right - width, margin), Math.max(window.innerWidth - width - margin, margin));
      const top = window.innerHeight - rect.bottom < 330
        ? Math.max(margin, rect.top - 334)
        : rect.bottom + 8;

      setPopoverStyle({
        left,
        position: "fixed",
        top,
        width,
        zIndex: 1000
      });
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    updatePopoverPosition();
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <Field label={label}>
      <div>
        <button
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-black/30 px-3.5 py-2.5 text-left transition-colors hover:border-neutral-600 hover:bg-neutral-900/70"
          onClick={() => setIsOpen((current) => !current)}
          ref={buttonRef}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-5 w-5 shrink-0 rounded border border-white/20 shadow-inner" style={swatchStyle} />
            <span className="truncate font-mono text-xs text-neutral-200">{colorValue || displayValue || "Default"}</span>
          </span>
          <span className="text-xs text-neutral-500">{isOpen ? "Close" : "Edit"}</span>
        </button>

        {isOpen && typeof document !== "undefined" ? createPortal(
          <div
            className="rounded-xl border border-neutral-700 bg-[#111111] p-3.5 shadow-2xl shadow-black/60"
            ref={panelRef}
            style={popoverStyle}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">{label}</span>
              <button
                className="rounded border border-neutral-800 px-2.5 py-1 text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                onClick={() => onChange("")}
                type="button"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 shrink-0 rounded-md border border-white/15 shadow-inner" style={swatchStyle} />
              <div className="min-w-0 flex-1">
                <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-neutral-500">CSS Color</label>
                <input
                  className="w-full rounded border border-neutral-800 bg-black px-2 py-1.5 font-mono text-xs text-neutral-200 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-500"
                  onChange={(event) => onChange(event.target.value)}
                  placeholder={placeholder}
                  type="text"
                  value={colorValue}
                />
                {!colorValue && displayValue ? (
                  <p className="mt-1 truncate text-[11px] text-neutral-500">Current: {displayValue}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-3.5">
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-neutral-500">Picker</label>
              <div className="flex items-center gap-2">
                <input
                  aria-label={`${label} picker`}
                  className="h-8 flex-1 cursor-pointer rounded border border-neutral-800 bg-transparent p-0"
                  onChange={(event) => onChange(event.target.value)}
                  type="color"
                  value={pickerValue}
                />
                <span className="font-mono text-xs text-neutral-500">{pickerValue.toUpperCase()}</span>
              </div>
            </div>
            <div className="mt-3.5">
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-neutral-500">Presets</label>
              <div className="grid grid-cols-8 gap-1">
                <button
                  aria-label="Use transparent"
                  className={`relative flex h-6 items-center justify-center overflow-hidden rounded border transition-transform hover:scale-110 ${
                    colorValue === "transparent" ? "border-white" : "border-neutral-700 bg-neutral-900"
                  }`}
                  onClick={() => onChange("transparent")}
                  title="Transparent"
                  type="button"
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM0NCIvPjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM0NCIvPjwvc3ZnPg==')] opacity-50" />
                  <div className="absolute inset-0 m-auto h-[2px] w-[140%] -rotate-45 bg-red-500/80" />
                </button>
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
          </div>,
          document.body
        ) : null}
      </div>
    </Field>
  );
}
