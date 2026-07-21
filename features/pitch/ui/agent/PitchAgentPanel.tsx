"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Bot, Check, History, RotateCcw, Send, Settings2, Sparkles, Square, Trash2, Wrench, X } from "lucide-react";
import Markdown from "react-markdown";
import { usePitchAgentContext } from "@/features/pitch/ui/agent/PitchAgentProvider";
import { PitchAgentCredentialSettings } from "@/features/pitch/ui/agent/PitchAgentCredentialSettings";
import { PitchAgentSessionList } from "@/features/pitch/ui/agent/PitchAgentSessionList";
import type { ModelCredential } from "@/features/pitch/domain/agentRun";

export function PitchAgentPanel() {
  const [credentialValidationError, setCredentialValidationError] = useState<string>();
  const [showSettings, setShowSettings] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { actions, meta, state } = usePitchAgentContext();

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
      setCredentialValidationError(
        "Enter a valid OpenAI API key or connect a Codex subscription before sending."
      );
      setShowSettings(true);
      return;
    }
    actions.setDraft("");
    setCredentialValidationError(undefined);
    void actions.submit(nextMessage, state.modelCredential);
  }

  return (
    <aside
      aria-label="SlideX agent"
      className="flex h-full min-h-0 w-[360px] shrink-0 flex-col overflow-hidden border-l border-white/[0.12] bg-[#111111] text-neutral-200"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
        <div className="flex items-center gap-2">
          <Bot aria-hidden="true" size={17} />
          <div>
            <h2 className="text-sm font-semibold text-white">SlideX Agent</h2>
            <p className="text-xs text-neutral-500">
              {meta.isCheckingStatus
                ? "Checking status…"
                : meta.isHydrating
                ? "Restoring…"
                : state.status === "reconnecting"
                  ? "Reconnecting…"
                  : state.status === "detached"
                    ? "Live progress unavailable"
                    : meta.isRunning ? "Working…" : "Ready"}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            aria-label="Conversation history"
            aria-pressed={showSessions}
            className="flex size-11 items-center justify-center rounded-md text-neutral-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={() => {
              setShowSettings(false);
              setShowSessions((current) => !current);
            }}
            type="button"
          >
            <History aria-hidden="true" size={16} />
          </button>
          <button
            aria-label="Agent settings"
            aria-pressed={showSettings}
            className="flex size-11 items-center justify-center rounded-md text-neutral-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={() => {
              setShowSessions(false);
              setShowSettings((current) => !current);
            }}
            type="button"
          >
            <Settings2 aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="max-h-80 shrink-0 overflow-y-auto border-b border-white/[0.08] p-4">
          <PitchAgentCredentialSettings
            error={visibleCredentialError}
            onCredentialChanged={() => setCredentialValidationError(undefined)}
          />
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <button
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/[0.12] px-3 text-sm font-medium text-neutral-200 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                disabled={!meta.canStartNewConversation
                  || meta.isCheckingStatus
                  || meta.isDeleting
                  || meta.isHydrating}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={15} />
                New conversation
              </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
              <AlertDialog.Content
                className="fixed top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 overflow-y-auto border border-white/[0.12] bg-[#18181b] p-5 shadow-xl focus:outline-none"
                style={{
                  left: "max(1rem, env(safe-area-inset-left))",
                  right: "max(1rem, env(safe-area-inset-right))",
                  maxHeight: "calc(100dvh - max(1rem, env(safe-area-inset-top)) - max(1rem, env(safe-area-inset-bottom)))"
                }}
              >
                <AlertDialog.Title className="text-balance text-base font-semibold text-white">
                  Start a new conversation?
                </AlertDialog.Title>
                <AlertDialog.Description className="mt-2 text-pretty text-sm leading-6 text-neutral-400">
                  The current deck stays open and this conversation remains available in history.
                </AlertDialog.Description>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <AlertDialog.Cancel asChild>
                    <button
                      className="h-11 rounded-md border border-white/[0.16] px-4 text-sm font-medium text-white hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      type="button"
                    >
                      Keep conversation
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button
                      className="h-11 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      onClick={actions.startNewConversation}
                      type="button"
                    >
                      New conversation
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <button
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-red-400/30 px-3 text-sm font-medium text-red-300 hover:bg-red-400/[0.08] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
                disabled={!meta.canDeleteConversation
                  || meta.isCheckingStatus
                  || meta.isDeleting
                  || meta.isHydrating}
                type="button"
              >
                <Trash2 aria-hidden="true" size={15} />
                {meta.isDeleting ? "Deleting conversation…" : "Delete conversation"}
              </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
              <AlertDialog.Content
                className="fixed top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 overflow-y-auto border border-white/[0.12] bg-[#18181b] p-5 shadow-xl focus:outline-none"
                style={{
                  left: "max(1rem, env(safe-area-inset-left))",
                  right: "max(1rem, env(safe-area-inset-right))",
                  maxHeight: "calc(100dvh - max(1rem, env(safe-area-inset-top)) - max(1rem, env(safe-area-inset-bottom)))"
                }}
              >
                <AlertDialog.Title className="text-balance text-base font-semibold text-white">
                  Delete this conversation?
                </AlertDialog.Title>
                <AlertDialog.Description className="mt-2 text-pretty text-sm leading-6 text-neutral-400">
                  This permanently deletes the chat history. The current deck stays open.
                </AlertDialog.Description>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <AlertDialog.Cancel asChild>
                    <button
                      className="h-11 rounded-md border border-white/[0.16] px-4 text-sm font-medium text-white hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      type="button"
                    >
                      Keep conversation
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button
                      className="h-11 rounded-md bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                      onClick={() => void actions.deleteConversation()}
                      type="button"
                    >
                      Delete conversation
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </div>
      )}

      {showSessions ? (
        <PitchAgentSessionList onClose={() => setShowSessions(false)} />
      ) : (
      <>
      <div
        aria-label="Agent conversation and activity"
        className="min-h-0 flex-1 overflow-y-auto p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/30"
        ref={scrollRef}
        role="region"
        tabIndex={0}
      >
        {state.error && state.errorCode !== "model_credential_rejected" && (
          <p className="mb-4 border border-red-400/25 bg-red-400/[0.06] p-3 text-xs leading-5 text-red-200" role="alert">
            {state.error}
          </p>
        )}
        {state.notice && (
          <p className="mb-4 border border-white/[0.12] bg-white/[0.04] p-3 text-pretty text-xs leading-5 text-neutral-300" role="status">
            {state.notice}
          </p>
        )}
        {state.status === "detached" && (
          <div className="mb-4 border border-white/[0.12] bg-white/[0.04] p-3">
            <p className="text-pretty text-xs leading-5 text-neutral-300">
              Live updates are unavailable. Check the durable conversation to see whether the run finished.
            </p>
            <button
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/[0.16] px-3 text-sm font-medium text-white hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              disabled={meta.isCheckingStatus}
              onClick={() => void actions.checkRunStatus()}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={15} />
              {meta.isCheckingStatus ? "Checking status…" : "Check status"}
            </button>
          </div>
        )}
        {state.messages.length === 0 ? (
          <div className="border border-dashed border-white/[0.12] p-4">
            <p className="text-sm font-medium text-white">Edit this deck conversationally</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Ask for a new slide, a visual rewrite, or a change to the current MotionDoc.
            </p>
          </div>
        ) : (
          <div className="space-y-4" aria-live="polite">
            {state.messages.map((item) => (
              <div className={item.role === "user" ? "pl-8" : "pr-4"} key={item.id}>
                {item.role === "reasoning" ? (
                  <ReasoningSummary content={item.content} done={item.done} />
                ) : (
                  <>
                    <p className="mb-1 text-xs font-medium text-neutral-500">
                      {item.role === "user"
                        ? "You"
                        : item.role === "commentary" ? "Working" : "SlideX Agent"}
                    </p>
                    <p className={`whitespace-pre-wrap text-pretty text-sm leading-6 ${item.role === "user" ? "border border-white/[0.12] bg-white/[0.06] p-3 text-white" : "text-neutral-300"}`}>
                      {item.content || "Working…"}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {state.tools.length > 0 && (
          <div className="mt-5 border-t border-white/[0.08] pt-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              <Wrench aria-hidden="true" size={13} /> Tool activity
            </p>
            <ul className="space-y-1.5">
              {state.tools.map((tool) => (
                <li className="flex items-center justify-between text-xs" key={tool.key}>
                  <span className="truncate text-neutral-400">{tool.name}</span>
                  <span className={tool.status === "failed" ? "text-red-400" : tool.status === "completed" ? "text-emerald-400" : "text-neutral-300"}>
                    {tool.status === "completed" ? <Check aria-label="Completed" size={14} /> : tool.status === "failed" ? <X aria-label="Failed" size={14} /> : "Running"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.pendingMotionDoc && (
          <div className="mt-5 border border-amber-400/30 bg-amber-400/[0.06] p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-200">
              <AlertTriangle aria-hidden="true" size={16} /> The deck changed during this run
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-100/70">
              Review your recent edits before replacing them with the agent result.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                className="h-11 flex-1 rounded-md bg-amber-200 px-3 text-sm font-semibold text-black hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
                onClick={actions.applyPendingMotionDoc}
                type="button"
              >
                Apply agent result
              </button>
              <button
                className="h-11 rounded-md border border-amber-200/30 px-3 text-sm text-amber-100 hover:bg-amber-100/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
                onClick={actions.dismissPendingMotionDoc}
                type="button"
              >
                Keep mine
              </button>
            </div>
          </div>
        )}
      </div>

      <form className="shrink-0 border-t border-white/[0.1] p-3" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="slidex-agent-message">Message the SlideX agent</label>
        <textarea
          className="min-h-24 w-full resize-none rounded-md border border-white/[0.12] bg-black p-3 text-sm leading-6 text-white outline-none placeholder:text-neutral-600 focus:border-white/30 focus:ring-2 focus:ring-white/10"
          disabled={meta.isRunning
            || meta.isHydrating
            || meta.isDeleting
            || meta.isCheckingStatus}
          id="slidex-agent-message"
          onChange={(event) => actions.setDraft(event.target.value)}
          placeholder="Make the opening slide more visual…"
          value={state.draft}
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-neutral-600">Uses the current MotionDoc as its base</p>
          {meta.isRunning ? (
            <button
              className="flex h-11 items-center gap-2 rounded-md border border-white/[0.16] px-4 text-sm font-medium text-white hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              disabled={meta.isCheckingStatus}
              onClick={() => void actions.cancel()}
              type="button"
            >
              <Square aria-hidden="true" fill="currentColor" size={12} /> Stop
            </button>
          ) : (
            <button
              className="flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              disabled={!state.draft.trim()
                || meta.isHydrating
                || meta.isDeleting
                || meta.isCheckingStatus}
              type="submit"
            >
              <Send aria-hidden="true" size={15} /> Send
            </button>
          )}
        </div>
      </form>
      </>
      )}
    </aside>
  );
}

function ReasoningSummary({
  content,
  done
}: {
  content: string;
  done: boolean;
}) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        <Sparkles aria-hidden="true" size={12} />
        Thinking
        {!done && <span aria-hidden="true" className="size-1.5 rounded-full bg-neutral-500" />}
      </p>
      <Markdown
        allowedElements={["p", "strong", "em", "code"]}
        components={{
          p: ({ children }) => (
            <p className="text-pretty text-sm leading-6 text-neutral-400">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-neutral-300">{children}</strong>
          ),
          em: ({ children }) => <em className="text-neutral-300">{children}</em>,
          code: ({ children }) => (
            <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs text-neutral-300">
              {children}
            </code>
          )
        }}
        unwrapDisallowed
      >
        {content || "Working through the request…"}
      </Markdown>
    </div>
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
