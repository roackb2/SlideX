export const minCanvasZoomScale = 0.02;
export const maxCanvasZoomScale = 64;

const zoomStepRatio = 1.18;

export function nextCanvasZoomScale(currentScale: number, direction: "in" | "out", stepCount = 1) {
  const safeStepCount = Math.max(1, Math.min(24, Math.round(stepCount)));
  const ratio = Math.pow(zoomStepRatio, safeStepCount);
  const nextScale = direction === "in" ? currentScale * ratio : currentScale / ratio;

  return roundCanvasZoomScale(clampCanvasZoomScale(nextScale));
}

export function canvasZoomScaleFromPinch(startScale: number, startDistance: number, currentDistance: number) {
  if (startDistance <= 0 || !Number.isFinite(startDistance) || !Number.isFinite(currentDistance)) {
    return clampCanvasZoomScale(startScale);
  }

  return roundCanvasZoomScale(clampCanvasZoomScale(startScale * (currentDistance / startDistance)));
}

export function canvasZoomStepCountFromWheel(deltaY: number) {
  return Math.max(1, Math.min(8, Math.ceil(Math.abs(deltaY) / 160)));
}

export function clampCanvasZoomScale(scale: number) {
  return Math.max(minCanvasZoomScale, Math.min(maxCanvasZoomScale, scale));
}

function roundCanvasZoomScale(scale: number) {
  return Math.round(scale * 10000) / 10000;
}
