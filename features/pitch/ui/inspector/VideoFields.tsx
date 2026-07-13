"use client";

import { Link2, PlayCircle, Upload, Video, Maximize, Minimize, StretchHorizontal, Shrink } from "lucide-react";
import { youtubeVideoId } from "@/core/motion-doc/domain/videoSource";
import { OptionButtons, TextInput, IconSegmentedControl, type BlockFieldProps } from "@/features/pitch/ui/inspector/InspectorControls";

const booleanOptions = [
  { label: "Off", value: "false" },
  { label: "On", value: "true" }
] as const;

const sourceOptions = [
  { label: "Upload", value: "upload" },
  { label: "External link", value: "external" }
] as const;

type VideoSourceMode = (typeof sourceOptions)[number]["value"];

export function VideoFields({
  block,
  selectedBlockIndex,
  updateBlock,
  uploadVideoForBlock
}: BlockFieldProps & {
  uploadVideoForBlock: (blockIndex: number, file: File | undefined) => void;
}) {
  const source = String(block.props.src ?? "");
  const sourceMode = normalizeSourceMode(block.props.sourceType, source);
  const youtubeId = youtubeVideoId(source);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-2">
        <OptionButtons
          label="Source"
          options={sourceOptions}
          value={sourceMode}
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, sourceType: value })}
        />
        {sourceMode === "upload" ? (
          <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/[0.1] bg-[#18181b] px-3 py-3 text-left transition hover:border-white/20 hover:bg-[#1d1d20] active:scale-[0.99]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/35 text-neutral-300 transition group-hover:text-white">
              <Upload size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-neutral-200">Import video file</span>
              <span className="block truncate text-[10px] text-neutral-500">MP4, MOV or WebM · up to 50 MB</span>
            </span>
            <input
              accept="video/mp4,video/quicktime,video/webm"
              className="sr-only"
              onChange={(event) => {
                uploadVideoForBlock(selectedBlockIndex, event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
              type="file"
            />
          </label>
        ) : (
          <div className="grid gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-3">
            <div className="flex items-center gap-2 text-neutral-400">
              {youtubeId ? <PlayCircle size={15} /> : <Link2 size={15} />}
              <span className="text-[10px] font-semibold tracking-wide text-neutral-500">EXTERNAL VIDEO</span>
            </div>
            <TextInput
              label="External link"
              onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, src: value })}
              placeholder="Paste a YouTube or direct video URL"
              value={source}
            />
            <p className="text-[10px] leading-relaxed text-neutral-600">
              {youtubeId ? "YouTube link detected. Preview and HTML export will use the embedded player." : "Supports YouTube, youtu.be, and direct MP4 or WebM links."}
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-[34px_1fr] items-end gap-2">
        <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-black/35 text-neutral-400">
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
      <div className="grid gap-3 rounded-xl border border-white/[0.055] bg-black/20 p-3">
        <p className="text-[10px] font-semibold tracking-wide text-neutral-500">PLAYBACK</p>
        <OptionButtons label="Controls" options={booleanOptions} value={normalizeBoolean(block.props.controls, "true")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, controls: value })} />
        <OptionButtons label="Loop" options={booleanOptions} value={normalizeBoolean(block.props.loop, "true")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, loop: value })} />
        <OptionButtons label="Muted" options={booleanOptions} value={normalizeBoolean(block.props.muted, "true")} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, muted: value })} />
      </div>
      <p className="-mt-2 text-[10px] leading-relaxed text-neutral-600">Fit, mute, and playback controls are also available directly on the selected video frame.</p>
    </div>
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

function normalizeSourceMode(value: string | number | undefined, source: string): VideoSourceMode {
  if (value === "external" || value === "upload") {
    return value;
  }

  if (!source || source.startsWith("blob:") || source.startsWith("data:video/")) {
    return "upload";
  }

  return "external";
}
