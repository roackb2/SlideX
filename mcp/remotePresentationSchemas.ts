import { z } from "zod/v4";

import { slideLayouts } from "@/core/motion-doc/presets/templates/slideLayouts";

export const presentationIdSchema = z
  .string()
  .uuid()
  .optional()
  .describe("Presentation UUID. Omit to use the presentation most recently opened in SlideX.");
export const requiredPresentationIdSchema = z
  .string()
  .uuid()
  .describe(
    "Presentation UUID returned by a SlideX read tool. Discover it automatically instead of asking the user."
  );
export const expectedRevisionSchema = z.number().int().min(0);
export const slideIndexSchema = z.number().int().min(0);
export const blockIndexSchema = z.number().int().min(0);

export const canvasFramePatchSchema = z
  .object({
    h: z.number().min(0).max(100).optional(),
    w: z.number().min(0).max(100).optional(),
    x: z.number().min(0).max(100).optional(),
    y: z.number().min(0).max(100).optional()
  })
  .refine((frame) => Object.values(frame).some((value) => value !== undefined), {
    message: "Provide at least one of x, y, w, or h."
  });

export const layoutOptionsSchema = {
  accent: z.string().optional(),
  background: z.string().optional(),
  duration: z.number().positive().optional(),
  replacements: z.record(z.string(), z.string()).optional(),
  textColor: z.string().optional(),
  theme: z.enum(["dark", "light"]).optional()
};

export const publicSlideLayouts = slideLayouts.filter((layout) => layout.id !== "blank");

export function listLayouts(includeSource: boolean) {
  return {
    count: publicSlideLayouts.length,
    layouts: publicSlideLayouts.map((layout) => formatLayout(layout, includeSource))
  };
}

export function getLayout(layoutId: string) {
  const layout = publicSlideLayouts.find((item) => item.id === layoutId);
  if (!layout) throw new Error(`Unknown layoutId: ${layoutId}.`);
  return layout;
}

export function formatLayout(
  layout: (typeof publicSlideLayouts)[number],
  includeSource: boolean
) {
  return {
    id: layout.id,
    name: layout.name,
    source: includeSource ? layout.source : undefined
  };
}
