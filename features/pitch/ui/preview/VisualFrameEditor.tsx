"use client";

import { Eye, EyeOff, Maximize, Minimize, Minus, Plus, RefreshCcw, Shrink, StretchHorizontal, Volume2, VolumeX } from "lucide-react";
import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";
import { iconFrameForSize } from "@/core/motion-doc/domain/iconSizing";
import type { BlockUpdater } from "@/features/pitch/ui/pitchCommandTypes";

type VisualBlock = Extract<MotionDocBlock, { props: Record<string, string | number> }>;

type VisualFrameEditorProps = {
  block: VisualBlock;
  blockIndex: number;
  onSelectBlock: (index: number) => void;
  onUpdateBlock: BlockUpdater;
  placement?: "above" | "below";
};

const fitOptions = [
  { icon: <Maximize size={13} />, label: "Cover", value: "cover" },
  { icon: <Minimize size={13} />, label: "Contain", value: "contain" },
  { icon: <StretchHorizontal size={13} />, label: "Fill", value: "fill" },
  { icon: <Shrink size={13} />, label: "Scale down", value: "scale-down" }
] as const;

export function VisualFrameEditor({ block, blockIndex, onSelectBlock, onUpdateBlock, placement = "above" }: VisualFrameEditorProps) {
  const isIcon = block.type === "Icon";
  const isImage = block.type === "ImageBlock";
  const isVideo = block.type === "VideoBlock";

  if (!isIcon && !isImage && !isVideo) return null;

  function update(updates: Record<string, string | number>) {
    onUpdateBlock(blockIndex, { ...block.props, ...updates }, undefined, { skipReplay: true });
  }

  return (
    <div
      aria-label={`${block.type} quick controls`}
      className={`absolute left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/[0.09] bg-[#151419]/95 p-1 shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl ${placement === "below" ? "top-[calc(100%+10px)]" : "bottom-[calc(100%+10px)]"}`}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelectBlock(blockIndex);
      }}
      role="toolbar"
    >
      {isIcon ? <IconQuickControls block={block} onUpdate={update} /> : null}
      {isImage || isVideo ? <MediaQuickControls block={block} isVideo={isVideo} onUpdate={update} /> : null}
    </div>
  );
}

function IconQuickControls({ block, onUpdate }: { block: VisualBlock; onUpdate: (updates: Record<string, string | number>) => void }) {
  const size = numberProp(block.props.size, 112);
  const strokeWidth = numberProp(block.props.strokeWidth, 2);
  const color = String(block.props.color ?? "#ffffff");

  return (
    <>
      <ToolbarValue label="Size" value={`${Math.round(size)}`}>
        <ToolbarButton label="Decrease icon size" onClick={() => onUpdate(iconFrameForSize(block.props, Math.max(40, size - 8)))}><Minus size={12} /></ToolbarButton>
        <ToolbarButton label="Increase icon size" onClick={() => onUpdate(iconFrameForSize(block.props, Math.min(640, size + 8)))}><Plus size={12} /></ToolbarButton>
      </ToolbarValue>
      <ToolbarDivider />
      <ToolbarValue label="Stroke" value={strokeWidth.toFixed(strokeWidth % 1 ? 1 : 0)}>
        <ToolbarButton label="Decrease stroke width" onClick={() => onUpdate({ strokeWidth: Math.max(0.5, strokeWidth - 0.25) })}><Minus size={12} /></ToolbarButton>
        <ToolbarButton label="Increase stroke width" onClick={() => onUpdate({ strokeWidth: Math.min(6, strokeWidth + 0.25) })}><Plus size={12} /></ToolbarButton>
      </ToolbarValue>
      <ToolbarDivider />
      <label aria-label="Icon color" className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition hover:bg-white/[0.07]" title="Icon color">
        <span className="h-4 w-4 rounded-md border border-white/25 shadow-sm" style={{ backgroundColor: color }} />
        <input className="absolute inset-0 cursor-pointer opacity-0" onChange={(event) => onUpdate({ color: event.target.value })} type="color" value={normalizeHexColor(color)} />
      </label>
    </>
  );
}

function MediaQuickControls({ block, isVideo, onUpdate }: { block: VisualBlock; isVideo: boolean; onUpdate: (updates: Record<string, string | number>) => void }) {
  const fit = normalizeFit(block.props.fit);
  const isMuted = normalizeBoolean(block.props.muted, true);
  const showsControls = normalizeBoolean(block.props.controls, true);

  return (
    <>
      <span className="px-1.5 text-[9px] font-semibold text-neutral-500">FIT</span>
      {fitOptions.map((option) => (
        <ToolbarButton active={fit === option.value} key={option.value} label={option.label} onClick={() => onUpdate({ fit: option.value })}>
          {option.icon}
        </ToolbarButton>
      ))}
      <ToolbarDivider />
      {isVideo ? (
        <>
          <ToolbarButton active={isMuted} label={isMuted ? "Unmute video" : "Mute video"} onClick={() => onUpdate({ muted: isMuted ? "false" : "true" })}>
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </ToolbarButton>
          <ToolbarButton active={showsControls} label={showsControls ? "Hide playback controls" : "Show playback controls"} onClick={() => onUpdate({ controls: showsControls ? "false" : "true" })}>
            {showsControls ? <Eye size={13} /> : <EyeOff size={13} />}
          </ToolbarButton>
        </>
      ) : (
        <ToolbarButton label="Reset image scale" onClick={() => onUpdate({ scaleX: 1, scaleY: 1 })}><RefreshCcw size={13} /></ToolbarButton>
      )}
    </>
  );
}

function ToolbarValue({ children, label, value }: { children: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-0.5"><span className="px-1 text-[9px] font-semibold text-neutral-500">{label}</span><span className="min-w-6 text-center font-mono text-[10px] tabular-nums text-neutral-300">{value}</span>{children}</div>;
}

function ToolbarButton({ active = false, children, label, onClick }: { active?: boolean; children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} className={`flex h-7 w-7 items-center justify-center rounded-lg outline-none transition active:scale-90 focus-visible:ring-1 focus-visible:ring-violet-300/70 ${active ? "bg-white text-[#17171a] shadow-sm" : "text-neutral-500 hover:bg-white/[0.07] hover:text-white"}`} onClick={onClick} title={label} type="button">
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-white/[0.08]" />;
}

function numberProp(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeFit(value: string | number | undefined) {
  return value === "contain" || value === "fill" || value === "scale-down" ? value : "cover";
}

function normalizeBoolean(value: string | number | undefined, fallback: boolean) {
  if (value === "false" || value === 0) return false;
  if (value === "true" || value === 1) return true;
  return fallback;
}

function normalizeHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff";
}
