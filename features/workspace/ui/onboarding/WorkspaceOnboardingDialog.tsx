"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { SlideXFeatureVisual } from "@/common/ui/SlideXFeatureVisual";
import { useWorkspaceI18n } from "@/features/workspace/ui/workspaceI18n";

type WorkspaceOnboardingDialogProps = {
  onComplete: () => void;
};

const onboardingPoints = [
  "Design on a precise canvas",
  "Edit every layer directly in MDX",
  "Present or export to PowerPoint and HTML"
] as const;

export function WorkspaceOnboardingDialog({ onComplete }: WorkspaceOnboardingDialogProps) {
  const { tx } = useWorkspaceI18n();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    primaryButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onComplete();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusableElements = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onComplete]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 p-4 backdrop-blur-[12px] sm:p-6"
      initial={reduceMotion ? false : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        aria-describedby="workspace-onboarding-description"
        aria-labelledby="workspace-onboarding-title"
        aria-modal="true"
        className="relative grid max-h-[calc(100dvh-2rem)] w-full max-w-[1040px] overflow-y-auto rounded-[18px] border border-white/[0.12] bg-[#111315] text-white shadow-[0_36px_120px_rgba(33,20,78,0.38)] lg:grid-cols-[1.5fr_0.85fr] lg:overflow-hidden"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.985, y: 16 }}
        ref={dialogRef}
        role="dialog"
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          aria-label={tx("Close welcome dialog")}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-[7px] border border-white/[0.1] bg-[#111315]/82 text-white/44 backdrop-blur transition hover:border-white/[0.2] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4ee87]"
          onClick={onComplete}
          type="button"
        >
          <X className="h-4 w-4" strokeWidth={1.7} />
        </button>

        <div className="border-b border-white/[0.09] bg-[#0b0c0f] p-3 lg:border-b-0 lg:border-r lg:p-4">
          <div className="flex aspect-[16/10] min-h-[240px] items-center justify-center overflow-hidden rounded-[11px] bg-[#f4f4f1] p-[7%] lg:h-full lg:min-h-[520px] lg:aspect-auto">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[16/10] w-full overflow-hidden rounded-[8px] shadow-[0_24px_72px_rgba(17,19,21,0.22)]"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              transition={{ delay: reduceMotion ? 0 : 0.06, duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <SlideXFeatureVisual variant="canvas" />
            </motion.div>
          </div>
        </div>

        <div className="flex min-h-[430px] flex-col px-6 pb-6 pt-16 sm:px-8 sm:pb-8 lg:min-h-0 lg:px-9 lg:pb-9 lg:pt-12">
          <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.14em] text-[#c4ee87]">
            <span className="h-px w-8 bg-[#c4ee87]/42" />
            <span>{tx("WELCOME TO SLIDEX")}</span>
          </div>

          <h2 className="mt-8 text-[clamp(30px,4vw,42px)] font-semibold leading-[0.98] tracking-[-0.045em] text-white [text-wrap:balance]" id="workspace-onboarding-title">
            {tx("Your ideas, ready for the stage.")}
          </h2>
          <p className="mt-5 max-w-[38ch] text-[14px] leading-6 text-white/48" id="workspace-onboarding-description">
            {tx("Start with a blank canvas and shape every slide your way. Design visually, refine in MDX, then present or export when you’re ready.")}
          </p>

          <div className="mt-7 space-y-3 border-t border-white/[0.09] pt-5">
            {onboardingPoints.map((point, index) => (
              <div className="flex items-center gap-3 text-[13px] leading-5 text-white/68" key={point}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-white/[0.06] text-[9px] tabular-nums text-white/38">0{index + 1}</span>
                <span>{tx(point)}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-10">
            <button className="h-11 px-1 text-[11px] font-medium text-white/36 transition hover:text-white/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30" onClick={onComplete} type="button">
              {tx("Skip for now")}
            </button>
            <button
              className="ml-auto inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#c4ee87] px-4 text-[12px] font-semibold text-[#132000] transition hover:bg-[#d4f5a3] active:translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c4ee87]/24"
              onClick={onComplete}
              ref={primaryButtonRef}
              type="button"
            >
              {tx("Start creating")}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
