"use client";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  MessageSquare,
  Plus,
  RefreshCw,
  Trash2
} from "lucide-react";
import { usePitchAgentContext } from "@/features/pitch/ui/agent/PitchAgentProvider";

dayjs.extend(relativeTime);

export function PitchAgentSessionList({ onClose }: { onClose: () => void }) {
  const { actions, meta, state } = usePitchAgentContext();
  const [selectingSessionId, setSelectingSessionId] = useState<string>();
  const [selectionError, setSelectionError] = useState<string>();

  const startNewConversation = () => {
    actions.startNewConversation();
    onClose();
  };

  const selectConversation = async (session: (typeof state.sessions)[number]) => {
    if (session.id === state.sessionId) {
      onClose();
      return;
    }
    if (!meta.canSwitchConversation || selectingSessionId) {
      return;
    }

    setSelectionError(undefined);
    setSelectingSessionId(session.id);
    try {
      const selected = await actions.selectSession(session);
      if (selected) {
        onClose();
        return;
      }
      setSelectionError("Couldn’t open that conversation. Try again.");
    } finally {
      setSelectingSessionId(undefined);
    }
  };

  return (
    <section
      aria-labelledby="slidex-agent-conversations-title"
      className="min-h-0 flex-1 overflow-y-auto p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          className="flex h-11 items-center gap-2 rounded-md px-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          onClick={onClose}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={14} />
          Back to conversation
        </button>
        <button
          className="flex h-11 shrink-0 items-center gap-2 rounded-md border border-white/[0.12] px-3 text-xs font-medium text-neutral-200 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          disabled={!meta.canSwitchConversation || Boolean(selectingSessionId)}
          onClick={startNewConversation}
          type="button"
        >
          <Plus aria-hidden="true" size={14} />
          New
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-balance text-sm font-semibold text-white" id="slidex-agent-conversations-title">
          Conversations
        </h3>
        <p className="mt-0.5 text-pretty text-xs text-neutral-500">
          Continue work across your presentations.
        </p>
        {!meta.canSwitchConversation && (
          <p className="mt-2 text-pretty text-xs leading-5 text-amber-200/80" role="status">
            {meta.isRunning
              ? "Return to the conversation to stop the active run before switching."
              : "Conversation actions will be available when the current operation finishes."}
          </p>
        )}
      </div>

      {selectionError && (
        <p className="mb-4 border border-red-400/25 bg-red-400/[0.06] p-3 text-pretty text-xs leading-5 text-red-200" role="alert">
          {selectionError}
        </p>
      )}

      {state.sessionsWarning && !state.sessionsError && (
        <div className="mb-4 border border-amber-300/25 bg-amber-300/[0.06] p-3" role="status">
          <p className="text-pretty text-xs leading-5 text-amber-100">
            {state.sessionsWarning}
          </p>
          <button
            className="mt-2 flex h-11 items-center gap-2 rounded-md border border-amber-200/30 px-3 text-xs font-medium text-amber-50 hover:bg-amber-200/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/60"
            onClick={() => void actions.retrySessions()}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={14} /> Retry sync
          </button>
        </div>
      )}

      {state.sessionsError && (
        <div className="mb-4 border border-red-400/25 bg-red-400/[0.06] p-3" role="alert">
          <p className="text-xs leading-5 text-red-200">{state.sessionsError}</p>
          <button
            className="mt-2 flex h-11 items-center gap-2 rounded-md border border-red-300/30 px-3 text-xs font-medium text-red-100 hover:bg-red-300/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
            onClick={() => void actions.retrySessions()}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={14} /> Retry
          </button>
        </div>
      )}

      {meta.isLoadingSessions ? (
        <div aria-label="Loading conversations" className="space-y-2" role="status">
          {[0, 1, 2].map((item) => (
            <div className="h-20 rounded-md bg-white/[0.05]" key={item} />
          ))}
        </div>
      ) : state.sessions.length === 0 && !state.sessionsError ? (
        <div className="border border-dashed border-white/[0.12] p-4 text-center">
          <MessageSquare aria-hidden="true" className="mx-auto text-neutral-500" size={20} />
          <p className="mt-3 text-sm font-medium text-white">No saved conversations yet</p>
          <p className="mt-1 text-pretty text-xs leading-5 text-neutral-500">
            Start chatting with the agent and the conversation will appear here.
          </p>
          <button
            className="mt-4 h-11 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={onClose}
            type="button"
          >
            Start a conversation
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {state.sessions.map((session) => {
            const isSelected = session.id === state.sessionId;
            const isSelecting = session.id === selectingSessionId;
            const isUnavailable = !isSelected
              && (!meta.canSwitchConversation || Boolean(selectingSessionId));
            return (
              <li
                className={`rounded-md border ${isSelected ? "border-white/30 bg-white/[0.1]" : "border-white/[0.12] bg-white/[0.03]"}`}
                key={session.id}
              >
                <div className="flex items-stretch">
                  <button
                    aria-current={isSelected ? "page" : undefined}
                    className="min-h-20 min-w-0 flex-1 px-3 py-2.5 text-left hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/50"
                    disabled={isUnavailable}
                    onClick={() => void selectConversation(session)}
                    type="button"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                        {session.title}
                      </span>
                      {isSelected && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                          <Check aria-hidden="true" size={11} /> Current
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-xs text-neutral-400">
                      {session.presentation.title}
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate text-neutral-500">
                        {dayjs(session.lastActivityAt).fromNow()} · {session.messageCount} {session.messageCount === 1 ? "message" : "messages"}
                      </span>
                      {!isSelected && (
                        <span className="flex shrink-0 items-center gap-0.5 font-medium text-neutral-300">
                          {isSelecting ? "Opening…" : "Open"}
                          {!isSelecting && <ChevronRight aria-hidden="true" size={13} />}
                        </span>
                      )}
                    </span>
                  </button>
                  <SessionDeleteButton
                    disabled={!meta.canSwitchConversation
                      || meta.isDeleting
                      || Boolean(selectingSessionId)}
                    onDelete={() => actions.deleteConversation(session.id)}
                    title={session.title}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {meta.hasMoreSessions && (
        <button
          className="mt-4 h-11 w-full rounded-md border border-white/[0.12] px-3 text-sm font-medium text-neutral-200 hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          disabled={meta.isFetchingMoreSessions}
          onClick={() => void actions.loadMoreSessions()}
          type="button"
        >
          {meta.isFetchingMoreSessions ? "Loading…" : "Load more"}
        </button>
      )}
    </section>
  );
}

function SessionDeleteButton({
  disabled,
  onDelete,
  title
}: {
  disabled: boolean;
  onDelete: () => Promise<void>;
  title: string;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          aria-label={`Delete ${title}`}
          className="flex min-h-20 w-11 shrink-0 items-center justify-center border-l border-white/[0.08] text-neutral-500 hover:bg-red-400/[0.08] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-300/60"
          disabled={disabled}
          type="button"
        >
          <Trash2 aria-hidden="true" size={15} />
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
            Delete “{title}”?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-pretty text-sm leading-6 text-neutral-400">
            This permanently deletes the chat history. Its presentation stays unchanged.
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
                onClick={() => void onDelete()}
                type="button"
              >
                Delete conversation
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
