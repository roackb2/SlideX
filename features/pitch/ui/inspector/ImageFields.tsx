"use client";

import { ImagePlus, Maximize, Minimize, RefreshCcw, Shrink, StretchHorizontal, Upload } from "lucide-react";
import { useState } from "react";
import { omitMotionDocProps } from "@/core/motion-doc/application/motionDocProps";
import {
  Field,
  IconSegmentedControl,
  NumberInput,
  TextInput,
  type BlockFieldProps
} from "@/features/pitch/ui/inspector/InspectorControls";
import { ImageFilterSection } from "@/features/pitch/ui/inspector/image/ImageFilterSection";

export function ImageFields({
  block,
  importImageUrlForBlock,
  selectedBlockIndex,
  updateBlock,
  uploadImageForBlock
}: BlockFieldProps & {
  importImageUrlForBlock: (blockIndex: number, source: string) => void;
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  const hasImage = Boolean(block.props.src);
  const externalImageSource = externalSource(block.props.sourceUrl ?? block.props.src);

  function commitImageUrl(value: string) {
    const source = value.trim();
    if (source === externalImageSource) return;
    if (!source) {
      const imageProps = omitMotionDocProps(block.props, ["sourceUrl"]);
      updateBlock(selectedBlockIndex, { ...imageProps, src: "" });
      return;
    }
    importImageUrlForBlock(selectedBlockIndex, source);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Visual Image Uploader/Preview Area */}
      <Field label="Content">
        <div className="group relative flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-neutral-900/50 transition-all hover:border-white/20">
          {hasImage ? (
            <>
              {/* Note: since it might be a local path or external URL, we just show a generic preview or the actual image if possible */}
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-50 transition-opacity group-hover:opacity-30"
                decoding="async"
                loading="lazy"
                src={String(block.props.src)}
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

      <CommittedImageUrlInput
        key={`${selectedBlockIndex}-${externalImageSource}`}
        onCommit={commitImageUrl}
        value={externalImageSource}
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

      <Field label="Image scale">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
          <NumberInput
            min="0.1"
            max="4"
            onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, scaleX: value === "" ? 1 : value })}
            prefix={<span className="text-[9px] font-semibold text-neutral-500">X</span>}
            step="0.05"
            suffix="×"
            value={block.props.scaleX ?? 1}
          />
          <NumberInput
            min="0.1"
            max="4"
            onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, scaleY: value === "" ? 1 : value })}
            prefix={<span className="text-[9px] font-semibold text-neutral-500">Y</span>}
            step="0.05"
            suffix="×"
            value={block.props.scaleY ?? 1}
          />
          <button
            aria-label="Reset image scale"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.055] bg-[#18181b] text-neutral-500 transition-all hover:border-white/10 hover:bg-white/[0.06] hover:text-white active:scale-95"
            onClick={() => updateBlock(selectedBlockIndex, { ...block.props, scaleX: 1, scaleY: 1 })}
            title="Reset image scale"
            type="button"
          >
            <RefreshCcw size={13} />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] leading-relaxed text-neutral-600">Scale the image content without changing its frame.</p>
      </Field>

      <ImageFilterSection
        onChange={(updates, options) => updateBlock(selectedBlockIndex, { ...block.props, ...updates }, undefined, options)}
        props={block.props}
      />
      <p className="-mt-2 text-[10px] leading-relaxed text-neutral-600">Fit and scale reset are also available directly on the selected image frame.</p>
    </div>
  );
}

function CommittedImageUrlInput({ onCommit, value }: { onCommit: (value: string) => void; value: string }) {
  const [draft, setDraft] = useState(value);

  return (
    <Field label="Image URL">
      <input
        className="h-9 w-full rounded-xl border border-white/[0.055] bg-[#18181b] px-3 text-[12px] text-neutral-200 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-[border-color,background-color,box-shadow] placeholder:text-neutral-600 hover:border-white/[0.09] hover:bg-[#1b1b1e] focus:border-violet-300/35 focus:bg-[#1d1d20] focus:ring-2 focus:ring-violet-400/10"
        onBlur={(event) => onCommit(event.currentTarget.value)}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            setDraft(value);
            event.currentTarget.blur();
          }
        }}
        placeholder="https://..."
        type="url"
        value={draft}
      />
      <p className="text-[10px] leading-relaxed text-neutral-600">Imported on Enter or when the field loses focus.</p>
    </Field>
  );
}

function externalSource(value: string | number | undefined) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim()) ? value.trim() : "";
}
