const MAX_VISIBLE_TICKS = 16;

export function normalizeChartAxisStep(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function chartAxisMaximum(value: number, step?: number) {
  const safeValue = Math.max(value, 1);
  const normalizedStep = normalizeChartAxisStep(step);

  if (normalizedStep) {
    return Math.max(normalizedStep, Math.ceil(safeValue / normalizedStep) * normalizedStep);
  }

  const magnitude = 10 ** Math.floor(Math.log10(safeValue));
  const normalized = safeValue / magnitude;
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return multiplier * magnitude;
}

export function chartAxisBounds(minimum: number, maximum: number, step?: number) {
  const normalizedStep = normalizeChartAxisStep(step);
  if (!normalizedStep) return { maximum, minimum };

  return {
    maximum: Math.ceil(maximum / normalizedStep) * normalizedStep,
    minimum: Math.floor(minimum / normalizedStep) * normalizedStep
  };
}

export function chartAxisTicks(minimum: number, maximum: number, step?: number, fallbackCount = 4) {
  const range = maximum - minimum;
  if (!Number.isFinite(range) || range === 0) return [roundAxisValue(minimum)];

  const normalizedStep = normalizeChartAxisStep(step);
  if (!normalizedStep) {
    const count = Math.max(Math.floor(fallbackCount), 1);
    return Array.from({ length: count + 1 }, (_, index) => roundAxisValue(minimum + range * index / count));
  }

  const rawTickCount = Math.max(Math.floor(range / normalizedStep), 1);
  const stride = Math.max(Math.ceil(rawTickCount / MAX_VISIBLE_TICKS), 1);
  const visibleStep = normalizedStep * stride;
  const first = Math.ceil(minimum / visibleStep) * visibleStep;
  const ticks: number[] = [];

  for (let value = first; value <= maximum + visibleStep * 0.000001 && ticks.length <= MAX_VISIBLE_TICKS; value += visibleStep) {
    ticks.push(roundAxisValue(value));
  }

  return ticks.length ? ticks : [roundAxisValue(minimum), roundAxisValue(maximum)];
}

function roundAxisValue(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
