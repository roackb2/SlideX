"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import {
  deckTemplateItems,
  type TemplateChooserItem
} from "@/core/motion-doc/presets/templateChooser";
import { usePitchI18n } from "@/features/pitch/ui/pitchI18n";

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
  const { locale, tx } = usePitchI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const visibleTemplates = useMemo(() => {
    if (!searchQuery.trim()) return deckTemplateItems;
    
    const query = searchQuery.toLowerCase();
    return deckTemplateItems.filter((item) => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query) ||
      item.tagLabel.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-6 pt-16 backdrop-blur-[32px] transition-all duration-700" onMouseDown={onClose}>
      <div
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.04] bg-[#0A0A0A] shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] animate-[bubble-appear_0.3s_ease-out] font-sans antialiased"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative flex h-14 items-center justify-center px-6">
          <span className="text-[14px] font-medium text-white">{tx("Template Gallery")}</span>
          <div className="absolute right-4 flex items-center gap-3">
            <button
              aria-label={tx("Close templates")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] hover:text-white active:scale-95"
              onClick={onClose}
              type="button"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-white/[0.04]">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-neutral-500" />
            <input
              type="text"
              placeholder={tx("Search templates...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 text-[13px] text-white placeholder-neutral-500 outline-none transition-all focus:border-white/20 focus:bg-white/[0.04] focus:ring-1 focus:ring-white/10"
              autoFocus
            />
          </div>
        </div>

        <div className="grid max-h-[70vh] gap-6 overflow-y-auto p-6 pt-4 custom-scrollbar sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <button
            className="group flex flex-col text-left transition-all"
            onClick={onAddBlankSlide}
            type="button"
          >
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.01] transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.03]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/[0.15] bg-white/[0.02] transition-colors group-hover:border-white/30 group-hover:bg-white/[0.05]">
                <Plus size={18} className="text-neutral-500 transition-colors group-hover:text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-4 w-full px-1">
              <span className="truncate text-[13px] font-semibold text-neutral-200 transition-colors group-hover:text-white">{tx("Blank Slide")}</span>
              <span className="text-[12px] leading-relaxed text-neutral-500">{locale === "zh-TW" ? "使用目前主題新增一張完全空白的投影片。" : "Add a completely empty slide using the current theme."}</span>
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
      className="group flex flex-col text-left transition-all"
      onClick={() => onApplyTemplate(item.templateId)}
      type="button"
    >
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden transition-all duration-300 ${
        isActive
          ? "ring-2 ring-[#8ea5ff] ring-offset-2 ring-offset-[#0A0A0A]"
          : "border border-white/[0.08] group-hover:border-white/20"
      }`}>
        <div className="absolute inset-0 transition-colors" style={{ background: item.preview.shell }}>
          <TemplatePreview item={item} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-4 w-full px-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate text-[13px] font-semibold transition-colors ${isActive ? "text-white" : "text-neutral-200 group-hover:text-white"}`}>{item.name}</span>
          <span className="shrink-0 text-[10px] font-mono font-medium text-neutral-500 bg-white/[0.04] px-1.5 py-0.5 rounded">{item.slideCount}p</span>
        </div>
        <span className="line-clamp-2 text-[12px] leading-relaxed text-neutral-500">{item.description}</span>
      </div>
    </button>
  );
}

function TemplatePreview({ item }: { item: Extract<TemplateChooserItem, { kind: "deck" }> }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: item.preview.primary,
        color: item.preview.foreground
      }}
    >
      {/* Dynamic Background Mesh */}
      <div 
        className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] opacity-40 blur-[40px] transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-60"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, ${item.preview.secondary}, ${item.preview.primary}, ${item.preview.accent}44, ${item.preview.primary}, ${item.preview.secondary})`
        }}
      />
      <div 
        className="absolute right-[-10%] top-[-10%] h-[70%] w-[70%] rounded-full blur-[40px] opacity-40 mix-blend-normal transition-all duration-1000 group-hover:opacity-70 group-hover:scale-110"
        style={{ background: item.preview.accent }}
      />
      
      {/* Glassmorphic Shell */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent mix-blend-overlay" />
      
      <div className="relative z-10 flex h-full flex-col justify-between p-3.5">
        {/* Top Header */}
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="h-1 w-6 rounded-full" style={{ background: item.preview.accent }} />
            <div className="h-2 w-28 rounded-sm shadow-sm" style={{ background: item.preview.foreground }} />
            <div className="h-1.5 w-16 rounded-sm opacity-50" style={{ background: item.preview.foreground }} />
          </div>
          <div className="flex gap-1">
             <div className="h-1.5 w-1.5 rounded-full opacity-30" style={{ background: item.preview.foreground }} />
             <div className="h-1.5 w-1.5 rounded-full opacity-30" style={{ background: item.preview.foreground }} />
          </div>
        </div>
        
        {/* Center/Bottom Layout Grid */}
        <div className="flex flex-col gap-2">
          {/* Main Hero Block */}
          <div 
            className="relative h-10 w-[85%] overflow-hidden rounded-[10px] border shadow-sm backdrop-blur-md" 
            style={{ 
              background: `linear-gradient(135deg, ${item.preview.secondary}ee, ${item.preview.primary}ee)`, 
              borderColor: `${item.preview.border}88` 
            }}
          >
             <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
             <div className="flex h-full items-center px-3">
                <div className="flex flex-col gap-1">
                  <div className="h-2 w-16 rounded-sm shadow-sm" style={{ background: item.preview.accent }} />
                  <div className="h-1 w-10 rounded-sm opacity-40" style={{ background: item.preview.foreground }} />
                </div>
             </div>
          </div>
          
          {/* Two Columns */}
          <div className="grid grid-cols-[1fr_1.2fr] gap-2">
             <div 
               className="relative h-10 overflow-hidden rounded-[8px] border shadow-sm backdrop-blur-md" 
               style={{ 
                 background: `${item.preview.secondary}dd`, 
                 borderColor: `${item.preview.border}66` 
               }}
             >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                <div className="flex h-full items-end gap-1 p-2">
                  <div className="w-full rounded-sm opacity-30" style={{ height: '40%', background: item.preview.foreground }} />
                  <div className="w-full rounded-sm opacity-50" style={{ height: '70%', background: item.preview.foreground }} />
                  <div className="w-full rounded-sm shadow-sm" style={{ height: '100%', background: item.preview.accent }} />
                </div>
             </div>
             
             <div 
               className="relative flex h-10 flex-col justify-center gap-1.5 rounded-[8px] border p-2.5 shadow-sm backdrop-blur-md" 
               style={{ 
                 background: `${item.preview.secondary}dd`, 
                 borderColor: `${item.preview.border}66` 
               }}
             >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full opacity-60" style={{ background: item.preview.accent }} />
                  <div className="h-1.5 flex-1 rounded-sm opacity-60" style={{ background: item.preview.foreground }} />
                </div>
                <div className="h-1 w-full rounded-sm opacity-30" style={{ background: item.preview.foreground }} />
                <div className="h-1 w-[80%] rounded-sm opacity-30" style={{ background: item.preview.foreground }} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
