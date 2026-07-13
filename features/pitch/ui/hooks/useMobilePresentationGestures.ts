"use client";

import { useCallback, useRef, useState, type PointerEvent, type RefObject } from "react";

type Point = { x: number; y: number };
type SingleGesture = Point & { lastX: number; lastY: number; pointerId: number };
type PinchGesture = { distance: number; zoom: number };
type MobilePresentationViewport = { x: number; y: number; zoom: number };

type UseMobilePresentationGesturesOptions = {
  frameRef: RefObject<HTMLDivElement | null>;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
};

const maximumZoom = 3;
const minimumZoom = 1;
const swipeThreshold = 54;

export function useMobilePresentationGestures({
  frameRef,
  onNextSlide,
  onPreviousSlide
}: UseMobilePresentationGesturesOptions) {
  const pointsRef = useRef(new Map<number, Point>());
  const pinchRef = useRef<PinchGesture | null>(null);
  const singleRef = useRef<SingleGesture | null>(null);
  const viewportRef = useRef<MobilePresentationViewport>({ x: 0, y: 0, zoom: 1 });
  const [viewport, setViewportState] = useState<MobilePresentationViewport>({ x: 0, y: 0, zoom: 1 });

  const setViewport = useCallback((next: MobilePresentationViewport) => {
    viewportRef.current = next;
    setViewportState(next);
  }, []);

  const resetViewport = useCallback(() => {
    pointsRef.current.clear();
    pinchRef.current = null;
    singleRef.current = null;
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, [setViewport]);

  function clampOffset(zoom: number, x: number, y: number) {
    const rect = frameRef.current?.getBoundingClientRect();
    const maxX = ((rect?.width ?? 0) * (zoom - 1)) / 2;
    const maxY = ((rect?.height ?? 0) * (zoom - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointsRef.current.size === 1) {
      singleRef.current = {
        lastX: event.clientX,
        lastY: event.clientY,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY
      };
      return;
    }

    if (pointsRef.current.size === 2) {
      const [first, second] = [...pointsRef.current.values()];
      pinchRef.current = {
        distance: Math.max(distanceBetween(first, second), 1),
        zoom: viewportRef.current.zoom
      };
      singleRef.current = null;
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointsRef.current.has(event.pointerId)) return;
    pointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointsRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = [...pointsRef.current.values()];
      const nextZoom = Math.max(
        minimumZoom,
        Math.min(maximumZoom, pinchRef.current.zoom * distanceBetween(first, second) / pinchRef.current.distance)
      );
      const offset = clampOffset(nextZoom, viewportRef.current.x, viewportRef.current.y);
      setViewport({ ...offset, zoom: nextZoom });
      return;
    }

    const single = singleRef.current;
    const current = viewportRef.current;

    if (!single || single.pointerId !== event.pointerId || current.zoom <= minimumZoom) return;

    const offset = clampOffset(
      current.zoom,
      current.x + event.clientX - single.lastX,
      current.y + event.clientY - single.lastY
    );
    single.lastX = event.clientX;
    single.lastY = event.clientY;
    setViewport({ ...offset, zoom: current.zoom });
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const wasPinching = pointsRef.current.size > 1 || pinchRef.current !== null;
    const single = singleRef.current;
    pointsRef.current.delete(event.pointerId);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!wasPinching && single?.pointerId === event.pointerId && viewportRef.current.zoom <= minimumZoom) {
      const deltaX = event.clientX - single.x;
      const deltaY = event.clientY - single.y;
      if (Math.abs(deltaX) >= swipeThreshold && Math.abs(deltaY) <= Math.abs(deltaX) * 0.7) {
        if (deltaX < 0) onNextSlide();
        else onPreviousSlide();
      }
    }

    pinchRef.current = null;
    singleRef.current = null;
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    pointsRef.current.delete(event.pointerId);
    pinchRef.current = null;
    singleRef.current = null;
  }

  return {
    handlePointerCancel,
    handlePointerDown,
    handlePointerEnd,
    handlePointerMove,
    isZoomed: viewport.zoom > minimumZoom + 0.01,
    resetViewport,
    transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
    zoom: viewport.zoom
  };
}

function distanceBetween(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}
