"use client";

import {
  emptyImageFilterUpdates,
  getPaperImageFilterDefinition,
  getPaperImageFilterPresetParams,
  paperImageFilterDefinitions,
  paperImageFilterPresetUpdates,
  resolvePaperImageFilterControlValue,
  type ImageFilterPropRecord,
  type PaperImageFilterControl,
  type PaperImageFilterId
} from "@/core/motion-doc/application/shaders/paperImageFilterCatalog";
import { Field, NativeSelect } from "@/features/pitch/ui/inspector/InspectorControls";
import { ShaderRangeControl } from "@/features/pitch/ui/inspector/shader/ShaderRangeControl";
import type { BlockUpdateOptions } from "@/features/pitch/ui/pitchCommandTypes";

type ImageFilterSelectValue = PaperImageFilterId | "none";

type ImageFilterSectionProps = {
  onChange: (updates: ImageFilterPropRecord, options?: BlockUpdateOptions) => void;
  props: Record<string, string | number>;
};

export function ImageFilterSection({ onChange, props }: ImageFilterSectionProps) {
  const activeFilterDefinition = getPaperImageFilterDefinition(String(props.filter ?? ""));
  const activeFilterValue = (activeFilterDefinition?.id ?? "none") as ImageFilterSelectValue;
  const activePresetName =
    activeFilterDefinition?.presets.some((preset) => preset.name === props.filterPreset)
      ? String(props.filterPreset)
      : activeFilterDefinition?.defaultPreset ?? "";
  const activePresetParams = getPaperImageFilterPresetParams(activeFilterDefinition?.id, activePresetName);

  return (
    <>
      <Field label="Paper Filter">
        <NativeSelect<ImageFilterSelectValue>
          onChange={(value) => {
            onChange(value === "none" ? emptyImageFilterUpdates() : paperImageFilterPresetUpdates(value));
          }}
          options={[
            { label: "None", value: "none" },
            ...paperImageFilterDefinitions.map((definition) => ({
              label: definition.name,
              value: definition.id
            }))
          ]}
          value={activeFilterValue}
        />
      </Field>

      {activeFilterDefinition ? (
        <div className="flex flex-col gap-4 rounded-lg border border-white/[0.06] bg-white/[0.025] p-3">
          <div className="overflow-hidden rounded-md border border-white/[0.06] bg-black/20">
            <div className="h-14" style={{ background: activeFilterDefinition.thumbnail }} />
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="truncate text-[12px] font-semibold text-neutral-200">
                {activeFilterDefinition.name}
              </span>
              <span className="shrink-0 rounded-md border border-white/[0.07] bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Paper
              </span>
            </div>
          </div>

          <Field label="Filter Preset">
            <NativeSelect
              onChange={(value) => onChange(paperImageFilterPresetUpdates(activeFilterDefinition.id, value))}
              options={activeFilterDefinition.presets.map((preset) => ({
                label: preset.name,
                value: preset.name
              }))}
              value={activePresetName}
            />
          </Field>

          <div className="grid grid-cols-1 gap-1">
            {activeFilterDefinition.controls.map((control) => {
              const value = resolvePaperImageFilterControlValue(
                activeFilterDefinition,
                activePresetParams,
                control.key,
                props[control.key]
              );

              return (
                <ShaderRangeControl
                  ariaLabel={`Image filter ${control.label}`}
                  badge={formatFilterControlBadge(value, control)}
                  key={control.key}
                  label={control.label}
                  max={String(control.max)}
                  min={String(control.min)}
                  onChange={(nextValue) => onChange({ [control.key]: nextValue }, { transient: true })}
                  step={String(control.step)}
                  value={value}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatFilterControlBadge(value: number, control: PaperImageFilterControl) {
  if (control.key === "filterAngle") {
    return `${Math.round(value)} deg`;
  }

  if (control.format === "integer") {
    return String(Math.round(value));
  }

  return value.toFixed(value >= 10 ? 1 : 2);
}
