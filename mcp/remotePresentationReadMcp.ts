import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import { getMotionDocCanvasNodes } from "@/core/motion-doc/application/motionDocCanvas";
import { motionDocAddBlockTypes } from "@/core/motion-doc/application/motionDocAutomation";
import { getMotionDocMcpSchema } from "@/mcp/motionDocMcpSchema";
import type { McpPresentationStore } from "@/mcp/presentationStore";
import {
  presentationSummary,
  readWithPresentation,
  readWithPresentationSummary,
  runAsyncMcpTool
} from "@/mcp/remotePresentationHelpers";
import {
  formatLayout,
  getLayout,
  listLayouts,
  presentationIdSchema,
  slideIndexSchema
} from "@/mcp/remotePresentationSchemas";
import { getMcpShader, listMcpShaders } from "@/mcp/shaderMcp";

export function registerRemotePresentationReadTools(
  server: McpServer,
  store: McpPresentationStore
) {
  server.registerTool(
    "slidex_list_presentations",
    {
      title: "List SlideX Presentations",
      description:
        "List the authenticated user's recent presentations. Use this automatically when a presentation ID is not already known; do not ask the user to find an ID.",
      inputSchema: {
        limit: z.number().int().min(1).max(50).default(20)
      }
    },
    ({ limit }) =>
      runAsyncMcpTool(async () => {
        const presentations = await store.listPresentations(limit);
        return {
          autoSelectedPresentationId: presentations[0]?.id ?? null,
          presentations
        };
      })
  );

  server.registerTool(
    "slidex_get_presentation",
    {
      title: "Get SlideX Presentation",
      description:
        "Read one authenticated SlideX presentation summary and its current source revision. Set includeSource to true only when the complete MotionDoc source is required. Omit presentationId to select the presentation most recently opened in SlideX.",
      inputSchema: {
        includeSource: z.boolean().default(false),
        presentationId: presentationIdSchema
      }
    },
    ({ includeSource, presentationId }) =>
      runAsyncMcpTool(async () => {
        const presentation = includeSource
          ? await store.getPresentation(presentationId)
          : await store.getPresentationSummary(presentationId);
        return {
          autoSelected: presentationId === undefined,
          presentation
        };
      }, (result) => ({
        autoSelected: result.autoSelected,
        presentation: "source" in result.presentation
          ? presentationSummary(result.presentation)
          : result.presentation
      }))
  );

  server.registerTool(
    "slidex_get_canvas_nodes",
    {
      title: "Get SlideX Canvas Nodes",
      description:
        "Read stable canvas node IDs, types, text previews, and precise percent and 1024x576 pixel frames. Omit presentationId to use the most recently opened presentation.",
      inputSchema: {
        presentationId: presentationIdSchema,
        slideIndex: slideIndexSchema.optional()
      }
    },
    ({ presentationId, slideIndex }) =>
      readWithPresentation(store, presentationId, (presentation) =>
        getMotionDocCanvasNodes(presentation.source, slideIndex)
      )
  );

  server.registerTool(
    "slidex_list_block_types",
    {
      title: "List Presentation Block Types",
      description:
        "List the public block types for the selected presentation. Automatically uses the most recently opened presentation when presentationId is omitted.",
      inputSchema: { presentationId: presentationIdSchema }
    },
    ({ presentationId }) =>
      readCatalog(store, presentationId, () => ({ blockTypes: motionDocAddBlockTypes }))
  );

  server.registerTool(
    "slidex_get_motion_doc_schema",
    {
      title: "Get Presentation MotionDoc Schema",
      description:
        "Return the current MotionDoc schema. Automatically uses the most recently opened presentation when presentationId is omitted.",
      inputSchema: { presentationId: presentationIdSchema }
    },
    ({ presentationId }) => readCatalog(store, presentationId, getMotionDocMcpSchema)
  );

  server.registerTool(
    "slidex_list_shaders",
    {
      title: "List Presentation Shaders",
      description:
        "List the shader catalog. Automatically uses the most recently opened presentation when presentationId is omitted.",
      inputSchema: { presentationId: presentationIdSchema }
    },
    ({ presentationId }) => readCatalog(store, presentationId, listMcpShaders)
  );

  server.registerTool(
    "slidex_get_shader",
    {
      title: "Get Presentation Shader",
      description:
        "Inspect one shader before applying it. Automatically uses the most recently opened presentation when presentationId is omitted.",
      inputSchema: {
        presentationId: presentationIdSchema,
        shaderId: z.string()
      }
    },
    ({ presentationId, shaderId }) =>
      readCatalog(store, presentationId, () => getMcpShader(shaderId))
  );

  server.registerTool(
    "slidex_list_slide_layouts",
    {
      title: "List Presentation Slide Layouts",
      description:
        "List current slide layouts. Automatically uses the most recently opened presentation when presentationId is omitted.",
      inputSchema: {
        includeSource: z.boolean().default(false),
        presentationId: presentationIdSchema
      }
    },
    ({ includeSource, presentationId }) =>
      readCatalog(store, presentationId, () => listLayouts(includeSource))
  );

  server.registerTool(
    "slidex_get_slide_layout",
    {
      title: "Get Presentation Slide Layout",
      description:
        "Inspect one slide layout before applying it. Automatically uses the most recently opened presentation when presentationId is omitted.",
      inputSchema: {
        includeSource: z.boolean().default(true),
        layoutId: z.string(),
        presentationId: presentationIdSchema
      }
    },
    ({ includeSource, layoutId, presentationId }) =>
      readCatalog(store, presentationId, () =>
        formatLayout(getLayout(layoutId), includeSource)
      )
  );
}

function readCatalog<T>(
  store: McpPresentationStore,
  presentationId: string | undefined,
  read: () => T
) {
  return readWithPresentationSummary(store, presentationId, () => read());
}
