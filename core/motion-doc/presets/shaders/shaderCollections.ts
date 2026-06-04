import { makePreset, type ShaderPreset } from "@/core/motion-doc/presets/shaders/shaderPresetFactory";
import { makePremiumShaderBody } from "@/core/motion-doc/application/shaders/premiumShaderBodies";

export const shaderPresets: ShaderPreset[] = [
  makePreset(
    "aurora",
    "Polar Silk",
    "organic",
    "linear-gradient(135deg, #05070d 0%, #0d172a 42%, #57d68d 64%, #5227ff 100%)",
    makePremiumShaderBody(0)
  ),
  makePreset(
    "mesh-gradient",
    "Pearl Mesh",
    "gradient",
    "radial-gradient(circle at 18% 24%, #eef7f8 0%, transparent 46%), radial-gradient(circle at 78% 72%, #f4b9c8 0%, transparent 54%), linear-gradient(135deg, #121826 0%, #86aebb 46%, #f8f3ee 100%)",
    makePremiumShaderBody(1)
  ),
  makePreset(
    "silk-gradient",
    "Opal Veil",
    "gradient",
    "linear-gradient(135deg, #f8fafc 0%, #dbeafe 25%, #f0abfc 52%, #fde68a 100%)",
    makePremiumShaderBody(2)
  ),
  makePreset(
    "noise-fog",
    "Vapor Glass",
    "organic",
    "radial-gradient(circle at 28% 30%, #dbeafe 0%, transparent 48%), radial-gradient(circle at 76% 72%, #99f6e4 0%, transparent 54%), #101826",
    makePremiumShaderBody(3)
  ),
  makePreset(
    "geometric-grid",
    "Blueprint Glow",
    "geometric",
    "linear-gradient(135deg, #06111f 0%, #0f172a 100%), repeating-linear-gradient(90deg, transparent 0 12px, rgba(125, 211, 252, 0.18) 12px 13px)",
    makePremiumShaderBody(4)
  ),
  makePreset(
    "particle-field",
    "Dust Atelier",
    "particle",
    "radial-gradient(circle at 26% 28%, rgba(248, 250, 252, 0.18) 0%, transparent 42%), radial-gradient(circle at 74% 70%, rgba(251, 191, 36, 0.16) 0%, transparent 44%), #07090f",
    makePremiumShaderBody(5)
  ),
  makePreset(
    "wave-distortion",
    "Liquid Chrome",
    "organic",
    "linear-gradient(135deg, #09090b 0%, #1f2937 40%, #94a3b8 72%, #e5e7eb 100%)",
    makePremiumShaderBody(6)
  ),
  makePreset(
    "reaction-diffusion",
    "Balatro Swirl",
    "organic",
    "linear-gradient(135deg, #DE443B 0%, #006BB4 50%, #162325 100%)",
    makePremiumShaderBody(7)
  ),
];

export const legacyWatercolorPresets: ShaderPreset[] = [
  makePreset(
    "watercolor-classic",
    "Watercolor Classic",
    "organic",
    "linear-gradient(135deg, #fef08a 0%, #f472b6 50%, #93c5fd 100%)",
    makePremiumShaderBody(1)
  ),
  makePreset(
    "watercolor-wet",
    "Wet-on-Wet Swirl",
    "organic",
    "radial-gradient(circle at 30% 30%, #ec4899 0%, transparent 60%), radial-gradient(circle at 70% 70%, #3b82f6 0%, transparent 60%), #fce7f3",
    makePremiumShaderBody(2)
  ),
  makePreset(
    "watercolor-rough",
    "Dry Brush Rough",
    "organic",
    "linear-gradient(135deg, #fed7aa 0%, #f97316 40%, #ffedd5 100%)",
    makePremiumShaderBody(3)
  ),
  makePreset(
    "watercolor-salt",
    "Salt Bloom & Rings",
    "organic",
    "linear-gradient(135deg, #f472b6 0%, #fae8ff 50%, #818cf8 100%)",
    makePremiumShaderBody(5)
  ),
  makePreset(
    "watercolor-ink",
    "Sumi-e Zen Ink",
    "organic",
    "linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #e4e4e7 100%)",
    makePremiumShaderBody(7)
  ),
  makePreset(
    "watercolor-glaze",
    "Overlay Glaze",
    "organic",
    "linear-gradient(45deg, #ec4899 0%, #f43f5e 50%, #a855f7 100%)",
    makePremiumShaderBody(2)
  ),
  makePreset(
    "watercolor-metallic",
    "Golden Shimmer",
    "organic",
    "linear-gradient(135deg, #fbbf24 0%, #d97706 40%, #fef3c7 100%)",
    makePremiumShaderBody(6)
  ),
  makePreset(
    "watercolor-gravity",
    "Dripping Bleed",
    "organic",
    "linear-gradient(180deg, #ec4899 0%, #8b5cf6 50%, #e0f2fe 100%)",
    makePremiumShaderBody(3)
  ),
  makePreset(
    "watercolor-granulating",
    "Mineral Granulation",
    "organic",
    "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #f472b6 100%)",
    makePremiumShaderBody(4)
  ),
];
