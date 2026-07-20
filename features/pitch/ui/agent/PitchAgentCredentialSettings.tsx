"use client";

import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { CheckCircle2, ExternalLink, KeyRound, LogIn } from "lucide-react";
import { usePitchAgentContext } from "@/features/pitch/ui/agent/PitchAgentProvider";

type CredentialMethod = "api-key" | "codex";

export function PitchAgentCredentialSettings({
  error,
  onCredentialChanged
}: {
  error?: string;
  onCredentialChanged: () => void;
}) {
  const { actions, state } = usePitchAgentContext();
  const [method, setMethod] = useState<CredentialMethod>(() => (
    state.modelCredential?.type === "oauth-access-token" ? "codex" : "api-key"
  ));
  const keyInputRef = useRef<HTMLInputElement>(null);
  const apiKey = state.modelCredential?.type === "api-key"
    ? state.modelCredential.apiKey
    : "";
  const runtimeCredential = state.modelCredential?.type === "oauth-access-token"
    ? state.modelCredential
    : undefined;
  const visibleError = error ?? state.deviceAuth.error;

  useEffect(() => {
    if (method === "api-key" && visibleError) {
      keyInputRef.current?.focus();
    }
  }, [method, visibleError]);

  function selectMethod(nextMethod: CredentialMethod): void {
    if (nextMethod === method) {
      return;
    }
    actions.clearModelCredential();
    actions.clearCredentialError();
    onCredentialChanged();
    setMethod(nextMethod);
  }

  function updateApiKey(value: string): void {
    actions.setApiKey(value);
    actions.clearCredentialError();
    onCredentialChanged();
  }

  return (
    <section aria-labelledby="slidex-agent-model-access">
      <h3
        className="text-balance text-xs font-semibold text-neutral-200"
        id="slidex-agent-model-access"
      >
        Model access
      </h3>
      <div
        aria-label="OpenAI authentication method"
        className="mt-2 grid grid-cols-2 rounded-md border border-white/[0.12] p-1"
        role="group"
      >
        <button
          aria-pressed={method === "api-key"}
          className="h-10 rounded text-xs font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 data-[selected=true]:bg-white data-[selected=true]:text-black data-[selected=true]:hover:bg-white"
          data-selected={method === "api-key"}
          onClick={() => selectMethod("api-key")}
          type="button"
        >
          API key
        </button>
        <button
          aria-pressed={method === "codex"}
          className="h-10 rounded text-xs font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 data-[selected=true]:bg-white data-[selected=true]:text-black data-[selected=true]:hover:bg-white"
          data-selected={method === "codex"}
          onClick={() => selectMethod("codex")}
          type="button"
        >
          Codex subscription
        </button>
      </div>

      {method === "api-key" ? (
        <div className="mt-3">
          <label
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-300"
            htmlFor="slidex-agent-api-key"
          >
            <KeyRound aria-hidden="true" size={14} /> OpenAI API key
          </label>
          <input
            aria-describedby={visibleError
              ? "slidex-agent-api-key-help slidex-agent-credential-error"
              : "slidex-agent-api-key-help"}
            aria-invalid={Boolean(visibleError)}
            autoComplete="off"
            className="h-11 w-full rounded-md border border-white/[0.12] bg-black px-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white/30 focus:ring-2 focus:ring-white/10"
            id="slidex-agent-api-key"
            onChange={(event) => updateApiKey(event.target.value)}
            placeholder="sk-…"
            ref={keyInputRef}
            spellCheck={false}
            type="password"
            value={apiKey}
          />
          <p
            className="mt-2 text-pretty text-xs leading-5 text-neutral-500"
            id="slidex-agent-api-key-help"
          >
            Current tab only. Sent only when a run starts; SlideX does not store it.
          </p>
          <button
            className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-white/[0.12] px-3 text-sm font-medium text-neutral-200 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            disabled={!apiKey}
            onClick={() => {
              actions.clearModelCredential();
              actions.clearCredentialError();
              onCredentialChanged();
              keyInputRef.current?.focus();
            }}
            type="button"
          >
            Forget key
          </button>
        </div>
      ) : (
        <div className="mt-3" aria-live="polite">
          {runtimeCredential ? (
            <div className="border border-emerald-400/25 bg-emerald-400/[0.06] p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                <CheckCircle2 aria-hidden="true" size={16} /> Codex connected
              </p>
              <p className="mt-1 text-pretty text-xs leading-5 text-emerald-100/70">
                Available until <time className="tabular-nums" dateTime={new Date(runtimeCredential.expiresAt).toISOString()}>{dayjs(runtimeCredential.expiresAt).format("h:mm A")}</time> in this tab.
              </p>
            </div>
          ) : state.deviceAuth.challenge ? (
            <div className="border border-white/[0.12] bg-white/[0.04] p-3">
              <p className="text-pretty text-xs leading-5 text-neutral-300">
                Open the official OpenAI page and enter this one-time code:
              </p>
              <code
                aria-label="OpenAI device code"
                className="mt-2 block rounded bg-black px-3 py-2 text-center font-mono text-base font-semibold text-white tabular-nums"
              >
                {state.deviceAuth.challenge.userCode}
              </code>
              <a
                className="mt-3 flex h-11 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-black hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                href={state.deviceAuth.challenge.verificationUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open OpenAI sign-in <ExternalLink aria-hidden="true" size={15} />
              </a>
              <p className="mt-2 text-pretty text-xs leading-5 text-neutral-500">
                Only enter the code at <strong className="font-medium text-neutral-400">auth.openai.com</strong>. SlideX never asks for your OpenAI password.
              </p>
            </div>
          ) : (
            <p className="text-pretty text-xs leading-5 text-neutral-500">
              Use the Codex access included with an eligible ChatGPT plan. You will sign in on OpenAI&apos;s site.
            </p>
          )}

          {!runtimeCredential && state.deviceAuth.status !== "pending" && (
            <button
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-black hover:bg-neutral-200 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              disabled={state.deviceAuth.status === "requesting"}
              onClick={() => {
                actions.clearCredentialError();
                onCredentialChanged();
                void actions.connectCodex();
              }}
              type="button"
            >
              <LogIn aria-hidden="true" size={15} />
              {state.deviceAuth.status === "requesting"
                ? "Starting OpenAI sign-in…"
                : state.deviceAuth.status === "error" || state.deviceAuth.status === "expired"
                  ? "Try Codex sign-in again"
                  : "Connect Codex subscription"}
            </button>
          )}
          {(runtimeCredential || state.deviceAuth.status === "pending") && (
            <button
              className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-white/[0.12] px-3 text-sm font-medium text-neutral-200 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              onClick={() => {
                if (runtimeCredential) {
                  actions.clearModelCredential();
                } else {
                  actions.cancelCodexConnection();
                }
                actions.clearCredentialError();
                onCredentialChanged();
              }}
              type="button"
            >
              {runtimeCredential ? "Disconnect Codex" : "Cancel sign-in"}
            </button>
          )}
        </div>
      )}

      {visibleError && (
        <p
          className="mt-2 text-pretty text-xs leading-5 text-red-300"
          id="slidex-agent-credential-error"
          role="alert"
        >
          {visibleError}
        </p>
      )}
      <p className="mt-2 text-pretty text-xs leading-5 text-neutral-500">
        Refreshing the page forgets the selected model credential. The server never stores it.
      </p>
    </section>
  );
}
