import {
  createParser,
  type EventSourceMessage
} from "eventsource-parser";
import type { ZodType } from "zod";
import { ConversationRunReplayCursorSchema } from "@roackb2/heddle-remote";
import type {
  AgentApiErrorCode,
  AgentRunEvent,
  AgentSessionState,
  StartAgentRunResult
} from "@/features/pitch/domain/agentRun";
import {
  AgentApiErrorResponseSchema,
  AgentSessionStateSchema,
  CancelAgentRunResultSchema,
  parseSlideXAgentSseMessage,
  ResetAgentSessionResultSchema,
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
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: AgentApiErrorCode
  ) {
    super(message);
    this.name = "SlideXAgentClientError";
  }
}

export type SlideXAgentClientOptions = {
  baseUrl?: string;
  getHeaders?: () => HeadersInit | Promise<HeadersInit>;
};

export class SlideXAgentClient {
  private readonly baseUrl: string;
  private readonly getHeaders?: SlideXAgentClientOptions["getHeaders"];

  constructor(options: SlideXAgentClientOptions = {}) {
    const baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_SLIDEX_AGENT_SERVER_URL;
    this.baseUrl = (baseUrl || DEFAULT_AGENT_SERVER_URL).replace(/\/$/, "");
    this.getHeaders = options.getHeaders;
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
    const headers = await this.createHeaders({ Accept: "text/event-stream" });
    const response = await fetch(
      `${this.baseUrl}/api/agent/runs/${encodeURIComponent(input.runId)}/events?after=${input.afterSequence}`,
      {
        headers,
        signal: input.signal
      }
    );
    if (!response.ok || !response.body) {
      throw await responseError(response);
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

  session(sessionId: string, signal?: AbortSignal): Promise<AgentSessionState> {
    return this.request(
      `/api/agent/sessions/${encodeURIComponent(sessionId)}`,
      AgentSessionStateSchema,
      { method: "GET", signal }
    );
  }

  async resetSession(sessionId: string): Promise<void> {
    await this.request(
      `/api/agent/sessions/${encodeURIComponent(sessionId)}`,
      ResetAgentSessionResultSchema,
      { method: "DELETE" }
    );
  }

  private async request<Result>(
    path: string,
    schema: ZodType<Result>,
    init: RequestInit
  ): Promise<Result> {
    const headers = await this.createHeaders(init.headers);
    if (init.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers
    });
    if (!response.ok) {
      throw await responseError(response);
    }
    return schema.parse(await response.json());
  }

  private async createHeaders(additional?: HeadersInit): Promise<Headers> {
    const headers = new Headers(await this.getHeaders?.());
    new Headers(additional).forEach((value, key) => headers.set(key, value));
    return headers;
  }
}

async function responseError(response: Response): Promise<SlideXAgentClientError> {
  const body = await response.json().catch(() => undefined);
  const parsed = AgentApiErrorResponseSchema.safeParse(body);
  return parsed.success
    ? new SlideXAgentClientError(
        parsed.data.error.message,
        response.status,
        parsed.data.error.code
      )
    : new SlideXAgentClientError(
        `SlideX agent request failed (${response.status})`,
        response.status
      );
}
