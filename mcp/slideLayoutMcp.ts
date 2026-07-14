import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import { summarizeMotionDoc } from "@/core/motion-doc/application/motionDocAutomation";
import { replaceMotionDocSlideSource } from "@/core/motion-doc/application/motionDocSourceEditor";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import { slideLayouts } from "@/core/motion-doc/presets/templates/slideLayouts";

type SlideLayout = (typeof slideLayouts)[number];

type LayoutSlideOptions = {
  accent?: string;
  background?: string;
  duration?: number;
  replacements?: Record<string, string>;
  textColor?: string;
  theme?: "dark" | "light";
};

const publicSlideLayouts = slideLayouts.filter((layout) => layout.id !== "blank");

const layoutSlideOptionsSchema = {
  accent: z.string().optional(),
  background: z.string().optional(),
  duration: z.number().positive().optional(),
  replacements: z
    .record(z.string(), z.string())
    .optional()
    .describe("Optional exact text replacements applied to the layout source."),
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
      description: "Built-in SlideX slide layout presets.",
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
      description: "Built-in SlideX slide layout source by id.",
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
      title: "List Slide Layouts",
      description: "List the built-in slide layout presets available to create or insert slides.",
      inputSchema: {
        includeSource: z.boolean().default(false)
      }
    },
    ({ includeSource }) => jsonResult(listSlideLayoutSummaries(includeSource))
  );

  server.registerTool(
    "slidex_get_slide_layout",
    {
      title: "Get Slide Layout",
      description: "Return one built-in slide layout preset and its MDX block source.",
      inputSchema: {
        includeSource: z.boolean().default(true),
        layoutId: z.string().describe("Layout id from slidex_list_slide_layouts.")
      }
    },
    ({ includeSource, layoutId }) =>
      runTool(() => formatSlideLayout(getSlideLayoutOrThrow(layoutId), includeSource))
  );

  server.registerTool(
    "slidex_create_slide_from_layout",
    {
      title: "Create Slide From Layout",
      description: "Create a complete <Slide>...</Slide> source block from a built-in layout.",
      inputSchema: {
        layoutId: z.string().describe("Layout id from slidex_list_slide_layouts."),
        ...layoutSlideOptionsSchema
      }
    },
    ({ layoutId, ...options }) =>
      runTool(() => {
        const layout = getSlideLayoutOrThrow(layoutId);
        const slideSource = createSlideSourceFromLayout(layout, undefined, options);

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
      description: "Append or insert a new slide generated from a built-in layout.",
      inputSchema: {
        afterSlideIndex: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("Insert after this slide index. Omit to append at the end."),
        layoutId: z.string().describe("Layout id from slidex_list_slide_layouts."),
        source: z.string().describe("Existing SlideX MotionDoc MDX source."),
        ...layoutSlideOptionsSchema
      }
    },
    ({ afterSlideIndex, layoutId, source, ...options }) =>
      runTool(() => {
        const layout = getSlideLayoutOrThrow(layoutId);
        const nextSource = addSlideFromLayout(source, layout, afterSlideIndex, options);

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
      description: "Replace one slide with a new slide generated from a built-in layout.",
      inputSchema: {
        layoutId: z.string().describe("Layout id from slidex_list_slide_layouts."),
        slideIndex: z.number().int().min(0),
        source: z.string().describe("Existing SlideX MotionDoc MDX source."),
        ...layoutSlideOptionsSchema
      }
    },
    ({ layoutId, slideIndex, source, ...options }) =>
      runTool(() => {
        const layout = getSlideLayoutOrThrow(layoutId);
        const document = parseMotionDoc(source);
        const referenceSlide = getSlideOrThrow(document.scenes, slideIndex);
        const slideSource = createSlideSourceFromLayout(layout, referenceSlide, options, {
          preserveReferenceDuration: true
        });
        const nextSource = replaceMotionDocSlideSource(source, slideIndex, slideSource);

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

function addSlideFromLayout(
  source: string,
  layout: SlideLayout,
  afterSlideIndex: number | undefined,
  options: LayoutSlideOptions
) {
  const document = parseMotionDoc(source);
  const referenceIndex = afterSlideIndex ?? document.scenes.length - 1;
  const referenceSlide = document.scenes[referenceIndex];
  const slideSource = createSlideSourceFromLayout(layout, referenceSlide, options);
  const normalizedSource = source.trim() || "# Untitled Deck";

  if (afterSlideIndex === undefined) {
    return `${normalizedSource.trimEnd()}\n\n${slideSource}`;
  }

  if (!referenceSlide) {
    throw new Error(`afterSlideIndex ${afterSlideIndex} is outside the slide range.`);
  }

  const pattern = /<(Slide|Scene)\b[^>]*>[\s\S]*?<\/\1>/g;
  let currentIndex = 0;

  for (const match of normalizedSource.matchAll(pattern)) {
    if (currentIndex === afterSlideIndex && match.index !== undefined) {
      const insertAt = match.index + match[0].length;
      return `${normalizedSource.slice(0, insertAt)}\n\n${slideSource}${normalizedSource.slice(insertAt)}`;
    }

    currentIndex += 1;
  }

  throw new Error(`afterSlideIndex ${afterSlideIndex} is outside the slide range.`);
}

function createSlideSourceFromLayout(
  layout: SlideLayout,
  referenceSlide: MotionDocScene | undefined,
  options: LayoutSlideOptions,
  behavior: { preserveReferenceDuration?: boolean } = {}
) {
  const slideProps = buildSlideProps(referenceSlide, options, behavior);
  const layoutSource = applyLayoutReplacements(layout.source, options.replacements);

  return `${formatSlideTag(slideProps)}\n${indentLayoutSource(layoutSource)}\n</Slide>`;
}

function buildSlideProps(
  referenceSlide: MotionDocScene | undefined,
  options: LayoutSlideOptions,
  behavior: { preserveReferenceDuration?: boolean }
) {
  const referenceProps = referenceSlide?.props ?? {};
  const duration =
    options.duration ??
    (behavior.preserveReferenceDuration ? numberProp(referenceProps.duration) ?? referenceSlide?.duration : undefined) ??
    5;
  const theme = options.theme ?? stringProp(referenceProps.theme) ?? "dark";
  const background =
    options.background ??
    stringProp(referenceProps.background) ??
    (theme === "light" ? "#f7f7f2" : "#050505");
  const accent =
    options.accent ??
    stringProp(referenceProps.accent) ??
    (theme === "light" ? "#111111" : "#ffffff");
  const textColor = options.textColor ?? stringProp(referenceProps.textColor);

  return {
    accent,
    background,
    duration,
    ...(textColor ? { textColor } : {}),
    theme
  } satisfies Record<string, string | number>;
}

function getSlideOrThrow(slides: MotionDocScene[], slideIndex: number) {
  const slide = slides[slideIndex];

  if (!slide) {
    throw new Error(`slideIndex ${slideIndex} is outside the slide range.`);
  }

  return slide;
}

function applyLayoutReplacements(source: string, replacements: Record<string, string> | undefined) {
  if (!replacements) return source;

  return Object.entries(replacements).reduce((currentSource, [from, to]) => {
    if (!from) return currentSource;
    return currentSource.split(from).join(safeMdxText(to));
  }, source);
}

function indentLayoutSource(source: string) {
  if (!source.trim()) return "";

  return source
    .split("\n")
    .map((line) => (line.trim() ? `  ${line}` : line))
    .join("\n");
}

function formatSlideTag(props: Record<string, string | number>) {
  const duration = numberProp(props.duration) ?? 5;
  const entries = Object.entries(props).filter(([key]) => key !== "duration");
  const attrs = entries
    .map(([key, value]) =>
      typeof value === "number"
        ? `${key}={${value}}`
        : `${key}="${safeMdxAttribute(value)}"`
    )
    .join(" ");

  return `<Slide duration={${duration}}${attrs ? ` ${attrs}` : ""}>`;
}

function stringProp(value: string | number | undefined) {
  return typeof value === "string" && value ? value : undefined;
}

function numberProp(value: string | number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeMdxText(value: string) {
  return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function safeMdxAttribute(value: string) {
  return safeMdxText(value).replace(/"/g, "&quot;");
}

function runTool<T>(callback: () => T) {
  try {
    return jsonResult(callback());
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: error instanceof Error ? error.message : String(error)
        }
      ],
      isError: true
    };
  }
}

function jsonResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: toJson(data)
      }
    ],
    structuredContent: {
      result: data
    }
  };
}

function toJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}
