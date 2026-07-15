"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent, type PointerEvent } from "react";
import { InteractiveDotField } from "@/common/ui/InteractiveDotField";
import { applyImageCropRect, fullImageCropRect, type ImageCropRect } from "@/core/motion-doc/application/imageCrop";
import type { MotionDocFrame } from "@/core/motion-doc/domain/frame";
import type { MotionDocProps, MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import type { CanvasTool } from "@/features/pitch/application/canvasTools";
import type { BlockFramePatch } from "@/features/pitch/application/pitchGeometry";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  blockFrame,
  canvasPointFromRect,
  gridLineColor,
  hiddenEditablePreviewBlockIndices,
  marqueeRect,
  selectedMovableBlockIndices,
  type CanvasInteraction,
  type ResizeHandle
} from "@/features/pitch/application/previewCanvas";
import { isPositionLocked, type AddBlockOptions, type InsertSlidePlacement } from "@/features/pitch/application/motionDocCommands";
import type { SlideRow } from "@/features/pitch/application/slideRows";
import { CanvasBlockDock, CanvasSlideAddControls, CanvasSlideNav } from "@/features/pitch/ui/preview/CanvasChrome";
import { MobileEdgePanelHandles } from "@/features/pitch/ui/preview/MobileCanvasChrome";
import { CanvasContextMenu } from "@/features/pitch/ui/preview/CanvasContextMenu";
import { CanvasSelectionLayer } from "@/features/pitch/ui/preview/CanvasSelectionLayer";
import { PreviewPane } from "@/features/pitch/ui/preview/PreviewPane";
import { useCanvasContextMenu } from "@/features/pitch/ui/preview/interaction/useCanvasContextMenu";
import { useCanvasInteractionEngine } from "@/features/pitch/ui/preview/interaction/useCanvasInteractionEngine";
import { useCanvasPanZoom } from "@/features/pitch/ui/preview/interaction/useCanvasPanZoom";
import { useTransientFramePreview } from "@/features/pitch/ui/preview/interaction/useTransientFramePreview";
import { useCanvasViewportMetrics } from "@/features/pitch/ui/preview/interaction/useCanvasViewportMetrics";
import type { BlockUpdater } from "@/features/pitch/application/pitchCommandTypes";
import type { AddBlockType } from "@/features/pitch/ui/pitchOptions";

type PreviewCanvasProps = {
  activeCanvasTool: CanvasTool;
  zoomLevel: number | "fit";
  onFitScaleChange?: (scale: number) => void;
  onSetZoomLevel: (zoomLevel: number | "fit") => void;
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  canPasteBlock: boolean;
  isGridVisible: boolean;
  onAddBlock: (type: AddBlockType, options?: AddBlockOptions) => void;

  onBeginBlockTransform: () => void;
  onClearSelection: () => void;
  onCopySelectedBlock: () => void;
  onDeleteSelectedBlocks: () => void;
  onDuplicateSelectedBlock: () => void;
  onGroupSelectedBlocks: () => void;
  onMoveSelectedBlocksToEdge: (edge: "back" | "front") => void;
  onOpenMobileInspector: () => void;
  onOpenMobileLayers: () => void;
  onNextSlide: () => void;
  onPasteCopiedBlock: () => void;
  onPreviousSlide: () => void;
  onSelectBlock: (index: number, options?: { additive?: boolean; range?: boolean }) => void;
  onSelectBlocks: (indices: number[], options?: { additive?: boolean }) => void;
  onSelectSlide: (index: number) => void;
  onInsertSlideNearActive: (placement: InsertSlidePlacement) => void;
  onCanvasToolChange: (tool: CanvasTool) => void;
  onToggleSelectedBlocksPositionLock: () => void;
  onUngroupSelectedBlocks: () => void;
  onUndo: () => void;
  onUpdateBlock: BlockUpdater;
  onUpdateBlockFrames: (updates: BlockFramePatch[]) => void;
  onUseSelectedImageAsBackground: () => void;
  replayNonce: number;
  sceneCount: number;
  scenes: MotionDocScene[];
  selectedBlockIndex: number | null;
  selectedBlockIndices: number[];
  selectedBlocksLocked: boolean;
  slideRows: SlideRow[];
  source: string;
};

export function PreviewCanvas({
  activeCanvasTool,
  zoomLevel,
  onFitScaleChange,
  onSetZoomLevel,
  activeSlide,
  activeSlideIndex,
  canPasteBlock,
  isGridVisible,
  onAddBlock,

  onBeginBlockTransform,
  onClearSelection,
  onCopySelectedBlock,
  onDeleteSelectedBlocks,
  onDuplicateSelectedBlock,
  onGroupSelectedBlocks,
  onMoveSelectedBlocksToEdge,
  onOpenMobileInspector,
  onOpenMobileLayers,
  onPasteCopiedBlock,
  onSelectBlock,
  onSelectBlocks,
  onToggleSelectedBlocksPositionLock,
  onUngroupSelectedBlocks,
  onUndo,
  onUpdateBlock,
  onUpdateBlockFrames,
  onUseSelectedImageAsBackground,
  onNextSlide,
  onPreviousSlide,
  onSelectSlide,
  onInsertSlideNearActive,
  onCanvasToolChange,
  replayNonce,
  sceneCount,
  scenes,
  selectedBlockIndex,
  selectedBlockIndices,
  selectedBlocksLocked,
  slideRows,
  source
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const activeSlideFrameRef = useRef<HTMLDivElement | null>(null);
  const activeCanvasToolRef = useRef<CanvasTool>(activeCanvasTool);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const canvasInteraction = useCanvasInteractionEngine();
  const transientFramePreview = useTransientFramePreview({
    blocks: activeSlide?.blocks ?? emptyBlocks,
    onCommit: onUpdateBlockFrames
  });
  const { syncSelection } = canvasInteraction;
  const [canvasViewportOffset, setCanvasViewportOffset] = useState({ x: 0, y: 0 });
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);
  const [imageCropTarget, setImageCropTarget] = useState<{ blockIndex: number; cropRect: ImageCropRect; slideIndex: number } | null>(null);
  const { closeContextMenu, contextMenu, openContextMenu } = useCanvasContextMenu();
  const { actualScale, canvasFrameStyle, canvasStripSidePadding } = useCanvasViewportMetrics({
    activeSlideIndex,
    canvasRef,
    onFitScaleChange,
    sceneCount,
    scrollAreaRef,
    zoomLevel
  });
  const imageCropBlockIndex = imageCropTarget?.slideIndex === activeSlideIndex && imageCropTarget.blockIndex === selectedBlockIndex && activeSlide?.blocks[imageCropTarget.blockIndex]?.type === "ImageBlock"
    ? imageCropTarget.blockIndex
    : null;
  const imageCropRect = imageCropBlockIndex === null ? null : imageCropTarget?.cropRect ?? null;
  const canvasPanZoom = useCanvasPanZoom({
    activeCanvasTool,
    actualScale,
    canvasRef,
    canvasViewportOffset,
    clearCanvasInteraction: canvasInteraction.clearInteraction,
    closeContextMenu,
    onSetZoomLevel,
    resetFramePreview: transientFramePreview.reset,
    scrollAreaRef,
    setCanvasViewportOffset
  });
  const {
    endCanvasPan,
    fitCanvasToViewport,
    handleCanvasToolPointerDown,
    isPanActive,
    isPanningCanvas,
    setZoomDirection,
    updateCanvasPan,
    zoomDirection
  } = canvasPanZoom;
  const gridColor = gridLineColor(activeSlide);
  const viewportCursorClass = activeCanvasTool === "hand"
    ? isPanningCanvas ? "cursor-grabbing" : "cursor-grab"
    : activeCanvasTool === "zoom" ? zoomDirection === "out" ? "cursor-zoom-out" : "cursor-zoom-in" : "";
  const hiddenPreviewBlockIndices = useMemo(
    () => hiddenEditablePreviewBlockIndices(activeSlide?.blocks ?? [], selectedBlockIndex, selectedBlockIndices),
    [activeSlide?.blocks, selectedBlockIndex, selectedBlockIndices]
  );
  const mountedSlideRows = useMemo(
    () => slideRows.filter((slide) => Math.abs(slide.index - activeSlideIndex) <= 1),
    [activeSlideIndex, slideRows]
  );
  useEffect(() => {
    activeCanvasToolRef.current = activeCanvasTool;
  }, [activeCanvasTool]);

  useEffect(() => {
    syncSelection({
      primaryIndex: selectedBlockIndex,
      selectedIndices: selectedBlockIndices.length > 0
        ? selectedBlockIndices
        : selectedBlockIndex === null ? [] : [selectedBlockIndex]
    });
  }, [selectedBlockIndex, selectedBlockIndices, syncSelection]);

  useEffect(() => {
    if (activeCanvasTool !== "zoom") {
      setZoomDirection("in");
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Alt") {
        setZoomDirection("out");
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === "Alt") {
        setZoomDirection("in");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeCanvasTool, setZoomDirection]);

  useEffect(() => {
    const activeSlideFrame = activeSlideFrameRef.current;

    if (!activeSlideFrame || isPanActive() || activeCanvasToolRef.current === "hand") {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollSlideFrameIntoView(activeSlideFrame, scrollAreaRef.current);
    });
  }, [activeSlideIndex, isPanActive, sceneCount]);

  function getCanvasPosition(event: { clientX: number; clientY: number }) {
    return canvasPointFromRect(event, canvasRef.current?.getBoundingClientRect());
  }

  function handleCanvasDoubleClick(event: MouseEvent<HTMLDivElement>) {
    if (activeCanvasTool !== "select") {
      return;
    }

    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
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
      const tool = JSON.parse(payload) as { props?: MotionDocProps; type?: AddBlockType };
      if (tool.type) {
        onAddBlock(tool.type, { position: getCanvasPosition(event), props: tool.props });
      }
    } catch {
      // Ignore malformed drag payloads from outside the app.
    }
  }

  function startMove(event: PointerEvent<HTMLDivElement>, blockIndex: number, frame: MotionDocFrame) {
    if (activeCanvasTool !== "select") {
      return;
    }

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
    transientFramePreview.reset();
    
    const moveIndices = (selectedBlockIndices.includes(blockIndex) ? selectedBlockIndices : [blockIndex])
      .filter((index) => {
        const selectedBlock = activeSlide?.blocks[index];
        return selectedBlock ? !isPositionLocked(selectedBlock) : false;
      });

    const interaction: CanvasInteraction = {
      blockIndex,
      mode: "move",
      startFrame: frame,
      startFrames: moveIndices.map((index) => ({
        blockIndex: index,
        frame: blockFrame(activeSlide?.blocks[index])
      })),
      startPointer: getCanvasPosition(event)
    };
    canvasInteraction.beginDragging(interaction);
    onBeginBlockTransform();
  }

  function startResize(
    event: PointerEvent<HTMLSpanElement>,
    blockIndex: number,
    handle: ResizeHandle,
    frame: MotionDocFrame,
    blockIndices: readonly number[] = [blockIndex]
  ) {
    if (activeCanvasTool !== "select") {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    transientFramePreview.reset();
    const block = activeSlide?.blocks[blockIndex];

    if (block && isPositionLocked(block)) {
      return;
    }

    const frameControl = event.currentTarget.closest("[data-frame-control]");

    if (frameControl instanceof HTMLElement) {
      frameControl.setPointerCapture(event.pointerId);
    }

    const interaction: CanvasInteraction = {
      blockIndex,
      handle,
      mode: "resize",
      startFrame: frame,
      startFrames: blockIndices.map((index) => ({
        blockIndex: index,
        frame: blockFrame(activeSlide?.blocks[index])
      })),
      startPointer: getCanvasPosition(event)
    };
    canvasInteraction.beginResizing(interaction);
    onBeginBlockTransform();
    if (blockIndices.length === 1) {
      onSelectBlock(blockIndex);
    }
  }

  function toggleImageCrop(blockIndex: number) {
    if (imageCropBlockIndex === blockIndex) {
      const block = activeSlide?.blocks[blockIndex];
      if (block?.type === "ImageBlock" && imageCropRect) {
        onBeginBlockTransform();
        onUpdateBlock(blockIndex, applyImageCropRect(block.props, imageCropRect));
      }
      setImageCropTarget(null);
      return;
    }

    onSelectBlock(blockIndex);
    setImageCropTarget({ blockIndex, cropRect: fullImageCropRect, slideIndex: activeSlideIndex });
  }

  function updateImageCropRect(cropRect: ImageCropRect) {
    setImageCropTarget((current) => current ? { ...current, cropRect } : current);
  }

  function updateInteraction(event: PointerEvent<HTMLDivElement>, commit = false) {
    const updates = canvasInteraction.frameUpdatesForPointer(getCanvasPosition(event));

    if (!updates) {
      return;
    }

    if (commit) {
      transientFramePreview.commit(updates);
      return;
    }
    transientFramePreview.preview(updates);
  }

  function endInteraction(event: PointerEvent<HTMLDivElement>, blockIndex: number) {
    if (!canvasInteraction.isTransformingBlock(blockIndex)) {
      return;
    }

    updateInteraction(event, true);
    event.currentTarget.releasePointerCapture(event.pointerId);
    canvasInteraction.finishTransform();
  }

  function startMarquee(event: PointerEvent<HTMLDivElement>) {
    if (activeCanvasTool !== "select") {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    const pointer = getCanvasPosition(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    canvasInteraction.beginMarquee({
      additive: event.metaKey || event.ctrlKey || event.shiftKey,
      current: pointer,
      pointerId: event.pointerId,
      start: pointer
    });
  }

  function updateMarquee(event: PointerEvent<HTMLDivElement>) {
    canvasInteraction.updateMarquee(event.pointerId, getCanvasPosition(event));
  }

  function endMarquee(event: PointerEvent<HTMLDivElement>) {
    const selection = canvasInteraction.marqueeSelection
      ? { ...canvasInteraction.marqueeSelection, current: getCanvasPosition(event) }
      : null;

    if (!selection || selection.pointerId !== event.pointerId) {
      return;
    }

    const rect = marqueeRect(selection);
    const selectedIndices = selectedMovableBlockIndices(activeSlide?.blocks ?? [], rect);
    const isClick = rect.w < 0.6 && rect.h < 0.6;

    event.currentTarget.releasePointerCapture(event.pointerId);

    if (isClick) {
      canvasInteraction.clearInteraction();
      onClearSelection();
      return;
    }

    canvasInteraction.select({
      primaryIndex: selectedIndices[0] ?? null,
      selectedIndices
    });
    onSelectBlocks(selectedIndices, { additive: selection.additive });
  }

  function cancelMarquee(event: PointerEvent<HTMLDivElement>) {
    canvasInteraction.cancelMarquee(event.pointerId);
  }

  function openLayerContextMenu(event: MouseEvent<HTMLDivElement>, blockIndex: number | null) {
    event.preventDefault();
    event.stopPropagation();

    if (blockIndex !== null && !selectedBlockIndices.includes(blockIndex) && selectedBlockIndex !== blockIndex) {
      onSelectBlock(blockIndex);
    }

    openContextMenu(event, blockIndex);
  }

  function handleSlideFramePointerDown(event: PointerEvent<HTMLDivElement>, slideIndex: number) {
    if (event.button !== 0 || activeCanvasTool !== "select") {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest("button, [data-canvas-context-menu]")) {
      return;
    }

    if (slideIndex === activeSlideIndex) {
      if (!target?.closest("[data-frame-control]")) {
        scrollSlideFrameIntoView(event.currentTarget, scrollAreaRef.current);
      }
      return;
    }

    scrollSlideFrameIntoView(event.currentTarget, scrollAreaRef.current);
    closeContextMenu();
    canvasInteraction.clearInteraction();
    onSelectSlide(slideIndex);
  }

  function handleCanvasContextMenu(event: MouseEvent<HTMLDivElement>) {
    if (activeCanvasTool === "zoom") {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (activeCanvasTool !== "select") {
      return;
    }

    const target = event.target;

    if (!(target instanceof HTMLElement) || target.closest("[data-canvas-context-menu]")) {
      return;
    }

    if (target.closest("[data-table-context-target], [data-table-context-menu], [data-table-style-popover]")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const slideFrameIndex = slideIndexFromTarget(target);

    if (slideFrameIndex !== null && slideFrameIndex !== activeSlideIndex) {
      closeContextMenu();
      canvasInteraction.clearInteraction();
      onSelectSlide(slideFrameIndex);
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
      className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#090909]"
      id="canvas-v4"
      onContextMenuCapture={handleCanvasContextMenu}
    >
      <InteractiveDotField className="z-0 opacity-65" />
      <CanvasSlideNav
        activeSlideIndex={activeSlideIndex}
        onNextSlide={onNextSlide}
        onPreviousSlide={onPreviousSlide}
        sceneCount={sceneCount}
      />
      <MobileEdgePanelHandles onOpenInspector={onOpenMobileInspector} onOpenLayers={onOpenMobileLayers} />

      <div
        className={`custom-scrollbar relative z-0 flex min-h-0 flex-1 touch-none items-center justify-center overflow-auto bg-transparent px-3 pb-24 pt-12 sm:touch-auto sm:items-start sm:justify-start sm:p-4 sm:pb-20 sm:pt-12 md:p-8 md:pb-24 md:pt-16 ${viewportCursorClass}`}
        onPointerCancelCapture={endCanvasPan}
        onPointerDownCapture={handleCanvasToolPointerDown}
        onPointerDown={(event) => {
          if (activeCanvasTool === "select" && event.target === event.currentTarget) {
            canvasInteraction.clearInteraction();
            onClearSelection();
          }
        }}
        onPointerMoveCapture={updateCanvasPan}
        onPointerUpCapture={endCanvasPan}
        ref={scrollAreaRef}
        style={{ overflowAnchor: "none" }}
      >
        <div
          className="relative flex min-h-full min-w-full shrink-0 items-center justify-start gap-12 sm:min-h-0 sm:items-start sm:gap-14 md:gap-16"
          style={{
            paddingLeft: canvasStripSidePadding,
            paddingRight: canvasStripSidePadding,
            transform: `translate3d(${canvasViewportOffset.x}px, ${canvasViewportOffset.y}px, 0)`
          }}
        >
          {mountedSlideRows.map((slide) => {
            const isActiveSlideFrame = slide.index === activeSlideIndex;
            const slideScene = scenes[slide.index];

            return (
              <div
                className={`relative shrink-0 flex-col gap-2 ${isActiveSlideFrame ? "z-10 flex" : "z-0 hidden opacity-85 transition-opacity hover:opacity-100 sm:flex"}`}
                data-slide-frame-index={slide.index}
                key={slide.index}
                onPointerDown={(event) => handleSlideFramePointerDown(event, slide.index)}
                ref={isActiveSlideFrame ? activeSlideFrameRef : undefined}
              >
                <div className="hidden h-6 items-center justify-between px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 sm:flex">
                  <span className={isActiveSlideFrame ? "text-[#8ea5ff]" : undefined}>Slide {slide.index + 1}</span>
                  <span>{slideScene?.duration ?? slide.duration}s</span>
                </div>
                <div className="relative">
                  {isActiveSlideFrame && !isMouseOverCanvas ? <CanvasSlideAddControls onInsertSlideNearActive={onInsertSlideNearActive} /> : null}
                  <div
                    aria-current={isActiveSlideFrame ? "true" : undefined}
                    aria-label={`Slide ${slide.index + 1} canvas, 16:9 ${CANVAS_WIDTH} by ${CANVAS_HEIGHT}`}
                    className={`group relative shrink-0 overflow-hidden bg-black shadow-xl ring-1 transition-shadow duration-200 ${
                      isActiveSlideFrame
                        ? "ring-[#8ea5ff]/70 shadow-[0_24px_80px_rgba(0,0,0,0.62),0_0_0_1px_rgba(142,165,255,0.2)]"
                        : "ring-neutral-800/80 hover:ring-white/20"
                    }`}
                    onDoubleClick={isActiveSlideFrame ? handleCanvasDoubleClick : undefined}
                    onDragOver={isActiveSlideFrame ? handleToolDragOver : undefined}
                    onDrop={isActiveSlideFrame ? handleToolDrop : undefined}
                    onMouseEnter={isActiveSlideFrame ? () => setIsMouseOverCanvas(true) : undefined}
                    onMouseLeave={isActiveSlideFrame ? () => setIsMouseOverCanvas(false) : undefined}
                    ref={isActiveSlideFrame ? canvasRef : undefined}
                    style={canvasFrameStyle}
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
                        activeSlideIndex={slide.index}
                        hiddenBlockIndices={isActiveSlideFrame ? hiddenPreviewBlockIndices : emptyBlockIndices}
                        frameOverrides={isActiveSlideFrame ? transientFramePreview.frameOverrides : undefined}
                        imageFetchPriority={isActiveSlideFrame ? "high" : "low"}
                        imageLoading={isActiveSlideFrame ? "eager" : "lazy"}
                        replayNonce={replayNonce}
                        scene={slideScene}
                        source={source}
                      />
                    </div>
                    {isActiveSlideFrame && isGridVisible ? (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-30"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
                          backgroundSize: `${40 * actualScale}px ${40 * actualScale}px`
                        }}
                      />
                    ) : null}
                    {isActiveSlideFrame ? (
                      <CanvasSelectionLayer
                        activeSlide={activeSlide}
                        alignmentGuides={transientFramePreview.alignmentGuides}
                        canvasScale={actualScale}
                        frameOverrides={transientFramePreview.frameOverrides}
                        interactionBlockIndex={canvasInteraction.transform?.blockIndex ?? null}
                        interactionMode={canvasInteraction.mode}
                        imageCropBlockIndex={imageCropBlockIndex}
                        imageCropRect={imageCropRect}
                        marqueeSelection={canvasInteraction.marqueeSelection}
                        onCancelMarquee={cancelMarquee}
                        onEndInteraction={endInteraction}
                        onEndMarquee={endMarquee}
                        onSelectBlock={onSelectBlock}
                        onBeginTextEdit={(blockIndex) => {
                          canvasInteraction.beginEditingText(blockIndex);
                          onBeginBlockTransform();
                        }}
                        onBeginBlockTransform={onBeginBlockTransform}
                        onImageCropRectChange={updateImageCropRect}
                        onStartMarquee={startMarquee}
                        onStartMove={startMove}
                        onStartResize={startResize}
                        onToggleImageCrop={toggleImageCrop}
                        onUpdateBlock={onUpdateBlock}
                        onUpdateInteraction={updateInteraction}
                        onUpdateMarquee={updateMarquee}
                        activeCanvasTool={activeCanvasTool}
                        selectedBlockIndex={selectedBlockIndex}
                        selectedBlockIndices={selectedBlockIndices}
                      />
                    ) : null}
                    {isActiveSlideFrame && contextMenu ? (
                      <CanvasContextMenu
                        canGroup={selectedBlockIndices.length > 1}
                        canPaste={canPasteBlock}
                        canUngroup={selectedBlockIndices.some((index) => {
                          const block = activeSlide?.blocks[index];
                          return Boolean(block && "props" in block && block.props.groupId);
                        })}
                        onClose={closeContextMenu}
                        onCopy={onCopySelectedBlock}
                        onDelete={onDeleteSelectedBlocks}
                        onDuplicate={onDuplicateSelectedBlock}
                        onGroup={onGroupSelectedBlocks}
                        onMoveToBack={() => onMoveSelectedBlocksToEdge("back")}
                        onMoveToFront={() => onMoveSelectedBlocksToEdge("front")}
                        onPaste={onPasteCopiedBlock}
                        onToggleLock={onToggleSelectedBlocksPositionLock}
                        onUngroup={onUngroupSelectedBlocks}
                        onUseAsBackground={onUseSelectedImageAsBackground}
                        position={contextMenu.position}
                        selectedBlock={contextMenu.blockIndex === null ? undefined : activeSlide?.blocks[contextMenu.blockIndex]}
                        selectedBlocksLocked={selectedBlocksLocked}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <CanvasBlockDock
        activeCanvasTool={activeCanvasTool}
        onAddBlock={onAddBlock}
        onCanvasToolChange={onCanvasToolChange}
        onFitMobile={fitCanvasToViewport}
        onInsertSlideAfter={() => onInsertSlideNearActive("after")}
        onOpenMobileInspector={onOpenMobileInspector}
        onOpenMobileLayers={onOpenMobileLayers}
        onUndoMobile={onUndo}
        zoomDirection={zoomDirection}
      />
    </div>
  );
}

const emptyBlockIndices: number[] = [];
const emptyBlocks: MotionDocScene["blocks"] = [];
function slideIndexFromTarget(target: HTMLElement) {
  const slideFrame = target.closest("[data-slide-frame-index]");

  if (!(slideFrame instanceof HTMLElement)) {
    return null;
  }

  const slideIndex = Number(slideFrame.dataset.slideFrameIndex);
  return Number.isInteger(slideIndex) ? slideIndex : null;
}

function scrollSlideFrameIntoView(slideFrame: HTMLElement, scrollArea: HTMLElement | null) {
  if (!scrollArea) {
    slideFrame.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
    return;
  }

  const slideRect = slideFrame.getBoundingClientRect();
  const viewportRect = scrollArea.getBoundingClientRect();
  const slideCenterX = slideRect.left + slideRect.width / 2;
  const slideCenterY = slideRect.top + slideRect.height / 2;
  const viewportCenterX = viewportRect.left + viewportRect.width / 2;
  const viewportCenterY = viewportRect.top + viewportRect.height / 2;

  scrollArea.scrollTo({
    behavior: "smooth",
    left: scrollArea.scrollLeft + slideCenterX - viewportCenterX,
    top: scrollArea.scrollTop + slideCenterY - viewportCenterY
  });
}
