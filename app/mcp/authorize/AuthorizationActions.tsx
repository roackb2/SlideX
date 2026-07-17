"use client";

import { useRef, useState } from "react";

export function AuthorizationActions() {
  const [decision, setDecision] = useState<"allow" | "deny" | null>(null);
  const decisionInput = useRef<HTMLInputElement>(null);
  const pending = decision !== null;

  function chooseDecision(nextDecision: "allow" | "deny") {
    if (decisionInput.current) decisionInput.current.value = nextDecision;
    setDecision(nextDecision);
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row" aria-live="polite">
      <input name="decision" ref={decisionInput} type="hidden" />
      <button
        className="h-12 flex-1 rounded-[9px] border border-white/[0.14] bg-transparent px-5 text-[14px] font-medium text-white/65 outline-none transition-colors hover:border-white/25 hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191919] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
        disabled={pending}
        name="decision"
        onClick={() => chooseDecision("deny")}
        type="submit"
        value="deny"
      >
        {decision === "deny" ? "Denying…" : "Deny"}
      </button>
      <button
        className="h-12 flex-1 rounded-[9px] bg-[#f4f1e9] px-5 text-[14px] font-semibold text-[#171716] outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#a9bfff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191919] disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none"
        disabled={pending}
        name="decision"
        onClick={() => chooseDecision("allow")}
        type="submit"
        value="allow"
      >
        {decision === "allow" ? "Allowing access…" : "Allow access"}
      </button>
    </div>
  );
}
