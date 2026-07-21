"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Bot, Check, History, Loader2, RotateCcw, Send, Settings2, Square, Trash2, User, Wrench, X } from "lucide-react";
import { usePitchAgentContext } from "@/features/pitch/ui/agent/PitchAgentProvider";
import { PitchAgentCredentialSettings } from "@/features/pitch/ui/agent/PitchAgentCredentialSettings";
import { PitchAgentSessionList } from "@/features/pitch/ui/agent/PitchAgentSessionList";
import { usePitchAgentI18n } from "@/features/pitch/ui/agent/pitchAgentI18n";
import type { ModelCredential } from "@/features/pitch/domain/agentRun";

export function PitchAgentPanel({ onClose }: { onClose: () => void }) {
  const [credentialValidationError, setCredentialValidationError] = useState<string>();
  const [showSettings, setShowSettings] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { actions, meta, state } = usePitchAgentContext();
  const { copy } = usePitchAgentI18n();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [state.messages, state.tools]);

  const runCredentialError = state.errorCode === "model_credential_rejected"
    ? state.error
    : undefined;
  const visibleCredentialError = credentialValidationError
    ?? runCredentialError
    ?? state.deviceAuth.error;

  useEffect(() => {
    if (visibleCredentialError) {
      setShowSettings(true);
    }
  }, [visibleCredentialError]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextMessage = state.draft.trim();
    if (!nextMessage) {
      return;
    }
    if (!isUsableModelCredential(state.modelCredential)) {
      setCredentialValidationError(copy.credentialRequired);
      setShowSettings(true);
      return;
    }
    actions.setDraft("");
    setCredentialValidationError(undefined);
    void actions.submit(nextMessage, state.modelCredential);
  }

  return (
    <aside
      aria-label={copy.slideXAgent}
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#09090b] text-neutral-200 selection:bg-white/20"
      role="dialog"
    >
      <div className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.02] bg-[#09090b]/80 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Bot aria-hidden="true" size={14} className="text-black" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[14px] font-semibold tracking-tight text-white/90">{copy.slideXAgent}</h2>
            <p className="text-[11px] font-medium tracking-wide text-neutral-500/80">
              {meta.isCheckingStatus
                ? copy.checkingStatus
                : meta.isHydrating
                ? copy.restoring
                : state.status === "reconnecting"
                  ? copy.reconnecting
                  : state.status === "detached"
                    ? copy.liveProgressUnavailable
                    : meta.isRunning ? copy.working : copy.ready}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label={copy.conversationHistory}
            aria-pressed={showSessions}
            className="flex size-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={() => {
              setShowSettings(false);
              setShowSessions((current) => !current);
            }}
            type="button"
          >
            <History aria-hidden="true" size={15} />
          </button>
          <button
            aria-label={copy.agentSettings}
            aria-pressed={showSettings}
            className="flex size-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={() => {
              setShowSessions(false);
              setShowSettings((current) => !current);
            }}
            type="button"
          >
            <Settings2 aria-hidden="true" size={15} />
          </button>
          <button
            aria-label={copy.closeAgent}
            className="flex size-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      {showSettings ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <PitchAgentCredentialSettings
            error={visibleCredentialError}
            onCredentialChanged={() => setCredentialValidationError(undefined)}
          />
          <div className="mt-6 flex justify-center gap-4">
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild>
                <button
                  aria-label={copy.newConversation}
                  className="group relative flex h-14 flex-1 items-center justify-center rounded-[20px] border-b border-black/60 border-t border-white/[0.15] bg-gradient-to-b from-white/[0.1] to-white/[0.02] text-neutral-300 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:-translate-y-0.5 hover:text-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] disabled:pointer-events-none disabled:opacity-30"
                  disabled={!meta.canStartNewConversation
                    || meta.isCheckingStatus
                    || meta.isDeleting
                    || meta.isHydrating}
                  title={copy.newConversation}
                  type="button"
                >
                  <RotateCcw aria-hidden="true" size={22} className="transition-transform duration-300 group-hover:-rotate-90" />
                </button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
                <AlertDialog.Content
                  className="fixed top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#111111] p-6 shadow-2xl focus:outline-none"
                  style={{
                    left: "max(1rem, env(safe-area-inset-left))",
                    right: "max(1rem, env(safe-area-inset-right))",
                    maxHeight: "calc(100dvh - max(1rem, env(safe-area-inset-top)) - max(1rem, env(safe-area-inset-bottom)))"
                  }}
                >
                  <AlertDialog.Title className="text-balance text-lg font-semibold tracking-wide text-white">
                    {copy.startNewConversationTitle}
                  </AlertDialog.Title>
                  <AlertDialog.Description className="mt-3 text-pretty text-[15px] leading-relaxed text-neutral-400">
                    {copy.startNewConversationDescription}
                  </AlertDialog.Description>
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <AlertDialog.Cancel asChild>
                      <button
                        className="flex h-11 items-center justify-center rounded-xl border border-white/[0.1] px-5 text-[14px] font-medium text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        type="button"
                      >
                        {copy.keepConversation}
                      </button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <button
                        className="flex h-11 items-center justify-center rounded-xl bg-white px-5 text-[14px] font-semibold text-black transition-transform hover:scale-105 hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        onClick={actions.startNewConversation}
                        type="button"
                      >
                        {copy.newConversation}
                      </button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild>
                <button
                  aria-label={meta.isDeleting ? copy.deletingConversation : copy.deleteConversation}
                  className="group relative flex h-14 flex-1 items-center justify-center rounded-[20px] border-b border-black/60 border-t border-red-400/[0.2] bg-gradient-to-b from-red-500/[0.15] to-red-500/[0.02] text-red-400 shadow-[0_4px_12px_rgba(239,68,68,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all hover:-translate-y-0.5 hover:text-red-300 hover:shadow-[0_6px_16px_rgba(239,68,68,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] disabled:pointer-events-none disabled:opacity-30"
                  disabled={!meta.canDeleteConversation
                    || meta.isCheckingStatus
                    || meta.isDeleting
                    || meta.isHydrating}
                  title={meta.isDeleting ? copy.deletingConversation : copy.deleteConversation}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={22} className="transition-transform duration-200 group-hover:scale-110" />
                </button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
                <AlertDialog.Content
                  className="fixed top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#111111] p-6 shadow-2xl focus:outline-none"
                  style={{
                    left: "max(1rem, env(safe-area-inset-left))",
                    right: "max(1rem, env(safe-area-inset-right))",
                    maxHeight: "calc(100dvh - max(1rem, env(safe-area-inset-top)) - max(1rem, env(safe-area-inset-bottom)))"
                  }}
                >
                  <AlertDialog.Title className="text-balance text-lg font-semibold tracking-wide text-white">
                    {copy.deleteConversationTitle}
                  </AlertDialog.Title>
                  <AlertDialog.Description className="mt-3 text-pretty text-[15px] leading-relaxed text-neutral-400">
                    {copy.deleteConversationDescription}
                  </AlertDialog.Description>
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <AlertDialog.Cancel asChild>
                      <button
                        className="flex h-11 items-center justify-center rounded-xl border border-white/[0.1] px-5 text-[14px] font-medium text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        type="button"
                      >
                        {copy.keepConversation}
                      </button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <button
                        className="flex h-11 items-center justify-center rounded-xl bg-red-500 px-5 text-[14px] font-semibold text-white transition-transform hover:scale-105 hover:bg-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                        onClick={() => void actions.deleteConversation()}
                        type="button"
                      >
                        {copy.deleteConversation}
                      </button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </div>
        </div>
      ) : showSessions ? (
        <PitchAgentSessionList onClose={() => setShowSessions(false)} />
      ) : (
      <>
      <div
        aria-label={copy.conversationActivity}
        className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/30"
        ref={scrollRef}
        role="region"
        tabIndex={0}
      >
        <div className="mx-auto max-w-3xl">
          {state.error && state.errorCode !== "model_credential_rejected" && (
            <p className="mb-6 rounded-xl border border-red-400/25 bg-red-400/[0.06] p-4 text-sm leading-relaxed text-red-200" role="alert">
              {state.error}
            </p>
          )}
          {state.notice && (
            <p className="mb-6 rounded-xl border border-white/[0.12] bg-white/[0.04] p-4 text-pretty text-sm leading-relaxed text-neutral-300" role="status">
              {state.notice}
            </p>
          )}
          {state.status === "detached" && (
            <div className="mb-6 rounded-xl border border-white/[0.12] bg-white/[0.04] p-4">
              <p className="text-pretty text-sm leading-relaxed text-neutral-300">
                {copy.liveUpdatesUnavailable}
              </p>
              <button
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/[0.16] px-4 text-sm font-medium text-white hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                disabled={meta.isCheckingStatus}
                onClick={() => void actions.checkRunStatus()}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={15} />
                {meta.isCheckingStatus ? copy.checkingStatus : copy.checkStatus}
              </button>
            </div>
          )}
          {state.messages.length === 0 ? (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-[0.98] duration-1000">
              <div className="relative mb-8 flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_0_40px_rgba(255,255,255,0.15)] ring-1 ring-white/20">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white to-white/50 blur-xl opacity-30" />
                <Bot size={26} className="text-black relative z-10" />
              </div>
              <p className="bg-gradient-to-br from-white via-white/90 to-white/30 bg-clip-text text-2xl font-medium tracking-tight text-transparent">
                {copy.emptyConversationTitle}
              </p>
              <p className="mt-4 max-w-sm text-[14px] leading-loose text-neutral-500">
                {copy.emptyConversationDescription}
              </p>
            </div>
          ) : (
            <div className="space-y-10 py-6" aria-live="polite">
              {state.messages.map((item) => (
                <div className="flex gap-5" key={item.id}>
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.05]">
                    {item.role === "user" ? <User size={13} className="text-neutral-300" /> : <Bot size={13} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 text-[12px] font-semibold tracking-wide text-neutral-500">
                      {item.role === "user" ? (copy.you || "You") : (copy.slideXAgent || "Agent")}
                    </div>
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-200">
                      {item.content || (
                        <span className="flex items-center gap-3 text-neutral-500 mt-2">
                          <Loader2 className="animate-spin text-white/40" size={16} /> {copy.thinking}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {state.tools.length > 0 && (
            <div className="mt-8 ml-12 rounded-2xl border border-white/[0.02] bg-white/[0.02] p-5">
              <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-neutral-500">
                <Wrench aria-hidden="true" size={12} /> {copy.toolActivity}
              </p>
              <ul className="space-y-3">
                {state.tools.map((tool) => (
                  <li className="flex items-center justify-between text-[13px]" key={tool.key}>
                    <span className="truncate font-medium text-neutral-400">{tool.name}</span>
                    <span className={tool.status === "failed" ? "text-red-400" : tool.status === "completed" ? "text-emerald-400" : "text-neutral-500"}>
                      {tool.status === "completed" ? <Check aria-label={copy.completed} size={14} /> : tool.status === "failed" ? <X aria-label={copy.failed} size={14} /> : (
                        <span className="flex items-center gap-2"><Loader2 className="animate-spin text-neutral-600" size={14} /> {copy.running}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state.pendingMotionDoc && (
            <div className="mt-8 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-4">
              <p className="flex items-center gap-2 text-[15px] font-medium text-amber-200">
                <AlertTriangle aria-hidden="true" size={18} /> {copy.deckChangedTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-amber-100/70">
                {copy.deckChangedDescription}
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  className="h-11 flex-1 rounded-md bg-amber-200 px-4 text-sm font-semibold text-black hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
                  onClick={actions.applyPendingMotionDoc}
                  type="button"
                >
                  {copy.applyAgentResult}
                </button>
                <button
                  className="h-11 rounded-md border border-amber-200/30 px-4 text-sm font-medium text-amber-100 hover:bg-amber-100/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
                  onClick={actions.dismissPendingMotionDoc}
                  type="button"
                >
                  {copy.keepMine}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="pointer-events-none absolute inset-x-0 bottom-full h-32 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
        <form className="bg-[#09090b] px-4 pb-6 pt-2" onSubmit={handleSubmit}>
          <div className="mx-auto max-w-3xl">
            <label className="sr-only" htmlFor="slidex-agent-message">{copy.messageAgent}</label>
            <div className="relative flex flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#141416] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.02)] transition-all focus-within:border-white/[0.12] focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <textarea
                className="min-h-[110px] max-h-64 w-full resize-none bg-transparent px-5 pb-14 pt-4 text-[15px] leading-relaxed text-white outline-none placeholder:text-neutral-600"
                disabled={meta.isRunning
                  || meta.isHydrating
                  || meta.isDeleting
                  || meta.isCheckingStatus}
                id="slidex-agent-message"
                onChange={(event) => actions.setDraft(event.target.value)}
                placeholder={copy.messagePlaceholder}
                value={state.draft}
              />
              <div className="absolute bottom-3 inset-x-4 flex items-center justify-between">
                <p className="px-1 text-[11px] font-medium tracking-wide text-neutral-600">{copy.usesCurrentMotionDoc}</p>
                {meta.isRunning ? (
                  <button
                    className="flex size-9 items-center justify-center rounded-full bg-white/[0.1] text-white transition-colors hover:bg-white/[0.15] disabled:cursor-wait disabled:opacity-50"
                    disabled={meta.isCheckingStatus}
                    onClick={() => void actions.cancel()}
                    type="button"
                  >
                    <Square aria-hidden="true" fill="currentColor" size={14} />
                  </button>
                ) : (
                  <button
                    className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                    disabled={!state.draft.trim()
                      || meta.isHydrating
                      || meta.isDeleting
                      || meta.isCheckingStatus}
                    type="submit"
                  >
                    <Send aria-hidden="true" size={15} className="mr-0.5 mt-0.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      </>
      )}
    </aside>
  );
}

function isUsableModelCredential(
  credential: ModelCredential | undefined
): credential is ModelCredential {
  if (!credential) {
    return false;
  }
  return credential.type === "api-key"
    ? credential.apiKey.trim().length >= 8
    : credential.expiresAt > Date.now();
}
