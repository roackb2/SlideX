"use client";

import { useEffect, useRef, useState } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/features/pitch/application/previewCanvas";
import { PreviewPane } from "@/features/pitch/ui/preview/PreviewPane";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";

type SlideThumbnailPreviewProps = {
  activeSlideIndex: number;
  eager?: boolean;
  replayNonce: number;
  scene?: MotionDocScene;
  source: string;
};

export function SlideThumbnailPreview({
  activeSlideIndex,
  eager = false,
  replayNonce,
  scene,
  source
}: SlideThumbnailPreviewProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(eager);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    if (eager) {
      setShouldRender(true);
      return;
    }

    const frame = frameRef.current;
    if (!frame || shouldRender) return;

    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setShouldRender(true);
      observer.disconnect();
    }, { rootMargin: "240px 0px" });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [eager, shouldRender]);

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const updateScale = () => {
      const rect = frame.getBoundingClientRect();
      setScale(rect.width > 0 ? rect.width / CANVAS_WIDTH : 0.2);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" ref={frameRef}>
      <div
        className="pointer-events-none absolute left-0 top-0 bg-black"
        style={{
          height: CANVAS_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "left top",
          width: CANVAS_WIDTH
        }}
      >
        {shouldRender ? (
          <PreviewPane
            activeSlideIndex={activeSlideIndex}
            imageFetchPriority="low"
            imageLoading="lazy"
            replayNonce={replayNonce}
            scene={scene}
            source={source}
          />
        ) : null}
      </div>
    </div>
  );
}
