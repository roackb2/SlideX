import type PptxGenJS from "pptxgenjs";
import { chartDataFromProps } from "@/core/motion-doc/application/chartBlock";
import { normalizeChartType, type ChartType } from "@/core/motion-doc/domain/chartCatalog";

type PptxSlide = ReturnType<PptxGenJS["addSlide"]>;
type PptxFrame = { h: number; w: number; x: number; y: number };

export const NATIVE_PPTX_CHART_TYPES = new Set<ChartType>([
  "area",
  "bar",
  "bubble",
  "column",
  "donut",
  "line",
  "pie",
  "radar",
  "scatter",
  "sparkline",
  "step"
]);

export function isNativePptxChartType(value: string | number | undefined) {
  return NATIVE_PPTX_CHART_TYPES.has(normalizeChartType(value));
}

export function addEditablePptxChart(
  slide: PptxSlide,
  props: Record<string, string | number>,
  frame: PptxFrame,
  theme: { background: string; foreground: string; muted: string }
) {
  const chartType = normalizeChartType(props.chartType);
  if (!NATIVE_PPTX_CHART_TYPES.has(chartType)) return false;

  const data = chartDataFromProps(props);
  const title = stringProp(props.title) ?? "Chart";
  const isRadial = chartType === "pie" || chartType === "donut";
  const isXY = chartType === "scatter" || chartType === "bubble";
  const type = pptxChartType(chartType);
  const series = [{
    labels: data.map((item) => isXY ? String(item.x) : item.label),
    name: title,
    sizes: chartType === "bubble" ? data.map((item) => item.size) : undefined,
    values: data.map((item) => item.value)
  }];
  const background = pptxColor(theme.background, "0F172A");
  const foreground = pptxColor(stringProp(props.color ?? props.textColor) ?? theme.foreground, "F8FAFC");
  const muted = pptxColor(theme.muted, "94A3B8");
  const chartColors = data.map((item) => pptxColor(item.color, "3B82F6"));

  slide.addChart(type, series, {
    ...frame,
    altText: title,
    barDir: chartType === "bar" ? "bar" : "col",
    catAxisLabelColor: muted,
    catAxisLabelFontFace: "Aptos",
    catAxisLabelFontSize: 9,
    catAxisLineColor: muted,
    catAxisLineShow: !isRadial,
    catGridLine: { style: "none" },
    chartArea: {
      border: { color: background, pt: 0 },
      fill: { color: background, transparency: 100 }
    },
    chartColors,
    dataLabelColor: foreground,
    dataLabelFontFace: "Aptos",
    dataLabelFontSize: 9,
    dataLabelPosition: isRadial ? "bestFit" : "outEnd",
    holeSize: chartType === "donut" ? 62 : undefined,
    legendColor: muted,
    legendFontFace: "Aptos",
    legendFontSize: 9,
    legendPos: "r",
    lineDataSymbol: chartType === "sparkline" ? "none" : "circle",
    lineSize: Math.max(numberProp(props.strokeWidth, 3) * 0.5, 1.5),
    plotArea: {
      border: { color: background, pt: 0 },
      fill: { color: background, transparency: 100 }
    },
    radarStyle: chartType === "radar" ? "filled" : undefined,
    showLegend: isRadial,
    showPercent: isRadial,
    showTitle: Boolean(title),
    showValue: !isXY,
    title,
    titleBold: true,
    titleColor: foreground,
    titleFontFace: "Aptos Display",
    titleFontSize: Math.max(numberProp(props.fontSize, 18) * 0.75, 11),
    valAxisLabelColor: muted,
    valAxisLabelFontFace: "Aptos",
    valAxisLabelFontSize: 9,
    valAxisLineColor: muted,
    valAxisLineShow: !isRadial,
    valGridLine: { color: muted, size: 0.5, style: "solid" }
  });

  return true;
}

function pptxChartType(type: ChartType): PptxGenJS.CHART_NAME {
  if (type === "donut") return "doughnut";
  if (type === "column" || type === "bar") return "bar";
  if (type === "step" || type === "sparkline") return "line";
  return type as PptxGenJS.CHART_NAME;
}

function stringProp(value: string | number | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberProp(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pptxColor(value: string, fallback: string) {
  const normalized = value.trim();
  const hex = normalized.match(/^#?([0-9a-f]{6})(?:[0-9a-f]{2})?$/i)?.[1];
  if (hex) return hex.toUpperCase();
  const rgb = normalized.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return rgb.slice(1, 4).map((channel) => Math.min(Number(channel), 255).toString(16).padStart(2, "0")).join("").toUpperCase();
  return fallback;
}
