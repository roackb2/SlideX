"use client";

import { Cpu, Droplets, EyeOff, Gauge, Layers, Maximize2, Palette, Sparkles, Zap } from "lucide-react";
import type { PropRecord } from "@/features/studio/application/themeColors";
import { shaderPresets } from "@/core/motion-doc/presets/shaderPresets";
import { Field } from "@/features/studio/ui/inspector/InspectorControls";
import { AccordionSection } from "@/features/studio/ui/inspector/controls/AccordionSection";
import { ShaderRangeControl } from "@/features/studio/ui/inspector/shader/ShaderRangeControl";
import { WatercolorStudioPanel } from "@/features/studio/ui/inspector/shader/WatercolorStudioPanel";

type ShaderBackgroundSectionProps = {
  accent: string;
  background: string;
  shader: string;
  shaderColor1: string;
  shaderColor2: string;
  shaderColor3: string;
  shaderDetail: number;
  shaderEngine: string;
  shaderIntensity: number;
  shaderScale: number;
  shaderSoftness: number;
  shaderSpeed: number;
  updateActiveSlideStyle: (updates: PropRecord) => void;
};

const shaderColorKeys = ["shaderColor1", "shaderColor2", "shaderColor3"] as const;
const shaderColorNames = ["Primary", "Flow", "Highlight"] as const;
const shaderPresetDefaults: Record<string, PropRecord> = {
  aurora: {
    background: "#120f17",
    mutedColor: "auto",
    shaderColor1: "#57d68d",
    shaderColor2: "#120f17",
    shaderColor3: "#5227ff",
    shaderDetail: 0.7,
    shaderIntensity: 0.95,
    shaderScale: 0.7,
    shaderSoftness: 0.62,
    shaderSpeed: 0.55,
    textColor: "auto"
  },
  "geometric-grid": {
    background: "#06111f",
    mutedColor: "auto",
    shaderColor1: "#38bdf8",
    shaderColor2: "#06111f",
    shaderColor3: "#0f766e",
    shaderDetail: 0.8,
    shaderIntensity: 0.78,
    shaderScale: 0.65,
    shaderSoftness: 0.45,
    shaderSpeed: 0.75,
    textColor: "auto"
  },
  "mesh-gradient": {
    background: "#e8eef2",
    mutedColor: "auto",
    shaderColor1: "#eef7f8",
    shaderColor2: "#cfd8dc",
    shaderColor3: "#f2b6c4",
    shaderDetail: 0.58,
    shaderIntensity: 0.82,
    shaderScale: 0.52,
    shaderSoftness: 0.88,
    shaderSpeed: 0.45,
    textColor: "auto"
  },
  "noise-fog": {
    background: "#07120f",
    mutedColor: "auto",
    shaderColor1: "#4ade80",
    shaderColor2: "#07120f",
    shaderColor3: "#7dd3fc",
    shaderDetail: 0.82,
    shaderIntensity: 0.82,
    shaderScale: 0.7,
    shaderSoftness: 0.74,
    shaderSpeed: 0.55,
    textColor: "auto"
  },
  "particle-field": {
    background: "#080706",
    mutedColor: "auto",
    shaderColor1: "#fbbf24",
    shaderColor2: "#080706",
    shaderColor3: "#a16207",
    shaderDetail: 0.85,
    shaderIntensity: 0.72,
    shaderScale: 0.76,
    shaderSoftness: 0.48,
    shaderSpeed: 0.65,
    textColor: "auto"
  },
  "reaction-diffusion": {
    background: "#0d0205",
    mutedColor: "auto",
    shaderColor1: "#DE443B",
    shaderColor2: "#006BB4",
    shaderColor3: "#162325",
    shaderDetail: 0.8,
    shaderIntensity: 0.9,
    shaderScale: 1.1,
    shaderSoftness: 0.5,
    shaderSpeed: 0.5,
    textColor: "auto"
  },
  "silk-gradient": {
    background: "#f2e7f4",
    mutedColor: "auto",
    shaderColor1: "#c7d2fe",
    shaderColor2: "#f8eef7",
    shaderColor3: "#d8b4fe",
    shaderDetail: 0.72,
    shaderIntensity: 0.84,
    shaderScale: 0.58,
    shaderSoftness: 0.86,
    shaderSpeed: 0.48,
    textColor: "auto"
  },
  "wave-distortion": {
    background: "#0c1118",
    mutedColor: "auto",
    shaderColor1: "#111827",
    shaderColor2: "#94a3b8",
    shaderColor3: "#f8fafc",
    shaderDetail: 0.88,
    shaderIntensity: 0.86,
    shaderScale: 0.72,
    shaderSoftness: 0.56,
    shaderSpeed: 0.7,
    textColor: "auto"
  }
};

export function ShaderBackgroundSection({
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
}: ShaderBackgroundSectionProps) {
  return (
    <AccordionSection title="Shader Background" icon={<Sparkles size={13} className="text-[#8ea5ff]" />} defaultOpen>
      <ShaderEngineIntro />

      <Field label="Shader Preset">
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`group relative overflow-hidden rounded-xl border aspect-[16/10] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 ${
              !shader
                ? "border-[#a855f7]/70 bg-[#a855f7]/10 text-white ring-1 ring-[#a855f7]/25 shadow-[0_0_18px_rgba(168,85,247,0.14)]"
                : "border-white/[0.06] bg-[#0a090d] text-neutral-500 hover:border-white/[0.14] hover:text-neutral-300"
            }`}
            onClick={() => updateActiveSlideStyle(emptyShaderUpdates())}
            type="button"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:8px_8px] opacity-60" />
            <EyeOff size={15} className={`mb-1 transition-transform group-hover:scale-110 duration-300 ${!shader ? "text-[#8ea5ff]" : "text-neutral-500"}`} />
            <span className="text-[9px] font-bold tracking-wider uppercase">Disable Effect</span>
          </button>

          {shaderPresets.map((preset) => {
            const isActive = shader === preset.id;
            return (
              <button
                className={`group relative overflow-hidden rounded-xl border aspect-[16/10] text-left transition-all duration-300 cursor-pointer active:scale-95 ${
                  isActive
                    ? "border-[#a855f7]/75 ring-1 ring-[#a855f7]/30 shadow-[0_0_22px_rgba(168,85,247,0.20)]"
                    : "border-white/[0.06] hover:border-white/[0.14]"
                }`}
                key={preset.id}
                onClick={() => updateActiveSlideStyle(shaderPresetUpdates(preset.id))}
                type="button"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ background: preset.thumbnail }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 opacity-80 group-hover:opacity-70 transition-opacity duration-300" />

                {isActive ? (
                  <div className="absolute top-2 right-2 p-0.5 rounded-full bg-[#a855f7] text-white shadow-[0_0_10px_rgba(168,85,247,0.75)]">
                    <Sparkles size={8} />
                  </div>
                ) : null}

                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/55 backdrop-blur-md border border-white/[0.08] text-[7.5px] font-mono font-bold uppercase tracking-wider text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  {preset.category}
                </div>
                <div className="absolute bottom-2 left-2.5 right-2.5 flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-white tracking-wide truncate group-hover:translate-x-0.5 transition-transform duration-300">
                    {preset.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      {shader ? (
        <>
          {shader.startsWith("watercolor-") ? (
            <WatercolorStudioPanel
              accent={accent}
              background={background}
              shader={shader}
              shaderColor1={shaderColor1}
              shaderColor2={shaderColor2}
              shaderColor3={shaderColor3}
              shaderDetail={shaderDetail}
              shaderIntensity={shaderIntensity}
              shaderScale={shaderScale}
              shaderSoftness={shaderSoftness}
              shaderSpeed={shaderSpeed}
              updateActiveSlideStyle={updateActiveSlideStyle}
            />
          ) : (
            <StandardShaderControls
              accent={accent}
              background={background}
              shaderColor1={shaderColor1}
              shaderColor2={shaderColor2}
              shaderColor3={shaderColor3}
              shaderDetail={shaderDetail}
              shaderIntensity={shaderIntensity}
              shaderScale={shaderScale}
              shaderSoftness={shaderSoftness}
              shaderSpeed={shaderSpeed}
              updateActiveSlideStyle={updateActiveSlideStyle}
            />
          )}
        </>
      ) : null}
    </AccordionSection>
  );
}

function ShaderEngineIntro() {
  return (
    <div className="p-1.5 rounded-[1.25rem] border border-white/[0.03] bg-[#0A0A0C]/50 shadow-[0_4px_24px_rgba(0,0,0,0.15)] backdrop-blur-xl group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8ea5ff]/5 to-transparent opacity-50" />
      <div className="p-3.5 rounded-[1rem] bg-black/40 border border-white/[0.03] flex items-start gap-3.5 relative z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8ea5ff]/10 text-[#8ea5ff] border border-[#8ea5ff]/20 shadow-[0_0_12px_rgba(142,165,255,0.15)]">
          <Sparkles size={12} className="animate-pulse" />
        </div>
        <div className="flex flex-col gap-1.5 pt-0.5">
          <span className="text-[10px] font-bold text-neutral-200 uppercase tracking-[0.16em] flex items-center gap-2">
            GPU Engine
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono tracking-wider">
              <Cpu size={8} />
              THREE.JS
            </span>
          </span>
          <span className="text-[9.5px] text-neutral-400/90 leading-relaxed font-medium">
            Refined Three.js shader presets export to interactive WebGL canvases.
          </span>
        </div>
      </div>
    </div>
  );
}

function StandardShaderControls({
  accent,
  background,
  shaderColor1,
  shaderColor2,
  shaderColor3,
  shaderDetail,
  shaderIntensity,
  shaderScale,
  shaderSoftness,
  shaderSpeed,
  updateActiveSlideStyle
}: Omit<ShaderBackgroundSectionProps, "shader" | "shaderEngine">) {
  return (
    <>
      <div className="p-1.5 rounded-[1.25rem] border border-white/[0.03] bg-[#0A0A0C]/50 shadow-[0_4px_24px_rgba(0,0,0,0.15)] backdrop-blur-xl">
        <div className="rounded-[1rem] border border-white/[0.03] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.03] px-3.5 py-3 bg-white/[0.01]">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                <Palette size={10} />
              </span>
              Background Studio
            </span>
            <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[9px] font-mono tracking-wider text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              THREE
            </span>
          </div>

          <div className="flex flex-col gap-4 px-3.5 py-4">
            <ColorRow
              fallback="#120f17"
              label="Canvas BG"
              onChange={(value) => updateActiveSlideStyle({ background: value })}
              value={background}
            />

            <div className="flex flex-col gap-2.5">
              <div className="pb-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Color Stops</span>
              </div>
              {shaderColorKeys.map((key, index) => {
                const value = key === "shaderColor1" ? shaderColor1 : key === "shaderColor2" ? shaderColor2 : shaderColor3;
                const fallback = key === "shaderColor1" ? (accent || "#7c3aed") : key === "shaderColor2" ? (background || "#120f17") : "#06b6d4";

                return (
                  <ColorRow
                    fallback={fallback}
                    key={key}
                    label={shaderColorNames[index]}
                    onChange={(color) => updateActiveSlideStyle({ [key]: color })}
                    value={value}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        <ShaderRangeControl
          ariaLabel="Shader intensity"
          badge={shaderIntensity.toFixed(2)}
          icon={Zap}
          label="Amplitude"
          max="1"
          min="0.05"
          onChange={(value) => updateActiveSlideStyle({ shaderIntensity: value })}
          step="0.05"
          value={shaderIntensity}
        />
        <ShaderRangeControl
          ariaLabel="Shader softness"
          badge={shaderSoftness.toFixed(2)}
          icon={Droplets}
          label="Blend"
          max="1"
          min="0"
          onChange={(value) => updateActiveSlideStyle({ shaderSoftness: value })}
          step="0.05"
          value={shaderSoftness}
        />
        <ShaderRangeControl
          ariaLabel="Shader speed"
          badge={shaderSpeed.toFixed(2)}
          icon={Gauge}
          label="Drift"
          max="3"
          min="0.1"
          onChange={(value) => updateActiveSlideStyle({ shaderSpeed: value })}
          step="0.1"
          value={shaderSpeed}
        />
        <ShaderRangeControl
          ariaLabel="Shader scale"
          badge={shaderScale.toFixed(2)}
          icon={Maximize2}
          label="Spread"
          max="2"
          min="0.1"
          onChange={(value) => updateActiveSlideStyle({ shaderScale: value })}
          step="0.05"
          value={shaderScale}
        />
        <ShaderRangeControl
          ariaLabel="Shader detail"
          badge={shaderDetail.toFixed(2)}
          icon={Layers}
          label="Texture"
          max="1"
          min="0.1"
          onChange={(value) => updateActiveSlideStyle({ shaderDetail: value })}
          step="0.05"
          value={shaderDetail}
        />
      </div>
    </>
  );
}

function ColorRow({
  fallback,
  label,
  onChange,
  value
}: {
  fallback: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const displayValue = value || fallback;
  const hexValue = hexColorValue(displayValue, fallback);

  return (
    <label className="group flex h-10 cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-white/[0.03] bg-white/[0.015] px-3.5 text-left transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.03]">
      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 transition-colors group-hover:text-neutral-200 shrink-0 w-18 truncate">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border border-white/[0.15] shadow-md transition-transform duration-300 group-hover:scale-110"
          style={{ background: displayValue }}
        >
          <input
            aria-label={`${label} color`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(event) => onChange(event.target.value)}
            type="color"
            value={hexValue}
          />
        </span>
        <span className="w-16 shrink-0 rounded-lg border border-white/[0.04] bg-black/40 py-0.5 text-center font-mono text-[9px] font-semibold tracking-wider text-neutral-400 transition-colors group-hover:border-white/[0.1] group-hover:text-neutral-200">
          {hexValue}
        </span>
      </div>
    </label>
  );
}

function hexColorValue(value: string, fallback: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(fallback)) {
    return fallback;
  }

  return "#7c3aed";
}

function shaderPresetUpdates(presetId: string): PropRecord {
  return {
    ...(shaderPresetDefaults[presetId] ?? {}),
    shader: presetId,
    shaderEngine: "three"
  };
}

function emptyShaderUpdates(): PropRecord {
  return {
    shader: "",
    shaderColor1: "",
    shaderColor2: "",
    shaderColor3: "",
    shaderDetail: "",
    shaderEngine: "",
    shaderIntensity: "",
    shaderScale: "",
    shaderSoftness: "",
    shaderSpeed: ""
  };
}
