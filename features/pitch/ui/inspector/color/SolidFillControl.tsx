"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { hexColorValue } from "@/features/pitch/application/colorPalettes";

const templateColors = [
  "#000000",
  "#ffffff",
  "#d7d7d4",
  "#8b8b89",
  "#ec5f39",
  "#d96d51",
  "#f6b11a",
  "#3980ee",
  "#36a269",
  "#8f5dea",
  "#e5419c",
  "#5d6a7e"
] as const;

type SolidFillControlProps = {
  value: string;
  onChange: (color: string) => void;
};

export function SolidFillControl({ value, onChange }: SolidFillControlProps) {
  const [isOpen, setIsOpen] = useState(true);
  const color = hexColorValue(value) ?? "#000000";

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#09090a] p-2">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.045] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span className="flex items-center gap-2.5">
          <span className="h-5 w-5 rounded-md border border-white/20 shadow-inner" style={{ backgroundColor: color }} />
          <span>
            <span className="block text-[12px] font-medium text-neutral-200">Solid fill</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-500">{color}</span>
          </span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-neutral-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="px-2 pb-2 pt-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#151515] px-2 py-1.5">
            <input
              aria-label="Choose solid fill"
              className="h-7 w-9 cursor-pointer rounded border border-white/15 bg-transparent p-0"
              onChange={(event) => onChange(event.target.value)}
              type="color"
              value={color}
            />
            <span className="font-mono text-xs text-neutral-200">{color.toUpperCase()}</span>
            <span className="ml-auto text-[10px] text-neutral-500">Current slide</span>
          </div>

          <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">Template colors</p>
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {templateColors.map((templateColor) => (
              <button
                aria-label={`Use ${templateColor}`}
                className={`aspect-square rounded-md border transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  color.toLowerCase() === templateColor.toLowerCase() ? "border-white" : "border-white/15"
                }`}
                key={templateColor}
                onClick={() => onChange(templateColor)}
                style={{ backgroundColor: templateColor }}
                type="button"
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
