"use client";

import { Blend, ChevronLeft, ChevronRight, Circle, CircleMinus, Combine } from "lucide-react";
import { ColorControl, Field, IconSegmentedControl, NativeSelect, NumberInput, OptionButtons, type BlockFieldProps } from "@/features/pitch/ui/inspector/InspectorControls";

const shapeOptions = [
  { label: "Rectangle", value: "rectangle" },
  { label: "Circle", value: "circle" },
  { label: "Arrow", value: "arrow" },
  { label: "Polygon", value: "polygon" },
  { label: "Line", value: "line" },
  { label: "Star", value: "star" }
] as const;

const operationOptions = [
  { icon: <Circle size={14} />, label: "None", value: "none" },
  { icon: <CircleMinus size={14} />, label: "Subtract", value: "subtract" },
  { icon: <Combine size={14} />, label: "Intersect", value: "intersect" },
  { icon: <Blend size={14} />, label: "Exclude", value: "exclude" }
] as const;

const maskOptions = [
  { label: "None", value: "none" },
  { label: "Alpha", value: "alpha" },
  { label: "Luma", value: "luma" },
  { label: "Clip", value: "clip" }
] as const;

export function ShapeFields({ block, selectedBlockIndex, updateBlock }: BlockFieldProps) {
  const currentShape = normalizeShape(block.props.shape);
  const showSides = currentShape === "polygon";
  const showPoints = currentShape === "star";
  const sides = normalizeInt(block.props.sides, 3);
  const points = normalizeInt(block.props.points, 5);

  function adjustSides(delta: number) {
    const next = Math.min(Math.max(sides + delta, 3), 12);
    updateBlock(selectedBlockIndex, { ...block.props, shape: "polygon", sides: next });
  }

  function adjustPoints(delta: number) {
    const next = Math.min(Math.max(points + delta, 3), 12);
    updateBlock(selectedBlockIndex, { ...block.props, points: next });
  }

  return (
    <>
      <Field label="Shape">
        <NativeSelect
          onChange={(value) => {
            const nextProps: Record<string, string | number> = { ...block.props, shape: value };
            if (value === "polygon" && !block.props.sides) {
              nextProps.sides = 3;
            }
            if (value === "star" && !block.props.points) {
              nextProps.points = 5;
            }
            updateBlock(selectedBlockIndex, nextProps);
          }}
          options={shapeOptions}
          value={currentShape}
        />
      </Field>
      {showSides ? (
        <Field label="Sides">
          <SidesAdjuster value={sides} onChange={adjustSides} min={3} max={12} />
        </Field>
      ) : null}
      {showPoints ? (
        <Field label="Points">
          <SidesAdjuster value={points} onChange={adjustPoints} min={3} max={12} />
        </Field>
      ) : null}
      <IconSegmentedControl
        label="Boolean"
        onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, operation: value })}
        options={operationOptions}
        value={normalizeOperation(block.props.operation)}
      />
      <OptionButtons
        label="Mask"
        onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, mask: value })}
        options={maskOptions}
        value={normalizeMask(block.props.mask)}
      />
      <ColorControl
        label="Fill"
        onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, fill: value })}
        placeholder="rgba(142,165,255,0.72)"
        value={block.props.fill}
      />
      <ColorControl
        label="Stroke"
        onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, stroke: value })}
        placeholder="#ffffff"
        value={block.props.stroke}
      />
      <Field label="Stroke width">
        <NumberInput
          max="24"
          min="0"
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, strokeWidth: value === "" ? "" : value })}
          placeholder="2"
          step="0.5"
          suffix="px"
          value={block.props.strokeWidth ?? ""}
        />
      </Field>
      <Field label="Opacity">
        <NumberInput
          max="1"
          min="0"
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, opacity: value === "" ? "" : value })}
          placeholder="1"
          step="0.05"
          value={block.props.opacity ?? 1}
        />
      </Field>
    </>
  );
}

function SidesAdjuster({
  max,
  min,
  onChange,
  value
}: {
  max: number;
  min: number;
  onChange: (delta: number) => void;
  value: number;
}) {
  return (
    <div className="flex items-center gap-0 rounded-xl border border-white/[0.06] bg-black/40 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
      <button
        aria-label="Decrease"
        className="flex h-8 w-8 items-center justify-center text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        disabled={value <= min}
        onClick={() => onChange(-1)}
        type="button"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="flex min-w-[40px] items-center justify-center font-mono text-[13px] font-bold text-neutral-200 select-none">
        {value}
      </span>
      <button
        aria-label="Increase"
        className="flex h-8 w-8 items-center justify-center text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        disabled={value >= max}
        onClick={() => onChange(1)}
        type="button"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function normalizeShape(value: string | number | undefined) {
  if (value === "arrow" || value === "circle" || value === "polygon" || value === "line" || value === "star") {
    return value;
  }

  if (value === "triangle") {
    return "polygon" as const;
  }

  return "rectangle" as const;
}

function normalizeInt(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : parseInt(String(value), 10);

  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 3), 12) : fallback;
}

function normalizeOperation(value: string | number | undefined) {
  if (value === "subtract" || value === "intersect" || value === "exclude") {
    return value;
  }

  return "none";
}

function normalizeMask(value: string | number | undefined) {
  if (value === "alpha" || value === "luma" || value === "clip") {
    return value;
  }

  return "none";
}
