"use client";

import { Bot } from "lucide-react";
import type { ReactNode } from "react";
import { usePitchAgentContext } from "@/features/pitch/ui/agent/PitchAgentProvider";
import { usePitchAgentI18n } from "@/features/pitch/ui/agent/pitchAgentI18n";

type PitchAgentFabProps = {
  isOpen: boolean;
  onToggle: () => void;
  panel?: ReactNode;
};

export function PitchAgentFab({ isOpen, onToggle, panel }: PitchAgentFabProps) {
  const { copy } = usePitchAgentI18n();
  const { meta, state } = usePitchAgentContext();
  const needsAttention = Boolean(
    state.error
    || state.pendingMotionDoc
    || state.status === "detached"
  );

  return (
    <div className="absolute bottom-20 left-4 z-[75] sm:bottom-6 sm:left-5">
      {isOpen && panel ? (
        <div
          className="absolute bottom-[4.5rem] left-0 h-[min(36rem,calc(100dvh-9.5rem))] w-[min(24rem,calc(100vw-2rem))] animate-[bubble-appear_0.2s_ease-out] overflow-hidden rounded-[1.25rem] border border-white/[0.12] bg-[#121316]/98 shadow-[0_28px_90px_rgba(0,0,0,0.72)] backdrop-blur-xl"
        >
          {panel}
        </div>
      ) : null}

      <button
        aria-label={isOpen ? copy.closeAgent : copy.openAgent}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_16px_42px_rgba(0,0,0,0.58)] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isOpen
            ? "border-white/30 bg-[#202126] text-white"
            : "border-white/[0.16] bg-[#17181b] text-white hover:bg-[#202126]"
        }`}
        onClick={onToggle}
        type="button"
      >
        <Bot aria-hidden="true" size={21} />
        {meta.isRunning ? (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border-2 border-black bg-[#c4ee87]" aria-label={copy.working}>
            <span className="size-1.5 animate-pulse rounded-full bg-black" />
          </span>
        ) : needsAttention ? (
          <span
            aria-label={copy.agentNeedsAttention}
            className="absolute -right-1 -top-1 size-5 rounded-full border-2 border-black bg-amber-300"
          />
        ) : null}
      </button>
    </div>
  );
}
