"use client";

import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import { Check, CheckCircle2, Copy, ExternalLink, KeyRound, LogIn } from "lucide-react";
import { usePitchAgentContext } from "@/features/pitch/ui/agent/PitchAgentProvider";
import { usePitchAgentI18n } from "@/features/pitch/ui/agent/pitchAgentI18n";

type CredentialMethod = "api-key" | "codex";

export function PitchAgentCredentialSettings({
  error,
  onCredentialChanged
}: {
  error?: string;
  onCredentialChanged: () => void;
}) {
  const { actions, state } = usePitchAgentContext();
  const { copy, locale } = usePitchAgentI18n();
  const [method, setMethod] = useState<CredentialMethod>(() => (
    state.modelCredential?.type === "oauth-access-token" ? "codex" : "api-key"
  ));
  const [copiedDeviceCode, setCopiedDeviceCode] = useState<string>();
  const [copyFailedDeviceCode, setCopyFailedDeviceCode] = useState<string>();
  const keyInputRef = useRef<HTMLInputElement>(null);
  const apiKey = state.modelCredential?.type === "api-key"
    ? state.modelCredential.apiKey
    : "";
  const runtimeCredential = state.modelCredential?.type === "oauth-access-token"
    ? state.modelCredential
    : undefined;
  const visibleError = error ?? state.deviceAuth.error;
  const deviceAuthChallenge = state.deviceAuth.challenge;
  const activeDeviceCode = deviceAuthChallenge?.userCode;
  const isDeviceCodeCopied = Boolean(
    activeDeviceCode && copiedDeviceCode === activeDeviceCode
  );
  const didDeviceCodeCopyFail = Boolean(
    activeDeviceCode && copyFailedDeviceCode === activeDeviceCode
  );

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

  async function copyDeviceCode(userCode: string): Promise<void> {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(userCode);
      setCopiedDeviceCode(userCode);
      setCopyFailedDeviceCode(undefined);
    } catch {
      setCopiedDeviceCode(undefined);
      setCopyFailedDeviceCode(userCode);
    }
  }

  return (
    <section aria-labelledby="slidex-agent-model-access">
      <h3
        className="text-balance text-xs font-semibold text-neutral-200"
        id="slidex-agent-model-access"
      >
        {copy.modelAccess}
      </h3>
      <div
        aria-label={copy.authenticationMethod}
        className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-white/[0.1] bg-black/30 p-1"
        role="group"
      >
        <button
          aria-pressed={method === "api-key"}
          className="h-9 whitespace-nowrap rounded-md border border-transparent px-2 text-xs font-medium text-neutral-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 data-[selected=true]:border-white/[0.08] data-[selected=true]:bg-white/[0.12] data-[selected=true]:text-white data-[selected=true]:shadow-sm"
          data-selected={method === "api-key"}
          onClick={() => selectMethod("api-key")}
          type="button"
        >
          {copy.apiKey}
        </button>
        <button
          aria-pressed={method === "codex"}
          className="h-9 whitespace-nowrap rounded-md border border-transparent px-2 text-xs font-medium text-neutral-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 data-[selected=true]:border-white/[0.08] data-[selected=true]:bg-white/[0.12] data-[selected=true]:text-white data-[selected=true]:shadow-sm"
          data-selected={method === "codex"}
          onClick={() => selectMethod("codex")}
          type="button"
        >
          {copy.codexSubscription}
        </button>
      </div>

      {method === "api-key" ? (
        <div className="mt-3">
          <label
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-300"
            htmlFor="slidex-agent-api-key"
          >
            <KeyRound aria-hidden="true" size={14} /> {copy.openAiApiKey}
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
            {copy.apiKeyHelp}
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
            {copy.forgetKey}
          </button>
        </div>
      ) : (
        <div className="mt-3" aria-live="polite">
          {runtimeCredential ? (
            <div className="rounded-md border border-emerald-400/25 bg-emerald-400/[0.06] p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                <CheckCircle2 aria-hidden="true" size={16} /> {copy.codexConnected}
              </p>
              <p className="mt-1 text-pretty text-xs leading-5 text-emerald-100/70">
                {copy.codexAvailableUntil(dayjs(runtimeCredential.expiresAt)
                  .locale(locale === "zh-TW" ? "zh-tw" : "en")
                  .format(locale === "zh-TW" ? "A h:mm" : "h:mm A"))}
              </p>
            </div>
          ) : deviceAuthChallenge ? (
            <div className="rounded-md border border-white/[0.12] bg-white/[0.04] p-3">
              <p className="text-pretty text-xs leading-5 text-neutral-300">
                {copy.deviceCodeInstruction}
              </p>
              <button
                aria-label={copy.copyDeviceCode(deviceAuthChallenge.userCode)}
                className="mt-2 flex w-full items-center gap-1.5 rounded-md border border-white/[0.1] bg-black p-1.5 text-left hover:border-white/[0.2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                onClick={() => void copyDeviceCode(deviceAuthChallenge.userCode)}
                type="button"
              >
                <code
                  className="min-w-0 flex-1 select-all px-2 text-center font-mono text-base font-semibold text-white tabular-nums"
                >
                  {deviceAuthChallenge.userCode}
                </code>
                <span
                  className="flex h-8 shrink-0 items-center gap-1 rounded bg-white/[0.08] px-2 text-[11px] font-medium text-neutral-300 data-[copied=true]:bg-emerald-400/[0.12] data-[copied=true]:text-emerald-200"
                  data-copied={isDeviceCodeCopied}
                >
                  {isDeviceCodeCopied
                    ? <Check aria-hidden="true" size={13} />
                    : <Copy aria-hidden="true" size={13} />}
                  {isDeviceCodeCopied ? copy.copied : copy.copy}
                </span>
              </button>
              {didDeviceCodeCopyFail && (
                <p className="mt-2 text-pretty text-xs leading-5 text-red-300" role="alert">
                  {copy.copyFailed}
                </p>
              )}
              <a
                className="mt-3 flex h-11 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-black hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                href={deviceAuthChallenge.verificationUrl}
                rel="noreferrer"
                target="_blank"
              >
                {copy.openOpenAiSignIn} <ExternalLink aria-hidden="true" size={15} />
              </a>
              <p className="mt-2 text-pretty text-xs leading-5 text-neutral-500">
                {copy.officialOpenAiOnly}
              </p>
            </div>
          ) : (
            <p className="text-pretty text-xs leading-5 text-neutral-500">
              {copy.codexPlanHelp}
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
                ? copy.startingSignIn
                : state.deviceAuth.status === "error" || state.deviceAuth.status === "expired"
                  ? copy.retryCodexSignIn
                  : copy.connectCodex}
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
              {runtimeCredential ? copy.disconnectCodex : copy.cancelSignIn}
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
        {copy.credentialPrivacy}
      </p>
    </section>
  );
}
