import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import {
  addMotionDocBlock,
  deleteMotionDocBlock,
  duplicateMotionDocBlock,
  motionDocAddBlockTypes,
  reorderMotionDocBlock,
  updateMotionDocBlock
} from "@/core/motion-doc/application/motionDocAutomation";
import { updateMotionDocCanvasNodeFrame } from "@/core/motion-doc/application/motionDocCanvas";
import {
  addMotionDocSlideFromLayout,
  replaceMotionDocSlideWithLayout
} from "@/core/motion-doc/application/motionDocLayoutAutomation";
import {
  motionDocBlockUpdateSchema,
  motionDocFrameSchema,
  motionDocPropsSchema
} from "@/mcp/motionDocMcpSchema";
import type { McpPresentationStore } from "@/mcp/presentationStore";
import { mutatePresentation } from "@/mcp/remotePresentationHelpers";
import {
  blockIndexSchema,
  canvasFramePatchSchema,
  expectedRevisionSchema,
  getLayout,
  layoutOptionsSchema,
  requiredPresentationIdSchema,
  slideIndexSchema
} from "@/mcp/remotePresentationSchemas";
import { applyMcpShaderPreset } from "@/mcp/shaderMcp";

export function registerRemotePresentationWriteTools(
  server: McpServer,
  store: McpPresentationStore
) {
  server.registerTool(
    "slidex_save_presentation",
    {
      title: "Save SlideX Presentation",
      description:
        "Save a complete MotionDoc source with revision safety. Use the presentationId returned by a read tool automatically; do not ask the user to find it.",
      inputSchema: {
        expectedRevision: expectedRevisionSchema,
        presentationId: requiredPresentationIdSchema,
        source: z.string()
      }
    },
    ({ expectedRevision, presentationId, source }) =>
      mutatePresentation(store, presentationId, expectedRevision, () => ({ source }))
  );

  server.registerTool(
    "slidex_add_block",
    {
      title: "Add Presentation Block",
      description:
        "Add a public block and revision-safely save it. Reuse the presentationId returned by the preceding read tool.",
      inputSchema: {
        afterBlockIndex: blockIndexSchema.optional(),
        expectedRevision: expectedRevisionSchema,
        position: motionDocFrameSchema.optional(),
        presentationId: requiredPresentationIdSchema,
        props: motionDocPropsSchema.optional(),
        slideIndex: slideIndexSchema,
        text: z.string().optional(),
        type: z.enum(motionDocAddBlockTypes)
      }
    },
    ({ afterBlockIndex, expectedRevision, position, presentationId, props, slideIndex, text, type }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) =>
        addMotionDocBlock(source, slideIndex, type, { afterBlockIndex, position, props, text })
      )
  );

  server.registerTool(
    "slidex_update_block",
    {
      title: "Update Presentation Block",
      description:
        "Update a block and revision-safely save it. Reuse the presentationId returned by the preceding read tool.",
      inputSchema: {
        blockIndex: blockIndexSchema,
        expectedRevision: expectedRevisionSchema,
        ...motionDocBlockUpdateSchema.shape,
        presentationId: requiredPresentationIdSchema,
        slideIndex: slideIndexSchema
      }
    },
    ({ blockIndex, expectedRevision, presentationId, props, slideIndex, text }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) =>
        updateMotionDocBlock(source, slideIndex, blockIndex, { props, text })
      )
  );

  server.registerTool(
    "slidex_update_canvas_node",
    {
      title: "Update SlideX Canvas Node",
      description:
        "Precisely move or resize a canvas node by its stable nodeId. Coordinates are percentages with up to three decimal places; use slidex_get_canvas_nodes first.",
      inputSchema: {
        expectedRevision: expectedRevisionSchema,
        frame: canvasFramePatchSchema,
        nodeId: z.string().min(1),
        presentationId: requiredPresentationIdSchema,
        slideIndex: slideIndexSchema
      }
    },
    ({ expectedRevision, frame, nodeId, presentationId, slideIndex }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) =>
        updateMotionDocCanvasNodeFrame(source, slideIndex, nodeId, frame)
      )
  );

  server.registerTool(
    "slidex_delete_block",
    {
      title: "Delete Presentation Block",
      description: "Delete a block and revision-safely save the presentation.",
      inputSchema: {
        blockIndex: blockIndexSchema,
        expectedRevision: expectedRevisionSchema,
        presentationId: requiredPresentationIdSchema,
        slideIndex: slideIndexSchema
      }
    },
    ({ blockIndex, expectedRevision, presentationId, slideIndex }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) =>
        deleteMotionDocBlock(source, slideIndex, blockIndex)
      )
  );

  server.registerTool(
    "slidex_duplicate_block",
    {
      title: "Duplicate Presentation Block",
      description: "Duplicate a block and revision-safely save the presentation.",
      inputSchema: {
        blockIndex: blockIndexSchema,
        expectedRevision: expectedRevisionSchema,
        offset: z.number().default(2),
        presentationId: requiredPresentationIdSchema,
        slideIndex: slideIndexSchema
      }
    },
    ({ blockIndex, expectedRevision, offset, presentationId, slideIndex }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) =>
        duplicateMotionDocBlock(source, slideIndex, blockIndex, offset)
      )
  );

  server.registerTool(
    "slidex_reorder_block",
    {
      title: "Reorder Presentation Block",
      description: "Reorder a block and revision-safely save the presentation.",
      inputSchema: {
        expectedRevision: expectedRevisionSchema,
        fromIndex: blockIndexSchema,
        presentationId: requiredPresentationIdSchema,
        slideIndex: slideIndexSchema,
        toIndex: blockIndexSchema
      }
    },
    ({ expectedRevision, fromIndex, presentationId, slideIndex, toIndex }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) =>
        reorderMotionDocBlock(source, slideIndex, fromIndex, toIndex)
      )
  );

  server.registerTool(
    "slidex_apply_shader_preset",
    {
      title: "Apply Presentation Shader Preset",
      description: "Apply a shader preset and revision-safely save the presentation.",
      inputSchema: {
        expectedRevision: expectedRevisionSchema,
        presentationId: requiredPresentationIdSchema,
        presetName: z.string().optional(),
        shaderId: z.string(),
        slideIndex: slideIndexSchema
      }
    },
    ({ expectedRevision, presentationId, presetName, shaderId, slideIndex }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) =>
        applyMcpShaderPreset(source, slideIndex, shaderId, presetName)
      )
  );

  server.registerTool(
    "slidex_add_slide_from_layout",
    {
      title: "Add Presentation Slide From Layout",
      description: "Add a layout slide and revision-safely save the presentation.",
      inputSchema: {
        afterSlideIndex: slideIndexSchema.optional(),
        expectedRevision: expectedRevisionSchema,
        layoutId: z.string(),
        presentationId: requiredPresentationIdSchema,
        ...layoutOptionsSchema
      }
    },
    ({ afterSlideIndex, expectedRevision, layoutId, presentationId, ...options }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) => ({
        source: addMotionDocSlideFromLayout(
          source,
          getLayout(layoutId).source,
          afterSlideIndex,
          { ...options, layoutId }
        )
      }))
  );

  server.registerTool(
    "slidex_replace_slide_with_layout",
    {
      title: "Replace Presentation Slide With Layout",
      description: "Apply a layout to one slide and revision-safely save the presentation.",
      inputSchema: {
        expectedRevision: expectedRevisionSchema,
        layoutId: z.string(),
        presentationId: requiredPresentationIdSchema,
        slideIndex: slideIndexSchema,
        ...layoutOptionsSchema
      }
    },
    ({ expectedRevision, layoutId, presentationId, slideIndex, ...options }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) => ({
        source: replaceMotionDocSlideWithLayout(
          source,
          slideIndex,
          getLayout(layoutId).source,
          { ...options, layoutId }
        )
      }))
  );
}
