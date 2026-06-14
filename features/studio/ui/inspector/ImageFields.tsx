"use client";

import { Image as ImageIcon, Link2, Upload, Maximize, Minimize, StretchHorizontal, Shrink } from "lucide-react";
import { Field, NativeSelect, OptionButtons, TextInput, IconSegmentedControl, type BlockFieldProps } from "@/features/studio/ui/inspector/InspectorControls";
import { imageFitOptions, imageModeOptions } from "@/features/studio/ui/studioOptions";

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
      <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#8b5cf6]/30 bg-[#090713]/70 px-3 py-3 text-left transition hover:border-[#a78bfa]/55 hover:bg-[#120d24]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/40 text-[#c4b5fd]">
          <Upload size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-white">Import image file</span>
          <span className="block truncate text-[10px] text-neutral-500">Stored inside this local MDX document</span>
        </span>
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
      <div className="grid grid-cols-[34px_1fr] items-end gap-2">
        <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-black/35 text-[#c4b5fd]">
          <Link2 size={15} />
        </span>
        <TextInput label="Image URL" placeholder="https://..." value={block.props.src ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, src: value })} />
      </div>
      <div className="grid grid-cols-[34px_1fr] items-end gap-2">
        <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-black/35 text-[#c4b5fd]">
          <ImageIcon size={15} />
        </span>
        <TextInput label="Alt Text" placeholder="Image description" value={block.props.alt ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, alt: value })} />
      </div>
      <IconSegmentedControl
        label="Image fit"
        options={[
          { label: "cover", value: "cover", icon: <Maximize size={14} /> },
          { label: "contain", value: "contain", icon: <Minimize size={14} /> },
          { label: "fill", value: "fill", icon: <StretchHorizontal size={14} /> },
          { label: "scale-down", value: "scale-down", icon: <Shrink size={14} /> },
        ]}
        value={String(block.props.fit ?? "cover")}
        onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, fit: value })}
      />
      <OptionButtons label="Image mode" options={imageModeOptions} value={String(block.props.full ?? "false")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, full: value })} />
    </>
  );
}
