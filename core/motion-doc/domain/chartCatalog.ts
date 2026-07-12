export const chartCategories = [
  { id: "trend", label: "Trend" },
  { id: "comparison", label: "Comparison" },
  { id: "composition", label: "Composition" },
  { id: "relationship", label: "Relationship" }
] as const;

export type ChartCategory = typeof chartCategories[number]["id"];
export type ChartDataMode = "category" | "delta" | "matrix" | "xy" | "xyz";

export const chartCatalog = [
  { category: "trend", dataMode: "category", label: "Line", type: "line" },
  { category: "trend", dataMode: "category", label: "Area", type: "area" },
  { category: "trend", dataMode: "category", label: "Step", type: "step" },
  { category: "trend", dataMode: "category", label: "Sparkline", type: "sparkline" },
  { category: "trend", dataMode: "delta", label: "Waterfall", type: "waterfall" },
  { category: "comparison", dataMode: "category", label: "Horizontal bar", type: "bar" },
  { category: "comparison", dataMode: "category", label: "Column", type: "column" },
  { category: "comparison", dataMode: "category", label: "Lollipop", type: "lollipop" },
  { category: "comparison", dataMode: "category", label: "Funnel", type: "funnel" },
  { category: "comparison", dataMode: "category", label: "Pyramid", type: "pyramid" },
  { category: "composition", dataMode: "category", label: "Pie", type: "pie" },
  { category: "composition", dataMode: "category", label: "Donut", type: "donut" },
  { category: "composition", dataMode: "category", label: "Radar", type: "radar" },
  { category: "composition", dataMode: "category", label: "Polar area", type: "polar-area" },
  { category: "composition", dataMode: "category", label: "Treemap", type: "treemap" },
  { category: "relationship", dataMode: "xy", label: "Scatter", type: "scatter" },
  { category: "relationship", dataMode: "xyz", label: "Bubble", type: "bubble" },
  { category: "relationship", dataMode: "matrix", label: "Heatmap", type: "heatmap" },
  { category: "relationship", dataMode: "category", label: "Timeline", type: "timeline" },
  { category: "relationship", dataMode: "category", label: "Gauge", type: "gauge" }
] as const satisfies ReadonlyArray<{ category: ChartCategory; dataMode: ChartDataMode; label: string; type: string }>;

export type ChartType = typeof chartCatalog[number]["type"];

const cartesianChartTypes = new Set<ChartType>(["area", "bar", "bubble", "column", "line", "lollipop", "scatter", "sparkline", "step", "waterfall"]);

export function chartHasCartesianAxes(type: unknown) {
  return cartesianChartTypes.has(normalizeChartType(type));
}

export function isChartType(value: unknown): value is ChartType {
  return chartCatalog.some((chart) => chart.type === value);
}

export function normalizeChartType(value: unknown): ChartType {
  return isChartType(value) ? value : "bar";
}

export function chartDefinition(type: unknown) {
  const normalized = normalizeChartType(type);
  return chartCatalog.find((chart) => chart.type === normalized) ?? chartCatalog[0];
}
