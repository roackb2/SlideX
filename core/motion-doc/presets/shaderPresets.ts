import type { ShaderPreset } from "@/core/motion-doc/presets/shaders/shaderPresetFactory";
import { paperPresets } from "@/core/motion-doc/presets/shaders/shaderCollections";

export type { ShaderPreset } from "@/core/motion-doc/presets/shaders/shaderPresetFactory";
export { FULLSCREEN_VERTEX_SHADER, FULLSCREEN_VERTEX_SHADER_V1 } from "@/core/motion-doc/presets/shaders/shaderPresetFactory";
export { paperPresets } from "@/core/motion-doc/presets/shaders/shaderCollections";

export const shaderPresets = paperPresets;

export const shaderPresetsById = Object.fromEntries(
  shaderPresets.map((preset) => [preset.id, preset])
) as Record<string, ShaderPreset>;

export function getShaderPreset(id: string): ShaderPreset | undefined {
  return shaderPresetsById[id];
}
