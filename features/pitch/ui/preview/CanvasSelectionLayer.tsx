"use client";

import type { PointerEvent } from "react";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import type { CanvasTool } from "@/features/pitch/application/canvasTools";
import { isPositionLocked } from "@/features/pitch/application/motionDocCommands";
import { tableEditorSelectionProps } from "@/features/pitch/application/tableEditorSelection";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  blockFrame,
  isEditableTableBlock,
  isEditableTextBlock,
  isMovableBlock,
  isTextOnlySelection,
  marqueeRect,
  resizeHandles,
  selectionSpacingGuides,
  type AlignmentGuide,
  type Frame,
  type MarqueeSelection,
  type ResizeHandle,
  type SelectionSpacingGuide
} from "@/features/pitch/application/previewCanvas";
import type { CanvasInteractionMode } from "@/features/pitch/ui/preview/interaction/useCanvasInteractionEngine";
import type { BlockUpdater } from "@/features/pitch/ui/pitchCommandTypes";
import { TableFrameEditor } from "@/features/pitch/ui/preview/TableFrameEditor";
import { TextFrameEditor } from "@/features/pitch/ui/preview/TextFrameEditor";
import { VisualFrameEditor } from "@/features/pitch/ui/preview/VisualFrameEditor";

type CanvasSelectionLayerProps = {
  activeCanvasTool: CanvasTool;
  activeSlide: MotionDocScene | undefined;
  alignmentGuides: AlignmentGuide[];
  canvasScale: number;
  frameOverrides: ReadonlyMap<number, Frame>;
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
  onStartResize: (event: PointerEvent<HTMLSpanElement>, blockIndex: number, handle: ResizeHandle, frame: Frame, blockIndices?: readonly number[]) => void;
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
  frameOverrides,
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
  const selectedIndices = selectedCanvasIndices(activeSlide, selectedBlockIndex, selectedBlockIndices);
  const isMultiSelection = selectedIndices.length > 1;
  const isTextMultiSelection = isMultiSelection && isTextOnlySelection(activeSlide?.blocks ?? [], selectedIndices);
  const multiSelectionFrame = isMultiSelection ? combinedSelectionFrame(activeSlide, selectedIndices, frameOverrides) : null;
  const spacingGuides = isMultiSelection
    ? selectionSpacingGuides(selectedIndices.map((index) => frameOverrides.get(index) ?? blockFrame(activeSlide?.blocks[index])))
    : [];
  const unlockedSelectedIndices = selectedIndices.filter((index) => {
    const block = activeSlide?.blocks[index];
    return block ? !isPositionLocked(block) : false;
  });
  const groupInteractionIndex = unlockedSelectedIndices.includes(selectedBlockIndex ?? -1)
    ? selectedBlockIndex
    : unlockedSelectedIndices[0] ?? null;

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

        const isSelected = selectedIndices.includes(blockIndex);
        const isPrimarySelection = selectedBlockIndex === blockIndex || (selectedBlockIndex === null && selectedIndices[0] === blockIndex);
        const isLocked = isPositionLocked(block);
        const tableBlock = isEditableTableBlock(block) ? block : null;
        const isTableBlock = tableBlock !== null;
        const isTextBlock = isEditableTextBlock(block);
        const isVisualBlock = block.type === "Icon" || block.type === "ImageBlock" || block.type === "VideoBlock";
        const isLineShape = block.type === "Shape" && block.props.shape === "line";
        const showIndividualTextEditor = isSelected && isTextBlock && (isTextMultiSelection || (!isMultiSelection && isPrimarySelection));
        const showIndividualControls = !isMultiSelection && isPrimarySelection || isTextMultiSelection && isTextBlock;
        const frame = frameOverrides.get(blockIndex) ?? blockFrame(block);
        const minFrameSize = minimumFrameSize(block, canvasScale);

        return (
          <div
            aria-label={`Move ${block.type} layer ${blockIndex + 1}`}
            className={frameControlClass({ isInteracting: interactionBlockIndex === blockIndex, isLineShape, isLocked, isPrimarySelection: isPrimarySelection || isTextMultiSelection && isTextBlock, isSelected, isTextBlock })}
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
            {isSelected && showIndividualControls && !isLocked && !isLineShape && !isVisualBlock ? <FrameInteractionHalo isTextBlock={isTextBlock} /> : null}
            {showIndividualTextEditor ? (
              <TextFrameEditor
	                block={block}
	                blockIndex={blockIndex}
	                canvasScale={canvasScale}
	                toolbarAlignment={frame.x + frame.w / 2 >= 50 ? "right" : "left"}
	                toolbarPlacement={frame.y < 11 ? "below" : "above"}
	                onBeginTextEdit={() => onBeginTextEdit(blockIndex)}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
            ) : null}
            {isSelected && isPrimarySelection && !isMultiSelection && isVisualBlock && !isLocked ? (
              <VisualFrameEditor
                block={block}
                blockIndex={blockIndex}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
                placement={frame.y < 11 ? "below" : "above"}
              />
            ) : null}
            {isSelected && isPrimarySelection && !isMultiSelection && isTableBlock ? (
              <TableFrameEditor
                block={tableBlock}
                blockIndex={blockIndex}
                onSelectionChange={(selection) => {
                  onUpdateBlock(blockIndex, tableEditorSelectionProps(tableBlock.props, selection), undefined, { transient: true });
                }}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
            ) : null}
            {isSelected ? (
              <SelectedFrameControls
                frame={frame}
                interactionMode={interactionBlockIndex === blockIndex ? interactionMode : "idle"}
                isTextBlock={isTextBlock}
                isLineShape={isLineShape}
                isLocked={isLocked}
                showHandles={showIndividualControls}
                onStartResize={(event, handle) => onStartResize(event, blockIndex, handle, frame)}
              />
            ) : null}
          </div>
        );
      })}
      {multiSelectionFrame && groupInteractionIndex !== null && !isTextMultiSelection ? (
        <MultiSelectionFrame
          blockIndex={groupInteractionIndex}
          canResize={unlockedSelectedIndices.length === selectedIndices.length}
          count={selectedIndices.length}
          frame={multiSelectionFrame}
          interactionMode={interactionMode}
          isTransforming={interactionBlockIndex === groupInteractionIndex}
          lockedCount={selectedIndices.length - unlockedSelectedIndices.length}
          onEndInteraction={(event) => onEndInteraction(event, groupInteractionIndex)}
          onPointerMove={onUpdateInteraction}
          onStartMove={(event) => onStartMove(event, groupInteractionIndex, multiSelectionFrame)}
          onStartResize={(event, handle) => onStartResize(event, groupInteractionIndex, handle, multiSelectionFrame, unlockedSelectedIndices)}
          spacingGuides={spacingGuides}
        />
      ) : null}
    </div>
  );
}

function frameControlClass({
  isInteracting,
  isLocked,
  isPrimarySelection,
  isLineShape,
  isSelected,
  isTextBlock
}: {
  isInteracting: boolean;
  isLocked: boolean;
  isPrimarySelection: boolean;
  isLineShape: boolean;
  isSelected: boolean;
  isTextBlock: boolean;
}) {
  const cursorClass = isLocked ? "cursor-default" : "cursor-move";
  const baseClass = "group/frame absolute box-border touch-none overflow-visible border bg-transparent text-left outline-none transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  if (isLineShape) {
    return `${baseClass} select-none border-transparent shadow-none ${cursorClass}`;
  }

  if (!isSelected) {
    return `${baseClass} select-none border-white/0 hover:border-violet-400/70 ${cursorClass}`;
  }

  if (!isPrimarySelection) {
    return `${baseClass} select-none border-violet-300/55 ${cursorClass}`;
  }

  if (isInteracting) {
    return `${baseClass} select-none border-violet-300 shadow-[0_0_0_2px_rgba(139,92,246,0.2),0_0_18px_rgba(88,55,170,0.22)] ${cursorClass}`;
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
  frame,
  interactionMode,
  isLocked,
  isLineShape,
  isTextBlock,
  label,
  onStartResize,
  showHandles
}: {
  frame: Frame;
  interactionMode: CanvasInteractionMode;
  isLocked: boolean;
  isLineShape: boolean;
  isTextBlock: boolean;
  label?: string;
  onStartResize: (event: PointerEvent<HTMLSpanElement>, handle: ResizeHandle) => void;
  showHandles: boolean;
}) {
  const labelAtBottom = frame.y < 5;
  const dimensionInside = frame.y < 11 || frame.y + frame.h > 95;

  return (
    <>
      {isLocked || label ? (
        <span className={`pointer-events-none absolute left-1 rounded-md bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-black shadow-sm ${labelAtBottom ? "top-1" : "-top-6"}`}>
          {label ?? "locked"}
        </span>
      ) : null}
      {!isLocked && showHandles && !isLineShape && !isTextBlock ? (
        <span className={`pointer-events-none absolute rounded-md border border-violet-300/20 bg-[#17131f]/92 px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums text-violet-100 shadow-[0_5px_16px_rgba(20,10,35,0.28)] backdrop-blur-md ${dimensionInside ? "right-1 top-1" : "-bottom-6 right-0"}`}>
          {interactionMode === "dragging" ? "Move · " : interactionMode === "resizing" ? "Resize · " : ""}
          {Math.round(frame.w / 100 * CANVAS_WIDTH)} × {Math.round(frame.h / 100 * CANVAS_HEIGHT)}
        </span>
      ) : null}
      {isLocked || !showHandles ? null : isLineShape ? (
        <>
          <LineEndpointHandle endpoint="start" onPointerDown={(event) => onStartResize(event, "w")} />
          <LineEndpointHandle endpoint="end" onPointerDown={(event) => onStartResize(event, "e")} />
        </>
      ) : resizeHandles.map((handle) => (
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

function LineEndpointHandle({ endpoint, onPointerDown }: { endpoint: "end" | "start"; onPointerDown: (event: PointerEvent<HTMLSpanElement>) => void }) {
  return (
    <span aria-label={`Adjust line ${endpoint}`} className={`absolute top-1/2 z-50 flex h-7 w-7 -translate-y-1/2 items-center justify-center cursor-ew-resize ${endpoint === "start" ? "-left-3.5" : "-right-3.5"}`} data-line-endpoint={endpoint} onPointerDown={onPointerDown} role="button">
      <span className="pointer-events-none h-3 w-3 rounded-full border border-violet-400 bg-white shadow-[0_0_0_2px_rgba(139,92,246,0.14),0_2px_8px_rgba(0,0,0,0.35)] transition-transform group-hover/frame:scale-110" />
    </span>
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
      aria-label={`Resize ${resizeHandleLabel(handle)}`}
      className={`absolute z-40 flex items-center justify-center ${resizeHandleHitAreaClass(handle)}`}
      data-resize-handle={handle}
      onPointerDown={onPointerDown}
      role="button"
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
    ? "border-violet-500 shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_1px_5px_rgba(0,0,0,0.3)] transition-transform duration-150 group-hover/frame:scale-110"
    : "border-violet-500 shadow-[0_0_0_1px_rgba(139,92,246,0.32),0_2px_7px_rgba(0,0,0,0.3)] transition-transform duration-150 group-hover/frame:scale-110";
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
    return "h-1.5 w-6 rounded-full";
  }

  if (handle === "e" || handle === "w") {
    return "h-6 w-1.5 rounded-full";
  }

  return "h-3 w-3 rounded-[4px]";
}

function resizeHandleLabel(handle: ResizeHandle) {
  const labels: Record<ResizeHandle, string> = {
    e: "right edge",
    n: "top edge",
    ne: "top right corner",
    nw: "top left corner",
    s: "bottom edge",
    se: "bottom right corner",
    sw: "bottom left corner",
    w: "left edge"
  };

  return labels[handle];
}

function selectedCanvasIndices(
  slide: MotionDocScene | undefined,
  selectedBlockIndex: number | null,
  selectedBlockIndices: readonly number[]
) {
  const indices = new Set(selectedBlockIndices);
  if (selectedBlockIndex !== null) indices.add(selectedBlockIndex);

  return [...indices].filter((index) => {
    const block = slide?.blocks[index];
    return block ? isMovableBlock(block) : false;
  });
}

function combinedSelectionFrame(slide: MotionDocScene | undefined, indices: readonly number[], frameOverrides: ReadonlyMap<number, Frame>) {
  const frames = indices.map((index) => frameOverrides.get(index) ?? blockFrame(slide?.blocks[index]));
  if (frames.length === 0) return null;

  const left = Math.min(...frames.map((frame) => frame.x));
  const top = Math.min(...frames.map((frame) => frame.y));
  const right = Math.max(...frames.map((frame) => frame.x + frame.w));
  const bottom = Math.max(...frames.map((frame) => frame.y + frame.h));

  return { h: bottom - top, w: right - left, x: left, y: top };
}

type MultiSelectionFrameProps = {
  blockIndex: number;
  canResize: boolean;
  count: number;
  frame: Frame;
  interactionMode: CanvasInteractionMode;
  isTransforming: boolean;
  lockedCount: number;
  onEndInteraction: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onStartMove: (event: PointerEvent<HTMLDivElement>) => void;
  onStartResize: (event: PointerEvent<HTMLSpanElement>, handle: ResizeHandle) => void;
  spacingGuides: readonly SelectionSpacingGuide[];
};

function MultiSelectionFrame({
  blockIndex,
  canResize,
  count,
  frame,
  interactionMode,
  isTransforming,
  lockedCount,
  onEndInteraction,
  onPointerMove,
  onStartMove,
  onStartResize,
  spacingGuides
}: MultiSelectionFrameProps) {
  const badgeAtBottom = frame.y < 5;
  const dimensionInside = frame.y + frame.h > 95;

  return (
    <div
      aria-label={`${count} selected elements`}
      className={`group/selection absolute z-30 cursor-move border border-violet-200/80 bg-violet-300/[0.025] shadow-[0_0_0_2px_rgba(109,73,181,0.12),0_8px_30px_rgba(37,22,66,0.1)] transition-[border-color,box-shadow] duration-150 ${isTransforming ? "border-violet-100 shadow-[0_0_0_3px_rgba(139,92,246,0.2),0_10px_40px_rgba(50,30,90,0.18)]" : "hover:border-violet-100"}`}
      data-block-index={blockIndex}
      data-frame-control
      data-multi-selection-frame
      onPointerDown={onStartMove}
      onPointerMove={onPointerMove}
      onPointerUp={onEndInteraction}
      role="group"
      style={{ height: `${frame.h}%`, left: `${frame.x}%`, top: `${frame.y}%`, width: `${frame.w}%` }}
    >
      <span className={`pointer-events-none absolute left-0 flex items-center gap-1.5 rounded-md border border-white/10 bg-[#17131f]/95 px-2 py-1 text-[10px] font-semibold text-violet-100 shadow-lg backdrop-blur-md ${badgeAtBottom ? "top-1" : "-top-7"}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
        <span>Group</span>
        <span className="font-normal text-violet-200/55">· {interactionMode === "dragging" ? "Moving" : interactionMode === "resizing" ? "Resizing" : `${count} layers`}</span>
        {lockedCount > 0 ? <span className="font-normal text-violet-200/55">· {lockedCount} locked</span> : null}
      </span>
      {interactionMode === "selected" ? <SelectionSpacingOverlay frame={frame} guides={spacingGuides} /> : null}
      <span className={`pointer-events-none absolute rounded-md border border-violet-300/20 bg-[#17131f]/92 px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums text-violet-100 shadow-md backdrop-blur-md ${dimensionInside ? "bottom-1 right-1" : "-bottom-6 right-0"}`}>
        {Math.round(frame.w / 100 * CANVAS_WIDTH)} × {Math.round(frame.h / 100 * CANVAS_HEIGHT)}
      </span>
      {canResize ? resizeHandles.map((handle) => (
        <ResizeHandleControl
          handle={handle}
          isTextBlock={false}
          key={`group-${handle}`}
          onPointerDown={(event) => onStartResize(event, handle)}
        />
      )) : null}
    </div>
  );
}

function SelectionSpacingOverlay({ frame, guides }: { frame: Frame; guides: readonly SelectionSpacingGuide[] }) {
  if (guides.length === 0) return null;

  const summary = spacingSummary(guides);
  const needsAttention = guides.some((guide) => guide.status === "overlap" || guide.status === "tight" || guide.status === "uneven");

  return (
    <>
      <span className={`pointer-events-none absolute left-1/2 top-1 z-20 -translate-x-1/2 rounded-md border px-2 py-0.5 text-[9px] font-semibold shadow-sm backdrop-blur-md ${needsAttention ? "border-amber-300/30 bg-amber-950/85 text-amber-100" : "border-emerald-300/25 bg-emerald-950/80 text-emerald-100"}`}>
        {summary}
      </span>
      {guides.map((guide, index) => (
        <SpacingGuide frame={frame} guide={guide} key={`${guide.axis}-${guide.start}-${guide.end}-${index}`} />
      ))}
    </>
  );
}

function SpacingGuide({ frame, guide }: { frame: Frame; guide: SelectionSpacingGuide }) {
  const warning = guide.status === "overlap" || guide.status === "tight" || guide.status === "uneven";
  const start = Math.min(guide.start, guide.end);
  const end = Math.max(guide.start, guide.end);
  const label = guide.gapPx < 0 ? `Overlap ${Math.abs(guide.gapPx)} px` : guide.gapPx === 0 ? "No spacing" : `${guide.gapPx} px`;
  const colorClass = warning ? "bg-amber-400 text-amber-100" : "bg-emerald-400 text-emerald-100";

  if (guide.axis === "horizontal") {
    const left = (start - frame.x) / frame.w * 100;
    const width = Math.max((end - start) / frame.w * 100, 0);
    const top = (guide.crossPosition - frame.y) / frame.h * 100;
    return (
      <span className={`pointer-events-none absolute z-10 h-px ${colorClass}`} style={{ left: `${left}%`, minWidth: 1, top: `${top}%`, width: `${width}%` }}>
        <i className="absolute -left-px -top-1 h-2 w-px bg-current" />
        <i className="absolute -right-px -top-1 h-2 w-px bg-current" />
        <b className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded bg-[#17131f]/92 px-1.5 py-0.5 font-mono text-[8px] font-medium not-italic shadow-sm">{label}</b>
      </span>
    );
  }

  const left = (guide.crossPosition - frame.x) / frame.w * 100;
  const top = (start - frame.y) / frame.h * 100;
  const height = Math.max((end - start) / frame.h * 100, 0);
  return (
    <span className={`pointer-events-none absolute z-10 w-px ${colorClass}`} style={{ height: `${height}%`, left: `${left}%`, minHeight: 1, top: `${top}%` }}>
      <i className="absolute -left-1 -top-px h-px w-2 bg-current" />
      <i className="absolute -bottom-px -left-1 h-px w-2 bg-current" />
      <b className="absolute left-1 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-[#17131f]/92 px-1.5 py-0.5 font-mono text-[8px] font-medium not-italic shadow-sm">{label}</b>
    </span>
  );
}

function spacingSummary(guides: readonly SelectionSpacingGuide[]) {
  if (guides.some((guide) => guide.status === "overlap")) return "Spacing alert · overlap";
  if (guides.some((guide) => guide.status === "uneven")) return "Spacing alert · uneven";
  if (guides.some((guide) => guide.status === "tight")) return "Spacing alert · too tight";

  const gap = guides[0]?.gapPx ?? 0;
  return guides.length > 1 ? `Auto spacing · ${gap} px even` : `Spacing · ${gap} px`;
}
