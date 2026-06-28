"use client";

import type { PointerEvent } from "react";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
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
import { TextFrameEditor } from "@/features/pitch/ui/preview/TextFrameEditor";

type CanvasSelectionLayerProps = {
  activeSlide: MotionDocScene | undefined;
  alignmentGuides: AlignmentGuide[];
  canvasScale: number;
  interactionBlockIndex: number | null;
  marqueeSelection: MarqueeSelection | null;
  onCancelMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  onEndInteraction: (event: PointerEvent<HTMLDivElement>, blockIndex: number) => void;
  onEndMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  onSelectBlock: (index: number) => void;
  onStartMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  onStartMove: (event: PointerEvent<HTMLDivElement>, blockIndex: number, frame: Frame) => void;
  onStartResize: (event: PointerEvent<HTMLSpanElement>, blockIndex: number, handle: ResizeHandle, frame: Frame) => void;
  onUpdateBlock: (blockIndex: number, newProps: Record<string, string | number>, newText?: string) => void;
  onUpdateInteraction: (event: PointerEvent<HTMLDivElement>) => void;
  onUpdateMarquee: (event: PointerEvent<HTMLDivElement>) => void;
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
};

export function CanvasSelectionLayer({
  activeSlide,
  alignmentGuides,
  canvasScale,
  interactionBlockIndex,
  marqueeSelection,
  onCancelMarquee,
  onEndInteraction,
  onEndMarquee,
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
      className="absolute inset-0 z-40"
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
        const frame = blockFrame(block);

        return (
          <div
            aria-label={`Move ${block.type} layer ${blockIndex + 1}`}
            className={`absolute touch-none select-none cursor-move border bg-transparent text-left outline-none transition-colors ${
              isSelected
                ? "border-[#c4b5fd] shadow-[0_0_0_1px_rgba(17,7,31,0.8),0_0_18px_rgba(139,92,246,0.34)]"
                : "border-white/0 hover:border-[#a78bfa]/70"
            }`}
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
              minHeight: block.type === "Shape" ? 18 : 36,
              minWidth: block.type === "Shape" ? 18 : 40,
              top: `${frame.y}%`,
              width: `${frame.w}%`
            }}
            tabIndex={0}
          >
            {isSelected && isEditableTextBlock(block) ? (
              <TextFrameEditor
                block={block}
                blockIndex={blockIndex}
                canvasScale={canvasScale}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
            ) : null}
            {isSelected ? (
              <SelectedFrameControls
                frame={frame}
                isTextBlock={isEditableTextBlock(block)}
                onStartResize={(event, handle) => onStartResize(event, blockIndex, handle, frame)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
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
  frame,
  isTextBlock,
  label,
  onStartResize
}: {
  frame: Frame;
  isTextBlock: boolean;
  label?: string;
  onStartResize: (event: PointerEvent<HTMLSpanElement>, handle: ResizeHandle) => void;
}) {
  return (
    <>
      <span className="pointer-events-none absolute -left-px -top-5 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-black">
        {label ?? (isTextBlock ? "drag frame" : `x ${Math.round(frame.x)} y ${Math.round(frame.y)} w ${Math.round(frame.w)} h ${Math.round(frame.h)}`)}
      </span>
      {resizeHandles.map((handle) => (
        <span
          aria-hidden="true"
          className={`absolute border border-[#13091f] bg-[#f5f3ff] shadow-[0_0_0_1px_rgba(196,181,253,0.5)] ${resizeHandleClass(handle)}`}
          key={handle}
          onPointerDown={(event) => onStartResize(event, handle)}
        />
      ))}
    </>
  );
}

function resizeHandleClass(handle: ResizeHandle) {
  if (handle === "n") return "-top-2 left-1/2 h-4 w-9 -translate-x-1/2 cursor-ns-resize rounded";
  if (handle === "e") return "-right-2 top-1/2 h-9 w-4 -translate-y-1/2 cursor-ew-resize rounded";
  if (handle === "s") return "-bottom-2 left-1/2 h-4 w-9 -translate-x-1/2 cursor-ns-resize rounded";
  if (handle === "w") return "-left-2 top-1/2 h-9 w-4 -translate-y-1/2 cursor-ew-resize rounded";
  if (handle === "nw") return "-left-2 -top-2 h-4 w-4 cursor-nwse-resize rounded";
  if (handle === "ne") return "-right-2 -top-2 h-4 w-4 cursor-nesw-resize rounded";
  if (handle === "sw") return "-bottom-2 -left-2 h-4 w-4 cursor-nesw-resize rounded";

  return "-bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded";
}
