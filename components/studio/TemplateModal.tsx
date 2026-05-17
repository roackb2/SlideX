"use client";

import { Plus, X } from "lucide-react";
import { motionTemplates } from "@/lib/templates";

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
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-6 pt-20 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="w-full max-w-4xl overflow-hidden rounded-lg border border-neutral-800 bg-[#111111] shadow-2xl shadow-black/50"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-white">Presentation templates</span>
            <span className="rounded border border-neutral-800 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-neutral-400">Deck</span>
          </div>
          <button
            aria-label="Close templates"
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto p-4 custom-scrollbar sm:grid-cols-2 lg:grid-cols-3">
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
                <span className="truncate text-[12px] font-semibold text-white">Blank slide</span>
                <span className="shrink-0 text-[10px] font-mono text-neutral-400">5s</span>
              </div>
              <span className="line-clamp-3 text-[11px] leading-relaxed text-neutral-400">Add one editable slide using the current theme, background, and accent.</span>
              <span className="mt-auto text-[10px] font-medium uppercase tracking-wide text-neutral-400">Scene</span>
            </div>
          </button>
          {motionTemplates.map((template) => {
            const isActive = selectedTemplateId === template.id;
            return (
              <button
                className={`group flex flex-col overflow-hidden rounded-md border text-left transition-all ${
                  isActive
                    ? "border-neutral-500 bg-neutral-900"
                    : "border-neutral-800 bg-[#0a0a0a] hover:border-neutral-600"
                }`}
                key={template.id}
                onClick={() => onApplyTemplate(template.id)}
                type="button"
              >
                <div className="aspect-video border-b border-neutral-800 bg-neutral-950 p-3">
                  <div className="grid h-full grid-cols-4 grid-rows-3 gap-1">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div
                        className={`rounded-sm border ${
                          template.category === "Black"
                            ? index % 2 === 0
                              ? "border-neutral-700 bg-black"
                              : "border-neutral-800 bg-neutral-950"
                            : index % 2 === 0
                              ? "border-neutral-300 bg-white"
                              : "border-neutral-200 bg-neutral-100"
                        }`}
                        key={index}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex min-h-[112px] flex-col gap-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-semibold text-white">{template.name}</span>
                    <span className="shrink-0 text-[10px] font-mono text-neutral-400">{template.duration}</span>
                  </div>
                  <span className="line-clamp-3 text-[11px] leading-relaxed text-neutral-400">{template.description}</span>
                  <span className="mt-auto text-[10px] font-medium uppercase tracking-wide text-neutral-400">{template.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
