"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { ColorControl, Field, NativeSelect, NumberInput, type BlockFieldProps } from "@/features/pitch/ui/inspector/InspectorControls";

const shapeOptions = [
  { label: "Rectangle", value: "rectangle" },
  { label: "Circle", value: "circle" },
  { label: "Diamond", value: "diamond" },
  { label: "Arrow", value: "arrow" },
  { label: "Polygon", value: "polygon" },
  { label: "Line", value: "line" },
  { label: "Star", value: "star" },
  { label: "Chevron", value: "chevron" },
  { label: "Hexagon", value: "hexagon" },
  { label: "Parallelogram", value: "parallelogram" }
] as const;

const lineStyleOptions = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" }
] as const;

const lineEndOptions = [
  { label: "None", value: "none" },
  { label: "Arrow", value: "arrow" },
  { label: "Circle", value: "circle" },
  { label: "Bar", value: "bar" }
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
      {currentShape === "line" ? <>
        <Field label="Line style"><NativeSelect onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, lineStyle: value })} options={lineStyleOptions} value={normalizeLineStyle(block.props.lineStyle)} /></Field>
        <Field label="Start"><NativeSelect onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, arrowStart: value })} options={lineEndOptions} value={normalizeLineEnd(block.props.arrowStart)} /></Field>
        {normalizeLineEnd(block.props.arrowStart) !== "none" ? <Field label="Start size"><NumberInput max="300" min="25" onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, arrowStartSize: value })} placeholder="100" step="5" suffix="%" value={block.props.arrowStartSize ?? 100} /></Field> : null}
        <Field label="End"><NativeSelect onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, arrowEnd: value })} options={lineEndOptions} value={normalizeLineEnd(block.props.arrowEnd)} /></Field>
        {normalizeLineEnd(block.props.arrowEnd) !== "none" ? <Field label="End size"><NumberInput max="300" min="25" onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, arrowEndSize: value })} placeholder="100" step="5" suffix="%" value={block.props.arrowEndSize ?? 100} /></Field> : null}
      </> : null}
      {currentShape !== "line" ? <ColorControl
        label="Fill"
        onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, fill: value })}
        placeholder="rgba(142,165,255,0.72)"
        value={block.props.fill}
      /> : null}
      <Field label="Text">
        <input className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/35 px-3 text-sm text-neutral-100 outline-none transition focus:border-[#8ea5ff]/55" onChange={(event) => updateBlock(selectedBlockIndex, { ...block.props, text: event.target.value })} placeholder="Add text" type="text" value={String(block.props.text ?? "")} />
      </Field>
      {block.props.text ? <>
        <ColorControl label="Text color" onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, textColor: value })} placeholder="#ffffff" value={block.props.textColor} />
        <Field label="Text size"><NumberInput max="96" min="8" onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, fontSize: value })} placeholder="18" step="1" suffix="px" value={block.props.fontSize ?? 18} /></Field>
      </> : null}
      <ColorControl
        label={currentShape === "line" ? "Line color" : "Stroke"}
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
  if (value === "arrow" || value === "chevron" || value === "circle" || value === "diamond" || value === "hexagon" || value === "parallelogram" || value === "polygon" || value === "line" || value === "star") {
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

function normalizeLineStyle(value: string | number | undefined) {
  return value === "dashed" || value === "dotted" ? value : "solid";
}

function normalizeLineEnd(value: string | number | undefined) {
  return value === "arrow" || value === "circle" || value === "bar" ? value : "none";
}
