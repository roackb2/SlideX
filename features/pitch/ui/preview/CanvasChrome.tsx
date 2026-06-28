"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { AddBlockOptions } from "@/features/pitch/application/motionDocCommands";
import { lucideIconLabels, lucideIconPaths, slidexIconNames, type SlideXIconName } from "@/core/motion-doc/domain/lucideIconRegistry";
import type { SlideRow } from "@/features/pitch/ui/LayerSidebar";
import { toolGroups, type AddBlockType, type PitchBlockTool, type PitchToolGroup } from "@/features/pitch/ui/pitchOptions";

type CanvasSlideNavProps = {
  activeSlideIndex: number;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  sceneCount: number;
};

export function CanvasSlideNav({
  activeSlideIndex,
  onNextSlide,
  onPreviousSlide,
  sceneCount
}: CanvasSlideNavProps) {
  return (
    <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/[0.04] bg-neutral-950/60 p-1 shadow-lg shadow-black/40 backdrop-blur-xl sm:top-5 transition-all duration-300">
      <button
        aria-label="Previous slide"
        className="rounded-lg p-1.5 text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.04] hover:text-white hover:scale-[1.04] active:scale-[0.93] cursor-pointer"
        onClick={onPreviousSlide}
        type="button"
      >
        <ChevronLeft size={12} strokeWidth={2.5} />
      </button>
      <div className="flex min-w-[36px] items-center justify-center px-2 py-0.5 sm:min-w-[48px]">
        <span className="font-mono text-sm font-semibold text-neutral-300 sm:text-base">
          {activeSlideIndex + 1} <span className="font-normal text-neutral-600">/</span> {sceneCount}
        </span>
      </div>
      <button
        aria-label="Next slide"
        className="rounded-lg p-1.5 text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.04] hover:text-white hover:scale-[1.04] active:scale-[0.93] cursor-pointer"
        onClick={onNextSlide}
        type="button"
      >
        <ChevronRight size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function CanvasBlockDock({ onAddBlock }: { onAddBlock: (type: AddBlockType, options?: AddBlockOptions) => void }) {
  const [openGroupId, setOpenGroupId] = useState<PitchToolGroup["id"] | null>(null);
  const [activeShapeTool, setActiveShapeTool] = useState<AddBlockType>("ShapeLine");
  const activeGroup = toolGroups.find((group) => group.id === openGroupId) ?? null;

  function addTool(type: AddBlockType, options?: AddBlockOptions) {
    if (String(type).startsWith("Shape")) {
      setActiveShapeTool(type);
    }
    onAddBlock(type, options);
    setOpenGroupId(null);
  }

  return (
    <>
      {activeGroup ? (
        <button
          aria-label="Close tool menu"
          className="fixed inset-0 z-[55] cursor-default bg-transparent"
          onClick={() => setOpenGroupId(null)}
          type="button"
        />
      ) : null}
      {activeGroup && !activeGroup.modal && (activeGroup.tools.length > 1 || activeGroup.id === "icon") ? (
        <ToolFlyout
          activeShapeTool={activeShapeTool}
          group={activeGroup}
          onAddTool={addTool}
        />
      ) : null}
      {activeGroup?.modal ? (
        <ToolModal group={activeGroup} onAddTool={addTool} onClose={() => setOpenGroupId(null)} />
      ) : null}
      <div className="absolute bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border border-white/[0.04] bg-neutral-950/60 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:bottom-5 md:bottom-7 transition-all duration-300 hover:shadow-black/85">
        {toolGroups.map((group) => {
          const isOpen = openGroupId === group.id;
          const isSingleTool = group.tools.length === 1 && group.id !== "icon";
          return (
            <button
              aria-label={isSingleTool ? `Add ${group.label}` : `Open ${group.label} tools`}
              className={`group relative flex h-8 w-8 cursor-pointer flex-col items-center justify-center overflow-visible rounded-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.06] active:scale-[0.93] sm:h-9.5 sm:w-9.5 md:h-10.5 md:w-10.5 ${
                isOpen ? "bg-white/[0.08] text-white border border-white/[0.05]" : "text-neutral-400 hover:bg-white/[0.03] hover:text-white"
              }`}
              key={group.id}
              onClick={() => {
                if (isSingleTool) {
                  addTool(group.tools[0].type);
                } else {
                  setOpenGroupId((current) => (current === group.id ? null : group.id));
                }
              }}
              type="button"
            >
              <span className="scale-80 sm:scale-95 md:scale-105">{group.icon}</span>
              <span className="pointer-events-none absolute -top-9 origin-bottom scale-90 whitespace-nowrap rounded-lg border border-white/[0.04] bg-[#0c0c0e] px-2.5 py-1 text-xs font-bold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 sm:-top-10">
                {group.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function ToolFlyout({
  activeShapeTool,
  group,
  onAddTool
}: {
  activeShapeTool: AddBlockType;
  group: PitchToolGroup;
  onAddTool: (type: AddBlockType, options?: AddBlockOptions) => void;
}) {
  if (group.id === "icon") {
    return <IconToolbox onAddTool={onAddTool} />;
  }

  return <CommandToolMenu group={group} onAddTool={onAddTool} />;
}

function CommandToolMenu({
  group,
  onAddTool
}: {
  group: PitchToolGroup;
  onAddTool: (type: AddBlockType, options?: AddBlockOptions) => void;
}) {
  return (
    <div className="absolute bottom-[4.25rem] left-1/2 z-[60] w-[230px] -translate-x-1/2 overflow-hidden rounded-xl border border-white/[0.04] bg-neutral-950/90 p-[6px] shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:bottom-[5rem]">
      <div className="px-2.5 pb-1.5 pt-1 text-sm font-bold text-neutral-400">
        {group.label}
      </div>
      {group.tools.map((tool) => (
        <CommandToolButton key={tool.type} tool={tool} onAddTool={onAddTool} />
      ))}
    </div>
  );
}


function CommandToolButton({
  onAddTool,
  tool
}: {
  onAddTool: (type: AddBlockType, options?: AddBlockOptions) => void;
  tool: PitchBlockTool;
}) {
  return (
    <button
      className="grid h-9.5 w-full grid-cols-[22px_1fr_auto] items-center gap-2 rounded-lg px-2.5 text-left text-sm font-semibold text-neutral-200 transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.04] hover:text-white active:scale-[0.96]"
      onClick={() => onAddTool(tool.type)}
      type="button"
    >
      <span className="flex items-center justify-center text-neutral-300">{tool.icon}</span>
      <span className="truncate">{tool.label}</span>
      {tool.shortcut ? <span className="font-mono text-xs text-neutral-500">{tool.shortcut}</span> : null}
    </button>
  );
}

function IconToolbox({
  onAddTool
}: {
  onAddTool: (type: AddBlockType, options?: AddBlockOptions) => void;
}) {
  const icons = slidexIconNames.slice(0, 24);

  return (
    <div className="absolute bottom-[4.25rem] left-1/2 z-[60] w-[300px] -translate-x-1/2 rounded-xl border border-white/[0.04] bg-neutral-950/90 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:bottom-[5rem]">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-bold text-neutral-400">Icon toolbox</span>
        <span className="text-xs font-medium text-neutral-500">Drag to canvas</span>
      </div>
      <div className="grid max-h-[212px] grid-cols-6 gap-1.5 overflow-y-auto pr-0.5 custom-scrollbar">
        {icons.map((iconName) => (
          <button
            aria-label={`Add ${lucideIconLabels[iconName]} icon`}
            className="group flex h-10 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.01] text-neutral-300 transition duration-300 hover:border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/12 hover:text-white active:scale-95"
            draggable
            key={iconName}
            onClick={() => onAddTool("Icon", { props: { icon: iconName } })}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "copy";
              event.dataTransfer.setData("application/x-slidex-tool", JSON.stringify({ props: { icon: iconName }, type: "Icon" }));
            }}
            title={lucideIconLabels[iconName]}
            type="button"
          >
            <LucideToolIcon name={iconName} />
          </button>
        ))}
      </div>
    </div>
  );
}

function LucideToolIcon({ name }: { name: SlideXIconName }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:scale-110"
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

function ToolModal({
  group,
  onAddTool,
  onClose
}: {
  group: PitchToolGroup;
  onAddTool: (type: AddBlockType, options?: AddBlockOptions) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-[min(92vw,520px)] overflow-hidden rounded-xl border border-white/[0.08] bg-[#090b12]/95 shadow-[0_28px_90px_rgba(0,0,0,0.74)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2 text-neutral-200">
            {group.icon}
            <span className="text-xs font-bold tracking-[0.18em]">{group.label}</span>
          </div>
          <button aria-label="Close shape tools" className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/[0.06] hover:text-white" onClick={onClose} type="button">
            <X size={14} />
          </button>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-2">
          {group.tools.map((tool) => (
            <button
              className="group flex min-h-16 items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#8ea5ff]/35 hover:bg-[#8ea5ff]/10 active:scale-[0.98]"
              key={tool.type}
              onClick={() => onAddTool(tool.type)}
              type="button"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/25 text-neutral-300 transition-colors group-hover:text-white">
                {tool.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-neutral-200">{tool.label}</span>
                {tool.description ? <span className="mt-1 block truncate text-[10px] text-neutral-500">{tool.description}</span> : null}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CanvasTimeline({
  activeSlideIndex,
  onSelectSlide,
  slideRows,
  totalDuration
}: {
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  slideRows: SlideRow[];
  totalDuration: number;
}) {
  return (
    <div className="relative z-10 flex h-4 w-full shrink-0 overflow-hidden border-t border-white/[0.03] bg-neutral-950 select-none sm:h-5">
      {slideRows.map((slide) => {
        const isActive = slide.index === activeSlideIndex;
        const widthPercent = Math.max((slide.duration / Math.max(totalDuration, 1)) * 100, 2);

        return (
          <button
            aria-label={`Go to slide ${slide.index + 1}`}
            className={`group/time h-full border-r border-white/[0.03] transition-all relative flex flex-col justify-between p-0.5 cursor-pointer ${
              isActive 
                ? "bg-[#0ea5e9]/8 shadow-[inset_0_1px_0_rgba(14,165,233,0.1)]" 
                : "bg-transparent hover:bg-white/[0.01]"
            }`}
            key={slide.index}
            onClick={() => onSelectSlide(slide.index)}
            style={{ width: `${widthPercent}%` }}
            type="button"
          >
            {/* Active glowing indicator block */}
            <span className={`absolute top-0 left-0 right-0 h-[2px] transition-all ${isActive ? "bg-[#0ea5e9]" : "bg-transparent"}`} />
            
            {/* Tick marks inside timeline */}
            <div className="flex w-full justify-between px-1 opacity-20 group-hover/time:opacity-40 transition-opacity">
              <span className="h-1.5 w-[1px] bg-white" />
              <span className="h-1 w-[1px] bg-white" />
              <span className="h-1 w-[1px] bg-white" />
              <span className="h-1 w-[1px] bg-white" />
            </div>
            
            <div className="flex w-full items-center justify-between px-1.5 pb-0.5 font-mono text-[11px] font-semibold">
              <span className={isActive ? "text-[#0ea5e9]" : "text-neutral-500 group-hover/time:text-neutral-400"}>
                S{slide.index + 1}
              </span>
              <span className="text-neutral-600 group-hover/time:text-neutral-500 font-normal">
                {slide.duration}s
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
