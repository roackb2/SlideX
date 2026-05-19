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
              <span className="line-clamp-3 text-[11px] leading-relaxed text-neutral-400">Add a completely empty slide using the current theme, background, and accent.</span>
              <span className="mt-auto text-[10px] font-medium uppercase tracking-wide text-neutral-400">Scene</span>
            </div>
          </button>
          {motionTemplates.map((template) => {
            const isActive = selectedTemplateId === template.id;
            const previewTone = templatePreviewTone(template.category);
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
                <div className="aspect-video border-b border-neutral-800 p-3" style={{ background: previewTone.shell }}>
                  <TemplatePreview tone={previewTone} title={template.name} />
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

type TemplateTone = {
  accent: string;
  border: string;
  foreground: string;
  muted: string;
  primary: string;
  secondary: string;
  shell: string;
};

function TemplatePreview({ title, tone }: { title: string; tone: TemplateTone }) {
  return (
    <div
      className="relative h-full overflow-hidden rounded border shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${tone.secondary}, ${tone.primary})`,
        borderColor: tone.border,
        color: tone.foreground
      }}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at 18% 14%, ${tone.accent}55, transparent 38%), radial-gradient(circle at 88% 78%, ${tone.accent}33, transparent 34%)`
        }}
      />
      <div className="relative z-10 flex h-full flex-col justify-between p-3">
        <div>
          <div className="mb-1.5 h-1 w-9 rounded-full" style={{ background: tone.accent }} />
          <div className="h-2.5 w-[72%] rounded-sm" style={{ background: tone.foreground }} />
          <div className="mt-1.5 h-1.5 w-[48%] rounded-sm" style={{ background: tone.muted }} />
        </div>
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-2">
          <div className="space-y-1.5">
            <div className="h-8 rounded border" style={{ background: `${tone.foreground}12`, borderColor: tone.border }} />
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map((index) => (
                <div className="h-4 rounded-sm border" key={index} style={{ background: `${tone.accent}${index === 1 ? "44" : "22"}`, borderColor: tone.border }} />
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1 rounded border p-1.5" style={{ background: `${tone.foreground}10`, borderColor: tone.border }}>
            {[48, 74, 58, 88].map((height, index) => (
              <div className="flex-1 rounded-sm" key={index} style={{ background: index === 3 ? tone.accent : tone.muted, height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[8px] font-semibold leading-none" style={{ color: tone.muted }}>{title}</span>
          <span className="h-1.5 w-7 rounded-full" style={{ background: `${tone.accent}cc` }} />
        </div>
      </div>
    </div>
  );
}

function templatePreviewTone(category: string) {
  if (category === "Black") {
    return { accent: "#ffffff", border: "#3f3f46", foreground: "#ffffff", muted: "#a1a1aa", primary: "#050505", secondary: "#111111", shell: "#020202" };
  }

  if (category === "White") {
    return { accent: "#111111", border: "#d4d4d8", foreground: "#111111", muted: "#71717a", primary: "#ffffff", secondary: "#f4f4f5", shell: "#fafafa" };
  }

  const tones: Record<string, TemplateTone> = {
    "Midnight Blue": { accent: "#72a7ff", border: "#1e3a5f", foreground: "#f8fbff", muted: "#9fb7d8", primary: "#07111f", secondary: "#0d1728", shell: "#030812" },
    "Ivory Finance": { accent: "#7a4f24", border: "#d8c6ac", foreground: "#2f2418", muted: "#8b7358", primary: "#fff8ef", secondary: "#efe5d7", shell: "#f4eadc" },
    "Graphite Green": { accent: "#7dd3a8", border: "#224034", foreground: "#f4fff8", muted: "#9bb7aa", primary: "#07120f", secondary: "#0e1c17", shell: "#030906" },
    "Mist QBR": { accent: "#145c49", border: "#c8d8d2", foreground: "#10251f", muted: "#5d746c", primary: "#f6faf8", secondary: "#e5ece8", shell: "#edf4f1" },
    "Electric Slate": { accent: "#7dd3fc", border: "#1f3b50", foreground: "#f5fbff", muted: "#99b5c5", primary: "#081018", secondary: "#0e1a24", shell: "#03070d" },
    "Consulting Blue": { accent: "#183b68", border: "#c3d5eb", foreground: "#10233c", muted: "#607895", primary: "#f7fbff", secondary: "#e4edf8", shell: "#edf4fc" },
    "Luxury Plum": { accent: "#f0a6ca", border: "#3d203f", foreground: "#fff7fb", muted: "#c49ab4", primary: "#120815", secondary: "#1c1021", shell: "#070309" },
    "Signal White": { accent: "#3157ff", border: "#cbd6f3", foreground: "#111827", muted: "#64748b", primary: "#f8faff", secondary: "#e8edf7", shell: "#f0f4ff" }
  };

  return tones[category] ?? { accent: "#a3a3a3", border: "#3f3f46", foreground: "#ffffff", muted: "#a1a1aa", primary: "#111111", secondary: "#1f1f1f", shell: "#090909" };
}
