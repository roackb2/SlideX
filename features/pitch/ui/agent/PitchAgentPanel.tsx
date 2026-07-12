"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Bot, Check, RotateCcw, Send, Settings2, Square, Wrench, X } from "lucide-react";
import type { AgentSession } from "@/features/pitch/domain/agentRun";
import { usePitchAgent } from "@/features/pitch/ui/agent/usePitchAgent";

export function PitchAgentPanel({
  isOpen,
  onApplyMotionDoc,
  onRestoreSession,
  projectId,
  projectName,
  source
}: {
  isOpen: boolean;
  onApplyMotionDoc: (motionDoc: string, summary: string) => void;
  onRestoreSession: (session: AgentSession) => boolean;
  projectId: string;
  projectName: string;
  source: string;
}) {
  const [message, setMessage] = useState("");
  const [llmApiKey, setLlmApiKey] = useState("");
  const [keyError, setKeyError] = useState<string>();
  const [showSettings, setShowSettings] = useState(false);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const agent = usePitchAgent({
    projectId,
    projectName,
    source,
    onApplyMotionDoc,
    onRestoreSession
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [agent.messages, agent.tools]);

  const credentialError = agent.errorCode === "model_credential_rejected"
    ? agent.error
    : undefined;
  const visibleKeyError = keyError ?? credentialError;

  useEffect(() => {
    if (visibleKeyError) {
      setShowSettings(true);
    }
  }, [visibleKeyError]);

  useEffect(() => {
    if (showSettings && visibleKeyError) {
      keyInputRef.current?.focus();
    }
  }, [showSettings, visibleKeyError]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextMessage = message.trim();
    if (!nextMessage) {
      return;
    }
    if (llmApiKey.trim().length < 8) {
      setKeyError("Enter a valid OpenAI API key before sending.");
      setShowSettings(true);
      return;
    }
    setMessage("");
    setKeyError(undefined);
    void agent.submit(nextMessage, llmApiKey);
  }

  function handleApiKeyChange(value: string): void {
    setLlmApiKey(value);
    setKeyError(undefined);
    agent.clearCredentialError();
  }

  function forgetApiKey(): void {
    setLlmApiKey("");
    setKeyError(undefined);
    agent.clearCredentialError();
    keyInputRef.current?.focus();
  }

  return (
    <aside
      aria-label="SlideX agent"
      className={`${isOpen ? "flex" : "hidden"} w-[360px] shrink-0 flex-col border-l border-white/[0.12] bg-[#111111] text-neutral-200`}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
        <div className="flex items-center gap-2">
          <Bot aria-hidden="true" size={17} />
          <div>
            <h2 className="text-sm font-semibold text-white">SlideX Agent</h2>
            <p className="text-xs text-neutral-500">
              {agent.isCheckingStatus
                ? "Checking status…"
                : agent.isHydrating
                ? "Restoring…"
                : agent.status === "reconnecting"
                  ? "Reconnecting…"
                  : agent.status === "detached"
                    ? "Live progress unavailable"
                    : agent.isRunning ? "Working…" : "Ready"}
            </p>
          </div>
        </div>
        <button
          aria-label="Agent settings"
          aria-pressed={showSettings}
          className="flex size-11 items-center justify-center rounded-md text-neutral-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          onClick={() => setShowSettings((current) => !current)}
          type="button"
        >
          <Settings2 aria-hidden="true" size={16} />
        </button>
      </div>

      {showSettings && (
        <div className="border-b border-white/[0.08] p-4">
          <label className="mb-1.5 block text-xs font-medium text-neutral-300" htmlFor="slidex-agent-api-key">
            OpenAI API key
          </label>
          <input
            aria-describedby={visibleKeyError
              ? "slidex-agent-api-key-help slidex-agent-api-key-error"
              : "slidex-agent-api-key-help"}
            aria-invalid={Boolean(visibleKeyError)}
            autoComplete="off"
            className="h-11 w-full rounded-md border border-white/[0.12] bg-black px-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-white/30 focus:ring-2 focus:ring-white/10"
            id="slidex-agent-api-key"
            onChange={(event) => handleApiKeyChange(event.target.value)}
            placeholder="sk-…"
            ref={keyInputRef}
            spellCheck={false}
            type="password"
            value={llmApiKey}
          />
          {visibleKeyError && (
            <p className="mt-2 text-pretty text-xs leading-5 text-red-300" id="slidex-agent-api-key-error" role="alert">
              {visibleKeyError}
            </p>
          )}
          <p className="mt-2 text-pretty text-xs leading-5 text-neutral-500" id="slidex-agent-api-key-help">
            Current tab only. Forgotten on refresh or when you choose Forget key. Sent only with a run-start request; the editor and server do not store it.
          </p>
          <button
            className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-white/[0.12] px-3 text-sm font-medium text-neutral-200 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            disabled={!llmApiKey}
            onClick={forgetApiKey}
            type="button"
          >
            Forget key
          </button>
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <button
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/[0.12] px-3 text-sm font-medium text-neutral-200 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                disabled={!agent.canReset || agent.isCheckingStatus || agent.isResetting}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={15} />
                {agent.isResetting ? "Starting new conversation…" : "New conversation"}
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
                  The current deck stays open, but this chat history will be permanently removed.
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
                      onClick={() => void agent.resetConversation()}
                      type="button"
                    >
                      New conversation
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {agent.error && agent.errorCode !== "model_credential_rejected" && (
          <p className="mb-4 border border-red-400/25 bg-red-400/[0.06] p-3 text-xs leading-5 text-red-200" role="alert">
            {agent.error}
          </p>
        )}
        {agent.notice && (
          <p className="mb-4 border border-white/[0.12] bg-white/[0.04] p-3 text-pretty text-xs leading-5 text-neutral-300" role="status">
            {agent.notice}
          </p>
        )}
        {agent.status === "detached" && (
          <div className="mb-4 border border-white/[0.12] bg-white/[0.04] p-3">
            <p className="text-pretty text-xs leading-5 text-neutral-300">
              Live updates are unavailable. Check the durable conversation to see whether the run finished.
            </p>
            <button
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-white/[0.16] px-3 text-sm font-medium text-white hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              disabled={agent.isCheckingStatus}
              onClick={() => void agent.checkRunStatus()}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={15} />
              {agent.isCheckingStatus ? "Checking status…" : "Check status"}
            </button>
          </div>
        )}
        {agent.messages.length === 0 ? (
          <div className="border border-dashed border-white/[0.12] p-4">
            <p className="text-sm font-medium text-white">Edit this deck conversationally</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Ask for a new slide, a visual rewrite, or a change to the current MotionDoc.
            </p>
          </div>
        ) : (
          <div className="space-y-4" aria-live="polite">
            {agent.messages.map((item) => (
              <div className={item.role === "user" ? "pl-8" : "pr-4"} key={item.id}>
                <p className="mb-1 text-xs font-medium text-neutral-500">
                  {item.role === "user" ? "You" : "SlideX Agent"}
                </p>
                <p className={`whitespace-pre-wrap text-sm leading-6 ${item.role === "user" ? "border border-white/[0.12] bg-white/[0.06] p-3 text-white" : "text-neutral-300"}`}>
                  {item.content || "Thinking…"}
                </p>
              </div>
            ))}
          </div>
        )}

        {agent.tools.length > 0 && (
          <div className="mt-5 border-t border-white/[0.08] pt-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              <Wrench aria-hidden="true" size={13} /> Tool activity
            </p>
            <ul className="space-y-1.5">
              {agent.tools.map((tool) => (
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

        {agent.pendingMotionDoc && (
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
                onClick={agent.applyPendingMotionDoc}
                type="button"
              >
                Apply agent result
              </button>
              <button
                className="h-11 rounded-md border border-amber-200/30 px-3 text-sm text-amber-100 hover:bg-amber-100/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
                onClick={agent.dismissPendingMotionDoc}
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
          disabled={agent.isRunning || agent.isHydrating || agent.isResetting}
          id="slidex-agent-message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Make the opening slide more visual…"
          value={message}
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-neutral-600">Uses the current MotionDoc as its base</p>
          {agent.isRunning ? (
            <button
              className="flex h-11 items-center gap-2 rounded-md border border-white/[0.16] px-4 text-sm font-medium text-white hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              disabled={agent.isCheckingStatus}
              onClick={() => void agent.cancel()}
              type="button"
            >
              <Square aria-hidden="true" fill="currentColor" size={12} /> Stop
            </button>
          ) : (
            <button
              className="flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              disabled={!message.trim() || agent.isHydrating || agent.isResetting}
              type="submit"
            >
              <Send aria-hidden="true" size={15} /> Send
            </button>
          )}
        </div>
      </form>
    </aside>
  );
}
