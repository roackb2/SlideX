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
  const [isResetting, setIsResetting] = useState(false);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const activeRunIdRef = useRef<string | undefined>(undefined);
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
    writeAgentProjectBinding(window.sessionStorage, {
      projectId: inputRef.current.projectId,
      sessionId: currentSessionId,
      ...(runId ? { runId } : {}),
      ...(afterSequence !== undefined ? { afterSequence } : {})
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
      const currentRevision = await hashSource(sourceRef.current);
      if (currentRevision === result.baseSourceRevision) {
        inputRef.current.onApplyMotionDoc(result.motionDoc, result.assistantMessage);
      } else {
        setPendingMotionDoc({
          motionDoc: result.motionDoc,
          assistantMessage: result.assistantMessage
        });
      }
      settleRun("idle");
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
    signal: AbortSignal
  ): Promise<void> => {
    const consumer = createRunConsumer(runId);
    let lastError: unknown;

    while (!consumer.isTerminal()) {
      let handlerError: unknown;
      try {
        await client.subscribe({
          ...requireSubscriptionInput(consumer),
          signal,
          onEvent: async (event) => {
            const acceptance = consumer.accept(event);
            if (!acceptance.accepted) {
              return;
            }
            persistBinding(runId, event.sequence);
            try {
              await handleEvent(event);
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

        // The v4.3 remote consumer cannot seed a nonzero persisted cursor yet.
        // Replaying this retained run from sequence zero preserves its sequence
        // policy; the next Heddle slice will use binding.afterSequence directly.
        updateActiveRunId(state.activeRun.runId);
        persistBinding(state.activeRun.runId, binding.afterSequence);
        setMessages((current) => ensureAssistantPlaceholder(current));
        setStatus("reconnecting");
        setIsHydrating(false);
        await subscribeWithReconnect(state.activeRun.runId, controller.signal);
      } catch (caught) {
        if (controller.signal.aborted || !mountedRef.current) {
          return;
        }
        if (isMissingSessionError(caught)) {
          clearAgentProjectBinding(window.sessionStorage);
          updateSessionId(undefined);
          updateActiveRunId(undefined);
          setMessages([]);
          setStatus("idle");
          setNotice("The previous conversation was unavailable, so a new one will start.");
          return;
        }
        const message = errorMessage(caught);
        setError(message);
        setStatus(caught instanceof SlideXAgentClientError && caught.code === "replay_unavailable"
          ? "detached"
          : "error");
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
        accepted = await client.start({
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
        accepted = await client.start(request, controller.signal);
      }

      acceptedRun = true;
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
      if (caught instanceof SlideXAgentClientError
        && caught.code === "active_run_conflict"
        && sessionIdRef.current) {
        try {
          const state = await client.session(sessionIdRef.current, controller.signal);
          if (state.activeRun && restoreSessionState(state, { restoreProject: false })) {
            acceptedRun = true;
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
      setStatus(failure instanceof SlideXAgentClientError && failure.code === "replay_unavailable"
        ? "detached"
        : "error");
      if (!acceptedRun) {
        setAssistantMessage(caughtMessage);
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
      const cancelled = await client.cancel(runId);
      if (!cancelled) {
        throw new Error("The agent run is no longer active");
      }
      setNotice("Cancellation requested.");
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }, []);

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
    dismissPendingMotionDoc: () => setPendingMotionDoc(undefined),
    error,
    isHydrating,
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

function ensureAssistantPlaceholder(messages: PitchAgentMessage[]): PitchAgentMessage[] {
  return messages.at(-1)?.role === "assistant"
    ? messages
    : [...messages, { id: crypto.randomUUID(), role: "assistant", content: "" }];
}

function createRunConsumer(runId: string): AgentRunConsumer {
  const consumer = new ConversationRunConsumerService<{ runId: string }>({
    retry: { maxAttempts: 6, baseDelayMs: 500, maxDelayMs: 4_000 }
  });
  consumer.select({ runId });
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
  if (!(error instanceof SlideXAgentClientError) || error.status === undefined) {
    return true;
  }
  return error.status === 408
    || error.status === 425
    || error.status === 429
    || error.status >= 500;
}

function isMissingSessionError(error: unknown): boolean {
  return error instanceof SlideXAgentClientError
    && error.code === "session_not_found";
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
