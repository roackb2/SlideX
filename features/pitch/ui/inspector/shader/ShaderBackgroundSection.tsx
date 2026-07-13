"use client";

import { Sparkles } from "lucide-react";
import {
  PAPER_SHADER_COLOR_KEYS,
  type PaperShaderControl,
  type PaperShaderControlKey,
  getPaperShaderDefinition,
  paperShaderDefinitions,
  paperShaderPresetUpdates
} from "@/core/motion-doc/application/shaders/paperShaderCatalog";
import type { PropRecord } from "@/features/pitch/application/themeColors";
import { Field } from "@/features/pitch/ui/inspector/InspectorControls";
import { AccordionSection } from "@/features/pitch/ui/inspector/controls/AccordionSection";
import { ShaderRangeControl } from "@/features/pitch/ui/inspector/shader/ShaderRangeControl";

type ShaderBackgroundSectionProps = {
  accent: string;
  background: string;
  shader: string;
  shaderAngle: number;
  shaderColor1: string;
  shaderColor2: string;
  shaderColor3: string;
  shaderColor4: string;
  shaderColor5: string;
  shaderColor6: string;
  shaderDetail: number;
  shaderEngine: string;
  shaderIntensity: number;
  shaderPreset: string;
  shaderScale: number;
  shaderSoftness: number;
  shaderSpeed: number;
  updateActiveSlideStyle: (updates: PropRecord) => void;
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
  shaderAngle,
  shaderColor1,
  shaderColor2,
  shaderColor3,
  shaderColor4,
  shaderColor5,
  shaderColor6,
  shaderDetail,
  shaderIntensity,
  shaderPreset,
  shaderScale,
  shaderSoftness,
  shaderSpeed,
  updateActiveSlideStyle
}: ShaderBackgroundSectionProps) {
  const definition = getPaperShaderDefinition(shader);
  const activeShaderId = definition?.id ?? "";
  const activePreset = definition?.presets.find((preset) => preset.name === shaderPreset) ?? definition?.presets[0];

  return (
    <div className="flex flex-col gap-4">
      <Field label="Paper Shader">
        <select
          className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#08080a] px-3 text-[13px] font-medium text-neutral-200 outline-none transition focus:border-[#8ea5ff]/60"
          onChange={(event) => {
            const nextShader = event.target.value;
            updateActiveSlideStyle(nextShader ? paperShaderPresetUpdates(nextShader) : emptyShaderUpdates());
          }}
          value={activeShaderId}
        >
          <option value="">None</option>
          {paperShaderDefinitions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </Field>

      {definition ? (
        <>
          <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.025]">
            <div className="h-16" style={{ background: definition.thumbnail }} />
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="truncate text-[12px] font-semibold text-neutral-200">{definition.name}</span>
              <span className="shrink-0 rounded-md border border-white/[0.07] bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Paper
              </span>
            </div>
          </div>

          <Field label="Paper Preset">
            <select
              className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#08080a] px-3 text-[13px] font-medium text-neutral-200 outline-none transition focus:border-[#8ea5ff]/60"
              onChange={(event) => updateActiveSlideStyle(paperShaderPresetUpdates(definition.id, event.target.value))}
              value={activePreset?.name ?? definition.defaultPreset}
            >
              {definition.presets.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
          </Field>

          <PaperShaderControls
            accent={accent}
            background={background}
            controls={definition.controls}
            colorLabels={definition.colorLabels}
            visibleColorCount={definition.visibleColorCount}
            shaderAngle={shaderAngle}
            shaderColor1={shaderColor1}
            shaderColor2={shaderColor2}
            shaderColor3={shaderColor3}
            shaderColor4={shaderColor4}
            shaderColor5={shaderColor5}
            shaderColor6={shaderColor6}
            shaderDetail={shaderDetail}
            shaderIntensity={shaderIntensity}
            shaderScale={shaderScale}
            shaderSoftness={shaderSoftness}
            shaderSpeed={shaderSpeed}
            updateActiveSlideStyle={updateActiveSlideStyle}
          />
        </>
      ) : null}
    </div>
  );
}

function PaperShaderControls({
  accent,
  background,
  colorLabels,
  controls,
  shaderAngle,
  shaderColor1,
  shaderColor2,
  shaderColor3,
  shaderColor4,
  shaderColor5,
  shaderColor6,
  shaderDetail,
  shaderIntensity,
  shaderScale,
  shaderSoftness,
  shaderSpeed,
  updateActiveSlideStyle,
  visibleColorCount
}: Omit<ShaderBackgroundSectionProps, "shader" | "shaderEngine" | "shaderPreset"> & {
  colorLabels: readonly [string, string, string, string, string, string];
  controls: readonly PaperShaderControl[];
  visibleColorCount?: number;
}) {
  const shaderColors = {
    shaderColor1,
    shaderColor2,
    shaderColor3,
    shaderColor4,
    shaderColor5,
    shaderColor6
  };
  const controlValues: Record<PaperShaderControlKey, number> = {
    shaderAngle,
    shaderDetail,
    shaderIntensity,
    shaderScale,
    shaderSoftness,
    shaderSpeed
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <ColorRow
          fallback="#120f17"
          label="Canvas BG"
          onChange={(value) => updateActiveSlideStyle({ background: value })}
          value={background}
        />

        {PAPER_SHADER_COLOR_KEYS.slice(0, visibleColorCount ?? PAPER_SHADER_COLOR_KEYS.length).map((key, index) => (
          <ColorRow
            fallback={shaderColorFallback(key, accent, background)}
            key={key}
            label={colorLabels[index]}
            onChange={(color) => updateActiveSlideStyle({ [key]: color })}
            value={shaderColors[key]}
          />
        ))}
      </div>

      <div className="h-[1px] w-full bg-white/[0.06]" />

      <div className="grid grid-cols-1 gap-1">
        {controls.map((control) => {
          const value = clampNumber(controlValues[control.key], control.min, control.max, control.defaultValue);

          return (
            <ShaderRangeControl
              ariaLabel={`Shader ${control.label}`}
              badge={formatControlBadge(value, control)}
              key={control.key}
              label={control.label}
              max={String(control.max)}
              min={String(control.min)}
              onChange={(nextValue) => updateActiveSlideStyle({ [control.key]: nextValue })}
              step={String(control.step)}
              value={value}
            />
          );
        })}
      </div>
    </div>
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
      <span className="shrink-0 text-[12px] font-medium text-neutral-400 transition-colors group-hover:text-neutral-300">
        {label}
      </span>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="font-mono text-[11px] text-neutral-500 transition-colors group-hover:text-neutral-400">
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

function emptyShaderUpdates(): PropRecord {
  return {
    shader: "",
    shaderAngle: "",
    shaderColor1: "",
    shaderColor2: "",
    shaderColor3: "",
    shaderColor4: "",
    shaderColor5: "",
    shaderColor6: "",
    shaderDetail: "",
    shaderEngine: "",
    shaderIntensity: "",
    shaderPreset: "",
    shaderScale: "",
    shaderSoftness: "",
    shaderSpeed: ""
  };
}

function formatControlBadge(value: number, control: PaperShaderControl) {
  if (control.key === "shaderAngle") {
    return `${Math.round(value)} deg`;
  }

  return control.format === "integer" ? String(Math.round(value)) : value.toFixed(2);
}

function clampNumber(value: number, min: number, max: number, fallback: number) {
  const safeValue = Number.isFinite(value) ? value : fallback;

  return Math.min(Math.max(safeValue, min), max);
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

function shaderColorFallback(
  key: (typeof PAPER_SHADER_COLOR_KEYS)[number],
  accent: string,
  background: string
) {
  switch (key) {
    case "shaderColor1":
      return background || "#120f17";
    case "shaderColor2":
      return accent || "#7c3aed";
    case "shaderColor3":
      return "#06b6d4";
    case "shaderColor4":
      return "#00f5d4";
    case "shaderColor5":
      return "#090514";
    case "shaderColor6":
      return "#d0bcff";
  }
}
