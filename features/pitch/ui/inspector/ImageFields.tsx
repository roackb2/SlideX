"use client";

import { Image as ImageIcon, Link2, Upload, Maximize, Minimize, StretchHorizontal, Shrink, ImagePlus } from "lucide-react";
import { Field, TextInput, IconSegmentedControl, OptionButtons, type BlockFieldProps } from "@/features/pitch/ui/inspector/InspectorControls";
import { imageFitOptions, imageModeOptions } from "@/features/pitch/ui/pitchOptions";

export function ImageFields({
  block,
  selectedBlockIndex,
  updateBlock,
  uploadImageForBlock
}: BlockFieldProps & {
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  const hasImage = Boolean(block.props.src);

  return (
    <div className="flex flex-col gap-5">
      {/* Visual Image Uploader/Preview Area */}
      <Field label="Content">
        <div className="group relative flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-neutral-900/50 transition-all hover:border-white/20">
          {hasImage ? (
            <>
              {/* Note: since it might be a local path or external URL, we just show a generic preview or the actual image if possible */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 transition-opacity group-hover:opacity-30"
                style={{ backgroundImage: `url(${block.props.src})` }}
              />
              <label className="relative z-10 flex cursor-pointer items-center gap-2 rounded-md bg-neutral-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-transform hover:scale-105 hover:bg-neutral-800">
                <Upload size={14} />
                Replace Image
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
            </>
          ) : (
            <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-neutral-500 transition-colors hover:text-neutral-300">
              <ImagePlus size={24} />
              <span className="text-xs font-medium">Upload Image</span>
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
          )}
        </div>
      </Field>

      <TextInput 
        label="Image URL" 
        placeholder="https://..." 
        value={block.props.src ?? ""} 
        onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, src: value })} 
      />

      <TextInput 
        label="Alt Text" 
        placeholder="Image description" 
        value={block.props.alt ?? ""} 
        onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, alt: value })} 
      />

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

    </div>
  );
}
