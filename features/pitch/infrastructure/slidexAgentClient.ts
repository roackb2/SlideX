import type { AgentRunEvent, StartAgentRunResult } from "@/features/pitch/domain/agentRun";

const DEFAULT_AGENT_SERVER_URL = "http://localhost:3000";

export type StartAgentRunInput = {
  sessionId?: string;
  title: string;
  message: string;
  motionDoc: string;
  sourceRevision: string;
  llmApiKey: string;
  model?: string;
};

export class SlideXAgentClient {
  private readonly baseUrl: string;

  constructor(baseUrl = process.env.NEXT_PUBLIC_SLIDEX_AGENT_SERVER_URL) {
    this.baseUrl = (baseUrl || DEFAULT_AGENT_SERVER_URL).replace(/\/$/, "");
  }

  async start(input: StartAgentRunInput, signal?: AbortSignal): Promise<StartAgentRunResult> {
    return this.request<StartAgentRunResult>("/api/agent/runs", {
      method: "POST",
      body: JSON.stringify(input),
      signal
    });
  }

  async subscribe(input: {
    runId: string;
    afterSequence: number;
    signal?: AbortSignal;
    onEvent: (event: AgentRunEvent) => void | Promise<void>;
  }): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/agent/runs/${encodeURIComponent(input.runId)}/events?after=${input.afterSequence}`,
      {
        headers: { Accept: "text/event-stream" },
        signal: input.signal
      }
    );
    if (!response.ok || !response.body) {
      throw new Error(await readError(response));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const data = frame
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (data) {
          await input.onEvent(JSON.parse(data) as AgentRunEvent);
        }
      }
      if (done) {
        return;
      }
    }
  }

  async cancel(runId: string): Promise<boolean> {
    const result = await this.request<{ cancelled: boolean }>(
      `/api/agent/runs/${encodeURIComponent(runId)}/cancel`,
      { method: "POST" }
    );
    return result.cancelled;
  }

  private async request<Result>(path: string, init: RequestInit): Promise<Result> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers
      }
    });
    if (!response.ok) {
      throw new Error(await readError(response));
    }
    return response.json() as Promise<Result>;
  }
}

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => undefined) as { error?: string } | undefined;
  return body?.error ?? `SlideX agent request failed (${response.status})`;
}
