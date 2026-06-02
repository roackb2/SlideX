"use client";

import { Field, NumberInput, TextInput, type BlockFieldProps } from "@/features/studio/ui/inspector/InspectorControls";

export function ChartFields({ block, selectedBlockIndex, updateBlock }: BlockFieldProps) {
  return (
    <>
      <Field label="Chart height">
        <NumberInput
          max="320"
          min="80"
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, height: value === "" ? "" : value })}
          placeholder="144"
          step="8"
          suffix="px"
          value={block.props.height ?? ""}
        />
      </Field>
      <TextInput label="Title" placeholder="Chart title" value={block.props.title ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, title: value })} />
      <TextInput label="Labels" placeholder="Q1,Q2,Q3,Q4" value={block.props.labels ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, labels: value })} />
      <TextInput label="Values" placeholder="42,58,73,91" value={block.props.values ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, values: value })} />
    </>
  );
}
