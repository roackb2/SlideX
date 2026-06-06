"use client";

import { isSlideXIconName, lucideIconPaths } from "@/core/motion-doc/domain/lucideIconRegistry";
import { MotionBlock, type AnimationProps, type ColorProps, type RadiusProps } from "@/features/studio/ui/preview/motion/MotionBlock";
import { cardWidthClass, chartWidthClass, metricWidthClass, surfaceVars } from "@/features/studio/ui/preview/motion/blockStyles";

export function Card({
  background,
  backgroundColor,
  color,
  icon,
  layout = "vertical",
  mutedColor,
  text,
  textColor,
  title,
  width = "md",
  ...animation
}: AnimationProps & {
  icon?: string;
  layout?: string;
  text: string;
  title: string;
  width?: string;
} & RadiusProps & ColorProps) {
  const isHorizontal = layout === "horizontal";
  const colors = surfaceVars({ background, backgroundColor, color, mutedColor, textColor });

  return (
    <MotionBlock
      className={`${cardWidthClass(width)} overflow-hidden rounded-2xl border border-[var(--slide-border)] bg-[var(--slide-card)] p-5 shadow-xl shadow-black/20 backdrop-blur ${
        isHorizontal ? "flex items-start gap-4" : ""
      }`}
      style={colors}
      {...animation}
    >
      {icon ? (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--slide-border)] bg-white/[0.08] text-[var(--slide-fg)] ${
            isHorizontal ? "" : "mb-4"
          }`}
          style={{ color: "var(--block-fg, var(--slide-fg))" }}
        >
          <LucideSvg name={icon} />
        </div>
      ) : null}
      <div className="min-w-0">
        <h3 className="text-xl font-semibold text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>
          {title}
        </h3>
        <p className="mt-2 text-base leading-7 text-[var(--slide-muted)]" style={{ color: "var(--block-muted, var(--slide-muted))" }}>
          {text}
        </p>
      </div>
    </MotionBlock>
  );
}

export function Metric({
  background,
  backgroundColor,
  caption,
  color,
  label,
  mutedColor,
  textColor,
  value,
  width = "sm",
  ...animation
}: AnimationProps & {
  caption?: string;
  label: string;
  value: string;
  width?: string;
} & RadiusProps & ColorProps) {
  return (
    <MotionBlock
      className={`${metricWidthClass(width)} rounded-2xl border border-[var(--slide-border)] bg-[var(--slide-card)] p-5 shadow-xl shadow-black/20 backdrop-blur`}
      style={surfaceVars({ background, backgroundColor, color, mutedColor, textColor })}
      {...animation}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slide-muted)]" style={{ color: "var(--block-muted, var(--slide-muted))" }}>
        {label}
      </p>
      <p className="mt-3 text-5xl font-semibold leading-none text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>
        {value}
      </p>
      {caption ? (
        <p className="mt-3 text-sm leading-6 text-[var(--slide-muted)]" style={{ color: "var(--block-muted, var(--slide-muted))" }}>
          {caption}
        </p>
      ) : null}
    </MotionBlock>
  );
}

export function Chart({
  background,
  backgroundColor,
  chartType = "bar",
  color,
  height = 144,
  labels = "",
  mutedColor,
  textColor,
  title,
  values = "",
  width = "lg",
  ...animation
}: AnimationProps & {
  chartType?: string;
  height?: number | string;
  labels?: string;
  title: string;
  values?: string;
  width?: string;
} & RadiusProps & ColorProps) {
  const chartValues = parseChartValues(values);
  const chartLabels = labels.split(",").map((item) => item.trim()).filter(Boolean);
  const maxValue = Math.max(...chartValues, 1);
  const chartHeight = normalizeChartHeight(height);
  const normalizedChartType = normalizeChartType(chartType);

  return (
    <MotionBlock
      className={`${chartWidthClass(width)} flex h-full flex-col rounded-2xl border border-[var(--slide-border)] bg-[var(--slide-card)] p-5 shadow-xl shadow-black/20 backdrop-blur`}
      style={surfaceVars({ background, backgroundColor, color, mutedColor, textColor })}
      {...animation}
    >
      <h3 className="text-xl font-semibold text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>
        {title}
      </h3>
      {normalizedChartType === "bar" ? (
        <BarChartBody chartHeight={chartHeight} labels={chartLabels} maxValue={maxValue} values={chartValues} />
      ) : null}
      {normalizedChartType === "line" || normalizedChartType === "area" ? (
        <LineChartBody chartHeight={chartHeight} labels={chartLabels} maxValue={maxValue} mode={normalizedChartType} values={chartValues} />
      ) : null}
      {normalizedChartType === "pie" || normalizedChartType === "donut" ? (
        <PieChartBody chartHeight={chartHeight} labels={chartLabels} mode={normalizedChartType} values={chartValues} />
      ) : null}
    </MotionBlock>
  );
}

function BarChartBody({
  chartHeight,
  labels,
  maxValue,
  values
}: {
  chartHeight: number;
  labels: string[];
  maxValue: number;
  values: number[];
}) {
  const gridLines = 4;
  return (
    <div className="relative mt-6 flex flex-1 flex-col justify-end" style={{ minHeight: chartHeight + 48 }}>
      <div className="absolute inset-0 flex flex-col justify-between pb-8">
        {Array.from({ length: gridLines }).map((_, i) => (
          <div key={i} className="h-px w-full bg-[var(--slide-border)] opacity-40" />
        ))}
      </div>
      <div className="relative z-10 flex h-full items-end gap-3 pb-8 pt-4">
        {values.map((value, index) => {
          const percentage = Math.max((value / maxValue) * 100, 4);
          return (
            <div className="group flex min-w-0 flex-1 flex-col items-center justify-end h-full relative" key={`${value}-${index}`}>
              <div 
                className="absolute -top-6 text-[10px] font-bold text-[var(--slide-fg)] opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: "var(--block-fg, var(--slide-fg))" }}
              >
                {value}
              </div>
              <div className="flex w-full items-end justify-center rounded-t-lg bg-white/[0.04] backdrop-blur-sm transition-all h-full max-h-full">
                <div
                  className="w-full rounded-t-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-500 ease-out"
                  style={{ 
                    background: "var(--block-fg, var(--slide-fg))", 
                    height: `${percentage}%`,
                    opacity: 0.9
                  }}
                />
              </div>
              <span className="absolute -bottom-6 max-w-full truncate text-[10px] uppercase tracking-wide text-[var(--slide-muted)]" style={{ color: "var(--block-muted, var(--slide-muted))" }}>
                {labels[index] ?? `D${index + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineChartBody({
  chartHeight,
  labels,
  maxValue,
  mode,
  values
}: {
  chartHeight: number;
  labels: string[];
  maxValue: number;
  mode: "area" | "line";
  values: number[];
}) {
  const width = 720;
  const height = chartHeight;
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - Math.max((value / maxValue) * height, 4);
    return { x, y };
  });

  const smoothPath = points.length > 0 ? (
    `M ${points[0].x},${points[0].y}` + 
    points.slice(1).map((p, i) => {
      const prev = points[i];
      const cp1x = prev.x + (p.x - prev.x) * 0.4;
      const cp2x = prev.x + (p.x - prev.x) * 0.6;
      return ` C ${cp1x},${prev.y} ${cp2x},${p.y} ${p.x},${p.y}`;
    }).join("")
  ) : "";

  const areaPath = smoothPath ? `${smoothPath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z` : "";
  const gridLines = 4;

  return (
    <div className="relative mt-6 flex flex-1 flex-col gap-3">
      <div className="absolute inset-0 flex flex-col justify-between pb-8">
        {Array.from({ length: gridLines }).map((_, i) => (
          <div key={i} className="h-px w-full bg-[var(--slide-border)] opacity-40" />
        ))}
      </div>
      <svg aria-hidden="true" className="relative z-10 w-full flex-1 overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`} style={{ color: "var(--block-fg, var(--slide-fg))" }}>
        <defs>
          <linearGradient id={`chart-area-fill-${mode}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {mode === "area" ? <path d={areaPath} fill={`url(#chart-area-fill-${mode})`} /> : null}
        <path d={smoothPath} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
        {points.map((point, index) => (
          <g key={`point-${index}`}>
            <circle cx={point.x} cy={point.y} fill="var(--slide-card)" r="7" stroke="currentColor" strokeWidth="4" />
            <circle cx={point.x} cy={point.y} fill="currentColor" r="2.5" />
          </g>
        ))}
      </svg>
      <div className="relative z-10 grid grid-flow-col auto-cols-fr gap-2 mt-1">
        {values.map((value, index) => (
          <span className="truncate text-center text-[10px] uppercase tracking-wide text-[var(--slide-muted)]" key={`${value}-label-${index}`} style={{ color: "var(--block-muted, var(--slide-muted))" }}>
            {labels[index] ?? `D${index + 1}`}
          </span>
        ))}
      </div>
    </div>
  );
}

function PieChartBody({
  chartHeight,
  labels,
  mode,
  values
}: {
  chartHeight: number;
  labels: string[];
  mode: "donut" | "pie";
  values: number[];
}) {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const size = Math.min(Math.max(chartHeight, 120), 220);
  const cx = size / 2;
  const cy = size / 2;
  
  // Calculate SVG arc paths
  let currentAngle = 0;
  const slices = values.map((value, index) => {
    const sweepAngle = (value / total) * 360;
    // Leave a small gap between slices for premium look
    const gap = sweepAngle > 5 ? 2.5 : 0;
    const startAngle = currentAngle + (gap / 2);
    const endAngle = currentAngle + sweepAngle - (gap / 2);
    
    currentAngle += sweepAngle;
    
    // Donut chart uses thick stroke, Pie chart uses filled wedges
    if (mode === "donut") {
      const radius = (size / 2) - 16;
      return { 
        path: describeArc(cx, cy, radius, startAngle, endAngle), 
        color: pieColor(index) 
      };
    } else {
      const radius = size / 2;
      const path = describeArc(cx, cy, radius, startAngle, endAngle) + ` L ${cx} ${cy} Z`;
      return { path, color: pieColor(index) };
    }
  });

  return (
    <div className="mt-5 grid flex-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="relative mx-auto flex items-center justify-center drop-shadow-xl" style={{ height: size, width: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="overflow-visible" style={{ transform: "rotate(-90deg)" }}>
          {slices.map((slice, index) => (
            <path 
              key={`slice-${index}`}
              d={slice.path}
              fill={mode === "pie" ? slice.color : "none"}
              stroke={mode === "donut" ? slice.color : "none"}
              strokeWidth={mode === "donut" ? 22 : 0}
              strokeLinecap={mode === "donut" ? "round" : "butt"}
              className="transition-all duration-300 hover:scale-[1.03] origin-center cursor-default"
            />
          ))}
        </svg>
        {mode === "donut" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--slide-muted)] opacity-80" style={{ color: "var(--block-muted, var(--slide-muted))" }}>Total</span>
            <span className="text-2xl font-semibold text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>{total}</span>
          </div>
        ) : null}
      </div>
      <div className="grid gap-3 self-center">
        {values.map((value, index) => (
          <div className="grid grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-transparent p-1.5 transition-colors hover:bg-white/[0.04] hover:border-white/[0.04]" key={`${value}-legend-${index}`}>
            <span className="h-3 w-3 rounded-md shadow-inner" style={{ background: pieColor(index) }} />
            <span className="truncate text-[12px] font-medium text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>
              {labels[index] ?? `D${index + 1}`}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>
                {Math.round((value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number){
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function parseChartValues(values: string) {
  const parsed = values
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value) && value >= 0);

  return parsed.length > 0 ? parsed : [24, 42, 68, 54];
}

function normalizeChartHeight(value: number | string | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return 144;
  }

  return Math.min(Math.max(parsed, 80), 320);
}

function normalizeChartType(value: string | undefined): "area" | "bar" | "donut" | "line" | "pie" {
  if (value === "line" || value === "area" || value === "pie" || value === "donut") {
    return value;
  }

  return "bar";
}

// Removed pieGradient because we are now using pure SVG arcs

function pieColor(index: number) {
  const colors = [
    "var(--block-fg, var(--slide-fg))",
    "rgba(120,139,253,0.85)", // Primary brand blue
    "rgba(94,234,212,0.85)",  // Teal accent
    "rgba(251,191,36,0.85)",  // Amber
    "rgba(244,114,182,0.85)"  // Pink
  ];

  return colors[index % colors.length];
}

function LucideSvg({ name }: { name: string }) {
  if (!isSlideXIconName(name)) {
    return null;
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {lucideIconPaths[name].map((path, index) => {
        const [shape, ...parts] = path.split(" ");

        if (shape === "circle") {
          return <circle cx={parts[0]} cy={parts[1]} key={path + index} r={parts[2]} />;
        }

        if (shape === "ellipse") {
          return <ellipse cx={parts[0]} cy={parts[1]} key={path + index} rx={parts[2]} ry={parts[3]} />;
        }

        if (shape === "rect") {
          return <rect height={parts[3]} key={path + index} rx={parts[4]} ry={parts[5]} width={parts[2]} x={parts[0]} y={parts[1]} />;
        }

        return <path d={shape === "path" ? parts.join(" ") : path} key={path + index} />;
      })}
    </svg>
  );
}
