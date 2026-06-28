"use client";

import { Link2, PlayCircle, Upload, Video, Maximize, Minimize, StretchHorizontal, Shrink } from "lucide-react";
import { OptionButtons, TextInput, IconSegmentedControl, type BlockFieldProps } from "@/features/pitch/ui/inspector/InspectorControls";
import { imageFitOptions } from "@/features/pitch/ui/pitchOptions";

const booleanOptions = [
  { label: "Off", value: "false" },
  { label: "On", value: "true" }
] as const;

export function VideoFields({
  block,
  selectedBlockIndex,
  updateBlock,
  uploadVideoForBlock
}: BlockFieldProps & {
  uploadVideoForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  return (
    <>
      <div className="grid gap-2">
        <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#8b5cf6]/30 bg-[#090713]/70 px-3 py-3 text-left transition hover:border-[#a78bfa]/55 hover:bg-[#120d24]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/40 text-[#c4b5fd]">
            <Upload size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-white">Import video file</span>
            <span className="block truncate text-[10px] text-neutral-500">MP4 / WebM saved into this MDX</span>
          </span>
          <input
            accept="video/*"
            className="sr-only"
            onChange={(event) => {
              uploadVideoForBlock(selectedBlockIndex, event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
            type="file"
          />
        </label>
        <div className="grid grid-cols-[34px_1fr] items-end gap-2">
          <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-black/35 text-[#c4b5fd]">
            {isYoutubeUrl(String(block.props.src ?? "")) ? <PlayCircle size={15} /> : <Link2 size={15} />}
          </span>
          <TextInput
            label="Video URL"
            onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, src: value })}
            placeholder="YouTube or direct video URL"
            value={block.props.src ?? ""}
          />
        </div>
      </div>
      <div className="grid grid-cols-[34px_1fr] items-end gap-2">
        <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-black/35 text-[#c4b5fd]">
          <Video size={15} />
        </span>
        <TextInput
          label="Poster"
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, poster: value })}
          placeholder="Poster image URL"
          value={block.props.poster ?? ""}
        />
      </div>
      <IconSegmentedControl
        label="Fit"
        options={[
          { label: "cover", value: "cover", icon: <Maximize size={14} /> },
          { label: "contain", value: "contain", icon: <Minimize size={14} /> },
          { label: "fill", value: "fill", icon: <StretchHorizontal size={14} /> },
          { label: "scale-down", value: "scale-down", icon: <Shrink size={14} /> },
        ]}
        value={normalizeFit(block.props.fit)}
        onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, fit: value })}
      />
      <OptionButtons label="Controls" options={booleanOptions} value={normalizeBoolean(block.props.controls, "true")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, controls: value })} />
      <OptionButtons label="Loop" options={booleanOptions} value={normalizeBoolean(block.props.loop, "true")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, loop: value })} />
      <OptionButtons label="Muted" options={booleanOptions} value={normalizeBoolean(block.props.muted, "true")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, muted: value })} />
    </>
  );
}

function normalizeFit(value: string | number | undefined) {
  if (value === "contain" || value === "fill" || value === "scale-down") {
    return value;
  }

  return "cover";
}

function normalizeBoolean(value: string | number | undefined, fallback: "false" | "true") {
  if (value === "false" || value === 0) {
    return "false";
  }

  if (value === "true" || value === 1) {
    return "true";
  }

  return fallback;
}

function isYoutubeUrl(value: string) {
  return /(?:youtube\.com|youtu\.be)/i.test(value);
}
