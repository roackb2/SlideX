"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/features/pitch/application/previewCanvas";

const mobileCanvasBreakpoint = 640;
const workspaceGridBaseSize = 24;
const workspaceGridBaseDotSize = 1.5;

type UseCanvasViewportMetricsOptions = {
  activeSlideIndex: number;
  canvasRef: RefObject<HTMLDivElement | null>;
  canvasViewportOffset: { x: number; y: number };
  onFitScaleChange?: (scale: number) => void;
  sceneCount: number;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  zoomLevel: number | "fit";
};

export function useCanvasViewportMetrics({
  activeSlideIndex,
  canvasRef,
  canvasViewportOffset,
  onFitScaleChange,
  sceneCount,
  scrollAreaRef,
  zoomLevel
}: UseCanvasViewportMetricsOptions) {
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasViewportWidth, setCanvasViewportWidth] = useState(0);
  const [fitCanvasWidth, setFitCanvasWidth] = useState(799);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
  }, [activeSlideIndex, canvasRef, onFitScaleChange, sceneCount]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

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
  }, [scrollAreaRef]);

  const actualScale = zoomLevel === "fit" ? canvasScale : zoomLevel;
  const canvasFrameWidth = zoomLevel === "fit" ? fitCanvasWidth : CANVAS_WIDTH * zoomLevel;
  const canvasStripMinimumPadding = canvasViewportWidth < mobileCanvasBreakpoint ? 12 : 48;

  return {
    actualScale,
    canvasFrameStyle: frameStyle(zoomLevel, fitCanvasWidth),
    canvasStripSidePadding: Math.max(canvasStripMinimumPadding, Math.round((canvasViewportWidth - canvasFrameWidth) / 2)),
    workspaceGridStyle: gridStyle(actualScale, canvasViewportOffset)
  };
}

function frameStyle(zoomLevel: number | "fit", fitCanvasWidth: number): CSSProperties {
  if (zoomLevel === "fit") {
    return { aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`, width: fitCanvasWidth };
  }

  return { height: CANVAS_HEIGHT * zoomLevel, width: CANVAS_WIDTH * zoomLevel };
}

function gridStyle(scale: number, offset: { x: number; y: number }): CSSProperties {
  const gridSize = Math.max(3, Math.min(640, workspaceGridBaseSize * scale));
  const dotSize = Math.max(0.6, Math.min(6, workspaceGridBaseDotSize * scale));

  return {
    backgroundImage: `radial-gradient(circle, #ffffff30 ${dotSize}px, transparent ${dotSize}px)`,
    backgroundPosition: `${offset.x}px ${offset.y}px`,
    backgroundSize: `${gridSize}px ${gridSize}px`
  };
}
