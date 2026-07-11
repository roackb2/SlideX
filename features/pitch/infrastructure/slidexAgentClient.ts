import {
  createParser,
  type EventSourceMessage
} from "eventsource-parser";
import type { ZodType } from "zod";
import { ConversationRunReplayCursorSchema } from "@roackb2/heddle-remote";
import type { AgentRunEvent, StartAgentRunResult } from "@/features/pitch/domain/agentRun";
import {
  CancelAgentRunResultSchema,
  parseSlideXAgentSseMessage,
  StartAgentRunResultSchema
} from "@/features/pitch/infrastructure/slidexAgentProtocol";

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

export class SlideXAgentClientError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

export class SlideXAgentClient {
  private readonly baseUrl: string;

  constructor(baseUrl = process.env.NEXT_PUBLIC_SLIDEX_AGENT_SERVER_URL) {
    this.baseUrl = (baseUrl || DEFAULT_AGENT_SERVER_URL).replace(/\/$/, "");
  }

  async start(input: StartAgentRunInput, signal?: AbortSignal): Promise<StartAgentRunResult> {
    return this.request("/api/agent/runs", StartAgentRunResultSchema, {
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
    ConversationRunReplayCursorSchema.parse(input.afterSequence);
    const response = await fetch(
      `${this.baseUrl}/api/agent/runs/${encodeURIComponent(input.runId)}/events?after=${input.afterSequence}`,
      {
        headers: { Accept: "text/event-stream" },
        signal: input.signal
      }
    );
    if (!response.ok || !response.body) {
      throw new SlideXAgentClientError(await readError(response), response.status);
    }
    if (!response.headers.get("content-type")?.startsWith("text/event-stream")) {
      throw new SlideXAgentClientError(
        "SlideX agent event response was not an SSE stream",
        response.status
      );
    }

    const pending: EventSourceMessage[] = [];
    const parser = createParser({
      onEvent: (event) => pending.push(event),
      onError: (error) => {
        throw new SlideXAgentClientError(error.message, response.status);
      }
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const flushPending = async () => {
      while (pending.length > 0) {
        input.signal?.throwIfAborted();
        const message = pending.shift();
        if (message) {
          try {
            await input.onEvent(parseSlideXAgentSseMessage(message));
          } catch (error) {
            throw new SlideXAgentClientError(
              error instanceof Error ? error.message : String(error),
              response.status
            );
          }
        }
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          parser.feed(decoder.decode());
          parser.reset({ consume: true });
          await flushPending();
          return;
        }
        parser.feed(decoder.decode(value, { stream: true }));
        await flushPending();
      }
    } finally {
      reader.releaseLock();
    }
  }

  async cancel(runId: string): Promise<boolean> {
    const result = await this.request(
      `/api/agent/runs/${encodeURIComponent(runId)}/cancel`,
      CancelAgentRunResultSchema,
      { method: "POST" }
    );
    return result.cancelled;
  }

  private async request<Result>(
    path: string,
    schema: ZodType<Result>,
    init: RequestInit
  ): Promise<Result> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers
      }
    });
    if (!response.ok) {
      throw new SlideXAgentClientError(await readError(response), response.status);
    }
    return schema.parse(await response.json());
  }
}

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => undefined) as { error?: string } | undefined;
  return body?.error ?? `SlideX agent request failed (${response.status})`;
}
