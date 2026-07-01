"use client";

import type { PointerEvent } from "react";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import type { CanvasTool } from "@/features/pitch/application/canvasTools";
import { isPositionLocked } from "@/features/pitch/application/motionDocCommands";
import {
  blockFrame,
  isEditableTextBlock,
  isMovableBlock,
  marqueeRect,
  resizeHandles,
  type AlignmentGuide,
  type Frame,
  type MarqueeSelection,
  type ResizeHandle
} from "@/features/pitch/application/previewCanvas";
import type { CanvasInteractionMode } from "@/features/pitch/ui/preview/interaction/useCanvasInteractionEngine";
import type { BlockUpdater } from "@/features/pitch/ui/pitchCommandTypes";
import { TextFrameEditor } from "@/features/pitch/ui/preview/TextFrameEditor";

type CanvasSelectionLayerProps = {
  activeCanvasTool: CanvasTool;
  activeSlide: MotionDocScene | undefined;
  alignmentGuides: AlignmentGuide[];
  canvasScale: number;
  interactionBlockIndex: number | null;
  interactionMode: CanvasInteractionMode;
  marqueeSelection: MarqueeSelection | null;
  onCancelMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  onEndInteraction: (event: PointerEvent<HTMLDivElement>, blockIndex: number) => void;
  onEndMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  onBeginTextEdit: (blockIndex: number) => void;
  onSelectBlock: (index: number) => void;
  onStartMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  onStartMove: (event: PointerEvent<HTMLDivElement>, blockIndex: number, frame: Frame) => void;
  onStartResize: (event: PointerEvent<HTMLSpanElement>, blockIndex: number, handle: ResizeHandle, frame: Frame) => void;
  onUpdateBlock: BlockUpdater;
  onUpdateInteraction: (event: PointerEvent<HTMLDivElement>) => void;
  onUpdateMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
};

export function CanvasSelectionLayer({
  activeCanvasTool,
  activeSlide,
  alignmentGuides,
  canvasScale,
  interactionBlockIndex,
  interactionMode,
  marqueeSelection,
  onCancelMarquee,
  onEndInteraction,
  onEndMarquee,
  onBeginTextEdit,
  onSelectBlock,
  onStartMarquee,
  onStartMove,
  onStartResize,
  onUpdateBlock,
  onUpdateInteraction,
  onUpdateMarquee,
  selectedBlockIndex,
  selectedBlockIndices
}: CanvasSelectionLayerProps) {
  return (
    <div
      className={`absolute inset-0 z-40 ${activeCanvasTool === "select" ? "" : "pointer-events-none"}`}
      data-canvas-tool={activeCanvasTool}
      data-canvas-interaction-mode={interactionMode}
      onPointerCancel={onCancelMarquee}
      onPointerDown={onStartMarquee}
      onPointerMove={onUpdateMarquee}
      onPointerUp={onEndMarquee}
    >
      {alignmentGuides.map((guide, index) => (
        <AlignmentGuideLine guide={guide} index={index} key={`${guide.orientation}-${guide.position}-${index}`} />
      ))}
      {marqueeSelection ? <MarqueeOverlay marqueeSelection={marqueeSelection} /> : null}
      {activeSlide?.blocks.map((block, blockIndex) => {
        if (!isMovableBlock(block)) {
          return null;
        }

        const isSelected = selectedBlockIndices.includes(blockIndex) || selectedBlockIndex === blockIndex;
        const isLocked = isPositionLocked(block);
        const isTextBlock = isEditableTextBlock(block);
        const frame = blockFrame(block);
        const minFrameSize = minimumFrameSize(block, canvasScale);

        return (
          <div
            aria-label={`Move ${block.type} layer ${blockIndex + 1}`}
            className={frameControlClass({ isLocked, isSelected, isTextBlock })}
            data-block-index={blockIndex}
            data-frame-control
            key={`${block.type}-control-${blockIndex}`}
            onPointerDown={(event) => onStartMove(event, blockIndex, frame)}
            onPointerMove={(event) => {
              if (interactionBlockIndex === blockIndex) {
                onUpdateInteraction(event);
              }
            }}
            onPointerUp={(event) => onEndInteraction(event, blockIndex)}
            role="button"
            style={{
              height: `${frame.h}%`,
              left: `${frame.x}%`,
              minHeight: minFrameSize.height,
              minWidth: minFrameSize.width,
              top: `${frame.y}%`,
              width: `${frame.w}%`
            }}
            tabIndex={0}
          >
            {isSelected && !isLocked ? <FrameInteractionHalo isTextBlock={isTextBlock} /> : null}
            {isSelected && isTextBlock ? (
              <TextFrameEditor
	                block={block}
	                blockIndex={blockIndex}
	                canvasScale={canvasScale}
	                onBeginTextEdit={() => onBeginTextEdit(blockIndex)}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
            ) : null}
            {isSelected ? (
              <SelectedFrameControls
                isTextBlock={isTextBlock}
                isLocked={isLocked}
                onStartResize={(event, handle) => onStartResize(event, blockIndex, handle, frame)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function frameControlClass({
  isLocked,
  isSelected,
  isTextBlock
}: {
  isLocked: boolean;
  isSelected: boolean;
  isTextBlock: boolean;
}) {
  const cursorClass = isLocked ? "cursor-default" : "cursor-move";
  const baseClass = "group/frame absolute box-border touch-none overflow-visible border bg-transparent text-left outline-none transition-colors";

  if (!isSelected) {
    return `${baseClass} select-none border-white/0 hover:border-violet-400/70 ${cursorClass}`;
  }

  if (isTextBlock) {
    return `${baseClass} select-text border-violet-500 shadow-[0_0_0_1px_rgba(139,92,246,0.28),0_0_0_3px_rgba(139,92,246,0.08)] ${cursorClass}`;
  }

  return `${baseClass} select-none border-violet-400 shadow-[0_0_0_1px_rgba(17,7,31,0.52),0_0_10px_rgba(139,92,246,0.2)] ${cursorClass}`;
}

function minimumFrameSize(block: MotionDocScene["blocks"][number], canvasScale: number) {
  if (isEditableTextBlock(block)) {
    const fontSize = numberFromProp(block.props.fontSize) ?? (block.type === "Title" ? 72 : 24);
    const lineHeight = numberFromProp(block.props.lineHeight) ?? (block.type === "Title" ? 1.02 : 1.45);

    return {
      height: Math.max(14, Math.round(fontSize * lineHeight * canvasScale)),
      width: Math.max(24, Math.round(fontSize * 1.4 * canvasScale))
    };
  }

  if (block.type === "Shape") {
    return { height: 18, width: 18 };
  }

  return { height: 36, width: 40 };
}

function numberFromProp(value: string | number | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function FrameInteractionHalo({ isTextBlock }: { isTextBlock: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-0 rounded-[10px] ${isTextBlock ? "-inset-2" : "-inset-3"} ${
        isTextBlock
          ? "cursor-move border border-transparent bg-transparent"
          : "cursor-move border border-transparent bg-white/[0.01] group-hover/frame:border-violet-400/20"
      }`}
    />
  );
}

function AlignmentGuideLine({ guide, index }: { guide: AlignmentGuide; index: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bg-sky-300 shadow-[0_0_0_1px_rgba(14,165,233,0.2),0_0_12px_rgba(125,211,252,0.55)]"
      key={`${guide.orientation}-${guide.position}-${index}`}
      style={
        guide.orientation === "vertical"
          ? { bottom: 0, left: `${guide.position}%`, top: 0, width: 1 }
          : { height: 1, left: 0, right: 0, top: `${guide.position}%` }
      }
    />
  );
}

function MarqueeOverlay({ marqueeSelection }: { marqueeSelection: MarqueeSelection }) {
  const rect = marqueeRect(marqueeSelection);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute border border-white/80 bg-white/10 shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
      style={{
        height: `${rect.h}%`,
        left: `${rect.x}%`,
        top: `${rect.y}%`,
        width: `${rect.w}%`
      }}
    />
  );
}

function SelectedFrameControls({
  isLocked,
  isTextBlock,
  label,
  onStartResize
}: {
  isLocked: boolean;
  isTextBlock: boolean;
  label?: string;
  onStartResize: (event: PointerEvent<HTMLSpanElement>, handle: ResizeHandle) => void;
}) {
  return (
    <>
      {isLocked || label ? (
        <span className="pointer-events-none absolute -left-px -top-5 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-black">
          {label ?? "locked"}
        </span>
      ) : null}
      {isLocked ? null : resizeHandles.map((handle) => (
        <ResizeHandleControl
          handle={handle}
          isTextBlock={isTextBlock}
          key={handle}
          onPointerDown={(event) => onStartResize(event, handle)}
        />
      ))}
    </>
  );
}

function ResizeHandleControl({
  handle,
  isTextBlock,
  onPointerDown
}: {
  handle: ResizeHandle;
  isTextBlock: boolean;
  onPointerDown: (event: PointerEvent<HTMLSpanElement>) => void;
}) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-40 flex items-center justify-center ${resizeHandleHitAreaClass(handle)}`}
      onPointerDown={onPointerDown}
    >
      <span className={`pointer-events-none border bg-[#fbfaff] ${resizeHandleSurfaceClass(isTextBlock)} ${resizeHandleVisualClass(handle, isTextBlock)}`} />
    </span>
  );
}

function resizeHandleHitAreaClass(handle: ResizeHandle) {
  if (handle === "n") return "-top-3 left-1/2 h-6 w-12 -translate-x-1/2 cursor-ns-resize";
  if (handle === "e") return "-right-3 top-1/2 h-12 w-6 -translate-y-1/2 cursor-ew-resize";
  if (handle === "s") return "-bottom-3 left-1/2 h-6 w-12 -translate-x-1/2 cursor-ns-resize";
  if (handle === "w") return "-left-3 top-1/2 h-12 w-6 -translate-y-1/2 cursor-ew-resize";
  if (handle === "nw") return "-left-3.5 -top-3.5 h-7 w-7 cursor-nwse-resize";
  if (handle === "ne") return "-right-3.5 -top-3.5 h-7 w-7 cursor-nesw-resize";
  if (handle === "sw") return "-bottom-3.5 -left-3.5 h-7 w-7 cursor-nesw-resize";

  return "-bottom-3.5 -right-3.5 h-7 w-7 cursor-nwse-resize";
}

function resizeHandleSurfaceClass(isTextBlock: boolean) {
  return isTextBlock
    ? "border-violet-500 shadow-[0_0_0_1px_rgba(139,92,246,0.28),0_1px_4px_rgba(0,0,0,0.24)]"
    : "border-[#13091f] shadow-[0_0_0_1px_rgba(196,181,253,0.5),0_4px_10px_rgba(0,0,0,0.32)]";
}

function resizeHandleVisualClass(handle: ResizeHandle, isTextBlock: boolean) {
  if (isTextBlock) {
    if (handle === "n" || handle === "s") {
      return "h-1 w-7 rounded-full";
    }

    if (handle === "e" || handle === "w") {
      return "h-7 w-1 rounded-full";
    }

    return "h-2.5 w-2.5 rounded-[3px]";
  }

  if (handle === "n" || handle === "s") {
    return "h-1.5 w-9 rounded-full";
  }

  if (handle === "e" || handle === "w") {
    return "h-9 w-1.5 rounded-full";
  }

  return "h-3.5 w-3.5 rounded-[4px]";
}
