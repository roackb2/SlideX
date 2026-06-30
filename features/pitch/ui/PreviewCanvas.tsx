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
import { isPositionLocked, type AddBlockOptions } from "@/features/pitch/application/motionDocCommands";
import type { SlideRow } from "@/features/pitch/ui/LayerSidebar";
import { CanvasBlockDock, CanvasSlideNav } from "@/features/pitch/ui/preview/CanvasChrome";
import { CanvasContextMenu } from "@/features/pitch/ui/preview/CanvasContextMenu";
import { CanvasSelectionLayer } from "@/features/pitch/ui/preview/CanvasSelectionLayer";
import { PreviewPane } from "@/features/pitch/ui/preview/PreviewPane";
import type { BlockUpdater } from "@/features/pitch/ui/pitchCommandTypes";
import type { AddBlockType } from "@/features/pitch/ui/pitchOptions";

type FramePatch = { h?: number; w?: number; x?: number; y?: number };
type CanvasContextMenuState = {
  blockIndex: number | null;
  position: { x: number; y: number };
};

type PreviewCanvasProps = {
  zoomLevel: number | "fit";
  onFitScaleChange?: (scale: number) => void;
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  canPasteBlock: boolean;
  isGridVisible: boolean;
  onAddBlock: (type: AddBlockType, options?: AddBlockOptions) => void;
  onAddTextAtPosition: (position: { x: number; y: number }) => void;
  onBeginBlockTransform: () => void;
  onClearSelection: () => void;
  onCopySelectedBlock: () => void;
  onDeleteSelectedBlocks: () => void;
  onDuplicateSelectedBlock: () => void;
  onNextSlide: () => void;
  onPasteCopiedBlock: () => void;
  onPreviousSlide: () => void;
  onSelectBlock: (index: number, options?: { additive?: boolean; range?: boolean }) => void;
  onSelectBlocks: (indices: number[], options?: { additive?: boolean }) => void;
  onSelectSlide: (index: number) => void;
  onToggleSelectedBlocksPositionLock: () => void;
  onUpdateBlock: BlockUpdater;
  onUpdateBlockFrames: (updates: Array<{ blockIndex: number; frame: FramePatch }>, commit?: boolean) => void;
  onUseSelectedImageAsBackground: () => void;
  replayNonce: number;
  sceneCount: number;
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  selectedBlocksLocked: boolean;
  slideRows: SlideRow[];
  source: string;
  totalDuration: number;
};

export function PreviewCanvas({
  zoomLevel,
  onFitScaleChange,
  activeSlide,
  activeSlideIndex,
  canPasteBlock,
  isGridVisible,
  onAddBlock,
  onAddTextAtPosition,
  onBeginBlockTransform,
  onClearSelection,
  onCopySelectedBlock,
  onDeleteSelectedBlocks,
  onDuplicateSelectedBlock,
  onPasteCopiedBlock,
  onSelectBlock,
  onSelectBlocks,
  onToggleSelectedBlocksPositionLock,
  onUpdateBlock,
  onUpdateBlockFrames,
  onUseSelectedImageAsBackground,
  onNextSlide,
  onPreviousSlide,
  onSelectSlide,
  replayNonce,
  sceneCount,
  selectedBlockIndex,
  selectedBlockIndices,
  selectedBlocksLocked,
  slideRows,
  source,
  totalDuration
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<CanvasInteraction | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const actualScale = zoomLevel === "fit" ? canvasScale : zoomLevel;
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [interactionBlockIndex, setInteractionBlockIndex] = useState<number | null>(null);
  const [marqueeSelection, setMarqueeSelection] = useState<MarqueeSelection | null>(null);
  const [contextMenu, setContextMenu] = useState<CanvasContextMenuState | null>(null);
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
      const scale = rect.width > 0 ? rect.width / CANVAS_WIDTH : 1;
      setCanvasScale(scale);
      onFitScaleChange?.(scale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    function closeContextMenu() {
      setContextMenu(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    }

    window.addEventListener("pointerdown", closeContextMenu);
    window.addEventListener("resize", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", closeContextMenu);
      window.removeEventListener("resize", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu]);

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
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    const additive = event.metaKey || event.ctrlKey;
    const range = event.shiftKey;
    const block = activeSlide?.blocks[blockIndex];

    if (additive || range) {
      onSelectBlock(blockIndex, { additive, range });
      return;
    }

    if (block && isPositionLocked(block)) {
      onSelectBlock(blockIndex);
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
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const block = activeSlide?.blocks[blockIndex];

    if (block && isPositionLocked(block)) {
      return;
    }

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
    if (event.button !== 0) {
      return;
    }

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

  function openLayerContextMenu(event: MouseEvent<HTMLDivElement>, blockIndex: number | null) {
    event.preventDefault();
    event.stopPropagation();

    if (blockIndex !== null && !selectedBlockIndices.includes(blockIndex) && selectedBlockIndex !== blockIndex) {
      onSelectBlock(blockIndex);
    }

    setContextMenu({
      blockIndex,
      position: clampedMenuPosition(event)
    });
  }

  function handleCanvasContextMenu(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target;

    if (!(target instanceof HTMLElement) || target.closest("[data-canvas-context-menu]")) {
      return;
    }

    const frameControl = target.closest("[data-frame-control][data-block-index]");

    if (frameControl instanceof HTMLElement) {
      const blockIndex = Number(frameControl.dataset.blockIndex);

      if (Number.isInteger(blockIndex)) {
        openLayerContextMenu(event, blockIndex);
        return;
      }
    }

    openLayerContextMenu(event, selectedBlockIndex ?? selectedBlockIndices[selectedBlockIndices.length - 1] ?? null);
  }

  return (
    <div
      className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#000000]"
      id="canvas-v4"
      onContextMenuCapture={handleCanvasContextMenu}
    >
      <CanvasSlideNav
        activeSlideIndex={activeSlideIndex}
        onNextSlide={onNextSlide}
        onPreviousSlide={onPreviousSlide}
        sceneCount={sceneCount}
      />

      <div
        className="custom-scrollbar relative z-0 flex min-h-0 flex-1 items-start justify-center overflow-auto p-3 pb-14 pt-9 sm:p-4 sm:pb-20 sm:pt-12 md:p-8 md:pb-24 md:pt-16 bg-[#000000] bg-[radial-gradient(#ffffff30_1.5px,transparent_1.5px)] [background-size:24px_24px]"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            onClearSelection();
          }
        }}
      >
        <div
          aria-label={`16:9 canvas ${CANVAS_WIDTH} by ${CANVAS_HEIGHT}`}
          className={`group relative overflow-hidden bg-black shadow-xl ring-1 ring-neutral-800 shrink-0 ${zoomLevel === "fit" ? "aspect-video w-full max-w-[799px]" : ""}`}
          style={zoomLevel === "fit" ? undefined : { width: CANVAS_WIDTH * zoomLevel, height: CANVAS_HEIGHT * zoomLevel }}
          onDoubleClick={handleCanvasDoubleClick}
          onDragOver={handleToolDragOver}
          onDrop={handleToolDrop}
          ref={canvasRef}
        >
          <div
            className="absolute left-0 top-0 overflow-hidden"
            style={{
              height: CANVAS_HEIGHT,
              transform: `scale(${actualScale})`,
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
                backgroundSize: `${40 * actualScale}px ${40 * actualScale}px`
              }}
            />
          ) : null}
          <CanvasSelectionLayer
            activeSlide={activeSlide}
            alignmentGuides={alignmentGuides}
            canvasScale={actualScale}
            interactionBlockIndex={interactionBlockIndex}
            marqueeSelection={marqueeSelection}
            onCancelMarquee={cancelMarquee}
            onEndInteraction={endInteraction}
            onEndMarquee={endMarquee}
            onSelectBlock={onSelectBlock}
            onBeginTextEdit={onBeginBlockTransform}
            onStartMarquee={startMarquee}
            onStartMove={startMove}
            onStartResize={startResize}
            onUpdateBlock={onUpdateBlock}
            onUpdateInteraction={updateInteraction}
            onUpdateMarquee={updateMarquee}
            selectedBlockIndex={selectedBlockIndex}
            selectedBlockIndices={selectedBlockIndices}
          />
          {contextMenu ? (
            <CanvasContextMenu
              canPaste={canPasteBlock}
              onClose={() => setContextMenu(null)}
              onCopy={onCopySelectedBlock}
              onDelete={onDeleteSelectedBlocks}
              onDuplicate={onDuplicateSelectedBlock}
              onPaste={onPasteCopiedBlock}
              onToggleLock={onToggleSelectedBlocksPositionLock}
              onUseAsBackground={onUseSelectedImageAsBackground}
              position={contextMenu.position}
              selectedBlock={contextMenu.blockIndex === null ? undefined : activeSlide?.blocks[contextMenu.blockIndex]}
              selectedBlocksLocked={selectedBlocksLocked}
            />
          ) : null}
        </div>

        <CanvasBlockDock onAddBlock={onAddBlock} />
      </div>
    </div>
  );
}

function clampedMenuPosition(event: MouseEvent<HTMLDivElement>) {
  const menuWidth = 224;
  const menuHeight = 264;
  const margin = 12;

  return {
    x: Math.max(margin, Math.min(event.clientX, window.innerWidth - menuWidth - margin)),
    y: Math.max(margin, Math.min(event.clientY, window.innerHeight - menuHeight - margin))
  };
}
