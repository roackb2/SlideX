"use client";

import { useEffect, useRef, useState } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/features/pitch/application/previewCanvas";
import { PreviewPane } from "@/features/pitch/ui/preview/PreviewPane";

type SlideThumbnailPreviewProps = {
  activeSlideIndex: number;
  replayNonce: number;
  source: string;
};

export function SlideThumbnailPreview({
  activeSlideIndex,
  replayNonce,
  source
}: SlideThumbnailPreviewProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.2);

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
        <PreviewPane
          activeSlideIndex={activeSlideIndex}
          replayNonce={replayNonce}
          source={source}
        />
      </div>
    </div>
  );
}
