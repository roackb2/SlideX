"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent, type PointerEvent, type WheelEvent } from "react";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import type { CanvasTool } from "@/features/pitch/application/canvasTools";
import { canvasZoomStepCountFromWheel, nextCanvasZoomScale } from "@/features/pitch/application/canvasZoom";
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
  type Frame,
  type ResizeHandle
} from "@/features/pitch/application/previewCanvas";
import { isPositionLocked, type AddBlockOptions, type InsertSlidePlacement } from "@/features/pitch/application/motionDocCommands";
import type { SlideRow } from "@/features/pitch/ui/LayerSidebar";
import { CanvasBlockDock, CanvasSlideAddControls, CanvasSlideNav, type CanvasZoomDirection } from "@/features/pitch/ui/preview/CanvasChrome";
import { MobileEdgePanelHandles } from "@/features/pitch/ui/preview/MobileCanvasChrome";
import { CanvasContextMenu } from "@/features/pitch/ui/preview/CanvasContextMenu";
import { CanvasSelectionLayer } from "@/features/pitch/ui/preview/CanvasSelectionLayer";
import { PreviewPane } from "@/features/pitch/ui/preview/PreviewPane";
import { useCanvasInteractionEngine } from "@/features/pitch/ui/preview/interaction/useCanvasInteractionEngine";
import { useCanvasPinchZoom } from "@/features/pitch/ui/preview/interaction/useCanvasPinchZoom";
import { useTransientFramePreview } from "@/features/pitch/ui/preview/interaction/useTransientFramePreview";
import type { BlockUpdater } from "@/features/pitch/ui/pitchCommandTypes";
import type { AddBlockType } from "@/features/pitch/ui/pitchOptions";

type FramePatch = { h?: number; w?: number; x?: number; y?: number };
type CanvasContextMenuState = {
  blockIndex: number | null;
  position: { x: number; y: number };
};
type CanvasPanState = {
  offsetX: number;
  offsetY: number;
  pointerId: number;
  startX: number;
  startY: number;
};
type CanvasPanCandidate = {
  offsetX: number;
  offsetY: number;
  pointerId: number;
  startX: number;
  startY: number;
};
type CanvasZoomPoint = {
  clientX: number;
  clientY: number;
};

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
  onUpdateBlockFrames: (updates: Array<{ blockIndex: number; frame: FramePatch }>) => void;
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
  const panStateRef = useRef<CanvasPanState | null>(null);
  const touchPanCandidateRef = useRef<CanvasPanCandidate | null>(null);
  const canvasInteraction = useCanvasInteractionEngine();
  const transientFramePreview = useTransientFramePreview({
    blocks: activeSlide?.blocks ?? emptyBlocks,
    onCommit: onUpdateBlockFrames
  });
  const { syncSelection } = canvasInteraction;
  const [canvasScale, setCanvasScale] = useState(1);
  const actualScale = zoomLevel === "fit" ? canvasScale : zoomLevel;
  const [contextMenu, setContextMenu] = useState<CanvasContextMenuState | null>(null);
  const [canvasViewportOffset, setCanvasViewportOffset] = useState({ x: 0, y: 0 });
  const [canvasViewportWidth, setCanvasViewportWidth] = useState(0);
  const [fitCanvasWidth, setFitCanvasWidth] = useState(799);
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);
  const [zoomDirection, setZoomDirection] = useState<CanvasZoomDirection>("in");
  const gridColor = gridLineColor(activeSlide);
  const canvasFrameWidth = zoomLevel === "fit" ? fitCanvasWidth : CANVAS_WIDTH * zoomLevel;
  const canvasStripMinimumPadding = canvasViewportWidth < mobileCanvasBreakpoint ? 12 : 48;
  const canvasStripSidePadding = Math.max(canvasStripMinimumPadding, Math.round((canvasViewportWidth - canvasFrameWidth) / 2));
  const workspaceGridStyle = workspaceGridStyleForScale(actualScale, canvasViewportOffset);
  const viewportCursorClass = activeCanvasTool === "hand"
    ? isPanningCanvas ? "cursor-grabbing" : "cursor-grab"
    : activeCanvasTool === "zoom" ? zoomDirection === "out" ? "cursor-zoom-out" : "cursor-zoom-in" : "";
  const hiddenPreviewBlockIndices = useMemo(
    () => hiddenEditablePreviewBlockIndices(activeSlide?.blocks ?? [], selectedBlockIndex, selectedBlockIndices),
    [activeSlide?.blocks, selectedBlockIndex, selectedBlockIndices]
  );
  const canvasPinchZoom = useCanvasPinchZoom({
    actualScale,
    getScrollArea: () => scrollAreaRef.current,
    onPinchStart: () => {
      panStateRef.current = null;
      touchPanCandidateRef.current = null;
      setIsPanningCanvas(false);
      setContextMenu(null);
      canvasInteraction.clearInteraction();
      transientFramePreview.reset();
    },
    onSetZoomLevel
  });

  useEffect(() => {
    activeCanvasToolRef.current = activeCanvasTool;
  }, [activeCanvasTool]);

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
  }, [activeSlideIndex, onFitScaleChange, sceneCount]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    const updateFitWidth = () => {
      const rect = scrollArea.getBoundingClientRect();
      const isMobileViewport = rect.width < mobileCanvasBreakpoint;
      const horizontalInset = isMobileViewport ? 24 : 96;
      const minimumWidth = isMobileViewport ? 240 : 280;
      const maximumWidth = isMobileViewport ? CANVAS_WIDTH : 799;
      setCanvasViewportWidth(rect.width);
      setFitCanvasWidth(Math.max(minimumWidth, Math.min(maximumWidth, rect.width - horizontalInset)));
    };

    updateFitWidth();

    const observer = new ResizeObserver(updateFitWidth);
    observer.observe(scrollArea);

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
  }, [activeCanvasTool]);

  useEffect(() => {
    const activeSlideFrame = activeSlideFrameRef.current;

    if (!activeSlideFrame || panStateRef.current || activeCanvasToolRef.current === "hand") {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollSlideFrameIntoView(activeSlideFrame, scrollAreaRef.current);
    });
  }, [activeSlideIndex, sceneCount]);

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
      const tool = JSON.parse(payload) as { props?: Record<string, string | number>; type?: AddBlockType };
      if (tool.type) {
        onAddBlock(tool.type, { position: getCanvasPosition(event), props: tool.props });
      }
    } catch {
      // Ignore malformed drag payloads from outside the app.
    }
  }

  function startMove(event: PointerEvent<HTMLDivElement>, blockIndex: number, frame: Frame) {
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
    frame: Frame,
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

    setContextMenu({
      blockIndex,
      position: clampedMenuPosition(event)
    });
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
    setContextMenu(null);
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
      setContextMenu(null);
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

  function handleCanvasToolPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (canvasPinchZoom.handlePointerDown(event)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest("button, [data-canvas-context-menu]")) {
      return;
    }

    if (
      event.pointerType === "touch"
      && activeCanvasTool === "select"
      && !isMobileEdgeGestureStart(event.clientX)
      && isDirectPanSurface(target)
    ) {
      touchPanCandidateRef.current = {
        offsetX: canvasViewportOffset.x,
        offsetY: canvasViewportOffset.y,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY
      };
      return;
    }

    if (activeCanvasTool === "hand") {
      startCanvasPan(event);
      return;
    }

    if (activeCanvasTool === "zoom" && (event.button === 0 || event.button === 2)) {
      event.preventDefault();
      event.stopPropagation();
      const direction = event.button === 2 || event.altKey ? "out" : "in";
      setZoomDirection(direction);
      zoomCanvasAtPoint(event, direction);
    }
  }

  function handleCanvasToolWheel(event: WheelEvent<HTMLDivElement>) {
    if (activeCanvasTool !== "zoom" || event.deltaY === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const direction = event.deltaY > 0 ? "out" : "in";
    const stepCount = canvasZoomStepCountFromWheel(event.deltaY);
    setZoomDirection(direction);
    zoomCanvasAtPoint(event, direction, stepCount);
  }

  function startCanvasPan(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    panStateRef.current = {
      offsetX: canvasViewportOffset.x,
      offsetY: canvasViewportOffset.y,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY
    };
    setContextMenu(null);
    setIsPanningCanvas(true);
    canvasInteraction.clearInteraction();
  }

  function updateCanvasPan(event: PointerEvent<HTMLDivElement>) {
    if (canvasPinchZoom.handlePointerMove(event)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const panCandidate = touchPanCandidateRef.current;

    if (!panStateRef.current && panCandidate?.pointerId === event.pointerId) {
      const distance = Math.hypot(event.clientX - panCandidate.startX, event.clientY - panCandidate.startY);

      if (distance >= directPanActivationDistance) {
        event.currentTarget.setPointerCapture(event.pointerId);
        panStateRef.current = { ...panCandidate };
        setContextMenu(null);
        setIsPanningCanvas(true);
        canvasInteraction.clearInteraction();
        transientFramePreview.reset();
      }
    }

    const panState = panStateRef.current;

    if (!panState || panState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setCanvasViewportOffset(clampCanvasViewportOffset({
      x: panState.offsetX + event.clientX - panState.startX,
      y: panState.offsetY + event.clientY - panState.startY
    }));
  }

  function endCanvasPan(event: PointerEvent<HTMLDivElement>) {
    if (canvasPinchZoom.handlePointerEnd(event)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const panState = panStateRef.current;
    touchPanCandidateRef.current = null;

    if (!panState || panState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.releasePointerCapture(event.pointerId);
    panStateRef.current = null;
    setIsPanningCanvas(false);
  }

  function zoomCanvasAtPoint(point: CanvasZoomPoint, direction: "in" | "out", stepCount = 1) {
    const scrollArea = scrollAreaRef.current;
    const nextScale = nextCanvasZoomScale(actualScale, direction, stepCount);

    if (!scrollArea || nextScale === actualScale) {
      onSetZoomLevel(nextScale);
      return;
    }

    const viewportRect = scrollArea.getBoundingClientRect();
    const pointerX = point.clientX - viewportRect.left;
    const pointerY = point.clientY - viewportRect.top;
    const contentX = scrollArea.scrollLeft + pointerX;
    const contentY = scrollArea.scrollTop + pointerY;
    const zoomRatio = nextScale / Math.max(actualScale, 0.01);

    onSetZoomLevel(nextScale);

    window.requestAnimationFrame(() => {
      scrollArea.scrollLeft = contentX * zoomRatio - pointerX;
      scrollArea.scrollTop = contentY * zoomRatio - pointerY;
    });
  }

  function fitCanvasToViewport() {
    setCanvasViewportOffset({ x: 0, y: 0 });
    onSetZoomLevel("fit");
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
      <MobileEdgePanelHandles onOpenInspector={onOpenMobileInspector} onOpenLayers={onOpenMobileLayers} />

      <div
        className={`custom-scrollbar relative z-0 flex min-h-0 flex-1 touch-none items-center justify-center overflow-auto bg-[#000000] px-3 pb-24 pt-12 sm:touch-auto sm:items-start sm:justify-start sm:p-4 sm:pb-20 sm:pt-12 md:p-8 md:pb-24 md:pt-16 ${viewportCursorClass}`}
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
        onWheelCapture={handleCanvasToolWheel}
        ref={scrollAreaRef}
        style={workspaceGridStyle}
      >
        <div
          className="relative flex min-h-full min-w-full shrink-0 items-center justify-start gap-12 sm:min-h-0 sm:items-start sm:gap-14 md:gap-16"
          style={{
            paddingLeft: canvasStripSidePadding,
            paddingRight: canvasStripSidePadding,
            transform: `translate3d(${canvasViewportOffset.x}px, ${canvasViewportOffset.y}px, 0)`
          }}
        >
          {slideRows.map((slide) => {
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
                    className={`group relative shrink-0 overflow-hidden bg-black shadow-xl ring-1 transition-all duration-200 ${
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
                    style={canvasFrameStyle(zoomLevel, fitCanvasWidth)}
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
                        marqueeSelection={canvasInteraction.marqueeSelection}
                        onCancelMarquee={cancelMarquee}
                        onEndInteraction={endInteraction}
                        onEndMarquee={endMarquee}
                        onSelectBlock={onSelectBlock}
                        onBeginTextEdit={(blockIndex) => {
                          canvasInteraction.beginEditingText(blockIndex);
                          onBeginBlockTransform();
                        }}
                        onStartMarquee={startMarquee}
                        onStartMove={startMove}
                        onStartResize={startResize}
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
                        onClose={() => setContextMenu(null)}
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
const canvasViewportOffsetLimit = 100000;
const workspaceGridBaseSize = 24;
const workspaceGridBaseDotSize = 1.5;
const directPanActivationDistance = 7;
const mobileCanvasBreakpoint = 640;

function isDirectPanSurface(target: HTMLElement | null) {
  return !target?.closest("[data-frame-control], button, input, textarea, select, [contenteditable='true']");
}

function isMobileEdgeGestureStart(clientX: number) {
  return clientX <= mobileEdgeGestureWidth || clientX >= window.innerWidth - mobileEdgeGestureWidth;
}

const mobileEdgeGestureWidth = 28;

function canvasFrameStyle(zoomLevel: number | "fit", fitCanvasWidth: number): CSSProperties {
  if (zoomLevel === "fit") {
    return {
      aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
      width: fitCanvasWidth
    };
  }

  return {
    height: CANVAS_HEIGHT * zoomLevel,
    width: CANVAS_WIDTH * zoomLevel
  };
}

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

function clampCanvasViewportOffset(offset: { x: number; y: number }) {
  return {
    x: Math.max(-canvasViewportOffsetLimit, Math.min(canvasViewportOffsetLimit, offset.x)),
    y: Math.max(-canvasViewportOffsetLimit, Math.min(canvasViewportOffsetLimit, offset.y))
  };
}

function workspaceGridStyleForScale(scale: number, offset: { x: number; y: number }) {
  const gridSize = Math.max(3, Math.min(640, workspaceGridBaseSize * scale));
  const dotSize = Math.max(0.6, Math.min(6, workspaceGridBaseDotSize * scale));

  return {
    backgroundImage: `radial-gradient(circle, #ffffff30 ${dotSize}px, transparent ${dotSize}px)`,
    backgroundPosition: `${offset.x}px ${offset.y}px`,
    backgroundSize: `${gridSize}px ${gridSize}px`
  };
}

function clampedMenuPosition(event: MouseEvent<HTMLDivElement>) {
  const menuWidth = 224;
  const menuHeight = 388;
  const margin = 12;

  return {
    x: Math.max(margin, Math.min(event.clientX, window.innerWidth - menuWidth - margin)),
    y: Math.max(margin, Math.min(event.clientY, window.innerHeight - menuHeight - margin))
  };
}
