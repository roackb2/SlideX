import { paperShaderDefinitions } from "@/core/motion-doc/application/shaders/paperShaderCatalog";
import { makePreset, type ShaderPreset } from "@/core/motion-doc/presets/shaders/shaderPresetFactory";

const paperFallbackBody = `
void main() {
  vec3 color = mix(u_color1, u_color2, smoothstep(0.0, 1.0, vUv.x));
  color = mix(color, u_color3, 0.18 * smoothstep(0.0, 1.0, vUv.y));
  fragColor = vec4(color, 1.0);
}
`;

export const paperPresets: ShaderPreset[] = paperShaderDefinitions.map((definition) =>
  makePreset(
    definition.id,
    definition.name,
    definition.category,
    definition.thumbnail,
    paperFallbackBody
  )
);

export const shaderPresets: ShaderPreset[] = paperPresets;

export const legacyWatercolorPresets: ShaderPreset[] = [];
