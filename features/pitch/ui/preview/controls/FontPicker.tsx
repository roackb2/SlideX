"use client";

import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { googleFonts } from "@/features/pitch/application/googleFonts";
import { useDynamicFont } from "@/features/pitch/ui/hooks/useDynamicFont";

type FontPickerProps = {
  onChange: (font: string) => void;
  value: string;
};

function FontPreviewItem({ font, isSelected, onClick }: { font: string; isSelected: boolean; onClick: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useDynamicFont(isVisible ? font : null);

  return (
    <button
      ref={ref}
      className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-white/10 ${
        isSelected ? "bg-white/5 text-white" : "text-neutral-300"
      }`}
      onClick={onClick}
      type="button"
      style={isVisible ? { fontFamily: `"${font}", sans-serif` } : {}}
    >
      <span className="truncate">{font}</span>
      {isSelected && <Check className="shrink-0 ml-2" size={14} />}
    </button>
  );
}

export function FontPicker({ onChange, value }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredFonts = useMemo(() => {
    const s = search.toLowerCase();
    return googleFonts.filter((f) => f.toLowerCase().includes(s));
  }, [search]);

  const handleSelect = (font: string) => {
    onChange(font);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger asChild>
        <button
          className="flex w-full items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[13px] font-medium text-neutral-200 outline-none transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.06] focus-visible:ring-1 focus-visible:ring-white/[0.12]"
          title="Font Family"
          type="button"
        >
          <span className="truncate">{value || "Default Font"}</span>
          <ChevronDown className="shrink-0 ml-1 text-neutral-500" size={14} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-[100] flex w-[220px] flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#18181b] p-1 shadow-2xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
          onOpenAutoFocus={(e) => e.preventDefault()}
          sideOffset={8}
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-2 pb-2 pt-1">
            <Search className="text-neutral-500" size={14} />
            <input
              className="w-full bg-transparent text-[12px] text-neutral-200 outline-none placeholder:text-neutral-500"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search fonts..."
              value={search}
            />
          </div>
          <div className="custom-scrollbar mt-1 max-h-[240px] overflow-y-auto">
            <button
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-white/10 ${
                value === "" ? "bg-white/5 text-white" : "text-neutral-300"
              }`}
              onClick={() => handleSelect("")}
              type="button"
            >
              <span>Default Font</span>
              {value === "" && <Check size={14} />}
            </button>
            {filteredFonts.map((font) => (
              <FontPreviewItem
                key={font}
                font={font}
                isSelected={value === font}
                onClick={() => handleSelect(font)}
              />
            ))}
            {filteredFonts.length === 0 && (
              <div className="px-2 py-3 text-center text-[12px] text-neutral-500">
                No fonts found.
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
