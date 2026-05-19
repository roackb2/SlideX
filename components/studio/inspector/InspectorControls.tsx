"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MotionDocBlock } from "@/lib/motionDocParser";

export type PropValue = string | number;
export type PropRecord = Record<string, PropValue>;
export type BlockWithProps = Extract<MotionDocBlock, { props: PropRecord }>;

export type BlockFieldProps = {
  block: BlockWithProps;
  selectedBlockIndex: number;
  updateBlock: (blockIndex: number, newProps: PropRecord, newText?: string) => void;
};

export function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-neutral-400">{label}</span>
      {children}
    </div>
  );
}

export function OptionButtons({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <Field label={label}>
      <div className={`grid gap-1 rounded-md border border-neutral-800 bg-black p-1 ${options.length === 2 ? "grid-cols-2" : options.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {options.map((option) => (
          <button
            className={`rounded px-1.5 py-1.5 text-[10px] transition-colors ${
              value === option.value
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function IconSegmentedControl({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ icon: ReactNode; label: string; value: string }>;
  value: string;
}) {
  return (
    <Field label={label}>
      <div className={`grid gap-1 rounded-md border border-neutral-800 bg-black p-1 ${options.length === 2 ? "grid-cols-2" : options.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {options.map((option) => (
          <button
            aria-label={option.label}
            className={`group relative flex h-8 items-center justify-center rounded transition-colors ${
              value === option.value
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            title={option.label}
            type="button"
          >
            {option.icon}
            <span className="sr-only">{option.label}</span>
          </button>
        ))}
      </div>
    </Field>
  );
}

export function NativeSelect({
  onChange,
  options,
  value
}: {
  onChange: (value: string) => void;
  options: ReadonlyArray<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <div className="relative rounded-md border border-neutral-800 transition-all focus-within:border-neutral-500">
      <select
        className="w-full cursor-pointer appearance-none bg-transparent px-2.5 py-1.5 text-[11px] text-neutral-200 outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400">
        <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
    </div>
  );
}

export function TextInput({ label, onChange, placeholder, value }: { label: string; onChange: (value: string) => void; placeholder: string; value: PropValue }) {
  return (
    <Field label={label}>
      <input
        className="w-full rounded-md border border-neutral-800 bg-transparent px-2.5 py-1.5 text-[11px] text-neutral-200 outline-none focus:border-neutral-500"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </Field>
  );
}

export function TextAreaField({ label, onChange, placeholder, rows, value }: { label: string; onChange: (value: string) => void; placeholder: string; rows: number; value: PropValue }) {
  return (
    <Field label={label}>
      <textarea
        className="w-full resize-none rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-[12px] leading-relaxed text-neutral-200 outline-none transition-all placeholder-neutral-700 focus:border-neutral-500"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </Field>
  );
}

export function NumberInput({
  max,
  min,
  onChange,
  placeholder,
  step,
  suffix,
  value
}: {
  max?: string;
  min: string;
  onChange: (value: number | "") => void;
  placeholder?: string;
  step: string;
  suffix?: string;
  value: PropValue;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-md border border-neutral-800 transition-all focus-within:border-neutral-500">
      <input
        className="w-full bg-transparent px-2.5 py-1.5 font-mono text-[11px] text-neutral-200 outline-none"
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value === "" ? "" : parseFloat(event.target.value))}
        placeholder={placeholder}
        step={step}
        type="number"
        value={value}
      />
      {suffix ? <span className="pr-2.5 font-mono text-[10px] text-neutral-400">{suffix}</span> : null}
    </div>
  );
}

export function ColorInput({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <span className="text-[11px] font-medium text-neutral-400">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-neutral-800 p-1.5 transition-colors focus-within:border-neutral-500">
        <input
          className="h-5 w-5 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
          onChange={(event) => onChange(event.target.value)}
          type="color"
          value={value}
        />
        <span className="font-mono text-[11px] uppercase text-neutral-300">{value}</span>
      </div>
    </div>
  );
}

export function ColorControl({
  displayValue,
  label,
  onChange,
  placeholder = "#ffffff",
  presets = defaultColorPresets,
  value
}: {
  displayValue?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  presets?: string[];
  value: PropValue | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const colorValue = String(value ?? "");
  const resolvedValue = colorValue || displayValue || placeholder;
  const pickerValue = hexColorValue(colorValue) ?? hexColorValue(displayValue ?? "") ?? hexColorValue(placeholder) ?? "#ffffff";
  const swatchStyle = colorSwatchStyle(resolvedValue);

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
                {presets.map((preset) => (
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

export function ColorSetControl({
  items,
  label,
  onApplyPalette
}: {
  items: Array<{
    id: string;
    label: string;
    onChange: (value: string) => void;
    placeholder?: string;
    value: PropValue | undefined;
  }>;
  label: string;
  onApplyPalette?: (colors: ThemePaletteColors, scope: "deck" | "slide") => void;
}) {
  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false);

  function applyPalette(colors: ThemePaletteColors, scope: "deck" | "slide") {
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
            {items.filter((item) => item.id === "background" || item.id === "text").map((item) => {
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
    </Field>
  );
}

export type ThemePaletteColors = {
  accent: string;
  background: string;
  muted: string;
  text: string;
};

const slidePalettePresets = [
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
];

const defaultColorPresets = [
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
];

function hexColorValue(value: string) {
  const trimmed = value.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }

  return null;
}

function colorSwatchStyle(value: string) {
  return value.trim()
    ? { background: value }
    : {
        background:
          "linear-gradient(45deg, #3f3f46 25%, transparent 25%), linear-gradient(-45deg, #3f3f46 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3f3f46 75%), linear-gradient(-45deg, transparent 75%, #3f3f46 75%)",
        backgroundColor: "#18181b",
        backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
        backgroundSize: "12px 12px"
      };
}
