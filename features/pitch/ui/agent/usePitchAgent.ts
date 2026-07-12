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
  SlideXAgentClient,
  SlideXAgentClientError
} from "@/features/pitch/infrastructure/slidexAgentClient";
import {
  clearAgentProjectBinding,
  readAgentProjectBinding,
  writeAgentProjectBinding
} from "@/features/pitch/infrastructure/slidexAgentPersistence";
import type {
  AgentRunEvent,
  AgentSession,
  AgentSessionState,
  AgentToolActivity
} from "@/features/pitch/domain/agentRun";

const client = new SlideXAgentClient();

type AgentRunConsumer = ConversationRunConsumerService<{ runId: string }>;
type AgentStatus = "idle" | "running" | "reconnecting" | "detached" | "error";

export type PitchAgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type PendingMotionDoc = {
  motionDoc: string;
  assistantMessage: string;
};

type MotionDocReconciliation = {
  pending?: PendingMotionDoc;
  error?: string;
};

type UsePitchAgentInput = {
  projectId: string;
  projectName: string;
  source: string;
  onApplyMotionDoc: (motionDoc: string, summary: string) => void;
  onRestoreSession: (session: AgentSession) => boolean;
};

export function usePitchAgent(input: UsePitchAgentInput) {
  const inputRef = useRef(input);
  const sourceRef = useRef(input.source);

  const [messages, setMessages] = useState<PitchAgentMessage[]>([]);
  const [tools, setTools] = useState<AgentToolActivity[]>([]);
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pendingMotionDoc, setPendingMotionDoc] = useState<PendingMotionDoc>();
  const [sessionId, setSessionId] = useState<string>();
  const [activeRunId, setActiveRunId] = useState<string>();
  const [isHydrating, setIsHydrating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const activeRunIdRef = useRef<string | undefined>(undefined);
  const activeSequenceRef = useRef<number | undefined>(undefined);
  const activeSourceRevisionRef = useRef<string | undefined>(undefined);
  const requestAbortRef = useRef<AbortController | undefined>(undefined);
  const projectIdRef = useRef(input.projectId);
  const mountedRef = useRef(true);

  useEffect(() => {
    inputRef.current = input;
    sourceRef.current = input.source;
  }, [input]);

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
    writeAgentProjectBinding(window.sessionStorage, {
      projectId: inputRef.current.projectId,
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
      setMessages(toPitchMessages(result.session));
      const reconciliation = await reconcileMotionDoc({
        assistantMessage: result.assistantMessage,
        baseSourceRevision: result.baseSourceRevision,
        currentSource: sourceRef.current,
        motionDoc: result.motionDoc,
        onApply: inputRef.current.onApplyMotionDoc
      });
      setPendingMotionDoc(reconciliation.pending);
      setError(reconciliation.error);
      settleRun(reconciliation.error ? "error" : "idle");
      return;
    }
    if (event.kind === "cancelled") {
      setAssistantMessage("Run cancelled.");
      settleRun("idle");
      return;
    }
    setAssistantMessage(event.error.message);
    setError(event.error.message);
    settleRun("error");
  }, [setAssistantMessage, settleRun]);

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
  }, [handleEvent, persistBinding]);

  const restoreSessionState = useCallback((
    state: AgentSessionState,
    options: { restoreProject?: boolean } = {}
  ): boolean => {
    if (options.restoreProject !== false
      && !inputRef.current.onRestoreSession(state.session)) {
      clearAgentProjectBinding(window.sessionStorage);
      updateSessionId(undefined);
      setNotice("The previous conversation was not restored because this deck has changed.");
      return false;
    }

    updateSessionId(state.session.id);
    setMessages(toPitchMessages(state.session));
    setError(undefined);
    setPendingMotionDoc(undefined);
    setTools([]);
    return true;
  }, [updateSessionId]);

  useEffect(() => {
    const previousProjectId = projectIdRef.current;
    const previousSessionId = sessionIdRef.current;
    const projectChanged = previousProjectId !== input.projectId;
    projectIdRef.current = input.projectId;
    requestAbortRef.current?.abort();
    const controller = new AbortController();
    requestAbortRef.current = controller;
    updateSessionId(undefined);
    updateActiveRunId(undefined);
    activeSequenceRef.current = undefined;
    activeSourceRevisionRef.current = undefined;
    setMessages([]);
    setTools([]);
    setPendingMotionDoc(undefined);
    setError(undefined);
    setNotice(undefined);
    setStatus("idle");
    setIsHydrating(false);

    const binding = readAgentProjectBinding(window.sessionStorage, input.projectId);
    if (!binding && !(projectChanged && previousSessionId)) {
      requestAbortRef.current = undefined;
      return () => controller.abort();
    }

    setIsHydrating(true);
    void (async () => {
      try {
        if (projectChanged && previousSessionId) {
          try {
            await client.resetSession(previousSessionId);
          } catch (resetError) {
            if (!isMissingSessionError(resetError)) {
              setNotice("The new deck is isolated, but the previous conversation could not be closed.");
            }
          }
        }
        if (!binding) {
          return;
        }
        const state = await client.session(binding.sessionId, controller.signal);
        if (controller.signal.aborted || !restoreSessionState(state)) {
          return;
        }
        if (!state.activeRun) {
          persistBinding();
          return;
        }

        const restoresStoredRun = binding.runId === state.activeRun.runId;
        const afterSequence = restoresStoredRun
          ? binding.afterSequence
          : undefined;
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
      } catch (caught) {
        if (controller.signal.aborted || !mountedRef.current) {
          return;
        }
        if (isMissingSessionError(caught)) {
          clearAgentProjectBinding(window.sessionStorage);
          updateSessionId(undefined);
          updateActiveRunId(undefined);
          activeSequenceRef.current = undefined;
          activeSourceRevisionRef.current = undefined;
          setMessages([]);
          setStatus("idle");
          setNotice("The previous conversation was unavailable, so a new one will start.");
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
    input.projectId,
    persistBinding,
    restoreSessionState,
    subscribeWithReconnect,
    updateActiveRunId,
    updateSessionId
  ]);

  const submit = useCallback(async (message: string, llmApiKey: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || activeRunIdRef.current || isHydrating || isResetting) {
      return;
    }

    setStatus("running");
    setError(undefined);
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
        title: inputRef.current.projectName,
        message: trimmedMessage,
        motionDoc,
        sourceRevision,
        llmApiKey: llmApiKey.trim() || "dev-oauth"
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
        clearAgentProjectBinding(window.sessionStorage);
        updateSessionId(undefined);
        setNotice("The previous conversation was unavailable, so this message started a new one.");
        accepted = await client.runs.start(request, controller.signal);
      }

      acceptedRun = true;
      activeSourceRevisionRef.current = sourceRevision;
      updateSessionId(accepted.session.id);
      updateActiveRunId(accepted.runId);
      setMessages(ensureAssistantPlaceholder(toPitchMessages(accepted.session)));
      persistBinding(accepted.runId, 0);
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
          if (state.activeRun && restoreSessionState(state, { restoreProject: false })) {
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
    isHydrating,
    isResetting,
    persistBinding,
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
  }, []);

  const checkRunStatus = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId || isCheckingStatus) {
      return;
    }

    setIsCheckingStatus(true);
    setError(undefined);
    try {
      const state = await client.session(currentSessionId);
      if (!mountedRef.current) {
        return;
      }
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
        clearAgentProjectBinding(window.sessionStorage);
        activeSequenceRef.current = undefined;
        activeSourceRevisionRef.current = undefined;
        updateSessionId(undefined);
        updateActiveRunId(undefined);
        setMessages([]);
        setTools([]);
        setPendingMotionDoc(undefined);
        setStatus("idle");
        setNotice("The previous conversation was unavailable, so a new one will start.");
        return;
      }
      setError(errorMessage(caught));
      setStatus("detached");
    } finally {
      if (mountedRef.current) {
        setIsCheckingStatus(false);
      }
    }
  }, [isCheckingStatus, persistBinding, updateActiveRunId, updateSessionId]);

  const resetConversation = useCallback(async () => {
    if (isResetting) {
      return;
    }
    setIsResetting(true);
    requestAbortRef.current?.abort();
    try {
      const currentSessionId = sessionIdRef.current;
      if (currentSessionId) {
        await client.resetSession(currentSessionId);
      }
      clearAgentProjectBinding(window.sessionStorage);
      activeSequenceRef.current = undefined;
      activeSourceRevisionRef.current = undefined;
      updateSessionId(undefined);
      updateActiveRunId(undefined);
      setMessages([]);
      setTools([]);
      setPendingMotionDoc(undefined);
      setError(undefined);
      setStatus("idle");
      setNotice("New conversation started. The current deck was kept.");
    } catch (caught) {
      if (isMissingSessionError(caught)) {
        clearAgentProjectBinding(window.sessionStorage);
        activeSequenceRef.current = undefined;
        activeSourceRevisionRef.current = undefined;
        updateSessionId(undefined);
        updateActiveRunId(undefined);
        setMessages([]);
        setTools([]);
        setPendingMotionDoc(undefined);
        setError(undefined);
        setStatus("idle");
        setNotice("The old conversation was already unavailable. A new one will start.");
      } else {
        setError(errorMessage(caught));
        setStatus("error");
      }
    } finally {
      setIsResetting(false);
    }
  }, [isResetting, updateActiveRunId, updateSessionId]);

  const applyPendingMotionDoc = useCallback(() => {
    if (!pendingMotionDoc) {
      return;
    }
    inputRef.current.onApplyMotionDoc(
      pendingMotionDoc.motionDoc,
      pendingMotionDoc.assistantMessage
    );
    setPendingMotionDoc(undefined);
  }, [pendingMotionDoc]);

  return {
    applyPendingMotionDoc,
    cancel,
    canReset: Boolean(sessionId || messages.length > 0),
    checkRunStatus,
    dismissPendingMotionDoc: () => setPendingMotionDoc(undefined),
    error,
    isHydrating,
    isCheckingStatus,
    isResetting,
    isRunning: Boolean(activeRunId),
    messages,
    notice,
    pendingMotionDoc,
    resetConversation,
    status,
    submit,
    tools
  };
}

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
  onApply: (motionDoc: string, summary: string) => void;
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
    input.onApply(input.motionDoc, input.assistantMessage);
    return {};
  } catch {
    return {
      pending,
      error: "The agent finished, but SlideX could not apply its deck result automatically."
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
