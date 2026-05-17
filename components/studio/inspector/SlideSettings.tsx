"use client";

import { ColorInput, Field, NativeSelect, NumberInput, OptionButtons, type PropRecord } from "@/components/studio/inspector/InspectorControls";
import { cardFlowOptions, stylePresets } from "@/components/studio/studioOptions";

export function SlideSettings({
  accent,
  alignX,
  alignY,
  background,
  cardFlow,
  duration,
  layout,
  metricFlow,
  textAlign,
  theme,
  updateActiveSlideStyle
}: {
  accent: string;
  alignX: string;
  alignY: string;
  background: string;
  cardFlow: string;
  duration: number;
  layout: string;
  metricFlow: string;
  textAlign: string;
  theme: string;
  updateActiveSlideStyle: (updates: PropRecord) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Global Settings</h3>

      <Field label="Layout">
        <NativeSelect
          onChange={(value) => updateActiveSlideStyle({ layout: value })}
          options={[
            { label: "Default (Centered)", value: "default" },
            { label: "Split Left (Text Left, Image Right)", value: "split-left" },
            { label: "Split Right (Image Left, Text Right)", value: "split-right" }
          ]}
          value={layout}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Horizontal">
          <NativeSelect
            onChange={(value) => updateActiveSlideStyle({ alignX: value })}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
              { label: "Stretch", value: "stretch" }
            ]}
            value={alignX}
          />
        </Field>
        <Field label="Vertical">
          <NativeSelect
            onChange={(value) => updateActiveSlideStyle({ alignY: value })}
            options={[
              { label: "Top", value: "top" },
              { label: "Center", value: "center" },
              { label: "Bottom", value: "bottom" }
            ]}
            value={alignY}
          />
        </Field>
      </div>

      <OptionButtons
        label="Text align"
        options={[
          { label: "left", value: "left" },
          { label: "center", value: "center" },
          { label: "right", value: "right" }
        ]}
        value={textAlign}
        onChange={(value) => updateActiveSlideStyle({ textAlign: value })}
      />
      <OptionButtons label="Card group" options={cardFlowOptions} value={cardFlow} onChange={(value) => updateActiveSlideStyle({ cardFlow: value })} />
      <OptionButtons label="Metric group" options={cardFlowOptions} value={metricFlow} onChange={(value) => updateActiveSlideStyle({ metricFlow: value })} />

      <Field label="Theme">
        <div className="grid grid-cols-2 gap-2">
          {stylePresets.map((preset) => (
            <button
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] font-medium transition-all ${
                theme === preset.theme
                  ? "border-neutral-500 bg-neutral-800 text-white"
                  : "border-neutral-800 bg-transparent text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
              }`}
              key={preset.id}
              onClick={() => updateActiveSlideStyle({ accent: preset.accent, background: preset.background, theme: preset.theme })}
              type="button"
            >
              <div className="h-2.5 w-2.5 rounded-sm border border-neutral-700" style={{ background: preset.background }} />
              {preset.name}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Duration">
        <NumberInput
          min="0.5"
          onChange={(value) => updateActiveSlideStyle({ duration: value || 5 })}
          step="0.5"
          suffix="s"
          value={duration}
        />
      </Field>

      <div className="flex gap-2">
        <ColorInput label="Background" value={background} onChange={(value) => updateActiveSlideStyle({ background: value })} />
        <ColorInput label="Accent" value={accent} onChange={(value) => updateActiveSlideStyle({ accent: value })} />
      </div>
    </div>
  );
}
