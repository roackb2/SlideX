"use client";

import { Check } from "lucide-react";
import type { TemplateChooserItem } from "@/core/motion-doc/presets/templateChooser";


export function CompactTemplateCard({
  item,
  onSelect,
  selected
}: {
  item: TemplateChooserItem;
  onSelect: (itemId: string) => void;
  selected: boolean;
}) {
  return (
    <button
      aria-label={item.name}
      className={`group relative aspect-video overflow-hidden rounded-xl border text-left transition-all duration-300 cursor-pointer active:scale-[0.98] ${
        selected ? "border-[#8ea5ff] shadow-[0_0_0_2px_rgba(142,165,255,0.3)]" : "border-white/[0.08] hover:border-white/[0.22]"
      }`}
      onClick={() => onSelect(item.id)}
      type="button"
    >
      <TemplatePreview compact item={item} />
      {selected && <SelectedBadge compact />}
      {item.kind === "deck" && (
        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[8px] font-bold text-white/85 backdrop-blur-sm">
          {item.slideCount}p
        </span>
      )}
    </button>
  );
}

export function LabeledTemplateCard({
  item,
  large = false,
  onSelect,
  selected
}: {
  item: TemplateChooserItem;
  large?: boolean;
  onSelect: (itemId: string) => void;
  selected: boolean;
}) {
  return (
    <button className="group w-full min-w-0 text-left cursor-pointer" onClick={() => onSelect(item.id)} type="button">
      <div
        className={`relative aspect-video overflow-hidden rounded-xl border bg-black transition-all duration-300 ${
          selected
            ? "border-[#8ea5ff] shadow-[0_0_0_3px_rgba(142,165,255,0.3)]"
            : "border-white/[0.08] group-hover:border-white/[0.22]"
        }`}
      >
        <TemplatePreview large={large} item={item} />
        {selected && <SelectedBadge />}
        <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[8px] font-bold text-white/85 backdrop-blur-sm">
          {item.kind === "deck" ? `${item.slideCount}p` : "Blank"}
        </span>
      </div>
      <div
        className={`mx-auto mt-2 max-w-full truncate rounded-lg px-2 py-0.5 text-center text-[10px] font-bold tracking-wide uppercase transition-all ${
          selected ? "w-fit bg-[#8ea5ff] text-black shadow-sm" : "text-neutral-500 group-hover:text-neutral-300"
        }`}
      >
        {item.name}
      </div>
    </button>
  );
}


function TemplatePreview({
  compact = false,
  large = false,
  item
}: {
  compact?: boolean;
  large?: boolean;
  item: TemplateChooserItem;
}) {
  const isCenteredBlank = item.kind === "blank" && item.name.includes("Centered");
  const alignClass = isCenteredBlank ? "items-center text-center" : "items-start text-left";
  const titleWidth = isCenteredBlank ? "44%" : "48%";
  const bodyWidth = isCenteredBlank ? "34%" : "32%";

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: item.preview.primary, color: item.preview.foreground }}>
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 opacity-75"
        style={{ background: `linear-gradient(180deg, transparent, ${item.preview.secondary})` }}
      />
      <div className={`relative flex h-full flex-col justify-center ${alignClass} ${compact ? "p-[8%]" : large ? "p-[9%]" : "p-[7%]"}`}>
        <span
          className={`block rounded-sm ${compact ? "h-2" : "h-2.5"}`}
          style={{ background: item.preview.foreground, width: titleWidth }}
        />
        <span
          className={`mt-2 block rounded-sm ${compact ? "h-1" : "h-1.5"}`}
          style={{ background: item.preview.muted, width: bodyWidth }}
        />
        {!compact && (
          <span className="mt-auto block h-1.5 w-[18%] rounded-full" style={{ background: item.preview.accent }} />
        )}
      </div>
    </div>
  );
}

function SelectedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`absolute right-1.5 top-1.5 flex items-center justify-center rounded-full bg-[#0a84ff] text-white ${compact ? "h-4 w-4" : "h-5 w-5"}`}>
      <Check size={compact ? 10 : 13} strokeWidth={2.5} />
    </span>
  );
}
