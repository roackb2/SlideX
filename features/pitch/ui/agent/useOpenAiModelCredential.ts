"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ModelCredential,
  OpenAiDeviceCodeChallenge
} from "@/features/pitch/domain/agentRun";
import type { SlideXAgentClient } from "@/features/pitch/infrastructure/slidexAgentClient";

const MIN_POLL_INTERVAL_MS = 2_000;

export type OpenAiDeviceAuthState = {
  status: "idle" | "requesting" | "pending" | "connected" | "expired" | "error";
  challenge?: OpenAiDeviceCodeChallenge;
  error?: string;
};

/**
 * Owns the browser-only model credential and OpenAI device-flow lifecycle.
 * Challenges and credentials stay in React memory and are discarded on
 * refresh, cancellation, expiry, or explicit disconnect.
 */
export function useOpenAiModelCredential(client: SlideXAgentClient) {
  const [modelCredential, setModelCredential] = useState<ModelCredential>();
  const [deviceAuth, setDeviceAuth] = useState<OpenAiDeviceAuthState>({
    status: "idle"
  });
  const authAbortRef = useRef<AbortController | undefined>(undefined);

  const abortDeviceAuth = useCallback(() => {
    authAbortRef.current?.abort();
    authAbortRef.current = undefined;
  }, []);

  useEffect(() => () => abortDeviceAuth(), [abortDeviceAuth]);

  useEffect(() => {
    if (modelCredential?.type !== "oauth-access-token") {
      return;
    }
    const remainingMs = modelCredential.expiresAt - Date.now();
    if (remainingMs <= 0) {
      setModelCredential(undefined);
      setDeviceAuth({
        status: "expired",
        error: "The Codex session expired. Connect again to continue."
      });
      return;
    }
    const timeout = window.setTimeout(() => {
      setModelCredential(undefined);
      setDeviceAuth({
        status: "expired",
        error: "The Codex session expired. Connect again to continue."
      });
    }, remainingMs);
    return () => window.clearTimeout(timeout);
  }, [modelCredential]);

  const setApiKey = useCallback((apiKey: string) => {
    abortDeviceAuth();
    setDeviceAuth({ status: "idle" });
    setModelCredential(apiKey
      ? { type: "api-key", provider: "openai", apiKey }
      : undefined);
  }, [abortDeviceAuth]);

  const clearModelCredential = useCallback(() => {
    abortDeviceAuth();
    setModelCredential(undefined);
    setDeviceAuth({ status: "idle" });
  }, [abortDeviceAuth]);

  const cancelCodexConnection = useCallback(() => {
    abortDeviceAuth();
    setDeviceAuth({ status: "idle" });
  }, [abortDeviceAuth]);

  const connectCodex = useCallback(async () => {
    abortDeviceAuth();
    const controller = new AbortController();
    authAbortRef.current = controller;
    setModelCredential(undefined);
    setDeviceAuth({ status: "requesting" });

    try {
      const challenge = await client.requestOpenAiDeviceCode(controller.signal);
      if (challenge.expiresAt <= Date.now()) {
        setDeviceAuth({
          status: "expired",
          error: "OpenAI returned an expired sign-in code. Try again."
        });
        return;
      }
      setDeviceAuth({ status: "pending", challenge });

      while (!controller.signal.aborted) {
        const remainingMs = challenge.expiresAt - Date.now();
        if (remainingMs <= 0) {
          setDeviceAuth({
            status: "expired",
            error: "The OpenAI sign-in code expired. Start again."
          });
          return;
        }
        await wait(
          Math.min(
            remainingMs,
            Math.max(challenge.intervalMs, MIN_POLL_INTERVAL_MS)
          ),
          controller.signal
        );
        if (Date.now() >= challenge.expiresAt) {
          setDeviceAuth({
            status: "expired",
            error: "The OpenAI sign-in code expired. Start again."
          });
          return;
        }

        const result = await client.pollOpenAiDeviceCode(
          challenge,
          controller.signal
        );
        if (result.status === "pending") {
          continue;
        }
        if (result.status === "expired" || result.credential.expiresAt <= Date.now()) {
          setDeviceAuth({
            status: "expired",
            error: "The OpenAI sign-in code expired. Start again."
          });
          return;
        }

        setModelCredential(result.credential);
        setDeviceAuth({ status: "connected" });
        return;
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      setDeviceAuth({
        status: "error",
        error: error instanceof Error
          ? error.message
          : "OpenAI sign-in failed. Try again."
      });
    } finally {
      if (authAbortRef.current === controller) {
        authAbortRef.current = undefined;
      }
    }
  }, [abortDeviceAuth, client]);

  return {
    state: { modelCredential, deviceAuth },
    actions: {
      cancelCodexConnection,
      clearModelCredential,
      connectCodex,
      setApiKey
    }
  };
}

function wait(durationMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const handleAbort = () => {
      window.clearTimeout(timeout);
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    };
    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, durationMs);
    signal.addEventListener("abort", handleAbort, { once: true });
  });
}
