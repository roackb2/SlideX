"use client";

import { useState, type MouseEvent } from "react";

type AuthorizationDecision = "allow" | "deny";

export function AuthorizationActions() {
  const [decision, setDecision] = useState<AuthorizationDecision | null>(null);

  function chooseDecision(
    event: MouseEvent<HTMLButtonElement>,
    nextDecision: AuthorizationDecision
  ) {
    submitAuthorizationDecision({
      currentDecision: decision,
      event,
      nextDecision,
      setDecision
    });
  }

  return <AuthorizationButtons decision={decision} onDecision={chooseDecision} />;
}

export function submitAuthorizationDecision({
  currentDecision,
  event,
  nextDecision,
  setDecision
}: {
  currentDecision: AuthorizationDecision | null;
  event: Pick<MouseEvent<HTMLButtonElement>, "currentTarget" | "preventDefault">;
  nextDecision: AuthorizationDecision;
  setDecision: (decision: AuthorizationDecision) => void;
}) {
  event.preventDefault();
  if (currentDecision !== null) return;

  const form = event.currentTarget.form;
  if (!form) return;

  // Serialize the current server-rendered form immediately. In particular,
  // this preserves the one-time consent nonce and the clicked button's value
  // before React applies the pending-state render.
  setDecision(nextDecision);
  form.requestSubmit(event.currentTarget);
}

export function AuthorizationButtons({
  decision,
  onDecision
}: {
  decision: AuthorizationDecision | null;
  onDecision: (event: MouseEvent<HTMLButtonElement>, decision: AuthorizationDecision) => void;
}) {
  const pending = decision !== null;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row" aria-live="polite">
      <button
        aria-disabled={pending}
        className="h-12 flex-1 rounded-[9px] border border-white/[0.14] bg-transparent px-5 text-[14px] font-medium text-white/65 outline-none transition-colors hover:border-white/25 hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191919] aria-disabled:pointer-events-none aria-disabled:opacity-45 motion-reduce:transition-none"
        name="decision"
        onClick={(event) => onDecision(event, "deny")}
        type="submit"
        value="deny"
      >
        {decision === "deny" ? "Denying…" : "Deny"}
      </button>
      <button
        aria-disabled={pending}
        className="h-12 flex-1 rounded-[9px] bg-[#f4f1e9] px-5 text-[14px] font-semibold text-[#171716] outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#a9bfff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191919] aria-disabled:pointer-events-none aria-disabled:opacity-55 motion-reduce:transition-none"
        name="decision"
        onClick={(event) => onDecision(event, "allow")}
        type="submit"
        value="allow"
      >
        {decision === "allow" ? "Allowing access…" : "Allow access"}
      </button>
    </div>
  );
}
