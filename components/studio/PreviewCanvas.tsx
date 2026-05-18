"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { PreviewPane } from "@/components/PreviewPane";
import { blockTools, type AddBlockType } from "@/components/studio/studioOptions";
import type { SlideRow } from "@/components/studio/LayerSidebar";
import type { MotionDocBlock, MotionDocScene } from "@/lib/motionDocParser";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const MIN_FRAME_WIDTH = 8;
const MIN_FRAME_HEIGHT = 6;
type ResizeHandle = "n" | "e" | "s" | "w" | "nw" | "ne" | "sw" | "se";
type CanvasInteraction = {
  blockIndex: number;
  handle?: ResizeHandle;
  mode: "move" | "resize";
  startFrame: { h: number; w: number; x: number; y: number };
  startFrames: Array<{ blockIndex: number; frame: { h: number; w: number; x: number; y: number } }>;
  startPointer: { x: number; y: number };
};

export function PreviewCanvas({
  activeSlide,
  activeSlideIndex,
  onAddBlock,
  onAddTextAtPosition,
  onBeginBlockTransform,
  onClearSelection,
  onSelectBlock,
  onUpdateBlockFrames,
  onNextSlide,
  onPreviousSlide,
  onSelectSlide,
  replayNonce,
  sceneCount,
  selectedBlockIndex,
  selectedBlockIndices,
  slideRows,
  source,
  totalDuration
}: {
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  onAddBlock: (type: AddBlockType) => void;
  onAddTextAtPosition: (position: { x: number; y: number }) => void;
  onBeginBlockTransform: () => void;
  onClearSelection: () => void;
  onSelectBlock: (index: number, options?: { additive?: boolean; range?: boolean }) => void;
  onUpdateBlockFrames: (updates: Array<{ blockIndex: number; frame: { h?: number; w?: number; x?: number; y?: number } }>, commit?: boolean) => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  onSelectSlide: (index: number) => void;
  replayNonce: number;
  sceneCount: number;
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  slideRows: SlideRow[];
  source: string;
  totalDuration: number;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<CanvasInteraction | null>(null);
  const [interactionBlockIndex, setInteractionBlockIndex] = useState<number | null>(null);

  function getCanvasPosition(event: { clientX: number; clientY: number }) {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    return {
      x: roundPercent(Math.min(Math.max(x, 0), 100)),
      y: roundPercent(Math.min(Math.max(y, 0), 100))
    };
  }

  function handleCanvasDoubleClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    onAddTextAtPosition(getCanvasPosition(event));
  }

  function startMove(event: PointerEvent<HTMLButtonElement>, blockIndex: number, frame: { h: number; w: number; x: number; y: number }) {
    event.preventDefault();
    const additive = event.metaKey || event.ctrlKey;
    const range = event.shiftKey;

    if (additive || range) {
      onSelectBlock(blockIndex, { additive, range });
      return;
    }

    if (!selectedBlockIndices.includes(blockIndex)) {
      onSelectBlock(blockIndex);
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    const moveIndices = selectedBlockIndices.includes(blockIndex) ? selectedBlockIndices : [blockIndex];
    interactionRef.current = {
      blockIndex,
      mode: "move",
      startFrame: frame,
      startFrames: moveIndices.map((index) => ({
        blockIndex: index,
        frame: blockFrame(activeSlide?.blocks[index])
      })),
      startPointer: getCanvasPosition(event)
    };
    onBeginBlockTransform();
    setInteractionBlockIndex(blockIndex);
  }

  function startResize(event: PointerEvent<HTMLSpanElement>, blockIndex: number, handle: ResizeHandle, frame: { h: number; w: number; x: number; y: number }) {
    event.preventDefault();
    event.stopPropagation();
    const frameButton = event.currentTarget.closest("button");
    frameButton?.setPointerCapture(event.pointerId);
    interactionRef.current = {
      blockIndex,
      handle,
      mode: "resize",
      startFrame: frame,
      startFrames: [{ blockIndex, frame }],
      startPointer: getCanvasPosition(event)
    };
    onBeginBlockTransform();
    setInteractionBlockIndex(blockIndex);
    onSelectBlock(blockIndex);
  }

  function updateInteraction(event: PointerEvent<HTMLButtonElement>, commit = false) {
    const interaction = interactionRef.current;

    if (!interaction) {
      return;
    }

    const pointer = getCanvasPosition(event);
    const dx = pointer.x - interaction.startPointer.x;
    const dy = pointer.y - interaction.startPointer.y;
    const updates =
      interaction.mode === "resize" && interaction.handle
        ? [
            {
              blockIndex: interaction.blockIndex,
              frame: resizeFrame(interaction.startFrame, dx, dy, interaction.handle)
            }
          ]
        : interaction.startFrames.map(({ blockIndex, frame }) => ({
            blockIndex,
            frame: {
              h: frame.h,
              w: frame.w,
              x: clampPosition(frame.x + dx, frame.w),
              y: clampPosition(frame.y + dy, frame.h)
            }
          }));

    onUpdateBlockFrames(updates, commit);
  }

  function endInteraction(event: PointerEvent<HTMLButtonElement>, blockIndex: number) {
    const interaction = interactionRef.current;

    if (!interaction || interaction.blockIndex !== blockIndex) {
      return;
    }

    updateInteraction(event, true);
    event.currentTarget.releasePointerCapture(event.pointerId);
    interactionRef.current = null;
    setInteractionBlockIndex(null);
  }

  return (
    <div id="canvas-v4" className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#050505]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Slide counter nav - compact on mobile */}
      <div className="absolute left-1/2 top-2 sm:top-4 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-md border border-neutral-800 bg-[#0a0a0a] p-0.5 shadow-sm">
        <button aria-label="Previous slide" className="rounded p-1 sm:p-1.5 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white active:bg-neutral-700" onClick={onPreviousSlide}>
          <svg fill="none" height="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="10"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="flex min-w-[36px] sm:min-w-[48px] items-center justify-center px-1.5 sm:px-3 py-0.5">
          <span className="font-mono text-[10px] sm:text-[11px] font-medium text-neutral-300">
            {activeSlideIndex + 1} <span className="text-neutral-500">/</span> {sceneCount}
          </span>
        </div>
        <button aria-label="Next slide" className="rounded p-1 sm:p-1.5 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white active:bg-neutral-700" onClick={onNextSlide}>
          <svg fill="none" height="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="10"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Canvas area - mobile: more vertical space, allow scroll */}
      <div
        className="custom-scrollbar relative z-0 flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-3 pb-14 pt-9 sm:p-4 sm:pb-20 sm:pt-12 md:p-8 md:pb-24 md:pt-16"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            onClearSelection();
          }
        }}
      >
        <div
          aria-label={`16:9 canvas ${CANVAS_WIDTH} by ${CANVAS_HEIGHT}`}
          className="group relative aspect-video w-full max-w-[64rem] overflow-hidden bg-black shadow-xl ring-1 ring-neutral-800"
          onDoubleClick={handleCanvasDoubleClick}
          ref={canvasRef}
        >
          <PreviewPane
            activeSlideIndex={activeSlideIndex}
            replayNonce={replayNonce}
            source={source}
          />
          <div
            className="absolute inset-0 z-40"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) {
                onClearSelection();
              }
            }}
          >
            {activeSlide?.blocks.map((block, blockIndex) => {
              if (!isMovableBlock(block)) {
                return null;
              }

              const isSelected = selectedBlockIndices.includes(blockIndex) || selectedBlockIndex === blockIndex;
              const x = percentValue(block.props.x, 9);
              const y = percentValue(block.props.y, defaultY(block.type));
              const w = percentValue(block.props.w, defaultWidth(block.type));
              const h = percentValue(block.props.h, defaultHeight(block.type));
              const frame = { h, w, x, y };

              return (
                <button
                  aria-label={`Move ${block.type} layer ${blockIndex + 1}`}
                  className={`absolute cursor-move border bg-transparent text-left outline-none transition-colors ${
                    isSelected
                      ? "border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.55)]"
                      : "border-white/0 hover:border-white/45"
                  }`}
                  key={`${block.type}-control-${blockIndex}`}
                  onPointerDown={(event) => startMove(event, blockIndex, frame)}
                  onPointerMove={(event) => {
                    if (interactionBlockIndex !== blockIndex) {
                      return;
                    }

                    updateInteraction(event);
                  }}
                  onPointerUp={(event) => endInteraction(event, blockIndex)}
                  style={{
                    height: `${h}%`,
                    left: `${x}%`,
                    minHeight: 36,
                    top: `${y}%`,
                    width: `${w}%`
                  }}
                  type="button"
                >
                  {isSelected ? (
                    <>
                      <span className="pointer-events-none absolute -left-px -top-5 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-black">
                        x {Math.round(x)} y {Math.round(y)} w {Math.round(w)} h {Math.round(h)}
                      </span>
                      {resizeHandles.map((handle) => (
                        <span
                          aria-hidden="true"
                          className={`absolute border border-black bg-white shadow-sm ${resizeHandleClass(handle)}`}
                          key={handle}
                          onPointerDown={(event) => startResize(event, blockIndex, handle, frame)}
                        />
                      ))}
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom block tools - smaller on mobile */}
        <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-md border border-neutral-800 bg-[#0a0a0a] p-0.5 shadow-lg">
          {blockTools.map((item) => (
            <button className="group relative flex h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-col items-center justify-center overflow-visible rounded text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white active:bg-neutral-700" key={item.type} onClick={() => onAddBlock(item.type)}>
              <span className="scale-75 sm:scale-90 md:scale-100">{item.icon}</span>
              <span className="pointer-events-none absolute -top-7 sm:-top-8 whitespace-nowrap rounded bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] font-medium text-black opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline - slightly taller on mobile */}
      <div className="relative z-10 flex h-1.5 sm:h-1.5 w-full shrink-0 overflow-hidden border-t border-neutral-800 bg-neutral-900">
        {slideRows.map((slide) => {
          const isActive = slide.index === activeSlideIndex;
          const widthPercent = Math.max((slide.duration / Math.max(totalDuration, 1)) * 100, 2);
          return (
            <button
              aria-label={`Go to slide ${slide.index + 1}`}
              className={`h-full border-r border-black transition-all ${isActive ? "bg-white" : "bg-neutral-700 hover:bg-neutral-500"}`}
              key={slide.index}
              onClick={() => onSelectSlide(slide.index)}
              style={{ width: `${widthPercent}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

type MovableBlock = Extract<MotionDocBlock, { props: Record<string, string | number> }>;
const resizeHandles: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

function isMovableBlock(block: MotionDocScene["blocks"][number]): block is MovableBlock {
  return (
    "props" in block &&
    (Number.isFinite(Number(block.props.x)) || Number.isFinite(Number(block.props.y)))
  );
}

function percentValue(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 0), 100);
}

function blockFrame(block: MotionDocScene["blocks"][number] | undefined) {
  if (!block || !("props" in block)) {
    return { h: 18, w: 42, x: 8, y: 12 };
  }

  return {
    h: percentValue(block.props.h, defaultHeight(block.type)),
    w: percentValue(block.props.w, defaultWidth(block.type)),
    x: percentValue(block.props.x, 9),
    y: percentValue(block.props.y, defaultY(block.type))
  };
}

function roundPercent(value: number) {
  return Math.round(Math.min(Math.max(value, 0), 100) * 10) / 10;
}

function clampPosition(value: number, size: number) {
  return Math.round(Math.min(Math.max(value, 0), Math.max(100 - size, 0)) * 10) / 10;
}

function resizeFrame(frame: { h: number; w: number; x: number; y: number }, dx: number, dy: number, handle: ResizeHandle) {
  let nextX = frame.x;
  let nextY = frame.y;
  let nextW = frame.w;
  let nextH = frame.h;

  if (handle.includes("e")) {
    nextW = Math.min(Math.max(frame.w + dx, MIN_FRAME_WIDTH), 100 - frame.x);
  }

  if (handle.includes("s")) {
    nextH = Math.min(Math.max(frame.h + dy, MIN_FRAME_HEIGHT), 100 - frame.y);
  }

  if (handle.includes("w")) {
    const maxLeftDelta = frame.w - MIN_FRAME_WIDTH;
    const leftDelta = Math.min(Math.max(dx, -frame.x), maxLeftDelta);
    nextX = frame.x + leftDelta;
    nextW = frame.w - leftDelta;
  }

  if (handle.includes("n")) {
    const maxTopDelta = frame.h - MIN_FRAME_HEIGHT;
    const topDelta = Math.min(Math.max(dy, -frame.y), maxTopDelta);
    nextY = frame.y + topDelta;
    nextH = frame.h - topDelta;
  }

  return {
    h: roundPercent(nextH),
    w: roundPercent(nextW),
    x: roundPercent(nextX),
    y: roundPercent(nextY)
  };
}

function resizeHandleClass(handle: ResizeHandle) {
  if (handle === "n") return "-top-1.5 left-1/2 h-3 w-8 -translate-x-1/2 cursor-ns-resize rounded-sm";
  if (handle === "e") return "-right-1.5 top-1/2 h-8 w-3 -translate-y-1/2 cursor-ew-resize rounded-sm";
  if (handle === "s") return "-bottom-1.5 left-1/2 h-3 w-8 -translate-x-1/2 cursor-ns-resize rounded-sm";
  if (handle === "w") return "-left-1.5 top-1/2 h-8 w-3 -translate-y-1/2 cursor-ew-resize rounded-sm";
  if (handle === "nw") return "-left-1.5 -top-1.5 h-3 w-3 cursor-nwse-resize rounded-sm";
  if (handle === "ne") return "-right-1.5 -top-1.5 h-3 w-3 cursor-nesw-resize rounded-sm";
  if (handle === "sw") return "-bottom-1.5 -left-1.5 h-3 w-3 cursor-nesw-resize rounded-sm";

  return "-bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-sm";
}

function defaultY(type: MovableBlock["type"]) {
  if (type === "Title") return 18;
  if (type === "Chart") return 36;
  if (type === "ImageBlock") return 20;

  return 38;
}

function defaultWidth(type: MovableBlock["type"]) {
  if (type === "Title") return 52;
  if (type === "Text") return 42;
  if (type === "Metric") return 32;
  if (type === "Chart") return 70;
  if (type === "ImageBlock") return 80;

  return 40;
}

function defaultHeight(type: MovableBlock["type"]) {
  if (type === "Title") return 18;
  if (type === "Text") return 16;
  if (type === "Metric") return 36;
  if (type === "Chart") return 42;
  if (type === "ImageBlock") return 54;

  return 32;
}
