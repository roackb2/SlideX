"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
} from "react";
import { ConversationRunConsumerService } from "@roackb2/heddle-remote";
import { ConversationRunHttpSseClientError } from "@roackb2/heddle-remote/http-sse";
import {
  type SlideXAgentClient,
  SlideXAgentClientError
} from "@/features/pitch/infrastructure/slidexAgentClient";
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import {
  deleteSupabaseAgentSession,
  syncSupabaseAgentSession
} from "@/features/pitch/infrastructure/supabaseAgentSessions";
import {
  clearAgentPresentationBinding,
  readAgentPresentationBinding,
  writeAgentPresentationBinding
} from "@/features/pitch/infrastructure/slidexAgentPersistence";
import type {
  AgentRunEvent,
  AgentSession,
  AgentSessionSummary,
  AgentSessionState,
  AgentToolActivity
} from "@/features/pitch/domain/agentRun";

type AgentRunConsumer = ConversationRunConsumerService<{ runId: string }>;
export type AgentStatus = "idle" | "running" | "reconnecting" | "detached" | "error";

export type PitchAgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type PendingMotionDoc = {
  motionDoc: string;
  assistantMessage: string;
};

type MotionDocReconciliation = {
  pending?: PendingMotionDoc;
  error?: string;
};

const MOTION_DOC_APPLY_ERROR =
  "The agent finished, but SlideX could not apply its deck result automatically.";

export type PitchAgentRuntimeInput = {
  initialSessionId?: string;
  presentationId: string;
  presentationTitle: string;
  source: string;
  onApplyMotionDoc: (
    motionDoc: string,
    summary: string
  ) => void | Promise<void>;
  onOpenSession?: (session: AgentSessionSummary) => void;
  onSelectedSessionChange?: (sessionId?: string) => void;
  persistSessionMetadata?: boolean;
};

export function usePitchAgent(
  input: PitchAgentRuntimeInput,
  client: SlideXAgentClient,
  onSessionChanged?: () => void
) {
  const inputRef = useRef(input);
  const initialSessionIdRef = useRef(input.initialSessionId);
  const sourceRef = useRef(input.source);
  const sessionChangedRef = useRef(onSessionChanged);

  const [messages, setMessages] = useState<PitchAgentMessage[]>([]);
  const [tools, setTools] = useState<AgentToolActivity[]>([]);
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [error, setError] = useState<string>();
  const [errorCode, setErrorCode] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pendingMotionDoc, setPendingMotionDoc] = useState<PendingMotionDoc>();
  const [sessionId, setSessionId] = useState<string>();
  const [activeRunId, setActiveRunId] = useState<string>();
  const [isHydrating, setIsHydrating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const activeRunIdRef = useRef<string | undefined>(undefined);
  const activeSequenceRef = useRef<number | undefined>(undefined);
  const activeSourceRevisionRef = useRef<string | undefined>(undefined);
  const requestAbortRef = useRef<AbortController | undefined>(undefined);
  const mountedRef = useRef(true);

  useEffect(() => {
    inputRef.current = input;
    sourceRef.current = input.source;
  }, [input]);

  useEffect(() => {
    sessionChangedRef.current = onSessionChanged;
  }, [onSessionChanged]);

  const notifySessionChanged = useCallback(() => {
    void sessionChangedRef.current?.();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestAbortRef.current?.abort();
    };
  }, []);

  const updateSessionId = useCallback((value?: string) => {
    sessionIdRef.current = value;
    setSessionId(value);
  }, []);

  const updateActiveRunId = useCallback((value?: string) => {
    activeRunIdRef.current = value;
    setActiveRunId(value);
  }, []);

  const persistSessionMetadata = useCallback((session: AgentSession) => {
    if (!inputRef.current.persistSessionMetadata) return;

    void syncSupabaseAgentSession(
      createSupabaseBrowserClient(),
      inputRef.current.presentationId,
      session
    ).catch(() => {
      if (mountedRef.current) {
        setNotice("The Agent conversation is active, but its Supabase metadata could not be saved.");
      }
    });
  }, []);

  const persistBinding = useCallback((runId?: string, afterSequence?: number) => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) {
      return;
    }
    if (!runId) {
      activeSequenceRef.current = undefined;
    } else if (afterSequence !== undefined) {
      activeSequenceRef.current = afterSequence;
    }
    writeAgentPresentationBinding(window.sessionStorage, {
      presentationId: inputRef.current.presentationId,
      sessionId: currentSessionId,
      ...(runId ? { runId } : {}),
      ...(runId && activeSequenceRef.current !== undefined
        ? { afterSequence: activeSequenceRef.current }
        : {}),
      ...(runId && activeSourceRevisionRef.current
        ? { baseSourceRevision: activeSourceRevisionRef.current }
        : {})
    });
  }, []);

  const resetRuntimeState = useCallback((nextNotice?: string) => {
    activeSequenceRef.current = undefined;
    activeSourceRevisionRef.current = undefined;
    updateSessionId(undefined);
    updateActiveRunId(undefined);
    setMessages([]);
    setTools([]);
    setPendingMotionDoc(undefined);
    setError(undefined);
    setErrorCode(undefined);
    setStatus("idle");
    setNotice(nextNotice);
  }, [updateActiveRunId, updateSessionId]);

  const setAssistantMessage = useCallback((content: string) => {
    setMessages((current) => {
      const index = current.findLastIndex(({ role }) => role === "assistant");
      return index < 0
        ? [...current, { id: crypto.randomUUID(), role: "assistant", content }]
        : current.map((item, itemIndex) => itemIndex === index ? { ...item, content } : item);
    });
  }, []);

  const settleRun = useCallback((nextStatus: AgentStatus) => {
    activeSourceRevisionRef.current = undefined;
    updateActiveRunId(undefined);
    persistBinding();
    setStatus(nextStatus);
  }, [persistBinding, updateActiveRunId]);

  const handleEvent = useCallback(async (event: AgentRunEvent): Promise<void> => {
    if (!mountedRef.current || event.runId !== activeRunIdRef.current) {
      return;
    }
    if (event.kind === "activity") {
      applyActivity(event, setAssistantMessage, setTools);
      return;
    }
    if (event.kind === "result") {
      const result = event.result;
      persistSessionMetadata(result.session);
      const reconciliation = await reconcileMotionDoc({
        assistantMessage: result.assistantMessage,
        baseSourceRevision: result.baseSourceRevision,
        currentSource: sourceRef.current,
        motionDoc: result.motionDoc,
        onApply: inputRef.current.onApplyMotionDoc
      });
      if (!mountedRef.current) {
        return;
      }
      setMessages(toPitchMessages(result.session));
      setPendingMotionDoc(reconciliation.pending);
      setError(reconciliation.error);
      setErrorCode(undefined);
      notifySessionChanged();
      settleRun(reconciliation.error ? "error" : "idle");
      return;
    }
    if (event.kind === "cancelled") {
      setAssistantMessage("Run cancelled.");
      setErrorCode(undefined);
      notifySessionChanged();
      settleRun("idle");
      return;
    }
    setAssistantMessage(event.error.message);
    setError(event.error.message);
    setErrorCode(event.error.code);
    notifySessionChanged();
    settleRun("error");
  }, [notifySessionChanged, persistSessionMetadata, setAssistantMessage, settleRun]);

  const subscribeWithReconnect = useCallback(async (
    runId: string,
    signal: AbortSignal,
    afterSequence?: number
  ): Promise<void> => {
    const consumer = createRunConsumer(runId, afterSequence);
    let lastError: unknown;

    while (!consumer.isTerminal()) {
      let handlerError: unknown;
      try {
        await client.runs.subscribe({
          ...requireSubscriptionInput(consumer),
          signal,
          onEvent: async (event) => {
            const acceptance = consumer.accept(event);
            if (!acceptance.accepted) {
              return;
            }
            try {
              await handleEvent(event);
              if (!acceptance.terminal) {
                persistBinding(runId, event.sequence);
              }
            } catch (caught) {
              handlerError = caught;
              throw caught;
            }
          }
        });
        if (!consumer.isTerminal()) {
          lastError = new Error("Agent event stream ended before the run completed");
        }
      } catch (subscriptionError) {
        if (handlerError !== undefined) {
          throw handlerError;
        }
        if (signal.aborted) {
          throw subscriptionError;
        }
        if (!isRetryableSubscriptionError(subscriptionError)) {
          throw subscriptionError;
        }
        lastError = subscriptionError;
      }

      if (!consumer.isTerminal()) {
        const retry = consumer.nextRetry();
        if (!retry) {
          throw lastError instanceof Error
            ? lastError
            : new Error("SlideX agent run exhausted its reconnect attempts");
        }
        setStatus("reconnecting");
        await wait(retry.delayMs, signal);
      }
    }
  }, [client, handleEvent, persistBinding]);

  const restoreSessionState = useCallback((state: AgentSessionState): void => {
    persistSessionMetadata(state.session);
    updateSessionId(state.session.id);
    setMessages(toPitchMessages(state.session));
    setError(undefined);
    setErrorCode(undefined);
    setPendingMotionDoc(undefined);
    setTools([]);
  }, [persistSessionMetadata, updateSessionId]);

  const hydrateConversation = useCallback(async (
    targetSessionId: string,
    binding: ReturnType<typeof readAgentPresentationBinding>,
    controller: AbortController
  ): Promise<void> => {
    await client.attachSession(targetSessionId, {
      presentationId: inputRef.current.presentationId,
      presentationTitle: inputRef.current.presentationTitle
    }, controller.signal);
    const state = await client.session(targetSessionId, controller.signal);
    if (controller.signal.aborted) {
      return;
    }

    restoreSessionState(state);
    notifySessionChanged();
    if (!state.activeRun) {
      persistBinding();
      setStatus("idle");
      return;
    }

    const restoresStoredRun = binding?.runId === state.activeRun.runId;
    const afterSequence = restoresStoredRun ? binding.afterSequence : undefined;
    activeSequenceRef.current = afterSequence;
    activeSourceRevisionRef.current = restoresStoredRun
      ? binding.baseSourceRevision
      : undefined;
    updateActiveRunId(state.activeRun.runId);
    persistBinding(state.activeRun.runId, afterSequence);
    setMessages((current) => ensureAssistantPlaceholder(current));
    setStatus("reconnecting");
    setIsHydrating(false);
    await subscribeWithReconnect(
      state.activeRun.runId,
      controller.signal,
      afterSequence
    );
  }, [
    client,
    notifySessionChanged,
    persistBinding,
    restoreSessionState,
    subscribeWithReconnect,
    updateActiveRunId
  ]);

  useEffect(() => {
    requestAbortRef.current?.abort();
    const controller = new AbortController();
    requestAbortRef.current = controller;
    resetRuntimeState();
    setIsHydrating(false);

    const storedBinding = readAgentPresentationBinding(
      window.sessionStorage,
      input.presentationId
    );
    const requestedSessionId = initialSessionIdRef.current?.trim();
    const targetSessionId = requestedSessionId || storedBinding?.sessionId;
    const binding = storedBinding?.sessionId === targetSessionId
      ? storedBinding
      : undefined;
    if (!targetSessionId) {
      requestAbortRef.current = undefined;
      return () => controller.abort();
    }

    setIsHydrating(true);
    void (async () => {
      try {
        await hydrateConversation(targetSessionId, binding, controller);
      } catch (caught) {
        if (controller.signal.aborted || !mountedRef.current) {
          return;
        }
        if (isMissingSessionError(caught)) {
          clearAgentPresentationBinding(
            window.sessionStorage,
            input.presentationId
          );
          resetRuntimeState(
            "The previous conversation was unavailable, so a new one will start."
          );
          inputRef.current.onSelectedSessionChange?.();
          notifySessionChanged();
          return;
        }
        const message = errorMessage(caught);
        setError(message);
        setStatus(statusAfterRunFailure(caught, Boolean(activeRunIdRef.current)));
      } finally {
        if (mountedRef.current && !controller.signal.aborted) {
          setIsHydrating(false);
        }
        if (requestAbortRef.current === controller) {
          requestAbortRef.current = undefined;
        }
      }
    })();

    return () => controller.abort();
  }, [
    hydrateConversation,
    input.presentationId,
    notifySessionChanged,
    resetRuntimeState,
  ]);

  const selectConversation = useCallback(async (targetSessionId: string) => {
    if (targetSessionId === sessionIdRef.current
      || activeRunIdRef.current
      || isHydrating
      || isDeleting
      || isCheckingStatus) {
      return false;
    }

    requestAbortRef.current?.abort();
    const controller = new AbortController();
    requestAbortRef.current = controller;
    setIsHydrating(true);
    setError(undefined);
    setErrorCode(undefined);
    setNotice(undefined);
    setPendingMotionDoc(undefined);

    try {
      await hydrateConversation(targetSessionId, undefined, controller);
      return true;
    } catch (caught) {
      if (controller.signal.aborted || !mountedRef.current) {
        return false;
      }
      if (isMissingSessionError(caught)) {
        setNotice("That conversation is no longer available.");
        notifySessionChanged();
        return false;
      }
      setError(errorMessage(caught));
      setStatus(statusAfterRunFailure(caught, Boolean(activeRunIdRef.current)));
      return false;
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setIsHydrating(false);
      }
      if (requestAbortRef.current === controller) {
        requestAbortRef.current = undefined;
      }
    }
  }, [
    hydrateConversation,
    isCheckingStatus,
    isDeleting,
    isHydrating,
    notifySessionChanged
  ]);

  const submit = useCallback(async (message: string, llmApiKey: string) => {
    const trimmedMessage = message.trim();
    const trimmedApiKey = llmApiKey.trim();
    if (!trimmedMessage || !trimmedApiKey
      || activeRunIdRef.current || isHydrating || isDeleting
      || isCheckingStatus) {
      return;
    }

    setStatus("running");
    setError(undefined);
    setErrorCode(undefined);
    setNotice(undefined);
    setPendingMotionDoc(undefined);
    setTools([]);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: trimmedMessage },
      { id: crypto.randomUUID(), role: "assistant", content: "" }
    ]);

    requestAbortRef.current?.abort();
    const controller = new AbortController();
    requestAbortRef.current = controller;
    let acceptedRun = false;

    try {
      const motionDoc = sourceRef.current;
      const sourceRevision = await hashSource(motionDoc);
      const request = {
        presentationId: inputRef.current.presentationId,
        presentationTitle: inputRef.current.presentationTitle,
        message: trimmedMessage,
        motionDoc,
        sourceRevision,
        llmApiKey: trimmedApiKey
      };
      const currentSessionId = sessionIdRef.current;
      let accepted;
      try {
        accepted = await client.runs.start({
          ...request,
          ...(currentSessionId ? { sessionId: currentSessionId } : {})
        }, controller.signal);
      } catch (caught) {
        if (!currentSessionId || !isMissingSessionError(caught)) {
          throw caught;
        }
        clearAgentPresentationBinding(
          window.sessionStorage,
          inputRef.current.presentationId
        );
        inputRef.current.onSelectedSessionChange?.();
        updateSessionId(undefined);
        setNotice("The previous conversation was unavailable, so this message started a new one.");
        accepted = await client.runs.start(request, controller.signal);
      }

      acceptedRun = true;
      activeSourceRevisionRef.current = sourceRevision;
      updateSessionId(accepted.session.id);
      persistSessionMetadata(accepted.session);
      updateActiveRunId(accepted.runId);
      setMessages(ensureAssistantPlaceholder(toPitchMessages(accepted.session)));
      persistBinding(accepted.runId, 0);
      notifySessionChanged();
      await subscribeWithReconnect(accepted.runId, controller.signal);
    } catch (caught) {
      if (controller.signal.aborted || !mountedRef.current) {
        return;
      }
      let failure = caught;
      if (isAgentClientError(caught)
        && caught.code === "active_run_conflict"
        && sessionIdRef.current) {
        try {
          const state = await client.session(sessionIdRef.current, controller.signal);
          if (state.activeRun) {
            restoreSessionState(state);
            acceptedRun = true;
            activeSourceRevisionRef.current = undefined;
            updateActiveRunId(state.activeRun.runId);
            setMessages((current) => ensureAssistantPlaceholder(current));
            persistBinding(state.activeRun.runId, 0);
            setStatus("reconnecting");
            await subscribeWithReconnect(state.activeRun.runId, controller.signal);
            return;
          }
        } catch (recoveryError) {
          failure = recoveryError;
        }
      }

      const caughtMessage = errorMessage(failure);
      setError(caughtMessage);
      setErrorCode(isAgentClientError(failure) ? failure.code : undefined);
      setStatus(statusAfterRunFailure(
        failure,
        acceptedRun || Boolean(activeRunIdRef.current)
      ));
      if (!acceptedRun) {
        setAssistantMessage(caughtMessage);
        activeSourceRevisionRef.current = undefined;
        updateActiveRunId(undefined);
      }
    } finally {
      if (requestAbortRef.current === controller) {
        requestAbortRef.current = undefined;
      }
    }
  }, [
    client,
    isHydrating,
    isDeleting,
    isCheckingStatus,
    notifySessionChanged,
    persistBinding,
    persistSessionMetadata,
    restoreSessionState,
    setAssistantMessage,
    subscribeWithReconnect,
    updateActiveRunId,
    updateSessionId
  ]);

  const cancel = useCallback(async () => {
    const runId = activeRunIdRef.current;
    if (!runId) {
      return;
    }
    try {
      const { cancelled } = await client.runs.cancel(runId);
      if (!cancelled) {
        throw new Error("The agent run is no longer active");
      }
      setNotice("Cancellation requested.");
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }, [client]);

  const checkRunStatus = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId || isCheckingStatus) {
      return;
    }

    setIsCheckingStatus(true);
    setError(undefined);
    setErrorCode(undefined);
    try {
      const state = await client.session(currentSessionId);
      if (!mountedRef.current) {
        return;
      }
      persistSessionMetadata(state.session);
      if (state.activeRun) {
        if (activeRunIdRef.current !== state.activeRun.runId) {
          activeSequenceRef.current = undefined;
          activeSourceRevisionRef.current = undefined;
        }
        updateActiveRunId(state.activeRun.runId);
        persistBinding(state.activeRun.runId);
        setStatus("detached");
        setNotice("The agent is still working. Check again shortly or stop the run.");
        return;
      }

      const reconciliation = await reconcileMotionDoc({
        assistantMessage: latestAssistantMessage(state.session),
        baseSourceRevision: activeSourceRevisionRef.current,
        currentSource: sourceRef.current,
        motionDoc: state.session.latestMotionDoc,
        onApply: inputRef.current.onApplyMotionDoc
      });
      updateSessionId(state.session.id);
      setMessages(toPitchMessages(state.session));
      setTools([]);
      setPendingMotionDoc(reconciliation.pending);
      setError(reconciliation.error);
      setErrorCode(undefined);
      activeSourceRevisionRef.current = undefined;
      updateActiveRunId(undefined);
      persistBinding();
      setStatus(reconciliation.error ? "error" : "idle");
      setNotice(reconciliation.pending
        ? "The run finished. Review the agent result before replacing your current deck."
        : "Conversation status updated.");
    } catch (caught) {
      if (!mountedRef.current) {
        return;
      }
      if (isMissingSessionError(caught)) {
        clearAgentPresentationBinding(
          window.sessionStorage,
          inputRef.current.presentationId
        );
        inputRef.current.onSelectedSessionChange?.();
        resetRuntimeState(
          "The previous conversation was unavailable, so a new one will start."
        );
        return;
      }
      setError(errorMessage(caught));
      setStatus("detached");
    } finally {
      if (mountedRef.current) {
        setIsCheckingStatus(false);
      }
    }
  }, [
    client,
    isCheckingStatus,
    persistBinding,
    persistSessionMetadata,
    resetRuntimeState,
    updateActiveRunId,
    updateSessionId
  ]);

  const startNewConversation = useCallback(() => {
    if (activeRunIdRef.current || isHydrating || isDeleting || isCheckingStatus) {
      return;
    }
    clearAgentPresentationBinding(
      window.sessionStorage,
      inputRef.current.presentationId
    );
    inputRef.current.onSelectedSessionChange?.();
    resetRuntimeState(
      "New conversation started. The previous conversation was kept."
    );
  }, [isCheckingStatus, isDeleting, isHydrating, resetRuntimeState]);

  const deleteConversation = useCallback(async (targetSessionId?: string) => {
    if (activeRunIdRef.current || isDeleting || isHydrating || isCheckingStatus) {
      return;
    }
    const selectedSessionId = sessionIdRef.current;
    const sessionToDelete = targetSessionId ?? selectedSessionId;
    if (!sessionToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await client.deleteSession(sessionToDelete);
      if (inputRef.current.persistSessionMetadata) {
        await deleteSupabaseAgentSession(
          createSupabaseBrowserClient(),
          inputRef.current.presentationId,
          sessionToDelete
        );
      }
      if (sessionToDelete === selectedSessionId) {
        clearAgentPresentationBinding(
          window.sessionStorage,
          inputRef.current.presentationId
        );
        inputRef.current.onSelectedSessionChange?.();
        resetRuntimeState("Conversation deleted. The current deck was kept.");
      } else {
        setNotice("Conversation deleted.");
      }
      notifySessionChanged();
    } catch (caught) {
      if (isMissingSessionError(caught)) {
        if (sessionToDelete === selectedSessionId) {
          clearAgentPresentationBinding(
            window.sessionStorage,
            inputRef.current.presentationId
          );
          inputRef.current.onSelectedSessionChange?.();
          resetRuntimeState(
            "The conversation was already unavailable. A new one will start."
          );
        } else {
          setNotice("That conversation was already unavailable.");
        }
        notifySessionChanged();
      } else {
        setError(errorMessage(caught));
        setStatus("error");
      }
    } finally {
      setIsDeleting(false);
    }
  }, [
    client,
    isCheckingStatus,
    isDeleting,
    isHydrating,
    notifySessionChanged,
    resetRuntimeState
  ]);

  const applyPendingMotionDoc = useCallback(async () => {
    if (!pendingMotionDoc) {
      return;
    }
    try {
      await inputRef.current.onApplyMotionDoc(
        pendingMotionDoc.motionDoc,
        pendingMotionDoc.assistantMessage
      );
      setPendingMotionDoc(undefined);
      setError(undefined);
      setStatus("idle");
    } catch {
      setError(MOTION_DOC_APPLY_ERROR);
      setStatus("error");
    }
  }, [pendingMotionDoc]);

  const clearCredentialError = useCallback(() => {
    if (errorCode !== "model_credential_rejected") {
      return;
    }
    setError(undefined);
    setErrorCode(undefined);
  }, [errorCode]);

  return {
    state: {
      error,
      errorCode,
      messages,
      notice,
      pendingMotionDoc,
      sessionId,
      status,
      tools
    },
    actions: {
      applyPendingMotionDoc,
      cancel,
      checkRunStatus,
      clearCredentialError,
      deleteConversation,
      dismissPendingMotionDoc: () => setPendingMotionDoc(undefined),
      selectConversation,
      startNewConversation,
      submit
    },
    meta: {
      canDeleteConversation: Boolean(sessionId) && !activeRunId,
      canStartNewConversation: Boolean(sessionId || messages.length > 0)
        && !activeRunId,
      canSwitchConversation: !activeRunId
        && !isCheckingStatus
        && !isDeleting
        && !isHydrating,
      isCheckingStatus,
      isDeleting,
      isHydrating,
      isRunning: Boolean(activeRunId)
    }
  };
}

export type PitchAgentRuntime = ReturnType<typeof usePitchAgent>;

function applyActivity(
  event: Extract<AgentRunEvent, { kind: "activity" }>,
  setAssistantMessage: (content: string) => void,
  setTools: Dispatch<SetStateAction<AgentToolActivity[]>>
): void {
  const activity = event.activity;
  if (activity.type === "assistant.stream" && activity.text) {
    setAssistantMessage(activity.text);
  }
  if ((activity.type === "tool.calling" || activity.type === "tool.completed") && activity.tool) {
    const next: AgentToolActivity = {
      key: activity.tool,
      name: displayToolName(activity.tool),
      status: activity.type === "tool.calling"
        ? "running"
        : activity.result?.ok === false ? "failed" : "completed"
    };
    setTools((current) => [...current.filter(({ key }) => key !== next.key), next]);
  }
}

function toPitchMessages(session: AgentSession): PitchAgentMessage[] {
  return session.messages
    .filter((message): message is typeof message & { role: "user" | "assistant" } => (
      message.role === "user" || message.role === "assistant"
    ))
    .map(({ id, role, content }) => ({ id, role, content }));
}

function latestAssistantMessage(session: AgentSession): string {
  return session.messages.findLast(({ role }) => role === "assistant")?.content
    || "Agent changes are ready.";
}

async function reconcileMotionDoc(input: {
  assistantMessage: string;
  baseSourceRevision?: string;
  currentSource: string;
  motionDoc: string;
  onApply: (
    motionDoc: string,
    summary: string
  ) => void | Promise<void>;
}): Promise<MotionDocReconciliation> {
  if (input.motionDoc === input.currentSource) {
    return {};
  }

  const pending = {
    motionDoc: input.motionDoc,
    assistantMessage: input.assistantMessage
  };
  if (!input.baseSourceRevision) {
    return { pending };
  }

  try {
    const currentRevision = await hashSource(input.currentSource);
    if (currentRevision !== input.baseSourceRevision) {
      return { pending };
    }
    await input.onApply(input.motionDoc, input.assistantMessage);
    return {};
  } catch {
    return {
      pending,
      error: MOTION_DOC_APPLY_ERROR
    };
  }
}

function ensureAssistantPlaceholder(messages: PitchAgentMessage[]): PitchAgentMessage[] {
  return messages.at(-1)?.role === "assistant"
    ? messages
    : [...messages, { id: crypto.randomUUID(), role: "assistant", content: "" }];
}

function createRunConsumer(runId: string, afterSequence?: number): AgentRunConsumer {
  const consumer = new ConversationRunConsumerService<{ runId: string }>({
    retry: { maxAttempts: 6, baseDelayMs: 500, maxDelayMs: 4_000 }
  });
  consumer.select({ runId }, { afterSequence });
  return consumer;
}

function requireSubscriptionInput(consumer: AgentRunConsumer) {
  const subscription = consumer.subscriptionInput();
  if (!subscription) {
    throw new Error("SlideX agent run no longer accepts subscriptions");
  }
  return subscription;
}

function isRetryableSubscriptionError(error: unknown): boolean {
  if (!isAgentClientError(error) || error.status === undefined) {
    return true;
  }
  return error.status === 408
    || error.status === 425
    || error.status === 429
    || error.status >= 500;
}

function isMissingSessionError(error: unknown): boolean {
  return isAgentClientError(error)
    && error.code === "session_not_found";
}

function statusAfterRunFailure(error: unknown, hasActiveRun: boolean): AgentStatus {
  return (hasActiveRun
    || (isAgentClientError(error) && error.code === "replay_unavailable"))
    ? "detached"
    : "error";
}

function isAgentClientError(
  error: unknown
): error is SlideXAgentClientError | ConversationRunHttpSseClientError {
  return error instanceof SlideXAgentClientError
    || error instanceof ConversationRunHttpSseClientError;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function hashSource(source: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function displayToolName(tool: string): string {
  return tool.replace(/^slidex_/, "").replaceAll("_", " ");
}

function wait(durationMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, durationMs);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
