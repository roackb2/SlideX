"use client";

import { resolveContrastingTextColor } from "@/common/util/colorContrast";
import { chartAxisBounds, chartAxisMaximum, chartAxisTicks } from "@/core/motion-doc/domain/chartAxis";
import type { ChartType } from "@/core/motion-doc/domain/chartCatalog";
import { formatChartValue, formatSignedChartValue, type ChartValueFormat } from "@/core/motion-doc/domain/chartValue";

type ChartVisualProps = { colors: string[]; height: number; labels: string[]; maxValue: number; sizes: number[]; strokeWidth: number; type: ChartType; valueFormat: ChartValueFormat; values: number[]; xAxisStep?: number; xValues: number[]; yAxisStep?: number };

export function ChartVisual(props: ChartVisualProps) {
  if (props.type === "bar") return <HorizontalVisual {...props} />;
  if (props.type === "funnel") return <FunnelVisual {...props} />;
  if (props.type === "pyramid") return <PyramidVisual {...props} />;
  if (props.type === "waterfall") return <WaterfallVisual {...props} />;
  if (props.type === "column" || props.type === "lollipop") return <ColumnVisual {...props} />;
  if (props.type === "gauge") return <GaugeVisual {...props} />;
  if (props.type === "polar-area") return <PolarAreaVisual {...props} />;
  if (props.type === "pie" || props.type === "donut") return <RadialVisual {...props} />;
  if (props.type === "treemap" || props.type === "heatmap") return <TileVisual {...props} />;
  if (props.type === "timeline") return <TimelineVisual {...props} />;
  if (props.type === "radar") return <RadarVisual {...props} />;
  if (props.type === "scatter" || props.type === "bubble") return <ScatterVisual {...props} />;
  if (props.type === "sparkline") return <SparklineVisual {...props} />;
  return <TrendVisual {...props} />;
}

function HorizontalVisual({ colors, height, labels, maxValue, strokeWidth, valueFormat, values, xAxisStep, yAxisStep }: ChartVisualProps) {
  const width = 720;
  const left = 112;
  const right = 42;
  const top = 18;
  const bottom = 38;
  const axisMax = chartAxisMaximum(maxValue, xAxisStep);
  const plotWidth = width - left - right;
  const rowHeight = (height - top - bottom) / Math.max(values.length, 1);
  const xFor = (value: number) => left + Math.max(value, 0) / axisMax * plotWidth;
  const ticks = chartAxisTicks(0, axisMax, xAxisStep);
  const rowTicks = chartAxisTicks(0, values.length, yAxisStep, Math.min(values.length, 8));

  return <div className="mt-4 flex flex-1 min-h-0"><svg className="h-full w-full" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
    {ticks.map((tick) => <g key={tick}><line stroke="var(--block-fg,var(--slide-fg))" strokeOpacity=".1" x1={xFor(tick)} x2={xFor(tick)} y1={top} y2={height - bottom} /><text fill="var(--block-muted,var(--slide-muted))" fontFamily="monospace" fontSize="calc(var(--chart-font-size) * .68)" textAnchor="middle" x={xFor(tick)} y={height - 15}>{formatChartValue(tick, valueFormat)}</text></g>)}
    {rowTicks.map((tick) => { const y = top + tick / Math.max(values.length, 1) * (height - top - bottom); return <line key={`row-${tick}`} stroke="var(--block-fg,var(--slide-fg))" strokeOpacity=".06" x1={left} x2={left + plotWidth} y1={y} y2={y} />; })}
    <text fill="var(--block-muted,var(--slide-muted))" fontSize="calc(var(--chart-font-size) * .7)" textAnchor="end" x={width - 8} y={height - 4}>X</text>
    {values.map((value, index) => { const centerY = top + rowHeight * (index + .5); const barHeight = Math.min(Math.max(strokeWidth, 12), rowHeight * .56); return <g key={index}><text dominantBaseline="middle" fill="var(--block-fg,var(--slide-fg))" fontSize="calc(var(--chart-font-size) * .76)" textAnchor="end" x={left - 10} y={centerY}>{index + 1} · {labels[index] ?? `Q${index + 1}`}</text><line stroke="var(--block-fg,var(--slide-fg))" strokeOpacity=".08" strokeWidth={barHeight} x1={left} x2={left + plotWidth} y1={centerY} y2={centerY} /><line stroke={colorAt(colors, index)} strokeLinecap="round" strokeWidth={barHeight} x1={left} x2={Math.max(xFor(value), left + 4)} y1={centerY} y2={centerY} /><text dominantBaseline="middle" fill="var(--block-fg,var(--slide-fg))" fontFamily="monospace" fontSize="calc(var(--chart-font-size) * .76)" fontWeight="700" x={Math.min(xFor(value) + 10, width - right + 4)} y={centerY}>{formatChartValue(value, valueFormat)}</text></g>; })}
  </svg></div>;
}

function FunnelVisual({ colors, labels, maxValue, strokeWidth, valueFormat, values }: ChartVisualProps) {
  const sorted = values.map((value, index) => ({ color: colorAt(colors, index), label: labels[index] ?? `Q${index + 1}`, value })).sort((a, b) => b.value - a.value);
  return <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-1.5 min-h-0">{sorted.map((item) => <div className="flex items-center justify-center rounded-md font-semibold shadow-sm" key={item.label} style={{ background: item.color, color: resolveContrastingTextColor(item.color) ?? "#ffffff", fontSize: "var(--chart-font-size)", height: Math.max(22, strokeWidth * 2.4), width: `${Math.max(item.value / maxValue * 88, 24)}%` }}><span className="truncate px-3">{item.label} · {formatChartValue(item.value, valueFormat)}</span></div>)}</div>;
}

function PyramidVisual({ colors, labels, maxValue, strokeWidth, valueFormat, values }: ChartVisualProps) {
  return <div className="mt-4 flex flex-1 flex-col justify-center gap-2 min-h-0">{values.map((value, index) => <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2" key={index}><div className="flex justify-end"><span className="rounded-l-full" style={{ background: index % 2 === 0 ? colorAt(colors, index) : "transparent", height: Math.max(10, strokeWidth * 1.5), width: `${value / maxValue * 90}%` }} /></div><span className="w-24 truncate text-center" style={{ fontSize: "var(--chart-font-size)" }}>{labels[index] ?? `Q${index + 1}`} · <b className="font-mono">{formatChartValue(value, valueFormat)}</b></span><div><span className="block rounded-r-full" style={{ background: index % 2 ? colorAt(colors, index) : "transparent", height: Math.max(10, strokeWidth * 1.5), width: `${value / maxValue * 90}%` }} /></div></div>)}</div>;
}

function WaterfallVisual({ colors, height, labels, strokeWidth, valueFormat, values, xAxisStep, yAxisStep }: ChartVisualProps) {
  const running = values.reduce<number[]>((items, value, index) => [...items, (items[index - 1] ?? 0) + value], []);
  const finalTotal = running.at(-1) ?? 0;
  const allLevels = [0, ...running];
  const axisBounds = chartAxisBounds(Math.min(...allLevels), Math.max(...allLevels), yAxisStep);
  const minimum = axisBounds.minimum;
  const maximum = axisBounds.maximum;
  const range = Math.max(maximum - minimum, 1);
  const top = 30;
  const bottom = 34;
  const plotHeight = Math.max(height - top - bottom, 40);
  const yFor = (value: number) => top + (maximum - value) / range * plotHeight;
  const itemCount = values.length + 1;
  const plotLeft = 68;
  const plotRight = 704;
  const step = (plotRight - plotLeft) / Math.max(itemCount, 1);
  const barWidth = Math.min(64, Math.max(28, step * .55 + strokeWidth));
  const xFor = (index: number) => plotLeft + step * index + (step - barWidth) / 2;
  const yTicks = chartAxisTicks(minimum, maximum, yAxisStep);
  const xTicks = chartAxisTicks(0, itemCount, xAxisStep, itemCount <= 8 ? itemCount : 4);

  return (
    <div className="mt-4 flex flex-1 min-h-0">
      <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 720 ${height}`}>
        {yTicks.map((tick) => <g key={tick}><line stroke="var(--block-fg,var(--slide-fg))" strokeOpacity={tick === 0 ? ".2" : ".1"} x1={plotLeft - 4} x2={plotRight} y1={yFor(tick)} y2={yFor(tick)} /><text dominantBaseline="middle" fill="var(--block-muted,var(--slide-muted))" fontFamily="monospace" fontSize="calc(var(--chart-font-size) * .68)" textAnchor="end" x={plotLeft - 10} y={yFor(tick)}>{formatChartValue(tick, valueFormat)}</text></g>)}
        {xTicks.map((tick) => { const x = plotLeft + tick / Math.max(itemCount, 1) * (plotRight - plotLeft); return <line key={`x-${tick}`} stroke="var(--block-fg,var(--slide-fg))" strokeOpacity=".06" x1={x} x2={x} y1={top} y2={height - bottom} />; })}
        <text fill="var(--block-muted,var(--slide-muted))" fontSize="calc(var(--chart-font-size) * .7)" x="8" y="16">Y</text>
        {values.map((value, index) => {
          const previous = running[index - 1] ?? 0;
          const current = running[index];
          const barTop = yFor(Math.max(previous, current));
          const barBottom = yFor(Math.min(previous, current));
          const labelY = value >= 0 ? Math.max(barTop - 8, 14) : Math.min(barBottom + 17, height - bottom - 2);
          const connectorY = yFor(current);
          const nextX = xFor(index + 1);
          return (
            <g key={index}>
              <rect fill={colorAt(colors, index)} height={Math.max(barBottom - barTop, 4)} rx="3" width={barWidth} x={xFor(index)} y={barTop} />
              <line stroke="var(--block-fg,var(--slide-fg))" strokeDasharray="4 4" strokeOpacity=".28" x1={xFor(index) + barWidth} x2={nextX} y1={connectorY} y2={connectorY} />
              <text fill="var(--block-fg,var(--slide-fg))" fontFamily="monospace" fontSize="var(--chart-font-size)" fontWeight="700" textAnchor="middle" x={xFor(index) + barWidth / 2} y={labelY}>{formatSignedChartValue(value, valueFormat, index === 0)}</text>
              <text fill="var(--block-muted,var(--slide-muted))" fontSize="calc(var(--chart-font-size) * .68)" textAnchor="middle" x={xFor(index) + barWidth / 2} y={height - 8}>{index + 1} · {labels[index] ?? `Q${index + 1}`}</text>
            </g>
          );
        })}
        <rect fill="var(--chart-color)" height={Math.max(Math.abs(yFor(finalTotal) - yFor(0)), 4)} rx="3" width={barWidth} x={xFor(values.length)} y={Math.min(yFor(finalTotal), yFor(0))} />
        <text fill="var(--block-fg,var(--slide-fg))" fontFamily="monospace" fontSize="var(--chart-font-size)" fontWeight="700" textAnchor="middle" x={xFor(values.length) + barWidth / 2} y={Math.max(Math.min(yFor(finalTotal), yFor(0)) - 8, 14)}>{formatChartValue(finalTotal, valueFormat)}</text>
        <text fill="var(--block-muted,var(--slide-muted))" fontSize="calc(var(--chart-font-size) * .68)" textAnchor="middle" x={xFor(values.length) + barWidth / 2} y={height - 8}>{values.length + 1} · Total</text>
      </svg>
    </div>
  );
}

function ColumnVisual({ colors, height, labels, maxValue, strokeWidth, type, valueFormat, values, xAxisStep, yAxisStep }: ChartVisualProps) {
  const scale = cartesianScale(height, Math.max(values.length, 1), maxValue, xAxisStep, yAxisStep);
  const barWidth = Math.min(72, Math.max(24, scale.plotWidth / Math.max(values.length, 1) * .48));
  return <div className="mt-4 flex flex-1 min-h-0"><svg className="h-full w-full" preserveAspectRatio="none" viewBox={`0 0 720 ${height}`}><CartesianAxes height={height} maxX={Math.max(values.length, 1)} maxY={maxValue} valueFormat={valueFormat} xAxisStep={xAxisStep} yAxisStep={yAxisStep} />{values.map((value, index) => { const x = scale.x(index + 1); const y = scale.y(value); const baseY = scale.y(0); return <g key={index}>{type === "lollipop" ? <><line stroke={colorAt(colors, index)} strokeWidth={Math.max(2, strokeWidth / 3)} x1={x} x2={x} y1={baseY} y2={y} /><circle cx={x} cy={y} fill={colorAt(colors, index)} r={Math.max(6, strokeWidth * .72)} /></> : <rect fill={colorAt(colors, index)} height={Math.max(baseY - y, 4)} rx="4" width={barWidth} x={x - barWidth / 2} y={Math.min(y, baseY - 4)} />}<text fill="var(--block-fg,var(--slide-fg))" fontFamily="monospace" fontSize="calc(var(--chart-font-size) * .76)" fontWeight="700" textAnchor="middle" x={x} y={Math.max(y - 9, 14)}>{formatChartValue(value, valueFormat)}</text><text fill="var(--block-muted,var(--slide-muted))" fontSize="calc(var(--chart-font-size) * .68)" textAnchor="middle" x={x} y={height - 3}>{labels[index] ?? `Q${index + 1}`}</text></g>; })}</svg></div>;
}

function TrendVisual({ colors, height, labels, maxValue, strokeWidth, type, valueFormat, values, xAxisStep, yAxisStep }: ChartVisualProps) {
  const scale = cartesianScale(height, Math.max(values.length, 1), maxValue, xAxisStep, yAxisStep);
  const points = values.map((value, index) => ({ x: scale.x(index + 1), y: scale.y(value) }));
  const straight = points.map((p) => `${p.x},${p.y}`).join(" ");
  const step = points.reduce((d, p, i) => i ? `${d} H ${p.x} V ${p.y}` : `M ${p.x} ${p.y}`, "");
  const area = points.length ? `M ${points[0].x} ${scale.y(0)} L ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${points.at(-1)?.x} ${scale.y(0)} Z` : "";
  return <div className="relative mt-4 flex flex-1 flex-col min-h-0"><svg className="min-h-0 w-full flex-1 overflow-visible" preserveAspectRatio="none" viewBox={`0 0 720 ${height}`}>
    <CartesianAxes height={height} maxX={Math.max(values.length, 1)} maxY={maxValue} valueFormat={valueFormat} xAxisStep={xAxisStep} yAxisStep={yAxisStep} />
    {type === "area" ? <path d={area} fill="var(--chart-color)" opacity=".2" /> : null}
    {type === "step" ? <path d={step} fill="none" stroke="var(--chart-color)" strokeWidth={strokeWidth} /> : <polyline fill="none" points={straight} stroke="var(--chart-color)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={type === "sparkline" ? strokeWidth * 1.4 : strokeWidth} />}
    {points.map((point, index) => <g key={index}><circle cx={point.x} cy={point.y} fill={colorAt(colors, index)} r={Math.max(4, strokeWidth * .62)} stroke="var(--block-bg,var(--slide-card))" strokeWidth="3" /><text fill="var(--block-fg,var(--slide-fg))" fontFamily="monospace" fontSize="calc(var(--chart-font-size) * .72)" fontWeight="700" textAnchor="middle" x={point.x} y={Math.max(point.y - 11, 14)}>{formatChartValue(values[index], valueFormat)}</text><text fill="var(--block-muted,var(--slide-muted))" fontSize="calc(var(--chart-font-size) * .66)" textAnchor="middle" x={point.x} y={height - 3}>{labels[index] ?? `Q${index + 1}`}</text></g>)}
  </svg></div>;
}

function SparklineVisual({ colors, labels, strokeWidth, valueFormat, values, xAxisStep, yAxisStep }: ChartVisualProps) {
  const latest = values.at(-1) ?? 0;
  const first = values[0] ?? latest;
  const change = first === 0 ? 0 : (latest - first) / Math.abs(first) * 100;
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 1;
  const bounds = chartAxisBounds(rawMin, rawMax, yAxisStep);
  const min = bounds.minimum;
  const max = bounds.maximum;
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => ({
    x: values.length === 1 ? 314 : 44 + index * 540 / (values.length - 1),
    y: 12 + (max - value) / range * 62
  }));
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = points.length ? `M ${points[0].x} 82 L ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${points.at(-1)?.x} 82 Z` : "";
  const yTicks = chartAxisTicks(min, max, yAxisStep, 2);
  const xTicks = chartAxisTicks(1, Math.max(values.length, 1), xAxisStep, Math.max(values.length - 1, 1));

  return (
    <div className="mt-4 flex flex-1 flex-col justify-center rounded-xl border border-[var(--slide-border)] bg-white/[0.025] px-5 py-4 min-h-0">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--block-muted,var(--slide-muted))]">Latest</p>
          <p className="mt-1 font-mono text-3xl font-bold text-[var(--block-fg,var(--slide-fg))]">{formatChartValue(latest, valueFormat)}</p>
        </div>
        <div className={`rounded-full px-2.5 py-1 font-mono text-xs font-semibold ${change >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
        </div>
      </div>
      <svg className="mt-3 h-24 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 90">
        {yTicks.map((tick) => { const y = 12 + (max - tick) / range * 62; return <g key={tick}><line stroke="var(--block-fg,var(--slide-fg))" strokeOpacity=".09" x1="36" x2="590" y1={y} y2={y} /><text dominantBaseline="middle" fill="var(--block-muted,var(--slide-muted))" fontFamily="monospace" fontSize="8" textAnchor="end" x="31" y={y}>{formatChartValue(tick, valueFormat)}</text></g>; })}
        {xTicks.map((tick) => { const x = values.length <= 1 ? 314 : 44 + (tick - 1) * 540 / (values.length - 1); return <g key={`x-${tick}`}><line stroke="var(--block-fg,var(--slide-fg))" strokeOpacity=".06" x1={x} x2={x} y1="10" y2="82" /><text fill="var(--block-muted,var(--slide-muted))" fontFamily="monospace" fontSize="8" textAnchor="middle" x={x} y="89">{formatChartNumber(tick)}</text></g>; })}
        <path d={areaPath} fill="var(--chart-color)" opacity=".1" />
        <polyline fill="none" points={pointString} stroke="var(--chart-color)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={Math.min(strokeWidth, 6)} vectorEffect="non-scaling-stroke" />
        {points.map((point, index) => (
          <circle
            cx={point.x}
            cy={point.y}
            fill={colorAt(colors, index)}
            key={index}
            r={index === points.length - 1 ? 5 : 3.5}
            stroke="var(--block-bg, var(--slide-card))"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="mt-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(values.length, 1)}, minmax(0, 1fr))` }}>
        {values.map((value, index) => (
          <div className="min-w-0 text-center" key={index} style={{ fontSize: "calc(var(--chart-font-size) * .78)" }}>
            <span className="mx-auto mb-1 block h-1.5 w-1.5 rounded-full" style={{ background: colorAt(colors, index) }} />
            <span className="block truncate text-[var(--block-muted,var(--slide-muted))]">X {index + 1} · {labels[index] ?? `Q${index + 1}`}</span>
            <b className="mt-0.5 block truncate font-mono text-[var(--block-fg,var(--slide-fg))]">Y {formatChartValue(value, valueFormat)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadialVisual({ colors, labels, strokeWidth, type, valueFormat, values }: ChartVisualProps) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const gradient = values.map((value, index) => { const start = values.slice(0, index).reduce((sum, item) => sum + item, 0) / total * 100; const end = start + value / total * 100; return `${colorAt(colors, index)} ${start}% ${end}%`; }).join(",");
  const inset = Math.min(40, Math.max(18, 44 - strokeWidth * 1.5)); return <div className="mt-4 flex flex-1 items-center justify-center gap-8 min-h-0"><div className="relative aspect-square h-full max-h-48 rounded-full" style={{ background: `conic-gradient(${gradient})`, padding: type === "pie" ? Math.max(0, 12 - strokeWidth / 2) : 0 }}>{type === "donut" ? <div className="absolute grid place-items-center rounded-full bg-[var(--slide-card)] font-mono font-bold" style={{ inset: `${inset}%`, fontSize: "var(--chart-font-size)" }}>{formatChartValue(total, valueFormat)}</div> : null}</div><div className="space-y-2">{values.map((v, i) => <div className="flex items-center gap-2" key={i} style={{ fontSize: "var(--chart-font-size)" }}><span className="rounded-sm" style={{ background: colorAt(colors, i), height: Math.max(8, strokeWidth), width: Math.max(8, strokeWidth) }} /><span>{labels[i]}</span><b>{formatChartValue(v, valueFormat)}</b></div>)}</div></div>;
}

function GaugeVisual({ colors, labels, strokeWidth, valueFormat, values }: ChartVisualProps) {
  const axisMax = chartAxisMaximum(Math.max(...values, 1)); const primaryValue = Math.max(values[0] ?? 0, 0); const primaryPct = Math.min(primaryValue / axisMax, 1); const angle = Math.PI * (1 - primaryPct); const needleX = 150 + Math.cos(angle) * 64; const needleY = 130 - Math.sin(angle) * 64; const visibleValues = values.slice(0, 6);
  const arcWidth = Math.min(14, Math.max(5, strokeWidth)); return <div className="mt-2 flex flex-1 items-center justify-center gap-5 min-h-0"><svg className="h-full max-h-64 min-w-0 flex-1" viewBox="0 0 300 205">{visibleValues.map((value, index) => { const radius = 96 - index * (arcWidth + 4); const startX = 150 - radius; const endX = 150 + radius; const pct = Math.min(Math.max(value, 0) / axisMax, 1); return <g key={index}><path d={`M${startX} 130 A${radius} ${radius} 0 0 1 ${endX} 130`} fill="none" pathLength="100" stroke="rgba(255,255,255,.08)" strokeLinecap="round" strokeWidth={arcWidth} /><path d={`M${startX} 130 A${radius} ${radius} 0 0 1 ${endX} 130`} fill="none" pathLength="100" stroke={colorAt(colors, index)} strokeDasharray={`${pct * 100} 100`} strokeLinecap="round" strokeWidth={arcWidth} /></g>; })}<line x1="150" x2={needleX} y1="130" y2={needleY} stroke="var(--block-fg, var(--slide-fg))" strokeLinecap="round" strokeWidth={Math.max(2, strokeWidth / 3)} /><circle cx="150" cy="130" fill="var(--slide-card)" r={Math.max(6, strokeWidth)} stroke={colorAt(colors, 0)} strokeWidth={Math.max(3, strokeWidth / 2)} /><text fill="var(--block-muted, var(--slide-muted))" fontSize="10" textAnchor="middle" x="49" y="153">{formatChartValue(0, valueFormat)}</text><text fill="var(--block-muted, var(--slide-muted))" fontSize="10" textAnchor="middle" x="251" y="153">{formatChartValue(axisMax, valueFormat)}</text><text fill="var(--block-fg, var(--slide-fg))" fontSize="30" fontWeight="700" textAnchor="middle" x="150" y="176">{formatChartValue(primaryValue, valueFormat)}</text><text fill="var(--block-muted, var(--slide-muted))" fontSize="var(--chart-font-size)" textAnchor="middle" x="150" y="194">{labels[0] ?? "Value"}</text></svg><div className="grid min-w-28 gap-2">{visibleValues.map((value, index) => <div className="grid grid-cols-[8px_1fr_auto] items-center gap-2" key={index} style={{ fontSize: "var(--chart-font-size)" }}><i className="h-2 w-2 rounded-full" style={{ background: colorAt(colors, index) }} /><span className="max-w-20 truncate text-[var(--block-muted,var(--slide-muted))]">{labels[index] ?? `Value ${index + 1}`}</span><b>{formatChartValue(value, valueFormat)}</b></div>)}</div></div>;
}

function PolarAreaVisual({ colors, height, labels, maxValue, strokeWidth, valueFormat, values }: ChartVisualProps) {
  const cx = 180, cy = 110, maxRadius = Math.min(88, height / 2 - 10); const slice = 360 / values.length;
  return <div className="mt-3 flex flex-1 items-center justify-center gap-6 min-h-0"><svg className="h-full max-h-52 w-auto" viewBox="0 0 360 220">{values.map((value, index) => { const radius = Math.max(value / maxValue * maxRadius, 12); return <path d={sectorPath(cx, cy, radius, index * slice - 90, (index + 1) * slice - 90 - Math.max(1, strokeWidth / 3))} fill={colorAt(colors, index)} key={index} opacity=".88" />; })}<circle cx={cx} cy={cy} fill="var(--slide-card)" r={Math.max(8, strokeWidth * 1.5)} /></svg><div className="space-y-1.5">{values.map((value, index) => <div className="flex items-center gap-2" key={index} style={{ fontSize: "var(--chart-font-size)" }}><i className="rounded-sm" style={{ background: colorAt(colors, index), height: Math.max(7, strokeWidth), width: Math.max(7, strokeWidth) }} /><span>{labels[index]}</span><b>{formatChartValue(value, valueFormat)}</b></div>)}</div></div>;
}

function TileVisual({ colors, labels, maxValue, strokeWidth, type, valueFormat, values }: ChartVisualProps) { return <div className={`mt-5 grid flex-1 min-h-0 ${type === "heatmap" ? "grid-cols-4" : "grid-cols-3"}`} style={{ gap: Math.max(2, strokeWidth / 2) }}>{values.map((v, i) => { const tileColor = colorAt(colors, i); const tileTextColor = resolveContrastingTextColor(tileColor) ?? "#ffffff"; return <div className="flex min-h-10 items-end justify-between rounded-md p-2" key={i} style={{ background: tileColor, color: tileTextColor, fontSize: "var(--chart-font-size)", opacity: type === "heatmap" ? .3 + .7 * v / maxValue : 1, gridColumn: type === "treemap" && i === 0 ? "span 2" : undefined, gridRow: type === "treemap" && i === 0 ? "span 2" : undefined }}><span className="truncate font-semibold">{labels[i]}</span><b>{formatChartValue(v, valueFormat)}</b></div>; })}</div>; }

function TimelineVisual({ colors, labels, strokeWidth, valueFormat, values }: ChartVisualProps) { return <div className="relative mt-5 flex flex-1 items-center"><div className="absolute left-0 right-0 bg-white/15" style={{ height: Math.max(1, strokeWidth / 3) }} />{values.map((v, i) => <div className="relative flex flex-1 flex-col items-center gap-2" key={i}><span className="z-10 rounded-full ring-[var(--slide-card)]" style={{ background: colorAt(colors, i), height: Math.max(10, strokeWidth * 1.5), width: Math.max(10, strokeWidth * 1.5), boxShadow: `0 0 0 ${Math.max(2, strokeWidth / 2)}px var(--slide-card)` }} /><b style={{ fontSize: "var(--chart-font-size)" }}>{labels[i]}</b><span className="font-mono text-[var(--block-muted,var(--slide-muted))]" style={{ fontSize: "var(--chart-font-size)" }}>{formatChartValue(v, valueFormat)}</span></div>)}</div>; }

function ScatterVisual({ colors, height, labels, maxValue, sizes, strokeWidth, type, valueFormat, values, xAxisStep, xValues, yAxisStep }: ChartVisualProps) { const resolvedXValues = values.map((_, index) => xValues[index] ?? index + 1); const maxX = Math.max(...resolvedXValues, 1); const maxSize = Math.max(...sizes, 1); const scale = cartesianScale(height, maxX, maxValue, xAxisStep, yAxisStep); return <div className="mt-4 flex flex-1 min-h-0"><svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 720 ${height}`}><CartesianAxes height={height} maxX={maxX} maxY={maxValue} valueFormat={valueFormat} xAxisStep={xAxisStep} yAxisStep={yAxisStep} />{values.map((value, index) => { const xValue = resolvedXValues[index]; const x = scale.x(xValue); const y = scale.y(value); const diameter = type === "bubble" ? 14 + (sizes[index] ?? 10) / maxSize * (30 + strokeWidth) : Math.max(8, strokeWidth + 3); const pointColor = colorAt(colors, index); return <g key={index}><circle cx={x} cy={y} fill={pointColor} r={diameter / 2} /><text fill="var(--block-fg,var(--slide-fg))" fontFamily="monospace" fontSize="calc(var(--chart-font-size) * .68)" fontWeight="700" textAnchor="middle" x={x} y={Math.max(y - diameter / 2 - 7, 13)}>({formatChartNumber(xValue)}, {formatChartValue(value, valueFormat)})</text>{type === "bubble" && diameter > 34 ? <text dominantBaseline="middle" fill={resolveContrastingTextColor(pointColor) ?? "#ffffff"} fontSize="calc(var(--chart-font-size) * .58)" textAnchor="middle" x={x} y={y}>{labels[index]?.slice(0, 3)}</text> : null}</g>; })}</svg></div>; }

function RadarVisual({ colors, height, labels, maxValue, strokeWidth, valueFormat, values }: ChartVisualProps) {
  const safeHeight = Math.max(height, 96);
  const centerX = 360;
  const centerY = safeHeight / 2;
  const radius = Math.max(18, Math.min(118, safeHeight / 2 - 32));
  const count = Math.max(values.length, 1);
  const pointAt = (index: number, scale = 1) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / count;
    return { x: centerX + Math.cos(angle) * radius * scale, y: centerY + Math.sin(angle) * radius * scale };
  };
  const gridPoints = (scale: number) => values.map((_, index) => {
    const point = pointAt(index, scale);
    return `${point.x},${point.y}`;
  }).join(" ");
  const valuePoints = values.map((value, index) => pointAt(index, Math.max(value, 0) / maxValue));
  const valuePointString = valuePoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="mt-4 flex flex-1 min-h-0">
      <svg className="h-full w-full" preserveAspectRatio="xMidYMid meet" viewBox={`0 0 720 ${safeHeight}`}>
        {[1, 0.66, 0.33].map((scale) => (
          <polygon
            fill="none"
            key={scale}
            points={gridPoints(scale)}
            stroke="var(--block-fg, var(--slide-fg))"
            strokeOpacity=".14"
            strokeWidth={Math.max(1, strokeWidth / 5)}
          />
        ))}
        {values.map((_, index) => {
          const point = pointAt(index);
          return <line key={index} stroke="var(--block-fg, var(--slide-fg))" strokeOpacity=".1" strokeWidth={Math.max(1, strokeWidth / 5)} x1={centerX} x2={point.x} y1={centerY} y2={point.y} />;
        })}
        <polygon fill="var(--chart-color)" fillOpacity=".2" points={valuePointString} stroke="var(--chart-color)" strokeLinejoin="round" strokeWidth={strokeWidth} />
        {valuePoints.map((point, index) => (
          <circle cx={point.x} cy={point.y} fill={colorAt(colors, index)} key={index} r={Math.max(3.5, strokeWidth / 2)} stroke="var(--block-bg, var(--slide-card))" strokeWidth="2" />
        ))}
        {values.map((value, index) => {
          const outerPoint = pointAt(index, 1.22);
          const labelX = Math.min(Math.max(outerPoint.x, 42), 678);
          const labelY = Math.min(Math.max(outerPoint.y, 16), safeHeight - 16);
          return (
            <text
              dominantBaseline="middle"
              fill="var(--block-fg, var(--slide-fg))"
              fontSize="var(--chart-font-size)"
              fontWeight="600"
              key={index}
              textAnchor="middle"
              x={labelX}
              y={labelY}
            >
              {labels[index] ?? `Q${index + 1}`} · {formatChartValue(value, valueFormat)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function CartesianAxes({ height, maxX, maxY, valueFormat, xAxisStep, yAxisStep }: { height: number; maxX: number; maxY: number; valueFormat: ChartValueFormat; xAxisStep?: number; yAxisStep?: number }) { const scale = cartesianScale(height, maxX, maxY, xAxisStep, yAxisStep); const xTickCount = Number.isInteger(scale.xMax) && scale.xMax <= 8 ? scale.xMax : 4; return <g>{chartAxisTicks(0, scale.yMax, yAxisStep).map((tick) => <g key={`y-${tick}`}><line stroke="var(--block-fg,var(--slide-fg))" strokeOpacity=".1" x1={scale.left} x2={scale.right} y1={scale.y(tick)} y2={scale.y(tick)} /><text dominantBaseline="middle" fill="var(--block-muted,var(--slide-muted))" fontFamily="monospace" fontSize="calc(var(--chart-font-size) * .64)" textAnchor="end" x={scale.left - 8} y={scale.y(tick)}>{formatChartValue(tick, valueFormat)}</text></g>)}{chartAxisTicks(0, scale.xMax, xAxisStep, xTickCount).map((tick) => <g key={`x-${tick}`}><line stroke="var(--block-fg,var(--slide-fg))" strokeOpacity=".075" x1={scale.x(tick)} x2={scale.x(tick)} y1={scale.top} y2={scale.bottom} /><text fill="var(--block-muted,var(--slide-muted))" fontFamily="monospace" fontSize="calc(var(--chart-font-size) * .62)" textAnchor="middle" x={scale.x(tick)} y={height - 16}>{formatChartNumber(tick)}</text></g>)}<text fill="var(--block-muted,var(--slide-muted))" fontSize="calc(var(--chart-font-size) * .7)" x="8" y="15">Y</text><text fill="var(--block-muted,var(--slide-muted))" fontSize="calc(var(--chart-font-size) * .7)" textAnchor="end" x="714" y={height - 3}>X</text></g>; }
function cartesianScale(height: number, maxX: number, maxY: number, xAxisStep?: number, yAxisStep?: number) { const left = 60; const right = 680; const top = 20; const bottom = height - 38; const xMax = xAxisStep ? chartAxisMaximum(maxX, xAxisStep) : Math.max(maxX, 1); const yMax = chartAxisMaximum(Math.max(maxY, 1), yAxisStep); const plotWidth = right - left; const plotHeight = Math.max(bottom - top, 1); return { bottom, left, plotHeight, plotWidth, right, top, x: (value: number) => left + Math.max(value, 0) / xMax * plotWidth, xMax, y: (value: number) => top + (yMax - Math.max(value, 0)) / yMax * plotHeight, yMax }; }
function colorAt(colors: string[], index: number) { return colors[index] || "var(--chart-color)"; }
function formatChartNumber(value: number) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value); }
function sectorPath(cx: number, cy: number, radius: number, startDegrees: number, endDegrees: number) {
  const start = polarPoint(cx, cy, radius, startDegrees); const end = polarPoint(cx, cy, radius, endDegrees); const largeArc = endDegrees - startDegrees > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}
function polarPoint(cx: number, cy: number, radius: number, degrees: number) { const radians = degrees * Math.PI / 180; return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius }; }
