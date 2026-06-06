"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
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
    <div className="flex flex-col gap-2.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">{label}</span>
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
      <div className={`grid gap-1 rounded-[1rem] border border-white/[0.04] bg-white/[0.02] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] ${optionGridClass(options.length)}`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              className={`rounded-lg py-1.5 text-xs font-bold tracking-wide transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-[0.96] ${
                isSelected
                  ? "bg-white/[0.08] text-white shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-white/[0.05]"
                  : "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200"
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
      <div className={`grid gap-1 rounded-[1rem] border border-white/[0.04] bg-white/[0.02] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] ${optionGridClass(options.length)}`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              aria-label={option.label}
              className={`group relative flex h-8.5 items-center justify-center rounded-lg transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer active:scale-[0.96] ${
                isSelected
                  ? "bg-white/[0.08] text-white shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-white/[0.05]"
                  : "text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200"
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
    <div className="relative rounded-[1rem] border border-white/[0.05] bg-[#020202] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.03)] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.1] focus-within:border-white/[0.2] focus-within:ring-1 focus-within:ring-white/[0.1]">
      <select
        className="w-full cursor-pointer appearance-none bg-transparent pl-3.5 pr-8 py-2.5 text-sm font-semibold text-neutral-300 outline-none"
        onChange={(event) => {
          const selectedOption = options.find((option) => option.value === event.target.value);

          if (selectedOption) {
            onChange(selectedOption.value);
          }
        }}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0e0e12] text-neutral-200">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        size={12}
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
        className="w-full rounded-[1rem] border border-white/[0.05] bg-[#020202] px-3.5 py-2.5 text-sm font-semibold text-neutral-300 outline-none transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-neutral-700 hover:border-white/[0.1] focus:border-white/[0.2] focus:ring-1 focus:ring-white/[0.1] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.03)]"
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
        className="w-full resize-none rounded-[1rem] border border-white/[0.05] bg-[#020202] px-3.5 py-2.5 text-sm leading-relaxed text-neutral-300 outline-none transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder-neutral-700 hover:border-white/[0.1] focus:border-white/[0.2] focus:ring-1 focus:ring-white/[0.1] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.03)]"
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
  const [draftValue, setDraftValue] = useState(String(value ?? ""));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraftValue(String(value ?? ""));
    }
  }, [isFocused, value]);

  return (
    <div className="flex items-center overflow-hidden rounded-[1rem] border border-white/[0.05] bg-[#020202] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.1] focus-within:border-white/[0.2] focus-within:ring-1 focus-within:ring-white/[0.1] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.03)]">
      <input
        className="w-full bg-transparent px-3.5 py-2.5 font-mono text-sm text-neutral-300 outline-none"
        inputMode="decimal"
        max={max}
        min={min}
        onBlur={() => {
          setIsFocused(false);
          setDraftValue(String(value ?? ""));
        }}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraftValue(nextValue);
          onChange(nextValue === "" ? "" : parseFloat(nextValue));
        }}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        step={step}
        type="text"
        value={isFocused ? draftValue : value}
      />
      {suffix ? <span className="pr-3.5 font-mono text-sm font-semibold text-neutral-400">{suffix}</span> : null}
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
    <div className="flex flex-1 flex-col gap-2.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">{label}</span>
      <div className="flex items-center gap-2 rounded-[1rem] border border-white/[0.05] bg-[#020202] p-1.5 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.1] focus-within:border-white/[0.2] focus-within:ring-1 focus-within:ring-white/[0.1] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.03)]">
        <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/[0.08] shadow-md hover:scale-105 transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <input
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(event) => onChange(event.target.value)}
            type="color"
            value={value}
            aria-label={`${label} hex color picker`}
          />
          <span className="block h-full w-full" style={{ backgroundColor: value }} />
        </span>
        <span className="font-mono text-sm font-semibold uppercase text-neutral-300 tracking-wider pl-1.5">{value}</span>
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
