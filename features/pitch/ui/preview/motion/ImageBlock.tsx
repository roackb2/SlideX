"use client";

import type { CSSProperties } from "react";
import { MotionBlock, type AnimationProps, type RadiusProps } from "@/features/pitch/ui/preview/motion/MotionBlock";
import { surfaceStyle } from "@/features/pitch/ui/preview/motion/blockStyles";

type ImageFit = NonNullable<CSSProperties["objectFit"]>;

export function ImageBlock({
  alt,
  background,
  backgroundColor,
  fit = "cover",
  full = false,
  src,
  ...animation
}: AnimationProps & {
  alt: string;
  fit?: string;
  full?: boolean;
  src: string;
} & RadiusProps & {
  background?: string;
  backgroundColor?: string;
}) {
  const fillFrame = Boolean(animation.fillFrame);

  return (
    <MotionBlock
      className={
        full
          ? "absolute -inset-8 z-0 w-auto max-w-none overflow-hidden rounded-none border-0 bg-white/[0.08]"
          : "w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08]"
      }
      style={surfaceStyle({ background, backgroundColor })}
      {...animation}
    >
      <img
        alt={alt}
        className={full || fillFrame ? "h-full w-full" : "aspect-video w-full"}
        src={src}
        style={{ objectFit: normalizeImageFit(fit) }}
      />
    </MotionBlock>
  );
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
  const youtubeEmbedUrl = youtubeEmbedSrc(src);

  return (
    <MotionBlock
      className={
        full
          ? "absolute -inset-8 z-0 w-auto max-w-none overflow-hidden rounded-none border-0 bg-white/[0.08]"
          : "w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08]"
      }
      style={surfaceStyle({ background, backgroundColor })}
      {...animation}
    >
      {youtubeEmbedUrl ? (
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={full || fillFrame ? "h-full w-full" : "aspect-video w-full"}
          src={youtubeEmbedUrl}
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

function youtubeEmbedSrc(src: string) {
  const id = youtubeVideoId(src);

  if (!id) {
    return null;
  }

  return `https://www.youtube.com/embed/${id}`;
}

function youtubeVideoId(src: string) {
  try {
    const url = new URL(src);

    if (url.hostname === "youtu.be") {
      return url.pathname.replace("/", "").slice(0, 32) || null;
    }

    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/")[2]?.slice(0, 32) || null;
      }

      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2]?.slice(0, 32) || null;
      }

      return url.searchParams.get("v")?.slice(0, 32) || null;
    }
  } catch {
    return null;
  }

  return null;
}
