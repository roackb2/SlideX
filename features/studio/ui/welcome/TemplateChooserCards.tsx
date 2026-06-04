"use client";

import { Check, FolderOpen, Scissors } from "lucide-react";
import type { SlidexRecentProject } from "@/features/studio/infrastructure/tauriProject";
import type { TemplateChooserItem } from "@/core/motion-doc/presets/templateChooser";

export function FeaturedTemplateCard({
  item,
  onCreate,
  onSelect,
  selected
}: {
  item: TemplateChooserItem;
  onCreate: (item: TemplateChooserItem) => void;
  onSelect: (itemId: string) => void;
  selected: boolean;
}) {
  return (
    <button
      className={`group min-w-0 rounded-xl text-left outline-none transition ${
        selected ? "ring-2 ring-[#0a84ff] ring-offset-2 ring-offset-[#202020]" : ""
      }`}
      onClick={() => onSelect(item.id)}
      onDoubleClick={() => onCreate(item)}
      type="button"
    >
      <div
        className="relative aspect-video overflow-hidden rounded-xl border p-6 transition group-hover:border-white/60"
        style={{
          background: item.preview.primary,
          borderColor: `${item.preview.accent}66`,
          color: item.preview.foreground
        }}
      >
        <div
          className="absolute inset-0 opacity-75"
          style={{
            background: `radial-gradient(circle at 28% 8%, ${item.preview.accent}44, transparent 34%), radial-gradient(circle at 82% 78%, ${item.preview.muted}33, transparent 30%)`
          }}
        />
        <div className="relative flex h-full items-center justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="mb-7 flex items-end gap-3">
              <span
                className="flex h-[70px] w-[116px] items-end justify-center rounded border bg-white/10 text-[56px] font-bold leading-none"
                style={{ borderColor: `${item.preview.foreground}44`, color: item.preview.accent }}
              >
                Aa
              </span>
              <span className="grid h-[72px] w-[58px] gap-2">
                <span className="rounded-md border bg-white/20" style={{ borderColor: `${item.preview.foreground}33` }} />
                <span className="rounded-full border bg-white/25" style={{ borderColor: `${item.preview.foreground}44` }} />
              </span>
            </div>
            <div className="text-[13px] font-black tracking-normal">{item.kind === "deck" ? item.tagLabel : "Creator Studio"}</div>
            <div className="mt-1 text-[22px] font-black leading-none">{item.name}</div>
            <div className="mt-2 max-w-[270px] text-[12px] font-semibold leading-snug opacity-85">
              {item.kind === "deck" ? `${item.slideCount}-page complete deck. Use Blank to start with only this style.` : "Start with a blank text layout using SlideX theme colors and motion."}
            </div>
          </div>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/10" style={{ color: item.preview.accent }}>
            <Scissors size={15} />
          </span>
        </div>
      </div>
    </button>
  );
}

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

export function RecentProjectList({
  openRecentProject,
  recentProjects
}: {
  openRecentProject: (project: SlidexRecentProject) => void;
  recentProjects: SlidexRecentProject[];
}) {
  if (recentProjects.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-[#0c0d12]/40 px-6 text-center text-sm text-neutral-500">
        No recent SlideX projects yet
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {recentProjects.map((project) => (
        <button
          className="flex min-w-0 items-center gap-4 rounded-xl border border-white/[0.06] bg-[#0c0d12]/60 p-3.5 text-left transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.02] active:scale-[0.99] shadow-sm cursor-pointer"
          key={project.path}
          onClick={() => openRecentProject(project)}
          type="button"
        >
          <span className="flex aspect-video w-28 shrink-0 items-center justify-start rounded-md border border-white/[0.12] bg-white p-3">
            <span className="block min-w-0">
              <span className="block h-2 w-16 rounded-sm bg-neutral-900" />
              <span className="mt-2 block h-1.5 w-10 rounded-sm bg-neutral-400" />
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-neutral-200">{project.name}</span>
            <span className="mt-1 block truncate text-[11px] text-neutral-500">{project.path}</span>
          </span>
          <span className="shrink-0 text-[11px] text-neutral-500 font-mono">
            {new Date(project.updatedAt).toLocaleDateString("en-US")}
          </span>
        </button>
      ))}
    </div>
  );
}

export function RecentProjectShortcut({
  onOpenProject,
  recentProjects
}: {
  onOpenProject: () => void;
  recentProjects: SlidexRecentProject[];
}) {
  if (recentProjects.length === 0) {
    return null;
  }

  return (
    <button
      className="flex h-[92px] min-w-[180px] items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0c0d12]/60 px-4 text-left transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.02] active:scale-[0.99] shadow-sm cursor-pointer"
      onClick={onOpenProject}
      type="button"
    >
      <FolderOpen size={16} className="text-[#8ea5ff]" />
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-bold text-neutral-200">Open Recent Project</span>
        <span className="mt-1 block truncate text-[11px] text-neutral-500">{recentProjects[0]?.name}</span>
      </span>
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
