import type { MotionDocBlock } from "@/lib/motionDocParser";

export type AddBlockType = "Title" | "Text" | "Card" | "Image" | "Metric" | "Chart";

export function createMotionDocBlock(type: AddBlockType): MotionDocBlock {
  const defaultDelay = 0.2;

  switch (type) {
    case "Title":
      return { type: "Title", props: { enter: "fadeUp", mb: 16 }, text: "New Title" } as MotionDocBlock;
    case "Text":
      return { type: "Text", props: { enter: "fadeUp", delay: defaultDelay }, text: "Add some descriptive text here." } as MotionDocBlock;
    case "Card":
      return { type: "Card", props: { icon: "Sparkles", layout: "vertical", title: "Feature", text: "Feature description", width: "md", enter: "fadeUp", delay: defaultDelay, mb: 12 } } as MotionDocBlock;
    case "Metric":
      return { type: "Metric", props: { label: "Pipeline", value: "$2.4M", caption: "Qualified revenue influenced this quarter.", width: "sm", enter: "fadeUp", delay: defaultDelay, mb: 12 } } as MotionDocBlock;
    case "Chart":
      return { type: "Chart", props: { title: "Quarterly traction", labels: "Q1,Q2,Q3,Q4", values: "42,58,73,91", width: "lg", height: 144, enter: "fadeUp", delay: defaultDelay, mb: 12 } } as MotionDocBlock;
    case "Image":
      return { type: "ImageBlock", props: { src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800", alt: "Retro Setup", fit: "cover", enter: "fadeIn", delay: defaultDelay } } as MotionDocBlock;
  }
}
