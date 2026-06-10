"use client";

import { useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  deckTemplateItems,
  templateChooserCategories,
  templateTagFromCategoryId,
  type TemplateChooserCategoryId,
  type TemplateChooserItem
} from "@/core/motion-doc/presets/templateChooser";

export function TemplateModal({
  onAddBlankSlide,
  onApplyTemplate,
  onClose,
  selectedTemplateId
}: {
  onAddBlankSlide: () => void;
  onApplyTemplate: (templateId: string) => void;
  onClose: () => void;
  selectedTemplateId: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateChooserCategoryId>("all");
  const visibleTemplates = useMemo(() => {
    const tag = templateTagFromCategoryId(selectedCategory);

    return tag ? deckTemplateItems.filter((item) => item.tag === tag) : deckTemplateItems;
  }, [selectedCategory]);
  const templateCategories = templateChooserCategories.filter((category) => category.source === "template");

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-6 pt-16 backdrop-blur-[32px] transition-all duration-700" onMouseDown={onClose}>
      <div
        className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#050505]/80 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1),0_40px_80px_-20px_rgba(0,0,0,1)] animate-[bubble-appear_0.3s_ease-out]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative flex h-14 items-center justify-center border-b border-white/[0.06] bg-transparent px-6">
          <span className="text-sm font-bold text-white tracking-wide">Template Gallery</span>
          <div className="absolute right-4 flex items-center gap-3">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] text-neutral-400 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)]">
              Decks
            </span>
            <button
              aria-label="Close templates"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] hover:text-white active:scale-95"
              onClick={onClose}
              type="button"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="border-b border-white/[0.04] px-6 py-4 bg-white/[0.01]">
          <div className="custom-scrollbar flex gap-1.5 overflow-x-auto">
            <button
              className={categoryButtonClass(selectedCategory === "all")}
              onClick={() => setSelectedCategory("all")}
              type="button"
            >
              All
            </button>
            {templateCategories.map((category) => (
              <button
                className={categoryButtonClass(selectedCategory === category.id)}
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                type="button"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid max-h-[70vh] gap-5 overflow-y-auto p-6 custom-scrollbar sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-white/[0.04] bg-[#0a0a0a]/40 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-white/[0.1] hover:bg-white/[0.02] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8)]"
            onClick={onAddBlankSlide}
            type="button"
          >
            <div className="aspect-video border-b border-white/[0.04] bg-[#050505] p-3 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.02)]">
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-black/50 transition-colors duration-500 group-hover:border-white/[0.15] group-hover:bg-white/[0.02]">
                <Plus size={24} className="text-neutral-500 transition-colors duration-500 group-hover:text-white" />
              </div>
            </div>
            <div className="flex min-h-[112px] flex-col gap-2.5 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-bold text-white tracking-wide">Blank Slide</span>
                <span className="shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono font-bold text-neutral-400 border border-white/[0.06]">5s</span>
              </div>
              <span className="line-clamp-3 text-[11px] leading-relaxed text-neutral-500">Add a completely empty slide using the current theme, background, and accent.</span>
              <span className="mt-auto text-[10px] font-bold tracking-[0.15em] text-neutral-600 group-hover:text-neutral-400 transition-colors">Scene</span>
            </div>
          </button>

          {visibleTemplates.map((item) => (
            <TemplateModalCard
              item={item}
              isActive={selectedTemplateId === item.templateId}
              key={item.id}
              onApplyTemplate={onApplyTemplate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateModalCard({
  isActive,
  item,
  onApplyTemplate
}: {
  isActive: boolean;
  item: Extract<TemplateChooserItem, { kind: "deck" }>;
  onApplyTemplate: (templateId: string) => void;
}) {
  return (
    <button
      className={`group flex flex-col overflow-hidden rounded-[1.25rem] border text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 relative ${
        isActive
          ? "border-white/[0.25] bg-white/[0.03] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.06)]"
          : "border-white/[0.04] bg-[#0a0a0a]/40 hover:border-white/[0.1] hover:bg-white/[0.02] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8)]"
      }`}
      onClick={() => onApplyTemplate(item.templateId)}
      type="button"
    >
      <div className={`relative aspect-video border-b p-3 transition-colors duration-500 ${isActive ? "border-white/[0.1]" : "border-white/[0.04] shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.02)]"}`} style={{ background: item.preview.shell }}>
        <TemplatePreview item={item} />
        {isActive && (
          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_12px_rgba(255,255,255,0.25)] animate-[bubble-appear_0.3s_ease-out]">
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex min-h-[112px] flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-bold text-white tracking-wide">{item.name}</span>
          <span className="shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono font-bold text-neutral-400 border border-white/[0.06]">{item.slideCount}p</span>
        </div>
        <span className="line-clamp-3 text-[11px] leading-relaxed text-neutral-500 group-hover:text-neutral-400 transition-colors duration-500">{item.description}</span>
        <span className="mt-auto text-[10px] font-bold tracking-[0.15em] text-neutral-600 group-hover:text-neutral-400 transition-colors duration-500">{item.tagLabel}</span>
      </div>
    </button>
  );
}

function TemplatePreview({ item }: { item: Extract<TemplateChooserItem, { kind: "deck" }> }) {
  return (
    <div
      className="relative h-full overflow-hidden rounded border shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${item.preview.secondary}, ${item.preview.primary})`,
        borderColor: item.preview.border,
        color: item.preview.foreground
      }}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at 18% 14%, ${item.preview.accent}55, transparent 38%), radial-gradient(circle at 88% 78%, ${item.preview.accent}33, transparent 34%)`
        }}
      />
      <div className="relative z-10 flex h-full flex-col justify-between p-3">
        <div>
          <div className="mb-1.5 h-1 w-9 rounded-full" style={{ background: item.preview.accent }} />
          <div className="h-2.5 w-[72%] rounded-sm" style={{ background: item.preview.foreground }} />
          <div className="mt-1.5 h-1.5 w-[48%] rounded-sm" style={{ background: item.preview.muted }} />
        </div>
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-2">
          <div className="space-y-1.5">
            <div className="h-8 rounded border" style={{ background: `${item.preview.foreground}12`, borderColor: item.preview.border }} />
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map((index) => (
                <div
                  className="h-4 rounded-sm border"
                  key={index}
                  style={{ background: `${item.preview.accent}${index === 1 ? "44" : "22"}`, borderColor: item.preview.border }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1 rounded border p-1.5" style={{ background: `${item.preview.foreground}10`, borderColor: item.preview.border }}>
            {[48, 74, 58, 88].map((height, index) => (
              <div className="flex-1 rounded-sm" key={index} style={{ background: index === 3 ? item.preview.accent : item.preview.muted, height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[8px] font-semibold leading-none" style={{ color: item.preview.muted }}>{item.name}</span>
          <span className="h-1.5 w-7 rounded-full" style={{ background: `${item.preview.accent}cc` }} />
        </div>
      </div>
    </div>
  );
}

function categoryButtonClass(active: boolean) {
  return `shrink-0 rounded-full border px-4 py-1.5 text-[11px] font-semibold transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
    active
      ? "border-white/[0.15] bg-white/[0.08] text-white shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.1)]"
      : "border-transparent bg-transparent text-neutral-500 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-neutral-300"
  }`;
}
