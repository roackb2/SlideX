import { createMotionDocBlock } from "@/core/motion-doc/application/motionDocBlockFactory";
import { motionDocAddBlockTypes } from "@/core/motion-doc/application/motionDocAutomation";
import { z } from "zod/v4";

export const motionDocPropValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const motionDocPropsSchema = z
  .record(z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/), motionDocPropValueSchema)
  .describe(
    "MotionDoc prop patch. Values may be strings, finite numbers, or booleans; booleans are serialized as \"true\" or \"false\"."
  );

export const motionDocFrameSchema = z.object({
  h: z.number().optional().describe("Frame height as a percentage of the slide."),
  w: z.number().optional().describe("Frame width as a percentage of the slide."),
  x: z.number().optional().describe("Frame x position as a percentage of the slide."),
  y: z.number().optional().describe("Frame y position as a percentage of the slide.")
});

export const motionDocBlockUpdateSchema = z
  .object({
    props: motionDocPropsSchema.optional(),
    text: z.string().optional().describe("Text content. Only applies to Title and Text blocks.")
  })
  .refine(({ props, text }) => props !== undefined || text !== undefined, {
    message: "Provide props and/or text."
  });

const slideFields = [
  "duration",
  "theme",
  "background",
  "accent",
  "textColor",
  "transition",
  "transitionDuration",
  "shader",
  "shaderPreset",
  "shaderEngine",
  "shaderIntensity",
  "shaderSpeed",
  "shaderScale",
  "shaderDetail",
  "shaderSoftness",
  "shaderAngle",
  "shaderColor1",
  "shaderColor2",
  "shaderColor3",
  "shaderColor4",
  "shaderColor5",
  "shaderColor6"
] as const;

const sharedBlockFields = ["id", "x", "y", "w", "h", "enter", "delay", "duration", "radius"] as const;

export function getMotionDocMcpSchema() {
  return {
    document: {
      title: "Top-level Markdown heading (# Title).",
      slideTag: "Slide",
      sourceFormat: "MotionDoc MDX"
    },
    slide: {
      fields: slideFields,
      notes: [
        "duration is a positive number in seconds.",
        "All slide styling fields are patched through slidex_update_slide_props."
      ]
    },
    block: {
      sharedFields: sharedBlockFields,
      notes: [
        "x, y, w and h are percentage-based frame values.",
        "Text content is stored in text only for Title and Text blocks.",
        "Use props for all non-text block fields."
      ],
      types: motionDocAddBlockTypes.map((addType) => describeAddBlockType(addType))
    }
  };
}

function describeAddBlockType(addType: (typeof motionDocAddBlockTypes)[number]) {
  const block = createMotionDocBlock(addType);

  return {
    addType,
    fields: "props" in block ? Object.keys(block.props).sort() : [],
    motionDocType: block.type,
    text: "text" in block ? block.text : undefined,
    defaultProps: "props" in block ? block.props : undefined
  };
}
