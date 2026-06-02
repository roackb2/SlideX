import { makePreset, type ShaderPreset } from "@/core/motion-doc/presets/shaders/shaderPresetFactory";
import { auroraBody, meshGradientBody, noiseFogBody } from "@/core/motion-doc/presets/shaders/atmosphericShaderBodies";
import { gridPulseBody, particleFieldBody, reactionDiffusionBody, waveDistortionBody } from "@/core/motion-doc/presets/shaders/motionShaderBodies";
import { watercolorClassicBody, watercolorGlazeBody, watercolorGranulatingBody, watercolorGravityBody, watercolorInkBody, watercolorMetallicBody, watercolorRoughBody, watercolorSaltBody, watercolorWetBody } from "@/core/motion-doc/presets/shaders/watercolorShaderBodies";

export const shaderPresets: ShaderPreset[] = [
  makePreset(
    "aurora",
    "Aurora Borealis",
    "organic",
    "linear-gradient(135deg, #0f172a 0%, #31108c 30%, #8b5cf6 60%, #06b6d4 100%)",
    auroraBody
  ),
  makePreset(
    "mesh-gradient",
    "Chroma Chrome",
    "gradient",
    "radial-gradient(circle at 20% 20%, #ec4899 0%, transparent 50%), radial-gradient(circle at 80% 80%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 50% 50%, #8b5cf6 0%, transparent 50%), #0c0a0f",
    meshGradientBody
  ),
  makePreset(
    "noise-fog",
    "Nebula Volumetric",
    "organic",
    "linear-gradient(135deg, #020617 0%, #1e1b4b 40%, #4338ca 70%, #d946ef 100%)",
    noiseFogBody
  ),
  makePreset(
    "geometric-grid",
    "Pixel Beams",
    "geometric",
    "linear-gradient(45deg, #050515 0%, #0c0022 100%), repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(139, 92, 246, 0.1) 9px, rgba(139, 92, 246, 0.1) 10px)",
    gridPulseBody
  ),
  makePreset(
    "particle-field",
    "Bending Light",
    "particle",
    "radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.15) 0%, transparent 40%), #03000a",
    particleFieldBody
  ),
  makePreset(
    "wave-distortion",
    "Stainless Waves",
    "organic",
    "linear-gradient(135deg, #09090b 0%, #18181b 40%, #3f3f46 70%, #a1a1aa 100%)",
    waveDistortionBody
  ),
  makePreset(
    "reaction-diffusion",
    "Reaction Swirl",
    "organic",
    "radial-gradient(circle at 50% 50%, #ec4899 0%, #8b5cf6 50%, #0c0a0f 100%)",
    reactionDiffusionBody
  ),
];

export const legacyWatercolorPresets: ShaderPreset[] = [
  makePreset(
    "watercolor-classic",
    "Watercolor Classic",
    "organic",
    "linear-gradient(135deg, #fef08a 0%, #f472b6 50%, #93c5fd 100%)",
    watercolorClassicBody
  ),
  makePreset(
    "watercolor-wet",
    "Wet-on-Wet Swirl",
    "organic",
    "radial-gradient(circle at 30% 30%, #ec4899 0%, transparent 60%), radial-gradient(circle at 70% 70%, #3b82f6 0%, transparent 60%), #fce7f3",
    watercolorWetBody
  ),
  makePreset(
    "watercolor-rough",
    "Dry Brush Rough",
    "organic",
    "linear-gradient(135deg, #fed7aa 0%, #f97316 40%, #ffedd5 100%)",
    watercolorRoughBody
  ),
  makePreset(
    "watercolor-salt",
    "Salt Bloom & Rings",
    "organic",
    "linear-gradient(135deg, #f472b6 0%, #fae8ff 50%, #818cf8 100%)",
    watercolorSaltBody
  ),
  makePreset(
    "watercolor-ink",
    "Sumi-e Zen Ink",
    "organic",
    "linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #e4e4e7 100%)",
    watercolorInkBody
  ),
  makePreset(
    "watercolor-glaze",
    "Overlay Glaze",
    "organic",
    "linear-gradient(45deg, #ec4899 0%, #f43f5e 50%, #a855f7 100%)",
    watercolorGlazeBody
  ),
  makePreset(
    "watercolor-metallic",
    "Golden Shimmer",
    "organic",
    "linear-gradient(135deg, #fbbf24 0%, #d97706 40%, #fef3c7 100%)",
    watercolorMetallicBody
  ),
  makePreset(
    "watercolor-gravity",
    "Dripping Bleed",
    "organic",
    "linear-gradient(180deg, #ec4899 0%, #8b5cf6 50%, #e0f2fe 100%)",
    watercolorGravityBody
  ),
  makePreset(
    "watercolor-granulating",
    "Mineral Granulation",
    "organic",
    "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #f472b6 100%)",
    watercolorGranulatingBody
  ),
];
