"use client";

import { BarChart3, ChevronDown, ChevronUp, Code2, Gauge, GripVertical, Image as ImageIcon, Layers, Trash2 } from "lucide-react";
import type { KeyboardEvent, MouseEvent } from "react";
import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";

export type GroupableLayerType = "Card" | "Metric" | "Chart";

export function LayerTextIcon({ className = "", label }: { className?: string; label: "H" | "T" }) {
  return (
    <span className={`inline-flex h-3 w-3 items-center justify-center font-serif text-[11px] font-bold leading-none ${className}`}>
      {label}
    </span>
  );
}

export function BlockLayerIcon({ block, className = "" }: { block: MotionDocBlock; className?: string }) {
  if (block.type === "Title") return <LayerTextIcon className={className} label="H" />;
  if (block.type === "Text") return <LayerTextIcon className={className} label="T" />;
  if (block.type === "ImageBlock") return <ImageIcon className={className} size={12} />;
  if (block.type === "Metric") return <Gauge className={className} size={12} />;
  if (block.type === "Chart") return <BarChart3 className={className} size={12} />;

  return <Code2 className={className} size={12} />;
}

export function LayerRow({
  block,
  deleteBlock,
  draggedBlockIndex,
  dragOverBlockIndex,
  index,
  moveBlock,
  onSelectBlock,
  reorderBlock,
  selectedBlockIndex,
  selectedBlockIndices,
  setDraggedBlockIndex,
  setDragOverBlockIndex,
  totalBlocks
}: {
  block: MotionDocBlock;
  deleteBlock: (index: number) => void;
  draggedBlockIndex: number | null;
  dragOverBlockIndex: number | null;
  index: number;
  moveBlock: (index: number, direction: -1 | 1) => void;
  onSelectBlock: (index: number, event: MouseEvent<HTMLDivElement>) => void;
  reorderBlock: (fromIndex: number, toIndex: number) => void;
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  setDraggedBlockIndex: (index: number | null) => void;
  setDragOverBlockIndex: (index: number | null) => void;
  totalBlocks: number;
}) {
  const isSelected = selectedBlockIndices.includes(index) || selectedBlockIndex === index;
  const isDragged = draggedBlockIndex === index;
  const isDragOver = dragOverBlockIndex === index && !isDragged;
  let itemClass = "group flex items-center justify-between p-2 rounded-xl transition-all duration-300 cursor-pointer border active:scale-[0.98] ";

  if (isSelected) {
    itemClass += "bg-gradient-to-r from-neutral-800/90 via-neutral-800/60 to-neutral-800/30 text-white border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.35)] ";
  } else {
    itemClass += "text-neutral-400 border-transparent hover:bg-white/[0.03] hover:text-neutral-200 ";
  }

  if (isDragged) {
    itemClass += "opacity-30 border-dashed !border-white/[0.08] ";
  } else if (isDragOver) {
    itemClass += "!border-t-[#8ea5ff] !border-t-2 bg-neutral-900/80 shadow-lg scale-[1.02] z-10 relative ";
  }

  return (
    <div
      className={itemClass}
      draggable
      onClick={(event) => onSelectBlock(index, event)}
      onDragEnd={() => {
        setDraggedBlockIndex(null);
        setDragOverBlockIndex(null);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (dragOverBlockIndex !== index) setDragOverBlockIndex(index);
      }}
      onDragStart={(event) => {
        setDraggedBlockIndex(index);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (draggedBlockIndex !== null && draggedBlockIndex !== index) {
          reorderBlock(draggedBlockIndex, index);
        }
        setDraggedBlockIndex(null);
        setDragOverBlockIndex(null);
      }}
    >
      <div className="flex items-center gap-2 truncate">
        <div className="cursor-grab transition-colors hover:text-white active:cursor-grabbing" title="Drag to reorder">
          <GripVertical size={12} className="opacity-30 group-hover:opacity-100" />
        </div>
        <BlockLayerIcon block={block} />
        <span className="truncate text-[11px]">{("text" in block ? block.text : "") || ("props" in block ? String(block.props.title || block.props.text || "Element") : "")}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
        <button className="shrink-0 p-0.5 text-neutral-400 transition-all hover:text-white disabled:opacity-30" disabled={index === 0} onClick={(event) => { event.stopPropagation(); moveBlock(index, -1); }}>
          <ChevronUp size={12} />
        </button>
        <button className="shrink-0 p-0.5 text-neutral-400 transition-all hover:text-white disabled:opacity-30" disabled={index === totalBlocks - 1} onClick={(event) => { event.stopPropagation(); moveBlock(index, 1); }}>
          <ChevronDown size={12} />
        </button>
        <button className="ml-1 shrink-0 p-0.5 text-neutral-400 transition-all hover:text-red-400" onClick={(event) => { event.stopPropagation(); deleteBlock(index); }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export function GroupLayerRow({
  count,
  flow,
  isExpanded,
  indices,
  isSelected,
  label,
  onToggleExpanded,
  onSelectBlocks
}: {
  count: number;
  flow: string;
  isExpanded: boolean;
  indices: number[];
  isSelected: boolean;
  label: string;
  onToggleExpanded: () => void;
  onSelectBlocks: (indices: number[], options?: { additive?: boolean }) => void;
}) {
  return (
    <div
      className={`group flex cursor-pointer items-center justify-between rounded-xl border p-2 transition-all duration-300 active:scale-[0.98] ${
        isSelected
          ? "border-white/[0.08] bg-gradient-to-r from-neutral-800/90 to-neutral-800/40 text-white shadow-md"
          : "border-white/[0.04] bg-[#090a0f]/60 text-neutral-400 hover:border-white/[0.12] hover:bg-white/[0.03]"
      }`}
      onClick={(event) => onSelectBlocks(indices, { additive: event.metaKey || event.ctrlKey || event.shiftKey })}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectBlocks(indices);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          aria-label={isExpanded ? "Collapse group" : "Expand group"}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
          onClick={(event) => {
            event.stopPropagation();
            onToggleExpanded();
          }}
          type="button"
        >
          <ChevronDown size={12} className={`transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
        </button>
        <Layers size={12} className={isSelected ? "text-white" : "text-neutral-400"} />
        <span className="truncate text-[11px] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase text-neutral-500">{count}</span>
        <span className="font-mono text-[9px] uppercase text-neutral-400">{flow}</span>
      </div>
    </div>
  );
}

export function collectBlocksOfType(blocks: MotionDocBlock[], type: GroupableLayerType) {
  return blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.type === type);
}
