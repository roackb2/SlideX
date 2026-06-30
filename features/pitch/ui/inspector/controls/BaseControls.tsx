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
    <div className="flex flex-col gap-1.5">
      {label ? <span className="text-[12px] font-medium text-neutral-500">{label}</span> : null}
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
      <div className="flex w-full gap-0.5 rounded-lg bg-white/[0.03] p-0.5 overflow-x-auto custom-scrollbar">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              className={`flex-1 min-w-0 flex items-center justify-center rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                isSelected
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              <span className="truncate whitespace-nowrap">{option.label}</span>
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
      <div className="flex w-full gap-0.5 rounded-lg bg-white/[0.03] p-0.5">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              aria-label={option.label}
              className={`group relative flex-1 flex h-7 items-center justify-center rounded-md transition-colors cursor-pointer ${
                isSelected
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300"
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
    <div className="relative rounded-lg bg-white/[0.03] transition-colors hover:bg-white/[0.05] focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/[0.12]">
      <select
        className="w-full cursor-pointer appearance-none bg-transparent pl-3 pr-8 py-1.5 text-[13px] text-neutral-200 outline-none"
        onChange={(event) => {
          const selectedOption = options.find((option) => option.value === event.target.value);

          if (selectedOption) {
            onChange(selectedOption.value);
          }
        }}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-neutral-900 text-neutral-200">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
        size={14}
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
        className="w-full rounded-lg bg-white/[0.03] px-3 py-1.5 text-[13px] text-neutral-200 outline-none transition-colors placeholder:text-neutral-600 hover:bg-white/[0.05] focus:bg-white/[0.06] focus:ring-1 focus:ring-white/[0.12]"
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
        className="w-full resize-none rounded-lg bg-white/[0.03] px-3 py-1.5 text-[13px] leading-relaxed text-neutral-200 outline-none transition-colors placeholder:text-neutral-600 hover:bg-white/[0.05] focus:bg-white/[0.06] focus:ring-1 focus:ring-white/[0.12]"
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
  prefix,
  step,
  suffix,
  value
}: {
  max?: string;
  min: string;
  onChange: (value: number | "") => void;
  placeholder?: string;
  prefix?: React.ReactNode;
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
    <div className="flex items-center overflow-hidden rounded-lg bg-white/[0.03] transition-colors hover:bg-white/[0.05] focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/[0.12]">
      {prefix ? <span className="pl-2.5 flex items-center text-neutral-500">{prefix}</span> : null}
      <input
        className="w-full bg-transparent px-2.5 py-1.5 font-mono text-[13px] text-neutral-200 outline-none"
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
      {suffix ? <span className="pr-2.5 font-mono text-[13px] text-neutral-500">{suffix}</span> : null}
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
    <div className="flex flex-1 flex-col gap-1.5">
      <span className="text-[12px] font-medium text-neutral-500">{label}</span>
      <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] p-1.5 transition-colors hover:bg-white/[0.05] focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/[0.12]">
        <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-[4px] border border-white/10 shadow-sm hover:scale-105 transition-transform duration-200">
          <input
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(event) => onChange(event.target.value)}
            type="color"
            value={value}
            aria-label={`${label} hex color picker`}
          />
          <span className="block h-full w-full" style={{ backgroundColor: value }} />
        </span>
        <span className="font-mono text-[13px] text-neutral-300 pl-1">{value}</span>
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
