"use client";

import { Droplets, Gauge, Layers, Maximize2, Palette, Sliders, Sparkles, Zap } from "lucide-react";
import type { PropRecord } from "@/features/studio/application/themeColors";
import { Field } from "@/features/studio/ui/inspector/InspectorControls";
import { ShaderRangeControl } from "@/features/studio/ui/inspector/shader/ShaderRangeControl";

type WatercolorStudioPanelProps = {
  accent: string;
  background: string;
  shader: string;
  shaderColor1: string;
  shaderColor2: string;
  shaderColor3: string;
  shaderDetail: number;
  shaderIntensity: number;
  shaderScale: number;
  shaderSoftness: number;
  shaderSpeed: number;
  updateActiveSlideStyle: (updates: PropRecord) => void;
};

const watercolorPalettes = [
  { name: "Sakura Mist", colors: ["#ffe4e6", "#f43f5e", "#fda4af"], label: "櫻花薄霧" },
  { name: "Indigo Zen", colors: ["#f0f9ff", "#0284c7", "#0c4a6e"], label: "水墨江南" },
  { name: "Mineral Teal", colors: ["#f0fdf4", "#059669", "#064e3b"], label: "翡翠山嵐" },
  { name: "Tuscan Amber", colors: ["#fffbeb", "#d97706", "#78350f"], label: "落日秋橘" },
  { name: "Lilac Breeze", colors: ["#faf5ff", "#9333ea", "#581c87"], label: "禪風薰草" },
  { name: "Charcoal Zen", colors: ["#fafafa", "#52525b", "#18181b"], label: "焦墨山水" }
] satisfies Array<{ colors: [string, string, string]; label: string; name: string }>;

const watercolorVariations = [
  { id: "watercolor-classic", name: "Classic Blot", cn: "經典暈染", thumb: "linear-gradient(135deg, #fef08a 0%, #f472b6 50%, #93c5fd 100%)" },
  { id: "watercolor-wet", name: "Wet Swirl", cn: "濕中濕流變", thumb: "radial-gradient(circle at 30% 30%, #ec4899 0%, transparent 60%), radial-gradient(circle at 70% 70%, #3b82f6 0%, transparent 60%), #fce7f3" },
  { id: "watercolor-rough", name: "Dry Brush", cn: "枯筆粗紋", thumb: "linear-gradient(135deg, #fed7aa 0%, #f97316 40%, #ffedd5 100%)" },
  { id: "watercolor-salt", name: "Salt Bloom", cn: "撒鹽水漬", thumb: "linear-gradient(135deg, #f472b6 0%, #fae8ff 50%, #818cf8 100%)" },
  { id: "watercolor-ink", name: "Sumi-e Zen", cn: "水墨禪意", thumb: "linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #e4e4e7 100%)" },
  { id: "watercolor-glaze", name: "Overlay Glaze", cn: "雙層罩染", thumb: "linear-gradient(45deg, #ec4899 0%, #f43f5e 50%, #a855f7 100%)" },
  { id: "watercolor-metallic", name: "Golden Shimmer", cn: "金箔微光", thumb: "linear-gradient(135deg, #fbbf24 0%, #d97706 40%, #fef3c7 100%)" },
  { id: "watercolor-gravity", name: "Dripping Bleed", cn: "重力流淌", thumb: "linear-gradient(180deg, #ec4899 0%, #8b5cf6 50%, #e0f2fe 100%)" },
  { id: "watercolor-granulating", name: "Granulation", cn: "色彩沉澱", thumb: "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #f472b6 100%)" }
] satisfies Array<{ cn: string; id: string; name: string; thumb: string }>;

const watercolorColorKeys = ["shaderColor1", "shaderColor2", "shaderColor3"] as const;
const watercolorColorNames = ["Primary Wash", "Secondary Flow", "Highlight Ring"] as const;

export function WatercolorStudioPanel({
  accent,
  background,
  shader,
  shaderColor1,
  shaderColor2,
  shaderColor3,
  shaderDetail,
  shaderIntensity,
  shaderScale,
  shaderSoftness,
  shaderSpeed,
  updateActiveSlideStyle
}: WatercolorStudioPanelProps) {
  const { intensityLabel, speedLabel, type } = getWatercolorConfig(shader);

  return (
    <div className="flex flex-col gap-4.5 animate-[bubble-appear_0.3s_ease-out]">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <span className="text-[10px] font-bold tracking-[0.15em] text-[#8ea5ff] flex items-center gap-1.5">
          <Palette size={12} className="text-[#8ea5ff]" />
          Watercolor Studio
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[8.5px] font-mono text-neutral-400">
          {type}
        </span>
      </div>

      <Field label="Paper Variation (9 Changes)">
        <div className="grid grid-cols-3 gap-2">
          {watercolorVariations.map((variant) => {
            const isSelected = shader === variant.id;
            return (
              <button
                className={`group relative overflow-hidden rounded-xl border aspect-[1/1] text-left transition-all duration-300 active:scale-95 cursor-pointer flex flex-col justify-end p-2 ${
                  isSelected
                    ? "border-[#8ea5ff] bg-white/[0.03] shadow-[0_0_12px_rgba(142,165,255,0.15)]"
                    : "border-white/[0.05] bg-black/40 hover:border-white/[0.12] hover:bg-white/[0.02]"
                }`}
                key={variant.id}
                onClick={() => updateActiveSlideStyle({ shader: variant.id })}
                type="button"
              >
                <div
                  className="absolute inset-0 opacity-25 transition-transform duration-500 ease-out group-hover:scale-110"
                  style={{ background: variant.thumb }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent opacity-90" />

                {isSelected ? (
                  <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-[#8ea5ff] text-black">
                    <Sparkles size={8} />
                  </div>
                ) : null}

                <div className="relative z-10 flex flex-col">
                  <span className="text-[9px] font-bold text-white tracking-wide truncate">{variant.name}</span>
                  <span className="text-[7.5px] text-neutral-400 font-medium truncate mt-0.5">{variant.cn}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      <div className="p-1.5 rounded-[1.25rem] border border-white/[0.03] bg-[#0A0A0C]/50 shadow-[0_4px_24px_rgba(0,0,0,0.15)] backdrop-blur-xl">
        <div className="rounded-[1rem] border border-white/[0.03] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.03] px-3.5 py-3 bg-white/[0.01]">
            <span className="text-[10px] font-bold tracking-[0.16em] text-neutral-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8ea5ff]/10 text-[#8ea5ff] border border-[#8ea5ff]/20 shadow-[0_0_10px_rgba(142,165,255,0.1)]">
                <Palette size={10} />
              </span>
              Curated Pigments
            </span>
            <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[9px] font-mono tracking-wider text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              PRESET
            </span>
          </div>

          <div className="p-3.5">

            <div className="grid grid-cols-2 gap-2">
              {watercolorPalettes.map((palette) => (
                <button
                  className="flex items-center justify-between rounded-[1rem] border border-white/[0.03] bg-white/[0.015] p-2 hover:border-white/[0.08] hover:bg-white/[0.03] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-300 text-left group cursor-pointer active:scale-95"
                  key={palette.name}
                  onClick={() => {
                    updateActiveSlideStyle({
                      shaderColor1: palette.colors[0],
                      shaderColor2: palette.colors[1],
                      shaderColor3: palette.colors[2]
                    });
                  }}
                  type="button"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9.5px] font-bold text-neutral-300 group-hover:text-white truncate">
                      {palette.name}
                    </span>
                    <span className="text-[7.5px] text-neutral-500 font-medium">{palette.label}</span>
                  </div>
                  <div className="flex -space-x-1.5 shrink-0 ml-2">
                    {palette.colors.map((color) => (
                      <span
                        className="h-4.5 w-4.5 rounded-full border border-black/40 shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110"
                        key={color}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-1.5 rounded-[1.25rem] border border-white/[0.03] bg-[#0A0A0C]/50 shadow-[0_4px_24px_rgba(0,0,0,0.15)] backdrop-blur-xl">
        <div className="rounded-[1rem] border border-white/[0.03] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.03] px-3.5 py-3 bg-white/[0.01]">
            <span className="text-[10px] font-bold tracking-[0.16em] text-neutral-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8ea5ff]/10 text-[#8ea5ff] border border-[#8ea5ff]/20 shadow-[0_0_10px_rgba(142,165,255,0.1)]">
                <Sliders size={10} />
              </span>
              Spectrum Tuning
            </span>
            <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[9px] font-mono tracking-wider text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              MANUAL
            </span>
          </div>
          <div className="p-3.5">
            <WatercolorColorInputs
              accent={accent}
              background={background}
              shaderColor1={shaderColor1}
              shaderColor2={shaderColor2}
              shaderColor3={shaderColor3}
              updateActiveSlideStyle={updateActiveSlideStyle}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        <ShaderRangeControl
          ariaLabel="Shader intensity"
          badge={`${Math.round(shaderIntensity * 100)}%`}
          icon={Zap}
          label={intensityLabel}
          max="1"
          min="0.05"
          onChange={(value) => updateActiveSlideStyle({ shaderIntensity: value })}
          step="0.05"
          surfaceClassName="rounded-2xl border-white/[0.04] bg-white/[0.015]"
          value={shaderIntensity}
        />
        <ShaderRangeControl
          ariaLabel="Shader speed"
          badge={`${shaderSpeed.toFixed(1)}x`}
          icon={Gauge}
          label={speedLabel}
          max="3"
          min="0.1"
          onChange={(value) => updateActiveSlideStyle({ shaderSpeed: value })}
          step="0.1"
          surfaceClassName="rounded-2xl border-white/[0.04] bg-white/[0.015]"
          value={shaderSpeed}
        />
        <ShaderRangeControl
          ariaLabel="Shader softness"
          badge={`${Math.round(shaderSoftness * 100)}%`}
          icon={Droplets}
          label="Softness"
          max="1"
          min="0"
          onChange={(value) => updateActiveSlideStyle({ shaderSoftness: value })}
          step="0.05"
          surfaceClassName="rounded-2xl border-white/[0.04] bg-white/[0.015]"
          value={shaderSoftness}
        />
        <ShaderRangeControl
          ariaLabel="Shader scale"
          badge={shaderScale.toFixed(2)}
          icon={Maximize2}
          label="Scale"
          max="2"
          min="0.1"
          onChange={(value) => updateActiveSlideStyle({ shaderScale: value })}
          step="0.05"
          surfaceClassName="rounded-2xl border-white/[0.04] bg-white/[0.015]"
          value={shaderScale}
        />
        <ShaderRangeControl
          ariaLabel="Shader detail"
          badge={`${(shaderDetail * 100).toFixed(0)}%`}
          icon={Layers}
          label="Detail"
          max="1"
          min="0.1"
          onChange={(value) => updateActiveSlideStyle({ shaderDetail: value })}
          step="0.05"
          surfaceClassName="rounded-2xl border-white/[0.04] bg-white/[0.015]"
          value={shaderDetail}
        />
      </div>
    </div>
  );
}

function WatercolorColorInputs({
  accent,
  background,
  shaderColor1,
  shaderColor2,
  shaderColor3,
  updateActiveSlideStyle
}: Pick<
  WatercolorStudioPanelProps,
  "accent" | "background" | "shaderColor1" | "shaderColor2" | "shaderColor3" | "updateActiveSlideStyle"
>) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {watercolorColorKeys.map((key, index) => {
        const value = key === "shaderColor1" ? shaderColor1 : key === "shaderColor2" ? shaderColor2 : shaderColor3;
        const fallback = key === "shaderColor1" ? (accent || "#7c3aed") : key === "shaderColor2" ? (background || "#0a0a1a") : "#06b6d4";
        const displayValue = value || fallback;
        const hexValue = /^#[0-9a-fA-F]{3,6}$/.test(displayValue) ? displayValue : "#7c3aed";

        return (
          <label className="group flex flex-col items-center gap-1.5 cursor-pointer relative" key={key}>
            <span className="text-[8px] font-bold text-neutral-500 group-hover:text-neutral-400 transition-colors tracking-wider text-center w-full truncate">
              {watercolorColorNames[index]}
            </span>
            <span
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] shadow-md transition-all duration-300 group-hover:border-white/[0.15] group-hover:scale-105 group-active:scale-95 overflow-hidden"
              style={{ background: displayValue }}
            >
              <span className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-60" />
              <input
                aria-label={`Shader color ${index + 1}`}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={(event) => updateActiveSlideStyle({ [key]: event.target.value })}
                type="color"
                value={hexValue}
              />
            </span>
            <span className="text-[8px] font-mono text-neutral-500 bg-white/[0.02] border border-white/[0.04] px-1.5 py-0.5 rounded group-hover:text-neutral-300 transition-colors">
              {displayValue.slice(0, 7)}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function getWatercolorConfig(shader: string) {
  switch (shader) {
    case "watercolor-wet":
      return { intensityLabel: "Wetness Spread", speedLabel: "Swirl Velocity", type: "Liquid Swirl" };
    case "watercolor-rough":
      return { intensityLabel: "Dry Grain Contrast", speedLabel: "Brush Flow Rate", type: "Dry Brush Texture" };
    case "watercolor-salt":
      return { intensityLabel: "Salt Bloom Density", speedLabel: "Absorption Rate", type: "Crystalline Salt" };
    case "watercolor-ink":
      return { intensityLabel: "Ink Concentration", speedLabel: "Wash Feathering", type: "Sumi Rice Wash" };
    case "watercolor-glaze":
      return { intensityLabel: "Glazing Transparency", speedLabel: "Overlay Drift Rate", type: "Glazing Overlay" };
    case "watercolor-metallic":
      return { intensityLabel: "Metallic Fleck Density", speedLabel: "Shimmer Frequency", type: "Golden Leaf Flakes" };
    case "watercolor-gravity":
      return { intensityLabel: "Drip Run Count", speedLabel: "Gravity Pull Speed", type: "Gravitational Bleed" };
    case "watercolor-granulating":
      return { intensityLabel: "Sediment Roughness", speedLabel: "Dual-Tone Separation", type: "Mineral Granules" };
    default:
      return { intensityLabel: "Viscosity Density", speedLabel: "Flow Absorption Rate", type: "Classic Wet Press" };
  }
}
