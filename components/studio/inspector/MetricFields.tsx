"use client";

import { OptionButtons, TextAreaField, TextInput, type BlockFieldProps } from "@/components/studio/inspector/InspectorControls";
import { cardWidthOptions } from "@/components/studio/studioOptions";

export function MetricFields({ block, selectedBlockIndex, updateBlock }: BlockFieldProps) {
  return (
    <>
      <OptionButtons label="Metric width" options={cardWidthOptions} value={String(block.props.width ?? "sm")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, width: value })} />
      <TextInput label="Label" placeholder="Metric label" value={block.props.label ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, label: value })} />
      <TextInput label="Value" placeholder="72%" value={block.props.value ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, value })} />
      <TextAreaField label="Caption" placeholder="Short context" rows={3} value={block.props.caption ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, caption: value })} />
    </>
  );
}
