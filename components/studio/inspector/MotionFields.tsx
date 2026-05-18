"use client";

import { Field, NativeSelect, NumberInput, OptionButtons, type BlockFieldProps } from "@/components/studio/inspector/InspectorControls";

export function MotionFields({
  block,
  isTextType,
  selectedBlockIndex,
  textValue,
  updateBlock
}: BlockFieldProps & {
  isTextType: boolean;
  textValue: string;
}) {
  const updateProps = (nextProps: typeof block.props) => {
    updateBlock(selectedBlockIndex, nextProps, isTextType ? textValue : undefined);
  };
  const applySizePreset = (value: string) => {
    const preset = sizePresetForBlock(block.type, value);
    updateProps({ ...block.props, h: preset.h, w: preset.w });
  };

  return (
    <>
      <OptionButtons
        label="Size preset"
        onChange={applySizePreset}
        options={[
          { label: "S", value: "compact" },
          { label: "M", value: "standard" },
          { label: "Wide", value: "wide" },
          { label: "Fill", value: "fill" }
        ]}
        value=""
      />
      <div className="grid grid-cols-2 gap-2">
        <Field label="X">
          <NumberInput min="0" max="100" onChange={(value) => updateProps({ ...block.props, x: value })} placeholder="10" step="0.5" suffix="%" value={block.props.x ?? ""} />
        </Field>
        <Field label="Y">
          <NumberInput min="0" max="100" onChange={(value) => updateProps({ ...block.props, y: value })} placeholder="20" step="0.5" suffix="%" value={block.props.y ?? ""} />
        </Field>
        <Field label="Width">
          <NumberInput min="8" max="100" onChange={(value) => updateProps({ ...block.props, w: value })} placeholder="42" step="0.5" suffix="%" value={block.props.w ?? ""} />
        </Field>
        <Field label="Height">
          <NumberInput min="6" max="100" onChange={(value) => updateProps({ ...block.props, h: value })} placeholder="18" step="0.5" suffix="%" value={block.props.h ?? ""} />
        </Field>
      </div>
      {isTextType && (
        <Field label="Font size">
          <NumberInput min="8" max="180" onChange={(value) => updateProps({ ...block.props, fontSize: value || "" })} placeholder={block.type === "Title" ? "72" : "24"} step="1" suffix="px" value={block.props.fontSize ?? ""} />
        </Field>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Field label="Delay">
          <NumberInput min="0" onChange={(value) => updateProps({ ...block.props, delay: value })} placeholder="0" step="0.1" suffix="s" value={block.props.delay ?? ""} />
        </Field>
        <Field label="Duration">
          <NumberInput min="0.1" onChange={(value) => updateProps({ ...block.props, duration: value || "" })} placeholder="0.6" step="0.1" suffix="s" value={block.props.duration ?? ""} />
        </Field>
      </div>
      <Field label="Bottom spacing">
        <NumberInput
          min="0"
          onChange={(value) => {
            const { marginBottom, mb, ...nextProps } = block.props;
            void marginBottom;
            void mb;
            updateProps({ ...nextProps, mb: value || "" });
          }}
          placeholder="18"
          step="1"
          value={block.props.marginBottom ?? block.props.mb ?? ""}
        />
      </Field>
      <Field label="Animation">
        <NativeSelect
          onChange={(value) => updateProps({ ...block.props, enter: value })}
          options={[
            { label: "None", value: "" },
            { label: "Fade Up", value: "fadeUp" },
            { label: "Fade In", value: "fadeIn" },
            { label: "Zoom In", value: "zoomIn" },
            { label: "Slide Left", value: "slideLeft" }
          ]}
          value={String(block.props.enter ?? "")}
        />
      </Field>
    </>
  );
}

const sizePresets: Record<string, { h: number; w: number }> = {
  compact: { h: 24, w: 32 },
  fill: { h: 72, w: 84 },
  standard: { h: 32, w: 40 },
  wide: { h: 38, w: 68 }
};

const metricSizePresets: Record<string, { h: number; w: number }> = {
  compact: { h: 30, w: 32 },
  fill: { h: 72, w: 84 },
  standard: { h: 36, w: 40 },
  wide: { h: 42, w: 68 }
};

function sizePresetForBlock(type: string, value: string) {
  const presets = type === "Metric" ? metricSizePresets : sizePresets;

  return presets[value] ?? presets.standard;
}
