"use client";

import { BarChart3, ChevronUp, ChevronDown, Gauge, GripVertical, Image as ImageIcon, MousePointer2, PlaySquare, Rows3, Shapes, Sparkles, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";
import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";

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
  if (block.type === "VideoBlock") return <PlaySquare className={className} size={12} />;
  if (block.type === "Metric") return <Gauge className={className} size={12} />;
  if (block.type === "Chart") return <BarChart3 className={className} size={12} />;
  if (block.type === "Icon") return <Sparkles className={className} size={12} />;
  if (block.type === "Shape") return <Shapes className={className} size={12} />;
  if (block.type === "Stack") return <Rows3 className={className} size={12} />;

  return <MousePointer2 className={className} size={12} />;
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
  let itemClass = "group flex items-center justify-between px-3 py-2.5 rounded-[0.85rem] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer border active:scale-[0.97] ";

  if (isSelected) {
    itemClass += "bg-white/[0.06] text-white border-white/[0.04] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)] ";
  } else {
    itemClass += "text-neutral-400 border-transparent hover:bg-white/[0.03] hover:text-neutral-200 ";
  }

  if (isDragged) {
    itemClass += "opacity-30 border-dashed !border-white/[0.06] ";
  } else if (isDragOver) {
    itemClass += "!border-t-white !border-t-2 bg-white/[0.02] shadow-[0_4px_12px_rgba(0,0,0,0.5)] scale-[1.01] z-10 relative ";
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
        <span className="truncate text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">{("text" in block ? block.text : "") || ("props" in block ? String(block.props.title || block.props.text || "Element") : "")}</span>
      </div>
      <div className="flex items-center gap-1">
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
    </div>
  );
}
