"use client";

import { Droplets, EyeOff, Gauge, Layers, Maximize2, Palette, Sparkles, Zap } from "lucide-react";
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
  shaderIntensity: number;
  shaderScale: number;
  shaderSoftness: number;
  shaderSpeed: number;
  updateActiveSlideStyle: (updates: PropRecord) => void;
};

const shaderColorKeys = ["shaderColor1", "shaderColor2", "shaderColor3"] as const;
const shaderColorNames = ["Primary", "Flow", "Highlight"] as const;

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
                ? "border-[#8ea5ff]/50 bg-white/[0.03] text-white ring-1 ring-[#8ea5ff]/20 shadow-[0_0_15px_rgba(142,165,255,0.08)]"
                : "border-white/[0.05] bg-black/40 text-neutral-500 hover:border-white/[0.12] hover:text-neutral-300"
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
                    ? "border-[#8ea5ff]/50 ring-1 ring-[#8ea5ff]/20 shadow-[0_0_15px_rgba(142,165,255,0.12)]"
                    : "border-white/[0.05] hover:border-white/[0.12]"
                }`}
                key={preset.id}
                onClick={() => updateActiveSlideStyle({ shader: preset.id })}
                type="button"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ background: preset.thumbnail }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 opacity-80 group-hover:opacity-70 transition-opacity duration-300" />

                {isActive ? (
                  <div className="absolute top-2 right-2 p-0.5 rounded-full bg-[#8ea5ff] text-black shadow-[0_0_8px_#8ea5ff]">
                    <Sparkles size={8} />
                  </div>
                ) : null}

                <div className="absolute top-2 left-2 px-1 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/[0.06] text-[7.5px] font-mono font-bold uppercase tracking-wider text-neutral-400">
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
        shader.startsWith("watercolor-") ? (
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
        )
      ) : null}
    </AccordionSection>
  );
}

function ShaderEngineIntro() {
  return (
    <div className="p-3.5 rounded-xl border border-white/[0.04] bg-neutral-950/40 backdrop-blur-md flex items-start gap-3 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#8ea5ff]/5 to-transparent opacity-30" />
      <div className="p-2 rounded-lg bg-[#8ea5ff]/10 text-[#8ea5ff] relative z-10 shrink-0">
        <Sparkles size={14} className="animate-pulse" />
      </div>
      <div className="flex flex-col gap-0.5 relative z-10">
        <span className="text-[10px] font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
          GPU Fluid Engine
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[7px] font-mono lowercase tracking-normal">
            active
          </span>
        </span>
        <span className="text-[9px] text-neutral-400 leading-relaxed">
          GPU-driven dynamic motion presets inspired by shaders.com. Generates ambient fluid textures in real-time.
        </span>
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
}: Omit<ShaderBackgroundSectionProps, "shader">) {
  return (
    <>
      <div className="p-3.5 rounded-xl border border-white/[0.04] bg-neutral-950/40 backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/[0.03] pb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Palette size={12} className="text-[#8ea5ff]" />
            Spectrum Tuning
          </span>
          <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Override active</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {shaderColorKeys.map((key, index) => {
            const value = key === "shaderColor1" ? shaderColor1 : key === "shaderColor2" ? shaderColor2 : shaderColor3;
            const fallback = key === "shaderColor1" ? (accent || "#7c3aed") : key === "shaderColor2" ? (background || "#0a0a1a") : "#06b6d4";
            const displayValue = value || fallback;
            const hexValue = /^#[0-9a-fA-F]{3,6}$/.test(displayValue) ? displayValue : "#7c3aed";

            return (
              <label className="group flex flex-col items-center gap-1.5 cursor-pointer relative" key={key}>
                <span className="text-[8.5px] font-bold text-neutral-500 group-hover:text-neutral-400 transition-colors uppercase tracking-wider text-center w-full truncate">
                  {shaderColorNames[index]}
                </span>
                <span
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] shadow-lg transition-all duration-300 group-hover:border-white/[0.2] group-hover:scale-105 group-active:scale-95 overflow-hidden"
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
                <span className="text-[8.5px] font-mono text-neutral-400 bg-white/[0.03] border border-white/[0.05] px-1.5 py-0.5 rounded uppercase group-hover:text-neutral-200 transition-colors">
                  {displayValue.slice(0, 7)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        <ShaderRangeControl
          ariaLabel="Shader intensity"
          badge={`${(shaderIntensity * 100).toFixed(0)}%`}
          icon={Zap}
          label="Emission Glow"
          max="1"
          min="0.05"
          onChange={(value) => updateActiveSlideStyle({ shaderIntensity: value })}
          step="0.05"
          value={shaderIntensity}
        />
        <ShaderRangeControl
          ariaLabel="Shader speed"
          badge={`${shaderSpeed.toFixed(1)}x`}
          icon={Gauge}
          label="Simulation Speed"
          max="3"
          min="0.1"
          onChange={(value) => updateActiveSlideStyle({ shaderSpeed: value })}
          step="0.1"
          value={shaderSpeed}
        />
        <ShaderRangeControl
          ariaLabel="Shader softness"
          badge={`${(shaderSoftness * 100).toFixed(0)}%`}
          icon={Droplets}
          label="Softness"
          max="1"
          min="0"
          onChange={(value) => updateActiveSlideStyle({ shaderSoftness: value })}
          step="0.05"
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
          value={shaderDetail}
        />
      </div>
    </>
  );
}

function emptyShaderUpdates(): PropRecord {
  return {
    shader: "",
    shaderColor1: "",
    shaderColor2: "",
    shaderColor3: "",
    shaderDetail: "",
    shaderIntensity: "",
    shaderScale: "",
    shaderSoftness: "",
    shaderSpeed: ""
  };
}
