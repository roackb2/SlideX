"use client";

import { Droplets, Gauge, Layers, Maximize2, Sparkles, Zap } from "lucide-react";
import type { PropRecord } from "@/features/pitch/application/themeColors";
import { shaderPresets } from "@/core/motion-doc/presets/shaderPresets";
import { Field } from "@/features/pitch/ui/inspector/InspectorControls";
import { AccordionSection } from "@/features/pitch/ui/inspector/controls/AccordionSection";
import { ShaderRangeControl } from "@/features/pitch/ui/inspector/shader/ShaderRangeControl";
import { WatercolorPitchPanel } from "@/features/pitch/ui/inspector/shader/WatercolorPitchPanel";

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

export function ShaderBackgroundSection(props: ShaderBackgroundSectionProps) {
  return (
    <AccordionSection title="Shader Background" icon={<Sparkles size={13} className="text-[#8ea5ff]" />} defaultOpen>
      <ShaderBackgroundSectionContent {...props} />
    </AccordionSection>
  );
}

export function ShaderBackgroundSectionContent({
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
    <div className="flex flex-col gap-4">


      <Field label="Shader Preset">
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`group relative overflow-hidden rounded-lg aspect-[16/10] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 ${
              !shader
                ? "bg-white/[0.15] ring-2 ring-white/[0.4] text-white"
                : "bg-white/[0.04] ring-1 ring-white/[0.08] text-neutral-500 hover:bg-white/[0.08] hover:text-neutral-300 hover:ring-white/[0.15]"
            }`}
            onClick={() => updateActiveSlideStyle(emptyShaderUpdates())}
            type="button"
          >
            <span className="text-[11px] font-medium">None</span>
          </button>

          {shaderPresets.map((preset) => {
            const isActive = shader === preset.id;
            return (
              <button
                className={`group relative overflow-hidden rounded-lg aspect-[16/10] text-left transition-all duration-300 cursor-pointer active:scale-95 ${
                  isActive
                    ? "ring-2 ring-white/[0.4]"
                    : "ring-1 ring-white/[0.08] hover:ring-white/[0.15]"
                }`}
                key={preset.id}
                onClick={() => updateActiveSlideStyle(shaderPresetUpdates(preset.id))}
                type="button"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ background: preset.thumbnail }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />

                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[11px] font-medium text-white/90 truncate block group-hover:translate-x-0.5 transition-transform duration-300">
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
            <WatercolorPitchPanel
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
      <div className="flex flex-col gap-4">
        {/* Colors Section */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <ColorRow
              fallback="#120f17"
              label="Canvas BG"
              onChange={(value) => updateActiveSlideStyle({ background: value })}
              value={background}
            />

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

        <div className="h-[1px] w-full bg-white/[0.06]" />

        {/* Sliders Section */}
        <div className="grid grid-cols-1 gap-1">
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
    <label className="group flex h-8 cursor-pointer items-center justify-between gap-3 text-left">
      <span className="text-[12px] font-medium text-neutral-400 group-hover:text-neutral-300 transition-colors shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[11px] text-neutral-500 group-hover:text-neutral-400 transition-colors">
          {hexValue}
        </span>
        <span
          className="relative h-4 w-4 shrink-0 overflow-hidden rounded border border-white/[0.15] transition-transform duration-300 group-hover:scale-110"
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
