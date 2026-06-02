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
  surfaceClassName = "rounded-xl border-white/[0.04] bg-neutral-950/40",
  value
}: ShaderRangeControlProps) {
  return (
    <div className={`p-3.5 border backdrop-blur-md flex flex-col gap-2.5 ${surfaceClassName}`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Icon size={11} className="text-[#8ea5ff]" />
          {label}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-[#8ea5ff]/10 border border-[#8ea5ff]/20 font-mono text-[9px] text-[#8ea5ff] font-bold">
          {badge}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          aria-label={ariaLabel}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/[0.06] accent-[#8ea5ff] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8ea5ff] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(142,165,255,0.4)] transition-all [&::-webkit-slider-thumb]:hover:scale-110"
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
