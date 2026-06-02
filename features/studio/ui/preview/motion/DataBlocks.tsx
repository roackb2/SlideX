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

  return (
    <MotionBlock
      className={`${chartWidthClass(width)} rounded-2xl border border-[var(--slide-border)] bg-[var(--slide-card)] p-5 shadow-xl shadow-black/20 backdrop-blur`}
      style={surfaceVars({ background, backgroundColor, color, mutedColor, textColor })}
      {...animation}
    >
      <h3 className="text-xl font-semibold text-[var(--slide-fg)]" style={{ color: "var(--block-fg, var(--slide-fg))" }}>
        {title}
      </h3>
      <div className="mt-5 flex items-end gap-3" style={{ minHeight: chartHeight + 48 }}>
        {chartValues.map((value, index) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={`${value}-${index}`}>
            <div className="flex w-full items-end rounded-md bg-white/[0.08]" style={{ height: chartHeight }}>
              <div
                className="w-full rounded-md bg-[var(--slide-fg)]"
                style={{ background: "var(--block-fg, var(--slide-fg))", height: `${Math.max((value / maxValue) * 100, 4)}%` }}
              />
            </div>
            <span className="max-w-full truncate text-[10px] uppercase tracking-wide text-[var(--slide-muted)]" style={{ color: "var(--block-muted, var(--slide-muted))" }}>
              {chartLabels[index] ?? `D${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </MotionBlock>
  );
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
