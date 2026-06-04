"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";

export type PropValue = string | number;
export type PropRecord = Record<string, PropValue>;
export type BlockWithProps = Extract<MotionDocBlock, { props: PropRecord }>;
export type ControlOption<T extends string = string> = { label: string; value: T };
export type IconControlOption<T extends string = string> = ControlOption<T> & { icon: ReactNode };

export type BlockFieldProps<TBlock extends BlockWithProps = BlockWithProps> = {
  block: TBlock;
  selectedBlockIndex: number;
  updateBlock: (blockIndex: number, newProps: TBlock["props"], newText?: string) => void;
};

export function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      {children}
    </div>
  );
}

export function OptionButtons<T extends string>({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: T) => void;
  options: ReadonlyArray<ControlOption<T>>;
  value: T;
}) {
  return (
    <Field label={label}>
      <div className={`grid gap-1 rounded-xl border border-white/[0.06] bg-black/40 p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] ${optionGridClass(options.length)}`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              className={`rounded-lg py-1.5 text-[10px] font-semibold tracking-wide transition-all duration-200 cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-neutral-800 text-white shadow-md border border-white/[0.05]"
                  : "text-neutral-400 hover:bg-neutral-900/40 hover:text-neutral-200"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

export function IconSegmentedControl<T extends string>({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: T) => void;
  options: ReadonlyArray<IconControlOption<T>>;
  value: T;
}) {
  return (
    <Field label={label}>
      <div className={`grid gap-1 rounded-xl border border-white/[0.06] bg-black/40 p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] ${optionGridClass(options.length)}`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              aria-label={option.label}
              className={`group relative flex h-8 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-neutral-800 text-white shadow-md border border-white/[0.05]"
                  : "text-neutral-400 hover:bg-neutral-900/40 hover:text-neutral-200"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              title={option.label}
              type="button"
            >
              <span className="scale-95 group-hover:scale-100 transition-transform">{option.icon}</span>
              <span className="sr-only">{option.label}</span>
            </button>
          );
        })}
      </div>
    </Field>
  );
}

export function NativeSelect<T extends string>({
  onChange,
  options,
  value
}: {
  onChange: (value: T) => void;
  options: ReadonlyArray<ControlOption<T>>;
  value: T;
}) {
  return (
    <div className="relative rounded-xl border border-white/[0.06] bg-[#090a0f]/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all hover:border-white/[0.14] focus-within:border-[#8ea5ff]/50 focus-within:ring-1 focus-within:ring-[#8ea5ff]/15">
      <select
        className="w-full cursor-pointer appearance-none bg-transparent px-3 py-2 text-[11px] font-medium text-neutral-300 outline-none"
        onChange={(event) => {
          const selectedOption = options.find((option) => option.value === event.target.value);

          if (selectedOption) {
            onChange(selectedOption.value);
          }
        }}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0f1015] text-neutral-200">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        size={11}
      />
    </div>
  );
}

export function TextInput({
  label,
  onChange,
  placeholder,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: PropValue;
}) {
  return (
    <Field label={label}>
      <input
        className="w-full rounded-xl border border-white/[0.06] bg-[#090a0f]/60 px-3 py-2 text-[11px] font-medium text-neutral-300 outline-none transition-all placeholder:text-neutral-700 hover:border-white/[0.12] focus:border-[#8ea5ff]/50 focus:ring-1 focus:ring-[#8ea5ff]/15"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  onChange,
  placeholder,
  rows,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
  value: PropValue;
}) {
  return (
    <Field label={label}>
      <textarea
        className="w-full resize-none rounded-xl border border-white/[0.06] bg-[#090a0f]/60 px-3 py-2.5 text-[11.5px] leading-relaxed text-neutral-300 outline-none transition-all placeholder-neutral-700 hover:border-white/[0.12] focus:border-[#8ea5ff]/50 focus:ring-1 focus:ring-[#8ea5ff]/15"
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
    <div className="flex items-center overflow-hidden rounded-xl border border-white/[0.06] bg-[#090a0f]/60 transition-all hover:border-white/[0.12] focus-within:border-[#8ea5ff]/50 focus-within:ring-1 focus-within:ring-[#8ea5ff]/15">
      <input
        className="w-full bg-transparent px-3 py-2 font-mono text-[11px] text-neutral-300 outline-none"
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value === "" ? "" : parseFloat(event.target.value))}
        placeholder={placeholder}
        step={step}
        type="number"
        value={value}
      />
      {suffix ? <span className="pr-3 font-mono text-[9px] font-bold text-neutral-400">{suffix}</span> : null}
    </div>
  );
}

export function ColorInput({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#090a0f]/60 p-1.5 transition-colors hover:border-white/[0.12] focus-within:border-[#8ea5ff]/50 focus-within:ring-1 focus-within:ring-[#8ea5ff]/15">
        <span className="relative h-5.5 w-5.5 shrink-0 overflow-hidden rounded-full border border-white/[0.12] shadow-md hover:scale-105 transition-transform duration-200">
          <input
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(event) => onChange(event.target.value)}
            type="color"
            value={value}
            aria-label={`${label} hex color picker`}
          />
          <span className="block h-full w-full" style={{ backgroundColor: value }} />
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase text-neutral-300 tracking-wider pl-1">{value}</span>
      </div>
    </div>
  );
}

function optionGridClass(optionCount: number) {
  if (optionCount === 2) {
    return "grid-cols-2";
  }

  if (optionCount === 4) {
    return "grid-cols-4";
  }

  return "grid-cols-3";
}
