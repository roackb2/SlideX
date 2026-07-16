import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import { updateMotionDocSlideProps } from "@/core/motion-doc/application/motionDocAutomation";
import {
  getPaperShaderDefinition,
  paperShaderDefinitions,
  paperShaderPresetUpdates
} from "@/core/motion-doc/application/shaders/paperShaderCatalog";
import { jsonMcpResult, runMcpTool } from "@/mcp/mcpResults";

export function registerShaderMcp(server: McpServer) {
  server.registerTool(
    "slidex_list_shaders",
    {
      title: "List SlideX Shaders",
      description: "List the current shader backgrounds and their available presets."
    },
    () => jsonMcpResult(listMcpShaders())
  );

  server.registerTool(
    "slidex_get_shader",
    {
      title: "Get SlideX Shader",
      description: "Return one current shader's presets, colors, and adjustable controls.",
      inputSchema: {
        shaderId: z.string().describe("Shader id from slidex_list_shaders.")
      }
    },
    ({ shaderId }) => runMcpTool(() => getMcpShader(shaderId))
  );

  server.registerTool(
    "slidex_apply_shader_preset",
    {
      title: "Apply Shader Preset",
      description: "Apply a current shader preset to one slide and return updated SlideX MDX.",
      inputSchema: {
        presetName: z.string().optional(),
        shaderId: z.string().describe("Shader id from slidex_list_shaders."),
        slideIndex: z.number().int().min(0),
        source: z.string()
      }
    },
    ({ presetName, shaderId, slideIndex, source }) =>
      runMcpTool(() => applyMcpShaderPreset(source, slideIndex, shaderId, presetName))
  );
}

export function listMcpShaders() {
  return {
    count: paperShaderDefinitions.length,
    shaders: paperShaderDefinitions.map((definition) => ({
      category: definition.category,
      defaultPreset: definition.defaultPreset,
      id: definition.id,
      name: definition.name,
      presets: definition.presets.map((preset) => preset.name)
    }))
  };
}

export function getMcpShader(shaderId: string) {
  const definition = getPaperShaderDefinition(shaderId);

  if (!definition || definition.id !== shaderId) {
    throw new Error(`Unknown shaderId: ${shaderId}.`);
  }

  return {
    category: definition.category,
    colorLabels: definition.colorLabels,
    controls: definition.controls,
    defaultPreset: definition.defaultPreset,
    id: definition.id,
    name: definition.name,
    presets: definition.presets.map((preset) => ({
      name: preset.name,
      props: preset.props
    })),
    visibleColorCount: definition.visibleColorCount ?? definition.colorLabels.length
  };
}

export function applyMcpShaderPreset(
  source: string,
  slideIndex: number,
  shaderId: string,
  presetName?: string
) {
  const definition = getPaperShaderDefinition(shaderId);

  if (!definition || definition.id !== shaderId) {
    throw new Error(`Unknown shaderId: ${shaderId}.`);
  }

  if (presetName && !definition.presets.some((preset) => preset.name === presetName)) {
    throw new Error(`Unknown presetName: ${presetName} for shader ${shaderId}.`);
  }

  return updateMotionDocSlideProps(
    source,
    slideIndex,
    paperShaderPresetUpdates(definition.id, presetName)
  );
}
