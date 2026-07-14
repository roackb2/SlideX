"use client";

import type { CSSProperties } from "react";
import { ImagePlus } from "lucide-react";
import { youtubeEmbedUrl } from "@/core/motion-doc/domain/videoSource";
import { MotionBlock, type AnimationProps, type RadiusProps } from "@/features/pitch/ui/preview/motion/MotionBlock";
import { surfaceStyle } from "@/features/pitch/ui/preview/motion/blockStyles";
import { PaperImageFilterLayer } from "@/features/pitch/ui/preview/paperImageFilterRenderers";

type ImageFit = NonNullable<CSSProperties["objectFit"]>;

export function ImageBlock({
  alt,
  background,
  backgroundColor,
  filter,
  filterAngle,
  filterContrast,
  filterDetail,
  filterDistortion,
  filterPreset,
  filterSize,
  filterSpeed,
  fit = "cover",
  fetchPriority = "auto",
  full = false,
  loading = "eager",
  scaleX = 1,
  scaleY = 1,
  src,
  ...animation
}: AnimationProps & {
  alt: string;
  fit?: string;
  fetchPriority?: "auto" | "high" | "low";
  full?: boolean;
  loading?: "eager" | "lazy";
  scaleX?: number;
  scaleY?: number;
  src: string;
  filter?: string;
  filterAngle?: number;
  filterContrast?: number;
  filterDetail?: number;
  filterDistortion?: number;
  filterPreset?: string;
  filterSize?: number;
  filterSpeed?: number;
} & RadiusProps & {
  background?: string;
  backgroundColor?: string;
}) {
  const fillFrame = Boolean(animation.fillFrame);
  const mediaClassName = full || fillFrame ? "h-full w-full" : "aspect-video w-full";
  const objectFit = normalizeImageFit(fit);
  const hasSource = Boolean(src.trim());
  const mediaTransform: CSSProperties = {
    transform: `scale(${clampImageScale(scaleX)}, ${clampImageScale(scaleY)})`,
    transformOrigin: "center"
  };

  return (
    <MotionBlock
      className={
        full
          ? "absolute -inset-8 z-0 w-auto max-w-none overflow-hidden rounded-none border-0 bg-white/[0.08]"
          : fillFrame
            ? "h-full w-full max-w-none overflow-hidden"
            : "w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08]"
      }
      style={surfaceStyle({ background, backgroundColor })}
      {...animation}
    >
      <div className={`relative overflow-hidden ${mediaClassName}`} style={{ borderRadius: "inherit" }}>
        {hasSource ? (
          <div className="absolute inset-0" style={mediaTransform}>
            <img
              alt={alt}
              className="absolute inset-0 h-full w-full"
              decoding="async"
              fetchPriority={fetchPriority}
              loading={loading}
              src={src}
              style={{ objectFit }}
            />
            <PaperImageFilterLayer
              filter={filter}
              filterAngle={filterAngle}
              filterContrast={filterContrast}
              filterDetail={filterDetail}
              filterDistortion={filterDistortion}
              filterPreset={filterPreset}
              filterSize={filterSize}
              filterSpeed={filterSpeed}
              fit={fit}
              src={src}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.09),transparent_60%)] text-neutral-500">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-neutral-400 shadow-sm">
              <ImagePlus size={18} strokeWidth={1.7} />
            </span>
            <span className="text-[12px] font-semibold text-neutral-300">Import an image</span>
            <span className="text-[10px] text-neutral-600">Choose a file from the right panel</span>
          </div>
        )}
      </div>
    </MotionBlock>
  );
}

function clampImageScale(value: number | undefined) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value ?? 1, 0.1), 4);
}

export function VideoBlock({
  background,
  backgroundColor,
  controls = true,
  fit = "cover",
  full = false,
  loop = true,
  muted = true,
  poster,
  src,
  ...animation
}: AnimationProps & {
  controls?: boolean;
  fit?: string;
  full?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  src: string;
} & RadiusProps & {
  background?: string;
  backgroundColor?: string;
}) {
  const fillFrame = Boolean(animation.fillFrame);
  const youtubeSrc = youtubeEmbedUrl(src, {
    autoplay: muted,
    controls,
    loop,
    muted
  });

  return (
    <MotionBlock
      className={
        full
          ? "absolute -inset-8 z-0 w-auto max-w-none overflow-hidden rounded-none border-0 bg-white/[0.08]"
          : fillFrame
            ? "h-full w-full max-w-none overflow-hidden"
            : "w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08]"
      }
      style={surfaceStyle({ background, backgroundColor })}
      {...animation}
    >
      {youtubeSrc ? (
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={full || fillFrame ? "h-full w-full" : "aspect-video w-full"}
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          src={youtubeSrc}
          title="YouTube video"
        />
      ) : (
        <video
          autoPlay={muted}
          className={full || fillFrame ? "h-full w-full" : "aspect-video w-full"}
          controls={controls}
          loop={loop}
          muted={muted}
          playsInline
          poster={poster}
          src={src}
          style={{ objectFit: normalizeImageFit(fit) }}
        />
      )}
    </MotionBlock>
  );
}

function normalizeImageFit(value: string | undefined): ImageFit {
  if (value === "contain" || value === "fill" || value === "scale-down") {
    return value;
  }

  return "cover";
}
