"use client";

import { memo, useState, type CSSProperties } from "react";
import { ImagePlus } from "lucide-react";
import { clampImageMediaPosition, imageMediaDimensions } from "@/core/motion-doc/application/imageCrop";
import { youtubeEmbedUrl } from "@/core/motion-doc/domain/videoSource";
import { MotionBlock, type AnimationProps, type RadiusProps } from "@/features/pitch/ui/preview/motion/MotionBlock";
import { surfaceStyle } from "@/features/pitch/ui/preview/motion/blockStyles";
import { PaperImageFilterLayer } from "@/features/pitch/ui/preview/paperImageFilterRenderers";

type ImageFit = NonNullable<CSSProperties["objectFit"]>;

export const ImageBlock = memo(function ImageBlock({
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
  frameAspectRatio = 16 / 9,
  full = false,
  loading = "eager",
  cropX = 0,
  cropY = 0,
  scaleX = 1,
  scaleY = 1,
  src,
  ...animation
}: AnimationProps & {
  alt: string;
  fit?: string;
  fetchPriority?: "auto" | "high" | "low";
  frameAspectRatio?: number;
  full?: boolean;
  loading?: "eager" | "lazy";
  cropX?: number;
  cropY?: number;
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
  const [loadedImage, setLoadedImage] = useState<{ aspectRatio: number | null; src: string }>({
    aspectRatio: null,
    src: ""
  });
  const imageAspectRatio = loadedImage.src === src ? loadedImage.aspectRatio : null;
  const imageDimensions = imageMediaDimensions(objectFit, frameAspectRatio, imageAspectRatio);
  const normalizedScaleX = clampImageScale(scaleX);
  const normalizedScaleY = clampImageScale(scaleY);
  const renderedCropX = objectFit === "cover"
    ? clampImageMediaPosition(cropX, 0, 100, imageDimensions.width * normalizedScaleX)
    : clampCropPosition(cropX);
  const renderedCropY = objectFit === "cover"
    ? clampImageMediaPosition(cropY, 0, 100, imageDimensions.height * normalizedScaleY)
    : clampCropPosition(cropY);
  const mediaTransform: CSSProperties = {
    transform: `translate(${renderedCropX}%, ${renderedCropY}%) scale(${normalizedScaleX}, ${normalizedScaleY})`,
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
              className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
              decoding="async"
              fetchPriority={fetchPriority}
              key={src}
              loading={loading}
              onLoad={(event) => {
                const image = event.currentTarget;
                if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                  setLoadedImage({
                    aspectRatio: image.naturalWidth / image.naturalHeight,
                    src
                  });
                }
              }}
              src={src}
              style={{ height: `${imageDimensions.height}%`, width: `${imageDimensions.width}%` }}
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
});

function clampImageScale(value: number | undefined) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value ?? 1, 0.1), 8);
}

function clampCropPosition(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value ?? 0, -350), 350);
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
