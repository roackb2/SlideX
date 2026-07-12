import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";
import { createTableCells, serializeTableCells } from "@/core/motion-doc/application/tableBlock";
import { chartDefaultProps } from "@/core/motion-doc/application/chartBlock";
import { normalizeChartType } from "@/core/motion-doc/domain/chartCatalog";

export type AddBlockType =
  | "Title"
  | "Text"
  | "Text96"
  | "Text60"
  | "Text48"
  | "Text36"
  | "Text32"
  | "Text24"
  | "Card"
  | "Image"
  | "Video"
  | "Metric"
  | "Chart"
  | "ChartBar"
  | "ChartLine"
  | "ChartArea"
  | "ChartPie"
  | "ChartDonut"
  | "ChartBubble"
  | "Icon"
  | "Table"
  | "ShapeRectangle"
  | "ShapeCircle"
  | "ShapeTriangle"
  | "ShapeLine"
  | "ShapeArrow"
  | "ShapeStar";

export function createMotionDocBlock(type: AddBlockType): MotionDocBlock {
  switch (type) {
    case "Table":
      return {
        type: "Table",
        props: {
          background: "#ffffff",
          borderColor: "#d1d5db",
          borderWidth: 1,
          cellBackground: "#ffffff",
          cells: serializeTableCells(createTableCells(3, 4)),
          color: "#000000",
          columns: 4,
          enter: "none",
          fontSize: 16,
          h: 30,
          headerHeight: 26,
          rowHeaderWidth: 34,
          rows: 3,
          stripeBackground: "#f8fafc",
          w: 56,
          x: 22,
          y: 34
        }
      } as MotionDocBlock;
    case "Title":
      return { type: "Title", props: { enter: "none", fontSize: 72, x: 9, y: 18, w: 52, h: 18 }, text: "New Title" } as MotionDocBlock;
    case "Text":
      return { type: "Text", props: { enter: "none", fontSize: 24, x: 10, y: 45, w: 42, h: 9 }, text: "Add some descriptive text here." } as MotionDocBlock;
    case "Text96":
      return createTextPresetBlock(96, "Display headline");
    case "Text60":
      return createTextPresetBlock(60, "Section headline");
    case "Text48":
      return createTextPresetBlock(48, "Key message");
    case "Text36":
      return createTextPresetBlock(36, "Slide title");
    case "Text32":
      return createTextPresetBlock(32, "Supporting title");
    case "Text24":
      return createTextPresetBlock(24, "Body copy");
    case "Card":
      return { type: "Card", props: { icon: "Sparkles", layout: "vertical", title: "Feature", text: "Feature description", width: "md", enter: "none", radius: 16, x: 8, y: 38, w: 40, h: 32 } } as MotionDocBlock;
    case "Metric":
      return { type: "Metric", props: { label: "Pipeline", value: "$2.4M", caption: "Qualified revenue influenced this quarter.", width: "sm", enter: "none", radius: 16, x: 8, y: 38, w: 32, h: 36 } } as MotionDocBlock;
    case "Chart":
    case "ChartBar":
      return createChartBlock("bar");
    case "ChartLine":
      return createChartBlock("line");
    case "ChartArea":
      return createChartBlock("area");
    case "ChartPie":
      return createChartBlock("pie");
    case "ChartDonut":
      return createChartBlock("donut");
    case "ChartBubble":
      return createChartBlock("bubble");
    case "Image":
      return { type: "ImageBlock", props: { src: "", alt: "", fit: "cover", scaleX: 1, scaleY: 1, enter: "none", radius: 16, x: 10, y: 20, w: 80, h: 54 } } as MotionDocBlock;
    case "Video":
      return { type: "VideoBlock", props: { src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", fit: "cover", controls: "true", loop: "true", muted: "true", enter: "none", radius: 16, x: 10, y: 20, w: 80, h: 54 } } as MotionDocBlock;
    case "Icon":
      return { type: "Icon", props: { icon: "Sparkles", color: "#ffffff", strokeWidth: 2.2, size: 112, enter: "none", radius: 0, x: 47.0833, y: 44.8148, w: 5.8333, h: 10.3704 } } as MotionDocBlock;
    case "ShapeRectangle":
      return createShapeBlock("rectangle");
    case "ShapeCircle":
      return createShapeBlock("circle");
    case "ShapeTriangle":
      return createShapeBlock("triangle");
    case "ShapeLine":
      return createShapeBlock("line");
    case "ShapeArrow":
      return createShapeBlock("arrow");
    case "ShapeStar":
      return createShapeBlock("star");
  }
}

function createTextPresetBlock(fontSize: number, text: string): MotionDocBlock {
  const isDisplay = fontSize >= 48;
  return {
    type: "Text",
    props: {
      enter: "none",
      fontSize,
      fontWeight: isDisplay ? 700 : 560,
      lineHeight: fontSize >= 60 ? 1 : 1.12,
      role: fontSize >= 36 ? "title" : "body",
      x: fontSize >= 60 ? 7 : 10,
      y: fontSize >= 60 ? 16 : fontSize >= 36 ? 24 : 44,
      w: fontSize >= 60 ? 76 : fontSize >= 36 ? 62 : 46,
      h: fontSize >= 60 ? 24 : fontSize >= 36 ? 18 : 9
    },
    text
  } as MotionDocBlock;
}

function createChartBlock(chartType: string): MotionDocBlock {
  const normalizedType = normalizeChartType(chartType);
  return {
    type: "Chart",
    props: {
      ...chartDefaultProps(normalizedType),
      title: normalizedType === "bar" ? "Quarterly traction" : "Audience signal",
      width: "full",
      enter: "none",
      radius: 16,
      x: 7,
      y: 24,
      w: 86,
      h: 64
    }
  } as MotionDocBlock;
}

function createShapeBlock(shape: string): MotionDocBlock {
  const isLine = shape === "line" || shape === "arrow";
  const isTriangle = shape === "triangle";
  const isStar = shape === "star";
  return {
    type: "Shape",
    props: {
      shape: isTriangle ? "polygon" : shape,
      ...(isTriangle ? { sides: 3 } : {}),
      ...(isStar ? { points: 5 } : {}),
      fill: isLine ? "transparent" : "rgba(142,165,255,0.72)",
      stroke: isLine ? "#171717" : "#ffffff",
      strokeWidth: 2,
      operation: "none",
      mask: "none",
      enter: "none",
      radius: 0,
      x: isLine ? 16 : 34,
      y: isLine ? 50 : 30,
      w: isLine ? 68 : 28,
      h: isLine ? 2.5 : 28
    }
  } as MotionDocBlock;
}
