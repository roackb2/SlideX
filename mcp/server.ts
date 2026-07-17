import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod/v4";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  addMotionDocBlock,
  applyMotionDocTextReplacements,
  applyMotionDocTitle,
  createMotionDocFromOutline,
  deleteMotionDocBlock,
  deleteMotionDocSlide,
  duplicateMotionDocBlock,
  motionDocAddBlockTypes,
  reorderMotionDocSlide,
  reorderMotionDocBlock,
  replaceMotionDocSlide,
  summarizeMotionDoc,
  updateMotionDocBlock,
  updateMotionDocSlideProps
} from "@/core/motion-doc/application/motionDocAutomation";
import { buildMotionDocHtml } from "@/core/motion-doc/infrastructure/export/motionDocExport";
import { defaultMdx } from "@/core/motion-doc/presets/defaultMdx";
import { defaultTemplate, motionTemplates } from "@/core/motion-doc/presets/templates";
import type { MotionTemplate } from "@/core/motion-doc/presets/templates/templateTypes";
import {
  getMotionDocMcpSchema,
  motionDocBlockUpdateSchema,
  motionDocFrameSchema,
  motionDocPropsSchema
} from "./motionDocMcpSchema";
import { exportMotionDocPptx } from "./pptxExport";
import type { McpPresentationStore } from "./presentationStore";
import type { RemotePresentationImageUploadOptions } from "./remotePresentationImageUploadMcp";
import { registerRemotePresentationMcp } from "./remotePresentationMcp";
import { registerShaderMcp } from "./shaderMcp";
import { registerSlideLayoutMcp } from "./slideLayoutMcp";

export type SlideXMcpServerOptions = {
  enablePptxExport?: boolean;
  enablePresentationWrites?: boolean;
  enableWorkspaceSkills?: boolean;
  imageUploads?: RemotePresentationImageUploadOptions;
  profile?: "local" | "remote";
  presentationStore?: McpPresentationStore;
};

const textReplacementSchema = z.record(z.string(), z.string());
const slideIndexSchema = z.number().int().min(0);
const blockIndexSchema = z.number().int().min(0);

export function createSlideXMcpServer(options: SlideXMcpServerOptions = {}) {
  const server = new McpServer({
    name: "slidex-motion-doc",
    version: "0.4.0"
  });

  if (options.profile === "remote") {
    if (!options.presentationStore) {
      throw new Error("Remote MCP requires a presentation store.");
    }

    registerRemotePresentationMcp(server, {
      enableWrites: options.enablePresentationWrites !== false,
      imageUploads: options.imageUploads,
      presentationStore: options.presentationStore
    });
    return server;
  }

  registerResources(server);
  registerPrompts(server);
  registerTools(server, options);
  registerSlideLayoutMcp(server);
  registerShaderMcp(server);

  if (options.enableWorkspaceSkills) {
    registerWorkspaceSkills(server);
  }

  return server;
}

if (isDirectExecution()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  });
}

async function main() {
  const server = createSlideXMcpServer({ enableWorkspaceSkills: true });
  await server.connect(new StdioServerTransport());
  console.error("SlideX MCP server is running on stdio.");
}

function registerTools(server: McpServer, options: SlideXMcpServerOptions) {
  server.registerTool(
    "slidex_parse_motion_doc",
    {
      title: "Parse SlideX MotionDoc",
      description: "Parse SlideX MDX into slides, blocks, stats, and validation issues.",
      inputSchema: {
        source: z.string().describe("SlideX MotionDoc MDX source.")
      }
    },
    ({ source }) => runTool(() => summarizeMotionDoc(source))
  );

  server.registerTool(
    "slidex_validate_motion_doc",
    {
      title: "Validate SlideX MotionDoc",
      description: "Return validation status and issues for SlideX MDX.",
      inputSchema: {
        source: z.string().describe("SlideX MotionDoc MDX source.")
      }
    },
    ({ source }) => runTool(() => summarizeMotionDoc(source).validation)
  );

  server.registerTool(
    "slidex_list_templates",
    {
      title: "List SlideX Templates",
      description: "List bundled SlideX deck templates with categories and use cases.",
      inputSchema: {
        category: z.string().optional().describe("Optional category filter.")
      }
    },
    ({ category }) => runTool(() => listTemplateSummaries(category))
  );

  server.registerTool(
    "slidex_get_template",
    {
      title: "Get SlideX Template",
      description: "Return a bundled template by id, optionally including its MDX source.",
      inputSchema: {
        includeSource: z.boolean().default(true),
        templateId: z.string().optional().describe("Template id. Defaults to the first template.")
      }
    },
    ({ includeSource, templateId }) =>
      runTool(() => formatTemplate(getTemplateOrDefault(templateId), includeSource))
  );

  server.registerTool(
    "slidex_create_deck",
    {
      title: "Create SlideX Deck",
      description: "Create editable SlideX MDX from a structured outline.",
      inputSchema: {
        accent: z.string().optional(),
        background: z.string().optional(),
        slides: z
          .array(
            z.object({
              body: z.string().optional(),
              bullets: z.array(z.string()).optional(),
              title: z.string()
            })
          )
          .describe("Content slides after the generated cover slide."),
        subtitle: z.string().optional(),
        theme: z.enum(["dark", "light"]).optional(),
        title: z.string()
      }
    },
    (args) => runTool(() => createMotionDocFromOutline(args))
  );

  server.registerTool(
    "slidex_create_from_template",
    {
      title: "Create SlideX Deck From Template",
      description: "Clone a bundled template, then optionally rename it and replace exact text.",
      inputSchema: {
        replacements: textReplacementSchema.optional(),
        templateId: z.string().optional().describe("Template id. Defaults to the first template."),
        title: z.string().optional()
      }
    },
    ({ replacements, templateId, title }) =>
      runTool(() => {
        const template = getTemplateOrDefault(templateId);
        const titled = title
          ? applyMotionDocTitle(template.source, title)
          : { source: template.source };
        const replaced = replacements
          ? applyMotionDocTextReplacements(titled.source, replacements)
          : { source: titled.source, summary: summarizeMotionDoc(titled.source) };

        return {
          source: replaced.source,
          summary: replaced.summary,
          template: formatTemplate(template, false)
        };
      })
  );

  server.registerTool(
    "slidex_update_slide_props",
    {
      title: "Update Slide Props",
      description: "Merge props into one slide and return updated SlideX MDX.",
      inputSchema: {
        props: motionDocPropsSchema,
        slideIndex: slideIndexSchema,
        source: z.string()
      }
    },
    ({ props, slideIndex, source }) =>
      runTool(() => updateMotionDocSlideProps(source, slideIndex, props))
  );

  server.registerTool(
    "slidex_replace_slide",
    {
      title: "Replace Slide",
      description: "Replace one slide with a complete <Slide>...</Slide> source block.",
      inputSchema: {
        slideIndex: slideIndexSchema,
        slideSource: z.string(),
        source: z.string()
      }
    },
    ({ slideIndex, slideSource, source }) =>
      runTool(() => replaceMotionDocSlide(source, slideIndex, slideSource))
  );

  server.registerTool(
    "slidex_add_block",
    {
      title: "Add Block",
      description: "Append a default block to a slide, with optional text, props, and frame position overrides.",
      inputSchema: {
        afterBlockIndex: blockIndexSchema
          .optional()
          .describe("Insert after this block index. Omit to append."),
        position: motionDocFrameSchema.optional(),
        props: motionDocPropsSchema.optional(),
        slideIndex: slideIndexSchema,
        source: z.string(),
        text: z.string().optional(),
        type: z.enum(motionDocAddBlockTypes)
      }
    },
    ({ afterBlockIndex, position, props, slideIndex, source, text, type }) =>
      runTool(() =>
        addMotionDocBlock(source, slideIndex, type, { afterBlockIndex, position, props, text })
      )
  );

  server.registerTool(
    "slidex_update_block",
    {
      title: "Update Block",
      description:
        "Update a current MotionDoc block. Use text for text blocks and props for frame, media, shape, table, and icon fields.",
      inputSchema: {
        blockIndex: blockIndexSchema,
        ...motionDocBlockUpdateSchema.shape,
        slideIndex: slideIndexSchema,
        source: z.string()
      }
    },
    ({ blockIndex, props, slideIndex, source, text }) =>
      runTool(() => updateMotionDocBlock(source, slideIndex, blockIndex, { props, text }))
  );

  server.registerTool(
    "slidex_delete_block",
    {
      title: "Delete Block",
      description: "Delete one block from a slide and return updated SlideX MDX.",
      inputSchema: {
        blockIndex: blockIndexSchema,
        slideIndex: slideIndexSchema,
        source: z.string()
      }
    },
    ({ blockIndex, slideIndex, source }) =>
      runTool(() => deleteMotionDocBlock(source, slideIndex, blockIndex))
  );

  server.registerTool(
    "slidex_duplicate_block",
    {
      title: "Duplicate Block",
      description: "Duplicate one block immediately after itself, optionally offsetting its x/y frame position.",
      inputSchema: {
        blockIndex: blockIndexSchema,
        offset: z.number().default(2).describe("Percentage offset applied to x and y."),
        slideIndex: slideIndexSchema,
        source: z.string()
      }
    },
    ({ blockIndex, offset, slideIndex, source }) =>
      runTool(() => duplicateMotionDocBlock(source, slideIndex, blockIndex, offset))
  );

  server.registerTool(
    "slidex_reorder_block",
    {
      title: "Reorder Block",
      description: "Move a block to another index within the same slide.",
      inputSchema: {
        fromIndex: blockIndexSchema,
        slideIndex: slideIndexSchema,
        source: z.string(),
        toIndex: blockIndexSchema
      }
    },
    ({ fromIndex, slideIndex, source, toIndex }) =>
      runTool(() => reorderMotionDocBlock(source, slideIndex, fromIndex, toIndex))
  );

  server.registerTool(
    "slidex_delete_slide",
    {
      title: "Delete Slide",
      description: "Delete one slide by index and return updated SlideX MDX.",
      inputSchema: {
        slideIndex: slideIndexSchema,
        source: z.string()
      }
    },
    ({ slideIndex, source }) => runTool(() => deleteMotionDocSlide(source, slideIndex))
  );

  server.registerTool(
    "slidex_reorder_slide",
    {
      title: "Reorder Slide",
      description: "Move a slide from one index to another and return updated SlideX MDX.",
      inputSchema: {
        fromIndex: slideIndexSchema,
        source: z.string(),
        toIndex: slideIndexSchema
      }
    },
    ({ fromIndex, source, toIndex }) =>
      runTool(() => reorderMotionDocSlide(source, fromIndex, toIndex))
  );

  server.registerTool(
    "slidex_export_html",
    {
      title: "Export HTML",
      description: "Export SlideX MDX to a standalone HTML player string.",
      inputSchema: {
        source: z.string(),
        title: z.string().optional()
      }
    },
    ({ source, title }) =>
      runTool(() => ({
        html: buildMotionDocHtml(source, title),
        summary: summarizeMotionDoc(source)
      }))
  );

  if (options.enablePptxExport !== false) {
    server.registerTool(
      "slidex_export_pptx",
      {
        title: "Export Editable PowerPoint",
        description:
          "Export SlideX MDX to an editable local .pptx file. Shader and non-native effects are rasterized as slide backgrounds.",
        inputSchema: {
          outputPath: z.string().describe("Absolute .pptx output path."),
          overwrite: z.boolean().default(false),
          source: z.string(),
          title: z.string().optional()
        }
      },
      (input) => runAsyncTool(() => exportMotionDocPptx(input))
    );
  }

  server.registerTool(
    "slidex_list_block_types",
    {
      title: "List Block Types",
      description: "List block type names accepted by slidex_add_block."
    },
    () => runTool(() => ({ blockTypes: motionDocAddBlockTypes }))
  );

  server.registerTool(
    "slidex_get_motion_doc_schema",
    {
      title: "Get Current MotionDoc Schema",
      description:
        "Return the current SlideX MotionDoc slide fields plus every MCP add-block type, its generated MotionDoc type, supported default fields, and default props. Call this before editing unfamiliar blocks."
    },
    () => runTool(getMotionDocMcpSchema)
  );

}

function registerResources(server: McpServer) {
  server.registerResource(
    "slidex-motion-doc-schema",
    "slidex://schema/motion-doc",
    {
      description: "Current MotionDoc slide and block field schema used by the SlideX MCP tools.",
      mimeType: "application/json",
      title: "SlideX MotionDoc Schema"
    },
    (uri) => ({
      contents: [
        {
          mimeType: "application/json",
          text: toJson(getMotionDocMcpSchema()),
          uri: uri.href
        }
      ]
    })
  );

  server.registerResource(
    "slidex-template-index",
    "slidex://templates",
    {
      description: "Bundled SlideX template index.",
      mimeType: "application/json",
      title: "SlideX Template Index"
    },
    (uri) => ({
      contents: [
        {
          mimeType: "application/json",
          text: toJson(listTemplateSummaries()),
          uri: uri.href
        }
      ]
    })
  );

  server.registerResource(
    "slidex-default-motion-doc",
    "slidex://defaults/blank.mdx",
    {
      description: "Default blank SlideX MotionDoc source.",
      mimeType: "text/markdown",
      title: "Blank SlideX MotionDoc"
    },
    (uri) => ({
      contents: [
        {
          mimeType: "text/markdown",
          text: defaultMdx,
          uri: uri.href
        }
      ]
    })
  );

  server.registerResource(
    "slidex-template-source",
    new ResourceTemplate("slidex://templates/{templateId}", {
      complete: {
        templateId: (value) =>
          motionTemplates
            .map((template) => template.id)
            .filter((templateId) => templateId.startsWith(value))
      },
      list: () => ({
        resources: motionTemplates.map((template) => ({
          description: template.description,
          mimeType: "text/markdown",
          name: template.id,
          title: template.name,
          uri: `slidex://templates/${template.id}`
        }))
      })
    }),
    {
      description: "Bundled SlideX template source by id.",
      mimeType: "text/markdown",
      title: "SlideX Template Source"
    },
    (uri, variables) => {
      const templateId = Array.isArray(variables.templateId)
        ? variables.templateId[0]
        : variables.templateId;
      const template = getTemplateOrDefault(templateId);

      return {
        contents: [
          {
            mimeType: "text/markdown",
            text: template.source,
            uri: uri.href
          }
        ]
      };
    }
  );
}

function registerPrompts(server: McpServer) {
  server.registerPrompt(
    "slidex_deck_builder",
    {
      argsSchema: {
        audience: z.string().optional(),
        slideCount: z.string().optional(),
        topic: z.string()
      },
      description: "Guide an assistant to produce a structured outline and call slidex_create_deck.",
      title: "Build a SlideX Deck"
    },
    ({ audience, slideCount, topic }) => ({
      description: "Create a SlideX deck outline and convert it to editable MotionDoc MDX.",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Create a SlideX presentation about: ${topic}.`,
              audience ? `Audience: ${audience}.` : undefined,
              slideCount ? `Target slide count: ${slideCount}.` : undefined,
              "First draft a concise structured outline, then call slidex_create_deck with title, optional subtitle, theme, and slides.",
              "Keep each slide focused: one title, one body paragraph or 3-5 bullets."
            ]
              .filter(Boolean)
              .join("\n")
          }
        }
      ]
    })
  );
}

function registerWorkspaceSkills(server: McpServer) {
  const skillsDir = path.join(process.cwd(), ".agents", "skills");
  if (!fs.existsSync(skillsDir)) return;

  let skillDirs: string[] = [];
  try {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    skillDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch {
    return;
  }

  for (const dirName of skillDirs) {
    const skillFilePath = path.join(skillsDir, dirName, "SKILL.md");
    if (!fs.existsSync(skillFilePath)) continue;

    try {
      const content = fs.readFileSync(skillFilePath, "utf8");

      let name = dirName;
      let description = `Skill: ${dirName}`;

      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const yaml = frontmatterMatch[1];
        const nameMatch = yaml.match(/^name:\s*(.+)$/m);
        const descMatch = yaml.match(/^description:\s*(.+)$/m);
        if (nameMatch) name = nameMatch[1].trim();
        if (descMatch) description = descMatch[1].trim();
      }

      // Register as Resource
      server.registerResource(
        `skill-${dirName}`,
        `workspace://skills/${dirName}`,
        {
          description,
          mimeType: "text/markdown",
          title: name
        },
        (uri) => ({
          contents: [
            {
              mimeType: "text/markdown",
              text: content,
              uri: uri.href
            }
          ]
        })
      );

      // Register as Prompt
      server.registerPrompt(
        `skill_${dirName.replace(/[^a-zA-Z0-9_]/g, "_")}`,
        {
          description,
          title: name,
          argsSchema: {
            request: z.string().optional().describe("The user's specific request to apply this skill to.")
          }
        },
        (args) => {
          const requestText = args?.request ? `\\n\\nUser Request: ${args.request}` : "";
          return {
            description: `Apply the ${name} skill.`,
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Please apply the following skill guidelines/workflows to the task.\\n\\nSkill Definition:\\n${content}${requestText}`
                }
              }
            ]
          };
        }
      );
    } catch {
      // Ignore read errors for individual skills
    }
  }
}

function runTool<T>(callback: () => T): CallToolResult {
  try {
    return jsonResult(callback());
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

async function runAsyncTool<T>(callback: () => Promise<T>): Promise<CallToolResult> {
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

function listTemplateSummaries(category?: string) {
  return motionTemplates
    .filter((template) => !category || template.category === category)
    .map((template) => ({
      category: template.category,
      description: template.description,
      duration: template.duration,
      id: template.id,
      name: template.name,
      sceneCount: summarizeMotionDoc(template.source).stats.sceneCount,
      useCase: template.useCase
    }));
}

function getTemplateOrDefault(templateId?: string) {
  if (!templateId) {
    if (!defaultTemplate) {
      throw new Error("No SlideX templates are available.");
    }

    return defaultTemplate;
  }

  const template = motionTemplates.find((item) => item.id === templateId);

  if (!template) {
    throw new Error(`Unknown templateId: ${templateId}`);
  }

  return template;
}

function formatTemplate(template: MotionTemplate, includeSource: boolean) {
  return {
    category: template.category,
    description: template.description,
    duration: template.duration,
    id: template.id,
    name: template.name,
    sceneCount: summarizeMotionDoc(template.source).stats.sceneCount,
    source: includeSource ? template.source : undefined,
    useCase: template.useCase
  };
}

function toJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function isDirectExecution() {
  const entryPath = process.argv[1];
  if (!entryPath) return false;

  try {
    return fs.realpathSync(entryPath) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return path.resolve(entryPath) === path.resolve(fileURLToPath(import.meta.url));
  }
}
