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
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-6 pt-16 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="w-full max-w-6xl overflow-hidden rounded-[14px] border border-neutral-800 bg-[#111111] shadow-2xl shadow-black/50"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative flex h-10 items-center justify-center border-b border-neutral-800 bg-[#1f2021] px-4">
          <span className="text-[12px] font-semibold text-neutral-200">Template Gallery</span>
          <div className="absolute right-3 flex items-center gap-2">
            <span className="rounded border border-neutral-800 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-neutral-400">
              Decks
            </span>
            <button
              aria-label="Close templates"
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="border-b border-neutral-800 px-4 py-3">
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

        <div className="grid max-h-[70vh] gap-3 overflow-y-auto p-4 custom-scrollbar sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            className="group flex flex-col overflow-hidden rounded-md border border-neutral-800 bg-[#0a0a0a] text-left transition-all hover:border-neutral-600"
            onClick={onAddBlankSlide}
            type="button"
          >
            <div className="aspect-video border-b border-neutral-800 bg-neutral-950 p-3">
              <div className="flex h-full items-center justify-center rounded border border-dashed border-neutral-700 bg-black">
                <Plus size={22} className="text-neutral-400" />
              </div>
            </div>
            <div className="flex min-h-[112px] flex-col gap-2 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-semibold text-white">Blank Slide</span>
                <span className="shrink-0 text-[10px] font-mono text-neutral-400">5s</span>
              </div>
              <span className="line-clamp-3 text-[11px] leading-relaxed text-neutral-400">Add a completely empty slide using the current theme, background, and accent.</span>
              <span className="mt-auto text-[10px] font-medium uppercase tracking-wide text-neutral-400">Scene</span>
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
      className={`group flex flex-col overflow-hidden rounded-md border text-left transition-all ${
        isActive
          ? "border-[#0a84ff] bg-neutral-900 shadow-[0_0_0_1px_rgba(10,132,255,0.45)]"
          : "border-neutral-800 bg-[#0a0a0a] hover:border-neutral-600"
      }`}
      onClick={() => onApplyTemplate(item.templateId)}
      type="button"
    >
      <div className="relative aspect-video border-b border-neutral-800 p-3" style={{ background: item.preview.shell }}>
        <TemplatePreview item={item} />
        {isActive && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0a84ff] text-white">
            <Check size={13} strokeWidth={2.5} />
          </span>
        )}
      </div>
      <div className="flex min-h-[112px] flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[12px] font-semibold text-white">{item.name}</span>
          <span className="shrink-0 text-[10px] font-mono text-neutral-400">{item.slideCount}p</span>
        </div>
        <span className="line-clamp-3 text-[11px] leading-relaxed text-neutral-400">{item.description}</span>
        <span className="mt-auto text-[10px] font-medium uppercase tracking-wide text-neutral-400">{item.tagLabel}</span>
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
  return `shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
    active
      ? "border-[#0a84ff]/70 bg-[#0a84ff]/20 text-[#8dc5ff]"
      : "border-neutral-800 bg-black/20 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
  }`;
}
