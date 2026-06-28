"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent, type PointerEvent } from "react";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  blockFrame,
  canvasPointFromRect,
  findAlignmentGuides,
  gridLineColor,
  hiddenEditablePreviewBlockIndices,
  interactionFrameUpdates,
  marqueeRect,
  selectedMovableBlockIndices,
  type AlignmentGuide,
  type CanvasInteraction,
  type Frame,
  type MarqueeSelection,
  type ResizeHandle
} from "@/features/pitch/application/previewCanvas";
import type { AddBlockOptions } from "@/features/pitch/application/motionDocCommands";
import type { SlideRow } from "@/features/pitch/ui/LayerSidebar";
import { CanvasBlockDock, CanvasSlideNav, CanvasTimeline } from "@/features/pitch/ui/preview/CanvasChrome";
import { CanvasSelectionLayer } from "@/features/pitch/ui/preview/CanvasSelectionLayer";
import { PreviewPane } from "@/features/pitch/ui/preview/PreviewPane";
import type { AddBlockType } from "@/features/pitch/ui/pitchOptions";

type FramePatch = { h?: number; w?: number; x?: number; y?: number };

type PreviewCanvasProps = {
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  isGridVisible: boolean;
  onAddBlock: (type: AddBlockType, options?: AddBlockOptions) => void;
  onAddTextAtPosition: (position: { x: number; y: number }) => void;
  onBeginBlockTransform: () => void;
  onClearSelection: () => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  onSelectBlock: (index: number, options?: { additive?: boolean; range?: boolean }) => void;
  onSelectBlocks: (indices: number[], options?: { additive?: boolean }) => void;
  onSelectSlide: (index: number) => void;
  onUpdateBlock: (blockIndex: number, newProps: Record<string, string | number>, newText?: string) => void;
  onUpdateBlockFrames: (updates: Array<{ blockIndex: number; frame: FramePatch }>, commit?: boolean) => void;
  replayNonce: number;
  sceneCount: number;
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  slideRows: SlideRow[];
  source: string;
  totalDuration: number;
};

export function PreviewCanvas({
  activeSlide,
  activeSlideIndex,
  isGridVisible,
  onAddBlock,
  onAddTextAtPosition,
  onBeginBlockTransform,
  onClearSelection,
  onSelectBlock,
  onSelectBlocks,
  onUpdateBlock,
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
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<CanvasInteraction | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [interactionBlockIndex, setInteractionBlockIndex] = useState<number | null>(null);
  const [marqueeSelection, setMarqueeSelection] = useState<MarqueeSelection | null>(null);
  const gridColor = gridLineColor(activeSlide);
  const hiddenPreviewBlockIndices = useMemo(
    () => hiddenEditablePreviewBlockIndices(activeSlide?.blocks ?? [], selectedBlockIndex, selectedBlockIndices),
    [activeSlide?.blocks, selectedBlockIndex, selectedBlockIndices]
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const updateScale = () => {
      const rect = canvas.getBoundingClientRect();
      setCanvasScale(rect.width > 0 ? rect.width / CANVAS_WIDTH : 1);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  function getCanvasPosition(event: { clientX: number; clientY: number }) {
    return canvasPointFromRect(event, canvasRef.current?.getBoundingClientRect());
  }

  function handleCanvasDoubleClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    onAddTextAtPosition(getCanvasPosition(event));
  }

  function handleToolDragOver(event: DragEvent<HTMLDivElement>) {
    if (event.dataTransfer.types.includes("application/x-slidex-tool")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function handleToolDrop(event: DragEvent<HTMLDivElement>) {
    const payload = event.dataTransfer.getData("application/x-slidex-tool");
    if (!payload) {
      return;
    }

    event.preventDefault();
    try {
      const tool = JSON.parse(payload) as { props?: Record<string, string | number>; type?: AddBlockType };
      if (tool.type) {
        onAddBlock(tool.type, { position: getCanvasPosition(event), props: tool.props });
      }
    } catch {
      // Ignore malformed drag payloads from outside the app.
    }
  }

  function startMove(event: PointerEvent<HTMLDivElement>, blockIndex: number, frame: Frame) {
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

  function startResize(event: PointerEvent<HTMLSpanElement>, blockIndex: number, handle: ResizeHandle, frame: Frame) {
    event.preventDefault();
    event.stopPropagation();
    const frameControl = event.currentTarget.closest("[data-frame-control]");

    if (frameControl instanceof HTMLElement) {
      frameControl.setPointerCapture(event.pointerId);
    }

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

  function updateInteraction(event: PointerEvent<HTMLDivElement>, commit = false) {
    const interaction = interactionRef.current;

    if (!interaction) {
      return;
    }

    const updates = interactionFrameUpdates(interaction, getCanvasPosition(event));

    setAlignmentGuides(findAlignmentGuides(activeSlide?.blocks ?? [], updates));
    onUpdateBlockFrames(updates, commit);
  }

  function endInteraction(event: PointerEvent<HTMLDivElement>, blockIndex: number) {
    const interaction = interactionRef.current;

    if (!interaction || interaction.blockIndex !== blockIndex) {
      return;
    }

    updateInteraction(event, true);
    event.currentTarget.releasePointerCapture(event.pointerId);
    interactionRef.current = null;
    setAlignmentGuides([]);
    setInteractionBlockIndex(null);
  }

  function startMarquee(event: PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    const pointer = getCanvasPosition(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    setMarqueeSelection({
      additive: event.metaKey || event.ctrlKey || event.shiftKey,
      current: pointer,
      pointerId: event.pointerId,
      start: pointer
    });
  }

  function updateMarquee(event: PointerEvent<HTMLDivElement>) {
    setMarqueeSelection((current) => {
      if (!current || current.pointerId !== event.pointerId) {
        return current;
      }

      return {
        ...current,
        current: getCanvasPosition(event)
      };
    });
  }

  function endMarquee(event: PointerEvent<HTMLDivElement>) {
    const selection = marqueeSelection
      ? { ...marqueeSelection, current: getCanvasPosition(event) }
      : null;

    if (!selection || selection.pointerId !== event.pointerId) {
      return;
    }

    const rect = marqueeRect(selection);
    const selectedIndices = selectedMovableBlockIndices(activeSlide?.blocks ?? [], rect);
    const isClick = rect.w < 0.6 && rect.h < 0.6;

    event.currentTarget.releasePointerCapture(event.pointerId);
    setMarqueeSelection(null);

    if (isClick) {
      onClearSelection();
      return;
    }

    onSelectBlocks(selectedIndices, { additive: selection.additive });
  }

  function cancelMarquee(event: PointerEvent<HTMLDivElement>) {
    if (marqueeSelection?.pointerId === event.pointerId) {
      setMarqueeSelection(null);
    }
  }

  return (
    <div
      className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#070709]"
      id="canvas-v4"
    >
      <CanvasSlideNav
        activeSlideIndex={activeSlideIndex}
        onNextSlide={onNextSlide}
        onPreviousSlide={onPreviousSlide}
        sceneCount={sceneCount}
      />

      <div
        className="custom-scrollbar relative z-0 flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-3 pb-14 pt-9 sm:p-4 sm:pb-20 sm:pt-12 md:p-8 md:pb-24 md:pt-16 bg-[#070709] bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px]"
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
          onDragOver={handleToolDragOver}
          onDrop={handleToolDrop}
          ref={canvasRef}
        >
          <div
            className="absolute left-0 top-0 overflow-hidden"
            style={{
              height: CANVAS_HEIGHT,
              transform: `scale(${canvasScale})`,
              transformOrigin: "left top",
              width: CANVAS_WIDTH
            }}
          >
            <PreviewPane
              activeSlideIndex={activeSlideIndex}
              hiddenBlockIndices={hiddenPreviewBlockIndices}
              replayNonce={replayNonce}
              source={source}
            />
          </div>
          {isGridVisible ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
                backgroundSize: `${40 * canvasScale}px ${40 * canvasScale}px`
              }}
            />
          ) : null}
          <CanvasSelectionLayer
            activeSlide={activeSlide}
            alignmentGuides={alignmentGuides}
            canvasScale={canvasScale}
            interactionBlockIndex={interactionBlockIndex}
            marqueeSelection={marqueeSelection}
            onCancelMarquee={cancelMarquee}
            onEndInteraction={endInteraction}
            onEndMarquee={endMarquee}
            onSelectBlock={onSelectBlock}
            onStartMarquee={startMarquee}
            onStartMove={startMove}
            onStartResize={startResize}
            onUpdateBlock={onUpdateBlock}
            onUpdateInteraction={updateInteraction}
            onUpdateMarquee={updateMarquee}
            selectedBlockIndex={selectedBlockIndex}
            selectedBlockIndices={selectedBlockIndices}
          />
        </div>

        <CanvasBlockDock onAddBlock={onAddBlock} />
      </div>

      <CanvasTimeline
        activeSlideIndex={activeSlideIndex}
        onSelectSlide={onSelectSlide}
        slideRows={slideRows}
        totalDuration={totalDuration}
      />
    </div>
  );
}
