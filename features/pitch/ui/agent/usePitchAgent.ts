"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationRunConsumerService } from "@roackb2/heddle-remote";
import {
  SlideXAgentClient,
  SlideXAgentClientError
} from "@/features/pitch/infrastructure/slidexAgentClient";
import type { AgentRunEvent, AgentToolActivity } from "@/features/pitch/domain/agentRun";

const client = new SlideXAgentClient();

type AgentRunConsumer = ConversationRunConsumerService<{ runId: string }>;

export type PitchAgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type PendingMotionDoc = {
  motionDoc: string;
  assistantMessage: string;
};

export function usePitchAgent(input: {
  projectName: string;
  source: string;
  onApplyMotionDoc: (motionDoc: string, summary: string) => void;
}) {
  const [messages, setMessages] = useState<PitchAgentMessage[]>([]);
  const [tools, setTools] = useState<AgentToolActivity[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "reconnecting" | "error">("idle");
  const [error, setError] = useState<string>();
  const [pendingMotionDoc, setPendingMotionDoc] = useState<PendingMotionDoc>();
  const [sessionId, setSessionId] = useState<string>();
  const runIdRef = useRef<string | undefined>(undefined);
  const requestAbortRef = useRef<AbortController | undefined>(undefined);
  const sourceRef = useRef(input.source);
  const mountedRef = useRef(true);

  useEffect(() => {
    sourceRef.current = input.source;
  }, [input.source]);

  useEffect(() => {
    const key = sessionStorageKey(input.projectName);
    setSessionId(window.localStorage.getItem(key) ?? undefined);
  }, [input.projectName]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestAbortRef.current?.abort();
    };
  }, []);

  const submit = useCallback(async (message: string, llmApiKey: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || status === "running" || status === "reconnecting") {
      return;
    }

    setStatus("running");
    setError(undefined);
    setPendingMotionDoc(undefined);
    setTools([]);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: trimmedMessage },
      { id: crypto.randomUUID(), role: "assistant", content: "" }
    ]);

    try {
      requestAbortRef.current?.abort();
      const requestController = new AbortController();
      requestAbortRef.current = requestController;
      const motionDoc = sourceRef.current;
      const sourceRevision = await hashSource(motionDoc);
      const accepted = await client.start({
        sessionId,
        title: input.projectName,
        message: trimmedMessage,
        motionDoc,
        sourceRevision,
        llmApiKey: llmApiKey.trim() || "dev-oauth"
      }, requestController.signal);
      runIdRef.current = accepted.runId;
      setSessionId(accepted.session.id);
      window.localStorage.setItem(sessionStorageKey(input.projectName), accepted.session.id);
      await subscribeWithReconnect(
        createRunConsumer(accepted.runId),
        requestController.signal,
        handleEvent
      );
    } catch (caught) {
      if (!mountedRef.current) {
        return;
      }
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(message);
      setStatus("error");
      setAssistantMessage(message);
    } finally {
      runIdRef.current = undefined;
      requestAbortRef.current = undefined;
    }

    async function handleEvent(event: AgentRunEvent): Promise<void> {
      if (!mountedRef.current) {
        return;
      }
      if (event.kind === "activity") {
        applyActivity(event);
        return;
      }
      if (event.kind === "result") {
        const result = event.result;
        setAssistantMessage(result.assistantMessage);
        const currentRevision = await hashSource(sourceRef.current);
        if (currentRevision === result.baseSourceRevision) {
          input.onApplyMotionDoc(result.motionDoc, result.assistantMessage);
        } else {
          setPendingMotionDoc({
            motionDoc: result.motionDoc,
            assistantMessage: result.assistantMessage
          });
        }
        setStatus("idle");
        return;
      }
      if (event.kind === "cancelled") {
        setAssistantMessage("Run cancelled.");
        setStatus("idle");
        return;
      }
      setAssistantMessage(event.error.message);
      setError(event.error.message);
      setStatus("error");
    }

    function applyActivity(event: Extract<AgentRunEvent, { kind: "activity" }>): void {
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

    function setAssistantMessage(content: string): void {
      setMessages((current) => {
        const index = current.findLastIndex(({ role }) => role === "assistant");
        return index < 0
          ? [...current, { id: crypto.randomUUID(), role: "assistant", content }]
          : current.map((item, itemIndex) => itemIndex === index ? { ...item, content } : item);
      });
    }

    async function subscribeWithReconnect(
      consumer: AgentRunConsumer,
      signal: AbortSignal,
      onEvent: (event: AgentRunEvent) => Promise<void>
    ): Promise<void> {
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
              try {
                await onEvent(event);
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
    }
  }, [input, sessionId, status]);

  const cancel = useCallback(async () => {
    const runId = runIdRef.current;
    if (!runId) {
      return;
    }
    try {
      const cancelled = await client.cancel(runId);
      if (!cancelled) {
        throw new Error("The agent run is no longer active");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, []);

  const applyPendingMotionDoc = useCallback(() => {
    if (!pendingMotionDoc) {
      return;
    }
    input.onApplyMotionDoc(pendingMotionDoc.motionDoc, pendingMotionDoc.assistantMessage);
    setPendingMotionDoc(undefined);
  }, [input, pendingMotionDoc]);

  return {
    applyPendingMotionDoc,
    cancel,
    dismissPendingMotionDoc: () => setPendingMotionDoc(undefined),
    error,
    isRunning: status === "running" || status === "reconnecting",
    messages,
    pendingMotionDoc,
    status,
    submit,
    tools
  };
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

async function hashSource(source: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sessionStorageKey(projectName: string): string {
  return `slidex_agent_session:${projectName}`;
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
