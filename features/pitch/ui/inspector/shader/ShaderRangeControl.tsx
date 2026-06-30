"use client";

import type { LucideIcon } from "lucide-react";

type ShaderRangeControlProps = {
  ariaLabel: string;
  badge: string;
  icon: LucideIcon;
  label: string;
  max: string;
  min: string;
  onChange: (value: number) => void;
  step: string;
  surfaceClassName?: string;
  value: number;
};

export function ShaderRangeControl({
  ariaLabel,
  badge,
  icon: Icon,
  label,
  max,
  min,
  onChange,
  step,
  surfaceClassName = "p-1.5 rounded-[1.25rem] border border-white/[0.03] bg-[#0A0A0C]/50 shadow-[0_4px_24px_rgba(0,0,0,0.15)]",
  value
}: ShaderRangeControlProps) {
  const percentage = ((value - Number(min)) / (Number(max) - Number(min))) * 100;

  return (
    <div className="flex flex-col gap-2 py-2 group">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-neutral-400 group-hover:text-neutral-300 transition-colors">
          {label}
        </span>
        <span className="font-mono text-[11px] text-neutral-500 group-hover:text-neutral-400 transition-colors">
          {badge}
        </span>
      </div>
      <div className="flex items-center h-4 relative">
        <input
          aria-label={ariaLabel}
          className="absolute inset-0 w-full h-1 m-auto cursor-pointer appearance-none rounded-full outline-none transition-all
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-400 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-all
                     group-hover:[&::-webkit-slider-thumb]:scale-[1.3] group-hover:[&::-webkit-slider-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,0.4) ${percentage}%, rgba(255,255,255,0.08) ${percentage}%)`
          }}
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          step={step}
          type="range"
          value={value}
        />
      </div>
    </div>
  );
}
