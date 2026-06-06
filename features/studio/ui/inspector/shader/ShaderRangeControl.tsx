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
  return (
    <div className={`backdrop-blur-xl flex flex-col ${surfaceClassName}`}>
      <div className="p-3.5 rounded-[1rem] border border-white/[0.03] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] flex flex-col gap-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              <Icon size={10} />
            </span>
            {label}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] font-mono text-xs text-neutral-300 tracking-wide shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            {badge}
          </span>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <input
            aria-label={ariaLabel}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/[0.05] accent-[#a855f7] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#a855f7] [&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(168,85,247,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all [&::-webkit-slider-thumb]:hover:scale-110"
            max={max}
            min={min}
            onChange={(event) => onChange(Number(event.target.value))}
            step={step}
            type="range"
            value={value}
          />
        </div>
      </div>
    </div>
  );
}
