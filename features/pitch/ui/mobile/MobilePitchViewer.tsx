"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Download, FileUp, MessageSquareText, RotateCcw, Send, X } from "lucide-react";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocParser";
import type { SlideComment } from "@/features/pitch/application/slideComments";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/features/pitch/application/previewCanvas";
import { useMobilePresentationGestures } from "@/features/pitch/ui/hooks/useMobilePresentationGestures";
import { SlideCommentHistory } from "@/features/pitch/ui/notes/SlideCommentHistory";
import { PreviewPane } from "@/features/pitch/ui/preview/PreviewPane";

type MobilePitchViewerProps = {
  activeSlideIndex: number;
  comments: SlideComment[];
  documentTitle: string;
  onAddComment: (comment: string) => void;
  onExport: () => void;
  onImport: () => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  onPassComment: (commentId: string) => void;
  replayNonce: number;
  scene?: MotionDocScene;
  sceneCount: number;
  source: string;
};

export function MobilePitchViewer({
  activeSlideIndex,
  comments,
  documentTitle,
  onAddComment,
  onExport,
  onImport,
  onNextSlide,
  onPreviousSlide,
  onPassComment,
  replayNonce,
  scene,
  sceneCount,
  source
}: MobilePitchViewerProps) {
  const canvasAreaRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.35);
  const [frameSize, setFrameSize] = useState({ height: 0, width: 0 });
  const [commentDraft, setCommentDraft] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const {
    handlePointerCancel,
    handlePointerDown,
    handlePointerEnd,
    handlePointerMove,
    isZoomed,
    resetViewport,
    transform,
    zoom
  } = useMobilePresentationGestures({ frameRef, onNextSlide, onPreviousSlide });

  useEffect(() => {
    const canvasArea = canvasAreaRef.current;
    if (!canvasArea) return;

    const updateFrame = () => {
      const rect = canvasArea.getBoundingClientRect();
      const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
      const width = Math.max(0, Math.min(rect.width, rect.height * aspectRatio));
      const height = width / aspectRatio;
      setFrameSize({ height, width });
      setScale((width / CANVAS_WIDTH) || 0.35);
    };

    updateFrame();
    const observer = new ResizeObserver(updateFrame);
    observer.observe(canvasArea);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    resetViewport();
  }, [activeSlideIndex, resetViewport]);

  function submitComment() {
    if (!commentDraft.trim()) return;
    onAddComment(commentDraft);
    setCommentDraft("");
  }

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#050505] text-white">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.08] px-3 pt-[env(safe-area-inset-top)]">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{documentTitle || "Untitled"}</p>
          <p className="mt-0.5 text-[10px] text-neutral-500">Preview only</p>
        </div>
        <div className="flex items-center gap-1">
          <ViewerIconButton icon={<FileUp size={17} />} label="Import presentation" onClick={onImport} />
          <ViewerIconButton icon={<Download size={17} />} label="Export presentation" onClick={onExport} />
        </div>
      </header>

      <section className="relative flex min-h-0 flex-1 flex-col">
        <div
          className="flex min-h-0 flex-1 touch-none items-center justify-center py-2"
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          ref={canvasAreaRef}
        >
          <div
            className="relative overflow-hidden rounded-sm bg-black shadow-[0_28px_90px_rgba(0,0,0,0.72)] ring-1 ring-white/[0.14]"
            ref={frameRef}
            style={{ height: frameSize.height || undefined, width: frameSize.width || "100%" }}
          >
            <div className="pointer-events-none absolute inset-0" style={{ transform, transformOrigin: "center" }}>
              <div
                className="absolute left-0 top-0 overflow-hidden"
                style={{
                  height: CANVAS_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: "left top",
                  width: CANVAS_WIDTH
                }}
              >
                <PreviewPane activeSlideIndex={activeSlideIndex} replayNonce={replayNonce} scene={scene} source={source} />
              </div>
            </div>
            {isZoomed ? (
              <button
                aria-label="Reset presentation zoom"
                className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex h-10 items-center gap-2 rounded-full bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur-md active:scale-95"
                onClick={resetViewport}
                type="button"
              >
                <RotateCcw size={15} />
                {Math.round(zoom * 100)}%
              </button>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/[0.08] bg-[#0b0b0c] px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <div className="flex items-center justify-between">
            <ViewerIconButton disabled={activeSlideIndex <= 0} icon={<ChevronLeft size={19} />} label="Previous slide" onClick={onPreviousSlide} />
            <span className="font-mono text-sm font-semibold text-neutral-300">{activeSlideIndex + 1} / {Math.max(sceneCount, 1)}</span>
            <ViewerIconButton disabled={activeSlideIndex >= sceneCount - 1} icon={<ChevronRight size={19} />} label="Next slide" onClick={onNextSlide} />
          </div>
          <button
            className={`mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition active:scale-[0.99] ${
              comments.length > 0 ? "border-[#9ad7ff]/30 bg-[#9ad7ff]/10 text-[#bfe8ff]" : "border-white/[0.1] bg-white/[0.035] text-neutral-300"
            }`}
            onClick={() => setIsNotesOpen(true)}
            type="button"
          >
            <MessageSquareText size={17} />
            {comments.length > 0 ? `View comments · ${comments.length}` : "Add a comment"}
          </button>
        </div>
      </section>

      {isNotesOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end bg-black/70 backdrop-blur-[6px]">
          <section className="flex max-h-[86dvh] w-full flex-col rounded-t-[1.75rem] border-t border-white/[0.1] bg-[#101114] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-28px_90px_rgba(0,0,0,0.72)]">
            <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-white/20" />
            <div className="flex items-center justify-between px-1 py-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#9ad7ff]/12 text-[#bfe8ff]">
                  <MessageSquareText size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Comments</h2>
                    <span className="rounded-full bg-white/[0.07] px-2 py-0.5 font-mono text-[10px] text-neutral-400">Slide {activeSlideIndex + 1}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-500">{comments.length} open · saved on this device</p>
                </div>
              </div>
              <button aria-label="Close comments" className="flex h-10 w-10 items-center justify-center rounded-2xl text-neutral-500 transition active:bg-white/[0.08] active:text-white" onClick={() => setIsNotesOpen(false)} type="button"><X size={18} /></button>
            </div>
            <div className="mt-2 min-h-0 flex-1 overflow-hidden px-1">
              <SlideCommentHistory
                comments={comments}
                onPassComment={onPassComment}
              />
            </div>
            <div className="mt-3 shrink-0 rounded-2xl border border-white/[0.1] bg-white/[0.035] p-2 focus-within:border-[#9ad7ff]/35">
              <textarea
                autoFocus
                className="min-h-16 w-full resize-none bg-transparent px-2 py-1.5 text-[15px] leading-6 text-white outline-none placeholder:text-neutral-600"
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Leave a comment…"
                value={commentDraft}
              />
              <div className="flex items-center justify-between pl-2">
                <span className="text-[11px] text-neutral-600">Posting as <span className="text-neutral-400">You</span></span>
                <button
                  aria-label="Post comment as You"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition active:scale-95 disabled:bg-white/[0.08] disabled:text-neutral-600"
                  disabled={!commentDraft.trim()}
                  onClick={submitComment}
                  type="button"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function ViewerIconButton({
  disabled = false,
  icon,
  label,
  onClick
}: {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-300 transition active:scale-95 active:bg-white/[0.08] disabled:opacity-25"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
    </button>
  );
}
