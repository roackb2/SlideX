"use client";

import { stringValue } from "@/common/util/valueUtils";
import { IconPicker } from "@/features/studio/ui/IconPicker";
import { ColorControl, Field, NumberInput, type BlockFieldProps } from "@/features/studio/ui/inspector/InspectorControls";

export function IconFields({ block, selectedBlockIndex, updateBlock }: BlockFieldProps) {
  return (
    <>
      <IconPicker value={stringValue(block.props.icon) ?? ""} onChange={(icon) => updateBlock(selectedBlockIndex, { ...block.props, icon })} />
      <Field label="Icon size">
        <NumberInput
          max="240"
          min="16"
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, size: value === "" ? "" : value })}
          placeholder="112"
          step="4"
          suffix="px"
          value={block.props.size ?? ""}
        />
      </Field>
      <Field label="Stroke width">
        <NumberInput
          max="6"
          min="0.5"
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, strokeWidth: value === "" ? "" : value })}
          placeholder="2"
          step="0.25"
          value={block.props.strokeWidth ?? ""}
        />
      </Field>
      <ColorControl label="Color" placeholder="#ffffff" value={block.props.color ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, color: value })} />
    </>
  );
}
