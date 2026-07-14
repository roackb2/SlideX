"use client";

import { useEffect } from "react";
import { LogIn, X } from "lucide-react";

export type GuestSignInIntent = "export";

type GuestSignInDialogProps = {
  intent: GuestSignInIntent | null;
  onClose: () => void;
  onContinue: (intent: GuestSignInIntent) => void;
};

const intentCopy = {
  export: {
    body: "PowerPoint export is available in the Live Demo. Sign in to unlock HTML and MDX export. Your demo changes will stay with you.",
    button: "Sign in to unlock"
  }
} satisfies Record<GuestSignInIntent, { body: string; button: string }>;

export function GuestSignInDialog({ intent, onClose, onContinue }: GuestSignInDialogProps) {
  useEffect(() => {
    if (!intent) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [intent, onClose]);

  if (!intent) return null;
  const copy = intentCopy[intent];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/72 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="guest-sign-in-title"
        aria-modal="true"
        className="w-full max-w-[440px] rounded-t-[18px] border border-white/[0.1] bg-[#151618] p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.5)] sm:rounded-[14px] sm:p-6"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[12px] font-semibold text-[#c4ee87]">Sign in required</p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em]" id="guest-sign-in-title">Unlock this export format</h2>
          </div>
          <button
            aria-label="Close sign in dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] text-white/42 transition hover:bg-white/[0.06] hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-4 text-[14px] leading-6 text-white/54">{copy.body}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="h-10 rounded-[8px] px-4 text-[13px] font-semibold text-white/52 transition hover:bg-white/[0.05] hover:text-white" onClick={onClose} type="button">Keep editing</button>
          <button autoFocus className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#f2f2ee] px-4 text-[13px] font-semibold text-[#111315] transition hover:bg-white active:translate-y-px" onClick={() => onContinue(intent)} type="button">
            <LogIn size={15} />
            {copy.button}
          </button>
        </div>
      </section>
    </div>
  );
}
