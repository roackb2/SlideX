"use client";

import type { PointerEvent } from "react";
import { Minus } from "lucide-react";
import { hexColorValue, uniqueColors } from "@/features/pitch/application/colorPalettes";
import { colorSwatchStyle } from "@/features/pitch/ui/inspector/color/colorSwatchStyle";
import { defaultColorPresets } from "@/features/pitch/ui/inspector/color/palettes";
import { useCustomSwatches } from "@/features/pitch/ui/inspector/color/useCustomSwatches";

type CompactColorPanelProps = {
  closeAfterSelect?: boolean;
  label: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  placeholder?: string;
  value: string;
};

export function CompactColorPanel({
  closeAfterSelect = false,
  label,
  onChange,
  onClose,
  placeholder = "inherit",
  value
}: CompactColorPanelProps) {
  const { customSwatches } = useCustomSwatches();
  const presets = uniqueColors([...customSwatches, ...defaultColorPresets]);
  const pickerValue = hexColorValue(value) ?? hexColorValue(placeholder) ?? "#ffffff";
  const swatchStyle = colorSwatchStyle(value || placeholder);

  function selectColor(nextValue: string) {
    onChange(nextValue);
    if (closeAfterSelect) onClose?.();
  }

  return (
    <>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="h-7 w-7 shrink-0 rounded-md border border-white/15 shadow-inner" style={swatchStyle} />
        <input
          aria-label={`${label} value`}
          className="min-w-0 flex-1 rounded border border-neutral-800 bg-black px-2 py-1 font-mono text-[11px] text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-neutral-500"
          onChange={(event) => onChange(event.target.value)}
          onPointerDown={stopPointer}
          placeholder={placeholder}
          type="text"
          value={value}
        />
        <button
          aria-label={`Clear ${label.toLowerCase()}`}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
          onPointerDown={(event) => {
            stopPointer(event, true);
            selectColor("");
          }}
          type="button"
        >
          <Minus size={12} />
        </button>
      </div>
      <div className="mb-2.5 flex items-center gap-2">
        <input
          aria-label={`${label} picker`}
          className="h-7 flex-1 cursor-pointer rounded border border-neutral-800 bg-transparent p-0"
          onChange={(event) => onChange(event.target.value)}
          onPointerDown={stopPointer}
          type="color"
          value={pickerValue}
        />
        <span className="font-mono text-[11px] text-neutral-500">{pickerValue.toUpperCase()}</span>
      </div>
      <div className="grid grid-cols-8 gap-1">
        <button
          aria-label="Use transparent"
          className={`relative flex h-5 items-center justify-center overflow-hidden rounded border transition-transform hover:scale-110 ${value === "transparent" ? "border-white" : "border-neutral-700 bg-neutral-900"}`}
          onPointerDown={(event) => {
            stopPointer(event, true);
            selectColor("transparent");
          }}
          type="button"
        >
          <span className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM0NCIvPjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM0NCIvPjwvc3ZnPg==')] opacity-50" />
          <span className="absolute inset-0 m-auto h-[2px] w-[140%] -rotate-45 bg-red-500/80" />
        </button>
        {presets.map((preset) => (
          <button
            aria-label={`Use ${preset}`}
            className={`h-5 rounded border transition-transform hover:scale-110 ${value.toLowerCase() === preset.toLowerCase() ? "border-white" : "border-neutral-700"}`}
            key={preset}
            onPointerDown={(event) => {
              stopPointer(event, true);
              selectColor(preset);
            }}
            style={{ background: preset }}
            type="button"
          />
        ))}
      </div>
    </>
  );
}

function stopPointer(event: PointerEvent<HTMLElement>, preventDefault = false) {
  event.stopPropagation();
  if (preventDefault) event.preventDefault();
}
