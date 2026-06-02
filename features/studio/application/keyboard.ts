export type PositionDelta = {
  x: number;
  y: number;
};

export function isArrowKey(key: string) {
  return key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown";
}

export function arrowDelta(key: string, isLargeStep: boolean, isFineStep: boolean): PositionDelta {
  const step = isFineStep ? 0.2 : isLargeStep ? 5 : 1;

  if (key === "ArrowLeft") return { x: -step, y: 0 };
  if (key === "ArrowRight") return { x: step, y: 0 };
  if (key === "ArrowUp") return { x: 0, y: -step };

  return { x: 0, y: step };
}
