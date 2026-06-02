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
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-neutral-400">{label}</span>
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
      <div className={`grid gap-1 rounded-md border border-neutral-800 bg-black p-1 ${optionGridClass(options.length)}`}>
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
      <div className={`grid gap-1 rounded-md border border-neutral-800 bg-black p-1 ${optionGridClass(options.length)}`}>
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
    <div className="relative rounded-md border border-neutral-800 transition-all focus-within:border-neutral-500">
      <select
        className="w-full cursor-pointer appearance-none bg-transparent px-2.5 py-1.5 text-[11px] text-neutral-200 outline-none"
        onChange={(event) => {
          const selectedOption = options.find((option) => option.value === event.target.value);

          if (selectedOption) {
            onChange(selectedOption.value);
          }
        }}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400"
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
        className="w-full rounded-md border border-neutral-800 bg-transparent px-2.5 py-1.5 text-[11px] text-neutral-200 outline-none focus:border-neutral-500"
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

function optionGridClass(optionCount: number) {
  if (optionCount === 2) {
    return "grid-cols-2";
  }

  if (optionCount === 4) {
    return "grid-cols-4";
  }

  return "grid-cols-3";
}
