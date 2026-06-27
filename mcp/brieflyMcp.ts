import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod/v4";

import {
  SECTION_TYPES,
  type ProjectBrief,
  type SectionType
} from "@/features/briefly/domain/briefTypes";
import {
  addBrieflySection,
  createBrieflyBrief,
  exportBrieflyBrief,
  getBrieflyBuilderSchema,
  listBrieflyBuilderBlocks,
  parseBrieflyBrief,
  updateBrieflySection
} from "@/features/briefly/application/briefBuilderEngine";
import { exportBrieflyPdf } from "@/features/briefly/infrastructure/pdfExport";
import {
  BRIEFLY_RUBRIC_IDS,
  buildBrieflyReviewPrompt,
  extractBrieflyStructure,
  getBrieflyRubric,
  listBrieflyRubrics,
  prepareBrieflyAsset,
  sanitizeToMarkdown,
  type BrieflyContentType,
  type BrieflyRubricId
} from "@/core/briefly/application/brieflyEngine";

const contentTypeSchema = z.enum(["auto", "html", "markdown", "text"]);
const rubricIdSchema = z.enum(BRIEFLY_RUBRIC_IDS);
const sectionTypeSchema = z.enum(SECTION_TYPES);
const projectBriefSchema = z.object({}).passthrough().describe("A Briefly ProjectBrief JSON object.");
const sectionDataSchema = z
  .record(z.string(), z.unknown())
  .describe("Section data fields keyed by Briefly field name.");
const localeSchema = z.enum(["en", "zh-TW"]).default("en");

const reviewSourceSchema = {
  content: z.string().optional().describe("Pasted markdown, plain text, or HTML to review."),
  contentType: contentTypeSchema.default("auto"),
  maxCharacters: z.number().int().positive().max(120_000).optional(),
  url: z.string().url().optional().describe("HTTP or HTTPS URL to fetch and review.")
};

const builderSectionInputSchema = z.object({
  data: sectionDataSchema.optional(),
  enabled: z.boolean().optional(),
  title: z.string().optional(),
  type: sectionTypeSchema
});

export function registerBrieflyMcp(server: McpServer) {
  registerBrieflyResources(server);
  registerBrieflyPrompts(server);
  registerBrieflyTools(server);
}

function registerBrieflyResources(server: McpServer) {
  server.registerResource(
    "briefly-rubric-index",
    "briefly://rubrics",
    {
      description: "Briefly review rubric index.",
      mimeType: "application/json",
      title: "Briefly Review Rubrics"
    },
    (uri) => ({
      contents: [
        {
          mimeType: "application/json",
          text: toJson({ rubrics: listBrieflyRubrics() }),
          uri: uri.href
        }
      ]
    })
  );

  server.registerResource(
    "briefly-rubric",
    new ResourceTemplate("briefly://rubrics/{rubricId}", {
      complete: {
        rubricId: (value) =>
          BRIEFLY_RUBRIC_IDS.filter((rubricId) => rubricId.startsWith(value))
      },
      list: () => ({
        resources: listBrieflyRubrics().map((rubric) => ({
          description: rubric.description,
          mimeType: rubric.mimeType,
          name: rubric.id,
          title: rubric.title,
          uri: rubric.uri
        }))
      })
    }),
    {
      description: "Briefly review rubric by id.",
      mimeType: "text/markdown",
      title: "Briefly Review Rubric"
    },
    (uri, variables) => {
      const rubricId = normalizeTemplateVariable(variables.rubricId);
      const rubric = getBrieflyRubric(validateRubricId(rubricId));

      return {
        contents: [
          {
            mimeType: rubric.mimeType,
            text: rubric.text,
            uri: uri.href
          }
        ]
      };
    }
  );

  server.registerResource(
    "briefly-builder-blocks",
    "briefly://builder/blocks",
    {
      description: "Briefly Builder section block definitions.",
      mimeType: "application/json",
      title: "Briefly Builder Blocks"
    },
    (uri) => ({
      contents: [
        {
          mimeType: "application/json",
          text: toJson(listBrieflyBuilderBlocks()),
          uri: uri.href
        }
      ]
    })
  );

  server.registerResource(
    "briefly-builder-schema",
    "briefly://builder/schema",
    {
      description: "Briefly Builder JSON shape and tool map.",
      mimeType: "application/json",
      title: "Briefly Builder Schema"
    },
    (uri) => ({
      contents: [
        {
          mimeType: "application/json",
          text: toJson(getBrieflyBuilderSchema()),
          uri: uri.href
        }
      ]
    })
  );
}

function registerBrieflyPrompts(server: McpServer) {
  server.registerPrompt(
    "briefly_reviewer",
    {
      argsSchema: {
        audience: z.string().optional(),
        objective: z.string().optional(),
        profile: rubricIdSchema.default("document-clarity")
      },
      description: "Guide an assistant to review a URL or pasted content with Briefly rubrics.",
      title: "Review With Briefly"
    },
    ({ audience, objective, profile }) => ({
      description: "Review an asset using a Briefly rubric.",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Use the Briefly MCP tool briefly_review_asset with profile "${profile}".`,
              objective ? `Review objective: ${objective}.` : undefined,
              audience ? `Target audience: ${audience}.` : undefined,
              "Ask me for the URL or content if I have not provided it yet.",
              "After the tool returns the review prompt, produce the Markdown report from that prompt."
            ]
              .filter(Boolean)
              .join("\n")
          }
        }
      ]
    })
  );

  server.registerPrompt(
    "briefly_builder",
    {
      argsSchema: {
        projectName: z.string(),
        oneLiner: z.string().optional()
      },
      description: "Guide an assistant to create a structured Briefly Builder project brief.",
      title: "Build A Briefly Project Brief"
    },
    ({ oneLiner, projectName }) => ({
      description: "Create a Briefly Builder document.",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Create a Briefly project brief for: ${projectName}.`,
              oneLiner ? `One-liner: ${oneLiner}.` : undefined,
              "Use briefly_create_brief first, then fill sections with briefly_update_section.",
              "Return the final Briefly MDX and a short summary of missing information."
            ]
              .filter(Boolean)
              .join("\n")
          }
        }
      ]
    })
  );
}

function registerBrieflyTools(server: McpServer) {
  server.registerTool(
    "briefly_list_rubrics",
    {
      title: "List Briefly Rubrics",
      description: "List review profiles available for Briefly review tools."
    },
    () => runTool(() => ({ rubrics: listBrieflyRubrics() }))
  );

  server.registerTool(
    "briefly_get_rubric",
    {
      title: "Get Briefly Rubric",
      description: "Return one Briefly review rubric in Markdown.",
      inputSchema: {
        rubricId: rubricIdSchema
      }
    },
    ({ rubricId }) => runTool(() => getBrieflyRubric(rubricId))
  );

  server.registerTool(
    "briefly_extract_structure",
    {
      title: "Extract Briefly Structure",
      description: "Fetch or clean content and return headings, links, CTAs, questions, and stats.",
      inputSchema: reviewSourceSchema
    },
    ({ content, contentType, maxCharacters, url }) =>
      runTool(async () => {
        if (url) {
          return prepareBrieflyAsset({ content, contentType, maxCharacters, url });
        }

        const safeContentType = (contentType ?? "auto") as BrieflyContentType;
        const type = safeContentType === "auto" ? "markdown" : safeContentType;
        const markdown = sanitizeToMarkdown(content ?? "", type);

        return {
          contentType: type,
          markdown,
          structure: extractBrieflyStructure(markdown)
        };
      })
  );

  server.registerTool(
    "briefly_review_asset",
    {
      title: "Review Briefly Asset",
      description:
        "Fetch or clean an asset, load a Briefly rubric, and return a review-ready prompt for the host AI.",
      inputSchema: {
        ...reviewSourceSchema,
        audience: z.string().optional(),
        notes: z.string().optional(),
        objective: z.string().optional(),
        profile: rubricIdSchema.default("document-clarity")
      }
    },
    ({ audience, content, contentType, maxCharacters, notes, objective, profile, url }) =>
      runTool(() =>
        buildBrieflyReviewPrompt({
          audience,
          content,
          contentType,
          maxCharacters,
          notes,
          objective,
          profile,
          url
        })
      )
  );

  server.registerTool(
    "briefly_list_builder_blocks",
    {
      title: "List Briefly Builder Blocks",
      description: "List Briefly Builder section types and block definitions."
    },
    () => runTool(() => listBrieflyBuilderBlocks())
  );

  server.registerTool(
    "briefly_create_brief",
    {
      title: "Create Briefly Brief",
      description: "Create a structured Briefly ProjectBrief JSON object and MDX source.",
      inputSchema: {
        category: z.string().optional(),
        documentName: z.string().optional(),
        includeCoreSections: z.boolean().default(true),
        oneLiner: z.string().optional(),
        owner: z.string().optional(),
        projectName: z.string().optional(),
        sections: z.array(builderSectionInputSchema).optional(),
        stage: z.string().optional(),
        status: z.string().optional(),
        title: z.string().optional()
      }
    },
    (args) => runTool(() => createBrieflyBrief(args))
  );

  server.registerTool(
    "briefly_parse_brief",
    {
      title: "Parse Briefly Brief",
      description: "Parse Briefly MDX into ProjectBrief JSON and normalized MDX.",
      inputSchema: {
        currentBrief: projectBriefSchema.optional(),
        mdx: z.string().describe("Briefly MDX source.")
      }
    },
    ({ currentBrief, mdx }) =>
      runTool(() => parseBrieflyBrief(mdx, currentBrief as unknown as ProjectBrief | undefined))
  );

  server.registerTool(
    "briefly_add_section",
    {
      title: "Add Briefly Section",
      description: "Add or enable a Briefly section, merge data, and return updated JSON and MDX.",
      inputSchema: {
        brief: projectBriefSchema,
        data: sectionDataSchema.optional(),
        enabled: z.boolean().optional(),
        title: z.string().optional(),
        type: sectionTypeSchema
      }
    },
    ({ brief, data, enabled, title, type }) =>
      runTool(() =>
        addBrieflySection({
          brief: brief as unknown as ProjectBrief,
          data,
          enabled,
          title,
          type: type as SectionType
        })
      )
  );

  server.registerTool(
    "briefly_update_section",
    {
      title: "Update Briefly Section",
      description: "Merge data into an existing Briefly section and return updated JSON and MDX.",
      inputSchema: {
        brief: projectBriefSchema,
        data: sectionDataSchema.optional(),
        enabled: z.boolean().optional(),
        title: z.string().optional(),
        type: sectionTypeSchema
      }
    },
    ({ brief, data, enabled, title, type }) =>
      runTool(() =>
        updateBrieflySection({
          brief: brief as unknown as ProjectBrief,
          data,
          enabled,
          title,
          type: type as SectionType
        })
      )
  );

  server.registerTool(
    "briefly_export_brief",
    {
      title: "Export Briefly Brief",
      description: "Export a Briefly ProjectBrief to MDX, HTML, or JSON.",
      inputSchema: {
        brief: projectBriefSchema,
        format: z.enum(["html", "json", "mdx"]).default("mdx"),
        locale: localeSchema
      }
    },
    ({ brief, format, locale }) =>
      runTool(() =>
        exportBrieflyBrief({
          brief: brief as unknown as ProjectBrief,
          format,
          locale
        })
      )
  );

  server.registerTool(
    "briefly_export_pdf",
    {
      title: "Export Briefly PDF",
      description: "Render a Briefly ProjectBrief to HTML and generate a local PDF with Chrome headless.",
      inputSchema: {
        brief: projectBriefSchema,
        chromePath: z.string().optional().describe("Optional Chrome or Chromium executable path."),
        includeBrowserHeaderFooter: z.boolean().default(false),
        locale: localeSchema,
        outputPath: z
          .string()
          .optional()
          .describe("Optional local PDF output path. Defaults to tmp/briefly-mcp-exports/<brief-name>.pdf.")
      }
    },
    ({ brief, chromePath, includeBrowserHeaderFooter, locale, outputPath }) =>
      runTool(async () => {
        const htmlExport = exportBrieflyBrief({
          brief: brief as unknown as ProjectBrief,
          format: "html",
          locale
        });
        const basename = htmlExport.filename.replace(/\.html$/i, "");
        const pdf = await exportBrieflyPdf({
          basename,
          chromePath,
          html: htmlExport.content,
          includeBrowserHeaderFooter,
          outputPath
        });

        return {
          ...pdf,
          summary: htmlExport.summary
        };
      })
  );
}

async function runTool<T>(callback: () => Promise<T> | T): Promise<CallToolResult> {
  try {
    return jsonResult(await callback());
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : String(error)
        }
      ],
      isError: true
    };
  }
}

function jsonResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: toJson(data)
      }
    ],
    structuredContent: {
      result: data
    }
  };
}

function toJson(data: unknown) {
  return JSON.stringify(data, null, 2);
}

function normalizeTemplateVariable(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function validateRubricId(value: string | undefined): BrieflyRubricId {
  const rubricId = value as BrieflyRubricId | undefined;

  if (!rubricId || !BRIEFLY_RUBRIC_IDS.includes(rubricId)) {
    throw new Error(`Unknown rubricId: ${value ?? "(missing)"}.`);
  }

  return rubricId;
}
