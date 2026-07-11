"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SlideXAgentClient } from "@/features/pitch/infrastructure/slidexAgentClient";
import type { AgentRunEvent, AgentToolActivity } from "@/features/pitch/domain/agentRun";

const client = new SlideXAgentClient();
const MAX_RECONNECT_ATTEMPTS = 6;

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
      await subscribeWithReconnect(accepted.runId, requestController.signal, handleEvent);
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

    async function handleEvent(event: AgentRunEvent): Promise<boolean> {
      if (!mountedRef.current) {
        return true;
      }
      if (event.type === "activity") {
        applyActivity(event);
        return false;
      }
      if (event.type === "complete") {
        setAssistantMessage(event.assistantMessage);
        const currentRevision = await hashSource(sourceRef.current);
        if (currentRevision === event.baseSourceRevision) {
          input.onApplyMotionDoc(event.motionDoc, event.assistantMessage);
        } else {
          setPendingMotionDoc({
            motionDoc: event.motionDoc,
            assistantMessage: event.assistantMessage
          });
        }
        setStatus("idle");
        return true;
      }
      if (event.type === "cancelled") {
        setAssistantMessage("Run cancelled.");
        setStatus("idle");
        return true;
      }
      setAssistantMessage(event.message);
      setError(event.message);
      setStatus("error");
      return true;
    }

    function applyActivity(event: Extract<AgentRunEvent, { type: "activity" }>): void {
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
      runId: string,
      signal: AbortSignal,
      onEvent: (event: AgentRunEvent) => Promise<boolean>
    ): Promise<void> {
      let afterSequence = 0;
      let terminal = false;
      let attempt = 0;

      while (!terminal && attempt < MAX_RECONNECT_ATTEMPTS) {
        try {
          await client.subscribe({
            runId,
            afterSequence,
            signal,
            onEvent: async (event) => {
              afterSequence = Math.max(afterSequence, event.sequence);
              terminal = terminal || await onEvent(event);
            }
          });
          if (!terminal) {
            throw new Error("Agent event stream ended before the run completed");
          }
        } catch (subscriptionError) {
          if (terminal) {
            return;
          }
          attempt += 1;
          if (attempt >= MAX_RECONNECT_ATTEMPTS) {
            throw subscriptionError;
          }
          setStatus("reconnecting");
          await wait(Math.min(500 * 2 ** (attempt - 1), 4_000), signal);
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
