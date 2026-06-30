"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { Locale } from "@/common/lib/i18n";
import { getBrieflyCopy, getOptionLabel } from "@/features/briefly/application/brieflyCopy";
import { joinLines, splitLines } from "@/features/briefly/ui/sectionData";

type SectionEditorCopy = ReturnType<typeof getBrieflyCopy>["sectionEditor"];

export function FieldShell({
  label,
  helper,
  children
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-white/90">{label}</span>
      {children}
      {helper ? <span className="text-xs leading-5 text-white/60">{helper}</span> : null}
    </label>
  );
}

export function inputClass() {
  return "min-h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/[0.06]";
}

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
  helper
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  helper?: string;
}) {
  return (
    <FieldShell label={label} helper={helper}>
      <input
        className={inputClass()}
        onChange={(event) => onChange(event.target.value)}
        placeholder={helper}
        type={type}
        value={value}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  helper
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  helper?: string;
}) {
  return (
    <FieldShell label={label} helper={helper}>
      <textarea
        className={`${inputClass()} resize-y leading-6`}
        onChange={(event) => onChange(event.target.value)}
        placeholder={helper}
        rows={rows}
        value={value}
      />
    </FieldShell>
  );
}

export function SelectInput({
  label,
  value,
  options,
  locale,
  copy,
  onChange
}: {
  label: string;
  value: string;
  options: readonly string[];
  locale: Locale;
  copy: SectionEditorCopy;
  onChange: (value: string) => void;
}) {
  return (
    <FieldShell label={label}>
      <div className="relative">
        <select
          className={`${inputClass()} appearance-none pr-8 cursor-pointer text-white/90`}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="" className="bg-[#111] text-white/90">{copy.unset}</option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#111] text-white/90">
              {getOptionLabel(option, locale)}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white/50">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </FieldShell>
  );
}

export function ListTextArea({
  label,
  helper,
  copy,
  items,
  onChange
}: {
  label: string;
  helper?: string;
  copy: SectionEditorCopy;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <FieldShell label={label} helper={copy.listHelper}>
      <textarea
        className={`${inputClass()} resize-y leading-6`}
        onChange={(event) => onChange(splitLines(event.target.value))}
        placeholder={helper}
        rows={4}
        value={joinLines(items)}
      />
    </FieldShell>
  );
}

export function Checklist({
  label,
  options,
  selected,
  locale,
  copy,
  onChange
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  locale: Locale;
  copy: SectionEditorCopy;
  onChange: (items: string[]) => void;
}) {
  const [customValue, setCustomValue] = useState("");
  const suggestions = options.filter((option) => !selected.includes(option));

  function addItem(value: string) {
    const item = value.trim();

    if (!item || selected.includes(item)) {
      setCustomValue("");
      return;
    }

    onChange([...selected, item]);
    setCustomValue("");
  }

  function removeItem(value: string) {
    onChange(selected.filter((item) => item !== value));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addItem(customValue);
    }
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium text-white/90">{label}</p>

      <div className="flex flex-wrap gap-2">
        {selected.length ? (
          selected.map((item) => (
            <span
              key={item}
              className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-medium text-white"
            >
              {getOptionLabel(item, locale)}
              <button
                type="button"
                aria-label={`${copy.removeItem} ${getOptionLabel(item, locale)}`}
                onClick={() => removeItem(item)}
                className="flex h-5 w-5 items-center justify-center rounded-md text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                x
              </button>
            </span>
          ))
        ) : (
          <p className="text-sm text-white/50">{copy.noTags}</p>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          className={inputClass()}
          onChange={(event) => setCustomValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={copy.customTag}
          value={customValue}
        />
        <button
          type="button"
          onClick={() => addItem(customValue)}
          className="min-h-10 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/20"
        >
          {copy.add}
        </button>
      </div>

      {suggestions.length ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => addItem(option)}
              className="min-h-7 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white"
            >
              + {getOptionLabel(option, locale)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
