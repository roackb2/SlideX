import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod/v4";

import {
  addMotionDocBlock,
  deleteMotionDocBlock,
  duplicateMotionDocBlock,
  motionDocAddBlockTypes,
  reorderMotionDocBlock,
  summarizeMotionDoc,
  updateMotionDocBlock
} from "@/core/motion-doc/application/motionDocAutomation";
import {
  addMotionDocSlideFromLayout,
  replaceMotionDocSlideWithLayout
} from "@/core/motion-doc/application/motionDocLayoutAutomation";
import { slideLayouts } from "@/core/motion-doc/presets/templates/slideLayouts";
import { getMotionDocMcpSchema, motionDocBlockUpdateSchema, motionDocFrameSchema, motionDocPropsSchema } from "@/mcp/motionDocMcpSchema";
import { jsonMcpResult } from "@/mcp/mcpResults";
import type { McpPresentationStore } from "@/mcp/presentationStore";
import { applyMcpShaderPreset, getMcpShader, listMcpShaders } from "@/mcp/shaderMcp";

type RemotePresentationMcpOptions = {
  enableWrites: boolean;
  presentationStore: McpPresentationStore;
};

const presentationIdSchema = z.string().uuid();
const expectedRevisionSchema = z.number().int().min(0);
const slideIndexSchema = z.number().int().min(0);
const blockIndexSchema = z.number().int().min(0);
const publicSlideLayouts = slideLayouts.filter((layout) => layout.id !== "blank");
const layoutOptionsSchema = {
  accent: z.string().optional(),
  background: z.string().optional(),
  duration: z.number().positive().optional(),
  replacements: z.record(z.string(), z.string()).optional(),
  textColor: z.string().optional(),
  theme: z.enum(["dark", "light"]).optional()
};

export function registerRemotePresentationMcp(
  server: McpServer,
  { enableWrites, presentationStore }: RemotePresentationMcpOptions
) {
  registerRemoteReadTools(server, presentationStore);

  if (enableWrites) {
    registerRemoteWriteTools(server, presentationStore);
  }
}

function registerRemoteReadTools(server: McpServer, store: McpPresentationStore) {
  server.registerTool(
    "slidex_get_presentation",
    {
      title: "Get SlideX Presentation",
      description: "Read one authenticated SlideX presentation and its current source revision.",
      inputSchema: { presentationId: presentationIdSchema }
    },
    ({ presentationId }) => runAsyncMcpTool(() => store.getPresentation(presentationId))
  );

  server.registerTool(
    "slidex_list_block_types",
    {
      title: "List Presentation Block Types",
      description: "List the public block types available for an accessible presentation.",
      inputSchema: { presentationId: presentationIdSchema }
    },
    ({ presentationId }) =>
      readCatalog(store, presentationId, () => ({ blockTypes: motionDocAddBlockTypes }))
  );

  server.registerTool(
    "slidex_get_motion_doc_schema",
    {
      title: "Get Presentation MotionDoc Schema",
      description: "Return the current MotionDoc schema for an accessible presentation.",
      inputSchema: { presentationId: presentationIdSchema }
    },
    ({ presentationId }) => readCatalog(store, presentationId, getMotionDocMcpSchema)
  );

  server.registerTool(
    "slidex_list_shaders",
    {
      title: "List Presentation Shaders",
      description: "List the current shader catalog for an accessible presentation.",
      inputSchema: { presentationId: presentationIdSchema }
    },
    ({ presentationId }) => readCatalog(store, presentationId, listMcpShaders)
  );

  server.registerTool(
    "slidex_get_shader",
    {
      title: "Get Presentation Shader",
      description: "Inspect one shader before applying it to an accessible presentation.",
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
      description: "List current slide layouts for an accessible presentation.",
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
      description: "Inspect one slide layout before applying it to an accessible presentation.",
      inputSchema: {
        includeSource: z.boolean().default(true),
        layoutId: z.string(),
        presentationId: presentationIdSchema
      }
    },
    ({ includeSource, layoutId, presentationId }) =>
      readCatalog(store, presentationId, () => formatLayout(getLayout(layoutId), includeSource))
  );
}

function registerRemoteWriteTools(server: McpServer, store: McpPresentationStore) {
  server.registerTool(
    "slidex_save_presentation",
    {
      title: "Save SlideX Presentation",
      description: "Save a complete MotionDoc source only when it still matches expectedRevision.",
      inputSchema: {
        expectedRevision: expectedRevisionSchema,
        presentationId: presentationIdSchema,
        source: z.string()
      }
    },
    ({ expectedRevision, presentationId, source }) =>
      runAsyncMcpTool(async () => {
        assertValidSource(source);
        return store.savePresentation({ expectedRevision, presentationId, source });
      })
  );

  server.registerTool(
    "slidex_add_block",
    {
      title: "Add Presentation Block",
      description: "Add a public block and revision-safely save the presentation.",
      inputSchema: {
        afterBlockIndex: blockIndexSchema.optional(),
        expectedRevision: expectedRevisionSchema,
        position: motionDocFrameSchema.optional(),
        presentationId: presentationIdSchema,
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
      description: "Update a block and revision-safely save the presentation.",
      inputSchema: {
        blockIndex: blockIndexSchema,
        expectedRevision: expectedRevisionSchema,
        ...motionDocBlockUpdateSchema.shape,
        presentationId: presentationIdSchema,
        slideIndex: slideIndexSchema
      }
    },
    ({ blockIndex, expectedRevision, presentationId, props, slideIndex, text }) =>
      mutatePresentation(store, presentationId, expectedRevision, (source) =>
        updateMotionDocBlock(source, slideIndex, blockIndex, { props, text })
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
        presentationId: presentationIdSchema,
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
        presentationId: presentationIdSchema,
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
        presentationId: presentationIdSchema,
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
        presentationId: presentationIdSchema,
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
        presentationId: presentationIdSchema,
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
        presentationId: presentationIdSchema,
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

async function mutatePresentation(
  store: McpPresentationStore,
  presentationId: string,
  expectedRevision: number,
  mutate: (source: string) => { source: string; [key: string]: unknown }
) {
  return runAsyncMcpTool(async () => {
    const current = await store.getPresentation(presentationId);
    if (current.sourceRevision !== expectedRevision) {
      throw new Error("The presentation changed. Read it again before saving.");
    }

    const mutation = mutate(current.source);
    assertValidSource(mutation.source);
    const presentation = await store.savePresentation({
      expectedRevision,
      presentationId,
      source: mutation.source
    });

    const details: Record<string, unknown> = { ...mutation };
    delete details.source;
    delete details.summary;
    return { ...details, presentation };
  });
}

function readCatalog<T>(
  store: McpPresentationStore,
  presentationId: string,
  read: () => T
) {
  return runAsyncMcpTool(async () => {
    await store.getPresentation(presentationId);
    return read();
  });
}

function assertValidSource(source: string) {
  if (!summarizeMotionDoc(source).validation.isValid) {
    throw new Error("The MotionDoc source is invalid and was not saved.");
  }
}

function listLayouts(includeSource: boolean) {
  return {
    count: publicSlideLayouts.length,
    layouts: publicSlideLayouts.map((layout) => formatLayout(layout, includeSource))
  };
}

function getLayout(layoutId: string) {
  const layout = publicSlideLayouts.find((item) => item.id === layoutId);
  if (!layout) throw new Error(`Unknown layoutId: ${layoutId}.`);
  return layout;
}

function formatLayout(layout: (typeof publicSlideLayouts)[number], includeSource: boolean) {
  return {
    id: layout.id,
    name: layout.name,
    source: includeSource ? layout.source : undefined
  };
}

async function runAsyncMcpTool<T>(callback: () => Promise<T>): Promise<CallToolResult> {
  try {
    return jsonMcpResult(await callback());
  } catch (error) {
    return {
      content: [
        {
          text: error instanceof Error ? error.message : String(error),
          type: "text"
        }
      ],
      isError: true
    };
  }
}
