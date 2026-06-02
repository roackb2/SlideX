"use client";

import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { slidexIconNames, isSlideXIconName, lucideIconLabels, lucideIconPaths } from "@/core/motion-doc/domain/lucideIconRegistry";

export function IconPicker({
  value,
  onChange
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filteredIcons = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return slidexIconNames;
    }

    return slidexIconNames.filter((name) => {
      const label = lucideIconLabels[name].toLowerCase();
      return name.toLowerCase().includes(search) || label.includes(search);
    });
  }, [query]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-neutral-400">Lucide icon</span>
        {value ? (
          <button
            className="text-[10px] text-neutral-400 transition-colors hover:text-white"
            onClick={() => onChange("")}
            type="button"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-2 rounded-md border border-neutral-800 px-2.5 py-1.5 focus-within:border-neutral-500">
        <SearchIcon size={12} className="shrink-0 text-neutral-400" />
        <input
          className="w-full bg-transparent text-[11px] text-neutral-200 outline-none placeholder:text-neutral-500"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search icons"
          type="search"
          value={query}
        />
      </div>
      <div className="grid max-h-44 grid-cols-4 gap-1.5 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-950/50 p-1.5 custom-scrollbar">
        {filteredIcons.map((name) => {
          const isSelected = value === name;
          return (
            <button
              aria-label={`Use ${lucideIconLabels[name]} icon`}
              className={`flex h-12 flex-col items-center justify-center gap-1 rounded-md border text-[9px] transition-all ${
                isSelected
                  ? "border-neutral-400 bg-neutral-800 text-white"
                  : "border-transparent text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
              key={name}
              onClick={() => onChange(name)}
              title={lucideIconLabels[name]}
              type="button"
            >
              <LucideIconPreview name={name} />
              <span className="max-w-full truncate px-1">{lucideIconLabels[name]}</span>
            </button>
          );
        })}
        {filteredIcons.length === 0 ? (
          <div className="col-span-4 px-2 py-6 text-center text-[10px] text-neutral-400">No icons found</div>
        ) : null}
      </div>
      {value && !isSlideXIconName(value) ? (
        <span className="text-[10px] leading-relaxed text-amber-400/80">This icon is not in the local export registry yet.</span>
      ) : null}
    </div>
  );
}

function LucideIconPreview({ name }: { name: string }) {
  if (!isSlideXIconName(name)) {
    return <span className="h-4 w-4" />;
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {lucideIconPaths[name].map((path, index) => renderIconPath(path, `${name}-${index}`))}
    </svg>
  );
}

function renderIconPath(path: string, key: string) {
  const [shape, ...parts] = path.split(" ");

  if (shape === "circle") {
    return <circle cx={parts[0]} cy={parts[1]} key={key} r={parts[2]} />;
  }

  if (shape === "ellipse") {
    return <ellipse cx={parts[0]} cy={parts[1]} key={key} rx={parts[2]} ry={parts[3]} />;
  }

  if (shape === "rect") {
    return <rect height={parts[3]} key={key} rx={parts[4]} ry={parts[5]} width={parts[2]} x={parts[0]} y={parts[1]} />;
  }

  return <path d={shape === "path" ? parts.join(" ") : path} key={key} />;
}
