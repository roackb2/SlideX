export const chartValueFormats = ["number", "percentage"] as const;
export type ChartValueFormat = typeof chartValueFormats[number];

export function normalizeChartValueFormat(value: unknown): ChartValueFormat {
  return value === "percentage" ? "percentage" : "number";
}

export function formatChartValue(value: number, format: ChartValueFormat) {
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
  return format === "percentage" ? `${formatted}%` : formatted;
}

export function formatSignedChartValue(value: number, format: ChartValueFormat, omitPositiveSign = false) {
  return `${value > 0 && !omitPositiveSign ? "+" : ""}${formatChartValue(value, format)}`;
}
