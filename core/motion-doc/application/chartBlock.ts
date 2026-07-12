import { chartDefinition, type ChartType } from "@/core/motion-doc/domain/chartCatalog";

export type ChartDatum = { color: string; label: string; size: number; value: number; x: number };
type PropRecord = Record<string, string | number>;

const fallbackColors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

export const chartPalettes = [
  { id: "vivid", label: "Vivid", colors: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#06b6d4", "#f97316"] },
  { id: "ocean", label: "Ocean", colors: ["#0ea5e9", "#06b6d4", "#14b8a6", "#22c55e", "#84cc16", "#eab308"] },
  { id: "sunset", label: "Sunset", colors: ["#f43f5e", "#fb7185", "#f97316", "#f59e0b", "#eab308", "#a855f7"] },
  { id: "editorial", label: "Editorial", colors: ["#111827", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"] }
] as const;

export function chartDataFromProps(props: PropRecord): ChartDatum[] {
  const labels = split(props.labels);
  const values = split(props.values).map(Number);
  const colors = split(props.colors);
  const xValues = split(props.xValues).map(Number);
  const sizes = split(props.sizes).map(Number);
  const mode = chartDefinition(props.chartType).dataMode;
  const count = Math.max(labels.length, values.length, 1);

  return Array.from({ length: count }, (_, index) => ({
    color: colors[index] || String(props.chartColor || fallbackColors[index % fallbackColors.length]),
    label: labels[index] || `Q${index + 1}`,
    size: Number.isFinite(sizes[index]) ? Math.max(sizes[index], 1) : Math.max(Math.abs(values[index] ?? 10), 10),
    value: Number.isFinite(values[index]) ? (mode === "delta" ? values[index] : Math.max(values[index], 0)) : 0,
    x: Number.isFinite(xValues[index]) ? xValues[index] : index + 1
  }));
}

export function updateChartDatum(props: PropRecord, index: number, patch: Partial<ChartDatum>): PropRecord {
  const data = chartDataFromProps(props).map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
  return serializeChartData(props, data);
}

export function addChartDatum(props: PropRecord): PropRecord {
  const data = chartDataFromProps(props);
  data.push({ color: fallbackColors[data.length % fallbackColors.length], label: `Q${data.length + 1}`, size: 10, value: 0, x: data.length + 1 });
  return serializeChartData(props, data);
}

export function removeChartDatum(props: PropRecord, index: number): PropRecord {
  const data = chartDataFromProps(props).filter((_, itemIndex) => itemIndex !== index);
  return serializeChartData(props, data.length ? data : [{ color: fallbackColors[0], label: "Q1", size: 10, value: 0, x: 1 }]);
}

export function applyChartPalette(props: PropRecord, colors: readonly string[]): PropRecord {
  return serializeChartData(props, chartDataFromProps(props).map((item, index) => ({ ...item, color: colors[index % colors.length] })));
}

function serializeChartData(props: PropRecord, data: ChartDatum[]): PropRecord {
  return {
    ...props,
    colors: data.map((item) => item.color).join(","),
    labels: data.map((item) => item.label.replaceAll(",", " ")).join(","),
    sizes: data.map((item) => item.size).join(","),
    values: data.map((item) => item.value).join(","),
    xValues: data.map((item) => item.x).join(",")
  };
}

export function chartDefaultProps(type: ChartType): PropRecord {
  const common = { chartType: type, chartColor: "#0ea5e9", fontSize: 18, height: 240, strokeWidth: 16, valueFormat: "number" };
  if (type === "scatter") return { ...common, labels: "Alpha,Beta,Gamma,Delta,Epsilon", values: "240,520,380,760,610", xValues: "120,280,450,680,860", sizes: "10,10,10,10,10", colors: "#0f172a,#0ea5e9,#14b8a6,#f59e0b,#f43f5e" };
  if (type === "bubble") return { ...common, labels: "North,South,East,West,Online", values: "350,680,480,820,570", xValues: "150,340,520,730,880", sizes: "18,32,24,40,28", colors: "#0f172a,#0ea5e9,#14b8a6,#f59e0b,#f43f5e" };
  if (type === "heatmap") return { ...common, labels: "M1,M2,M3,M4,T1,T2,T3,T4,W1,W2,W3,W4", values: "180,420,670,880,320,580,760,490,250,710,910,630", colors: "#0ea5e9,#0ea5e9,#0ea5e9,#0ea5e9,#14b8a6,#14b8a6,#14b8a6,#14b8a6,#f59e0b,#f59e0b,#f59e0b,#f59e0b" };
  if (type === "waterfall") return { ...common, chartColor: "#103f5d", labels: "Start,Growth,Costs,Expansion,Churn,Upsell", values: "50000,30000,-25000,40000,-20000,12000", colors: "#103f5d,#e84e9b,#67c2d3,#e84e9b,#67c2d3,#e84e9b" };
  if (type === "gauge") return { ...common, labels: "Revenue,Users,Orders,Retention", values: "420,580,730,910", colors: "#0f172a,#0ea5e9,#14b8a6,#f59e0b" };
  if (type === "timeline") return { ...common, labels: "Discover,Design,Build,Launch", values: "120,240,360,480", colors: "#0f172a,#0ea5e9,#14b8a6,#f59e0b" };
  if (type === "funnel") return { ...common, labels: "Visitors,Leads,Trials,Customers", values: "1200,820,460,240", colors: "#0f172a,#0ea5e9,#14b8a6,#f59e0b" };
  if (type === "sparkline") return { ...common, labels: "Jan,Feb,Mar,Apr,May,Jun,Jul", values: "420,610,530,760,680,890,840", colors: "#0f172a,#0ea5e9,#14b8a6,#f59e0b,#ef4444,#06b6d4,#0ea5e9" };
  return { ...common, labels: "Q1,Q2,Q3,Q4", values: "42,58,73,91", colors: "#ef4444,#f59e0b,#10b981,#3b82f6" };
}

function split(value: string | number | undefined) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}
