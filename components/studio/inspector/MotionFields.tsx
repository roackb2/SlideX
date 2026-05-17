"use client";

import { Field, NativeSelect, NumberInput, type BlockFieldProps } from "@/components/studio/inspector/InspectorControls";

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
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Delay">
          <NumberInput min="0" onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, delay: value }, isTextType ? textValue : undefined)} placeholder="0" step="0.1" suffix="s" value={block.props.delay ?? ""} />
        </Field>
        <Field label="Duration">
          <NumberInput min="0.1" onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, duration: value || "" }, isTextType ? textValue : undefined)} placeholder="0.6" step="0.1" suffix="s" value={block.props.duration ?? ""} />
        </Field>
      </div>
      <Field label="Bottom spacing">
        <NumberInput
          min="0"
          onChange={(value) => {
            const { marginBottom, mb, ...nextProps } = block.props;
            void marginBottom;
            void mb;
            updateBlock(selectedBlockIndex, { ...nextProps, mb: value || "" }, isTextType ? textValue : undefined);
          }}
          placeholder="18"
          step="1"
          value={block.props.marginBottom ?? block.props.mb ?? ""}
        />
      </Field>
      <Field label="Animation">
        <NativeSelect
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, enter: value }, isTextType ? textValue : undefined)}
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
