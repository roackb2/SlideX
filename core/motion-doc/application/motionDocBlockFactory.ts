import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";

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
  | "Icon"
  | "ShapeRectangle"
  | "ShapeCircle"
  | "ShapeTriangle"
  | "ShapeLine"
  | "ShapeArrow"
  | "ShapeStar";

export function createMotionDocBlock(type: AddBlockType): MotionDocBlock {
  switch (type) {
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
    case "Image":
      return { type: "ImageBlock", props: { src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800", alt: "Retro Setup", fit: "cover", enter: "none", radius: 16, x: 10, y: 20, w: 80, h: 54 } } as MotionDocBlock;
    case "Video":
      return { type: "VideoBlock", props: { src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", fit: "cover", controls: "true", loop: "true", muted: "true", enter: "none", radius: 16, x: 10, y: 20, w: 80, h: 54 } } as MotionDocBlock;
    case "Icon":
      return { type: "Icon", props: { icon: "Sparkles", color: "#ffffff", strokeWidth: 2.2, size: 112, enter: "none", radius: 0, x: 42, y: 28, w: 16, h: 28 } } as MotionDocBlock;
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
  return {
    type: "Chart",
    props: {
      chartType,
      title: chartType === "bar" ? "Quarterly traction" : "Audience signal",
      labels: "Q1,Q2,Q3,Q4",
      values: chartType === "pie" || chartType === "donut" ? "32,24,18,26" : "42,58,73,91",
      width: "lg",
      height: 152,
      enter: "none",
      radius: 16,
      x: 10,
      y: 34,
      w: 70,
      h: 42
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
      stroke: "#ffffff",
      strokeWidth: isLine ? 4 : 2,
      operation: "none",
      mask: "none",
      enter: "none",
      radius: shape === "rectangle" ? 18 : 0,
      x: isLine ? 16 : 34,
      y: isLine ? 50 : 30,
      w: isLine ? 68 : 28,
      h: isLine ? 5 : 28
    }
  } as MotionDocBlock;
}
