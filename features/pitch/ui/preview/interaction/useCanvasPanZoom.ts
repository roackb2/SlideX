"use client";

import { useRef, useState, type Dispatch, type PointerEvent, type RefObject, type SetStateAction, type WheelEvent } from "react";
import type { CanvasTool } from "@/features/pitch/application/canvasTools";
import { canvasZoomStepCountFromWheel, nextCanvasZoomScale } from "@/features/pitch/application/canvasZoom";
import { useCanvasPinchZoom } from "@/features/pitch/ui/preview/interaction/useCanvasPinchZoom";

export type CanvasViewportOffset = { x: number; y: number };
export type CanvasZoomDirection = "in" | "out";

type CanvasPanState = CanvasViewportOffset & {
  pointerId: number;
  startX: number;
  startY: number;
};

type UseCanvasPanZoomArgs = {
  activeCanvasTool: CanvasTool;
  actualScale: number;
  canvasViewportOffset: CanvasViewportOffset;
  clearCanvasInteraction: () => void;
  closeContextMenu: () => void;
  onSetZoomLevel: (zoomLevel: number | "fit") => void;
  resetFramePreview: () => void;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  setCanvasViewportOffset: Dispatch<SetStateAction<CanvasViewportOffset>>;
};

export function useCanvasPanZoom({
  activeCanvasTool,
  actualScale,
  canvasViewportOffset,
  clearCanvasInteraction,
  closeContextMenu,
  onSetZoomLevel,
  resetFramePreview,
  scrollAreaRef,
  setCanvasViewportOffset
}: UseCanvasPanZoomArgs) {
  const panStateRef = useRef<CanvasPanState | null>(null);
  const touchPanCandidateRef = useRef<CanvasPanState | null>(null);
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const [zoomDirection, setZoomDirection] = useState<CanvasZoomDirection>("in");
  const canvasPinchZoom = useCanvasPinchZoom({
    actualScale,
    getScrollArea: () => scrollAreaRef.current,
    onPinchStart: () => {
      panStateRef.current = null;
      touchPanCandidateRef.current = null;
      setIsPanningCanvas(false);
      closeContextMenu();
      clearCanvasInteraction();
      resetFramePreview();
    },
    onSetZoomLevel
  });

  function handleCanvasToolPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (canvasPinchZoom.handlePointerDown(event)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest("button, [data-canvas-context-menu]")) return;

    if (
      event.pointerType === "touch"
      && activeCanvasTool === "select"
      && !isMobileEdgeGestureStart(event.clientX)
      && isDirectPanSurface(target)
    ) {
      touchPanCandidateRef.current = {
        ...canvasViewportOffset,
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
    if (activeCanvasTool !== "zoom" || event.deltaY === 0) return;
    event.preventDefault();
    event.stopPropagation();
    const direction = event.deltaY > 0 ? "out" : "in";
    setZoomDirection(direction);
    zoomCanvasAtPoint(event, direction, canvasZoomStepCountFromWheel(event.deltaY));
  }

  function startCanvasPan(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    panStateRef.current = {
      ...canvasViewportOffset,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY
    };
    closeContextMenu();
    setIsPanningCanvas(true);
    clearCanvasInteraction();
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
        closeContextMenu();
        setIsPanningCanvas(true);
        clearCanvasInteraction();
        resetFramePreview();
      }
    }

    const panState = panStateRef.current;
    if (!panState || panState.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    setCanvasViewportOffset(clampCanvasViewportOffset({
      x: panState.x + event.clientX - panState.startX,
      y: panState.y + event.clientY - panState.startY
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
    if (!panState || panState.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.releasePointerCapture(event.pointerId);
    panStateRef.current = null;
    setIsPanningCanvas(false);
  }

  function zoomCanvasAtPoint(point: { clientX: number; clientY: number }, direction: CanvasZoomDirection, stepCount = 1) {
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

  return {
    endCanvasPan,
    fitCanvasToViewport,
    handleCanvasToolPointerDown,
    handleCanvasToolWheel,
    isPanActive: () => panStateRef.current !== null,
    isPanningCanvas,
    setZoomDirection,
    updateCanvasPan,
    zoomDirection
  };
}

const canvasViewportOffsetLimit = 100000;
const directPanActivationDistance = 7;
const mobileEdgeGestureWidth = 28;

function isDirectPanSurface(target: HTMLElement | null) {
  return !target?.closest("[data-frame-control], button, input, textarea, select, [contenteditable='true']");
}

function isMobileEdgeGestureStart(clientX: number) {
  return clientX <= mobileEdgeGestureWidth || clientX >= window.innerWidth - mobileEdgeGestureWidth;
}

function clampCanvasViewportOffset(offset: CanvasViewportOffset) {
  return {
    x: Math.max(-canvasViewportOffsetLimit, Math.min(canvasViewportOffsetLimit, offset.x)),
    y: Math.max(-canvasViewportOffsetLimit, Math.min(canvasViewportOffsetLimit, offset.y))
  };
}
