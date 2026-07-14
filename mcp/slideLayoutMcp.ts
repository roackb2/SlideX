import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import {
  addMotionDocSlideFromLayout,
  createMotionDocSlideFromLayout,
  replaceMotionDocSlideWithLayout
} from "@/core/motion-doc/application/motionDocLayoutAutomation";
import { summarizeMotionDoc } from "@/core/motion-doc/application/motionDocAutomation";
import { slideLayouts } from "@/core/motion-doc/presets/templates/slideLayouts";
import { jsonMcpResult, runMcpTool, toJson } from "@/mcp/mcpResults";

type SlideLayout = (typeof slideLayouts)[number];

const publicSlideLayouts = slideLayouts.filter((layout) => layout.id !== "blank");

const layoutSlideOptionsSchema = {
  accent: z.string().optional(),
  background: z.string().optional(),
  duration: z.number().positive().optional(),
  replacements: z
    .record(z.string(), z.string())
    .optional()
    .describe("Exact text replacements applied to the layout before parsing."),
  textColor: z.string().optional(),
  theme: z.enum(["dark", "light"]).optional()
};

export function registerSlideLayoutMcp(server: McpServer) {
  registerSlideLayoutResources(server);
  registerSlideLayoutTools(server);
}

function registerSlideLayoutResources(server: McpServer) {
  server.registerResource(
    "slidex-slide-layout-index",
    "slidex://slide-layouts",
    {
      description: "Slide layouts currently available in the SlideX Pitch layout picker.",
      mimeType: "application/json",
      title: "SlideX Slide Layouts"
    },
    (uri) => ({
      contents: [
        {
          mimeType: "application/json",
          text: toJson(listSlideLayoutSummaries(false)),
          uri: uri.href
        }
      ]
    })
  );

  server.registerResource(
    "slidex-slide-layout-source",
    new ResourceTemplate("slidex://slide-layouts/{layoutId}", {
      complete: {
        layoutId: (value) =>
          publicSlideLayouts
            .map((layout) => layout.id)
            .filter((layoutId) => layoutId.startsWith(value))
      },
      list: () => ({
        resources: publicSlideLayouts.map((layout) => ({
          description: `Slide layout preset: ${layout.name}.`,
          mimeType: "text/markdown",
          name: layout.id,
          title: layout.name,
          uri: `slidex://slide-layouts/${layout.id}`
        }))
      })
    }),
    {
      description: "Current SlideX slide layout source by id.",
      mimeType: "text/markdown",
      title: "SlideX Slide Layout Source"
    },
    (uri, variables) => {
      const layoutId = Array.isArray(variables.layoutId)
        ? variables.layoutId[0]
        : variables.layoutId;
      const layout = getSlideLayoutOrThrow(layoutId);

      return {
        contents: [
          {
            mimeType: "text/markdown",
            text: layout.source,
            uri: uri.href
          }
        ]
      };
    }
  );
}

function registerSlideLayoutTools(server: McpServer) {
  server.registerTool(
    "slidex_list_slide_layouts",
    {
      title: "List Current Slide Layouts",
      description: "List the slide layouts exposed by the current SlideX Pitch layout picker.",
      inputSchema: {
        includeSource: z.boolean().default(false)
      }
    },
    ({ includeSource }) => jsonMcpResult(listSlideLayoutSummaries(includeSource))
  );

  server.registerTool(
    "slidex_get_slide_layout",
    {
      title: "Get Slide Layout",
      description: "Return one current slide layout preset and its MDX block source.",
      inputSchema: {
        includeSource: z.boolean().default(true),
        layoutId: z.string().describe("Layout id from slidex_list_slide_layouts.")
      }
    },
    ({ includeSource, layoutId }) =>
      runMcpTool(() => formatSlideLayout(getSlideLayoutOrThrow(layoutId), includeSource))
  );

  server.registerTool(
    "slidex_create_slide_from_layout",
    {
      title: "Create Slide From Layout",
      description: "Create a complete current-format <Slide> block from a layout.",
      inputSchema: {
        layoutId: z.string().describe("Layout id from slidex_list_slide_layouts."),
        ...layoutSlideOptionsSchema
      }
    },
    ({ layoutId, ...options }) =>
      runMcpTool(() => {
        const layout = getSlideLayoutOrThrow(layoutId);
        const slideSource = createMotionDocSlideFromLayout(layout.source, {
          ...options,
          layoutId
        });

        return {
          layout: formatSlideLayout(layout, false),
          slideSource,
          summary: summarizeMotionDoc(`# Layout Preview\n\n${slideSource}`)
        };
      })
  );

  server.registerTool(
    "slidex_add_slide_from_layout",
    {
      title: "Add Slide From Layout",
      description: "Append or insert a slide while inheriting the reference slide appearance.",
      inputSchema: {
        afterSlideIndex: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("Insert after this slide index. Omit to append."),
        layoutId: z.string().describe("Layout id from slidex_list_slide_layouts."),
        source: z.string().describe("Existing SlideX MotionDoc source."),
        ...layoutSlideOptionsSchema
      }
    },
    ({ afterSlideIndex, layoutId, source, ...options }) =>
      runMcpTool(() => {
        const layout = getSlideLayoutOrThrow(layoutId);
        const nextSource = addMotionDocSlideFromLayout(
          source,
          layout.source,
          afterSlideIndex,
          { ...options, layoutId }
        );

        return {
          layout: formatSlideLayout(layout, false),
          source: nextSource,
          summary: summarizeMotionDoc(nextSource)
        };
      })
  );

  server.registerTool(
    "slidex_replace_slide_with_layout",
    {
      title: "Replace Slide With Layout",
      description: "Replace a slide's blocks while preserving its current appearance props.",
      inputSchema: {
        layoutId: z.string().describe("Layout id from slidex_list_slide_layouts."),
        slideIndex: z.number().int().min(0),
        source: z.string().describe("Existing SlideX MotionDoc source."),
        ...layoutSlideOptionsSchema
      }
    },
    ({ layoutId, slideIndex, source, ...options }) =>
      runMcpTool(() => {
        const layout = getSlideLayoutOrThrow(layoutId);
        const nextSource = replaceMotionDocSlideWithLayout(
          source,
          slideIndex,
          layout.source,
          { ...options, layoutId }
        );

        return {
          layout: formatSlideLayout(layout, false),
          source: nextSource,
          summary: summarizeMotionDoc(nextSource)
        };
      })
  );
}

function listSlideLayoutSummaries(includeSource: boolean) {
  return {
    count: publicSlideLayouts.length,
    layouts: publicSlideLayouts.map((layout) => formatSlideLayout(layout, includeSource))
  };
}

function formatSlideLayout(layout: SlideLayout, includeSource: boolean) {
  return {
    id: layout.id,
    name: layout.name,
    source: includeSource ? layout.source : undefined
  };
}

function getSlideLayoutOrThrow(layoutId: string | undefined) {
  const layout = publicSlideLayouts.find((item) => item.id === layoutId);

  if (!layout) {
    throw new Error(
      `Unknown layoutId: ${layoutId ?? "(missing)"}. Available layouts: ${publicSlideLayouts
        .map((item) => item.id)
        .join(", ")}.`
    );
  }

  return layout;
}
