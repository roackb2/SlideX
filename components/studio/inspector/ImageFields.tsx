"use client";

import { Image as ImageIcon } from "lucide-react";
import { Field, NativeSelect, OptionButtons, TextInput, type BlockFieldProps } from "@/components/studio/inspector/InspectorControls";
import { imageFitOptions, imageModeOptions } from "@/components/studio/studioOptions";

export function ImageFields({
  block,
  selectedBlockIndex,
  updateBlock,
  uploadImageForBlock
}: BlockFieldProps & {
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  return (
    <>
      <label className="flex cursor-pointer flex-col gap-2 rounded-md border border-dashed border-neutral-700 bg-neutral-900/40 px-3 py-3 text-[11px] text-neutral-300 transition-colors hover:border-neutral-500 hover:bg-neutral-900">
        <span className="flex items-center gap-2 font-medium text-white">
          <ImageIcon size={13} />
          Upload local image
        </span>
        <span className="text-[10px] leading-relaxed text-neutral-400">Stored inside this local MDX document.</span>
        <input
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            uploadImageForBlock(selectedBlockIndex, event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
          type="file"
        />
      </label>
      <TextInput label="Image URL" placeholder="https://..." value={block.props.src ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, src: value })} />
      <TextInput label="Alt Text" placeholder="Image description" value={block.props.alt ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, alt: value })} />
      <Field label="Image fit">
        <NativeSelect options={imageFitOptions.map((fit) => ({ label: fit, value: fit }))} value={String(block.props.fit ?? "cover")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, fit: value })} />
      </Field>
      <OptionButtons label="Image mode" options={imageModeOptions} value={String(block.props.full ?? "false")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, full: value })} />
    </>
  );
}
