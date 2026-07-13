import type { ZodType } from "zod";
import { ConversationRunHttpSseClient } from "@roackb2/heddle-remote/http-sse";
import type {
  AgentActivity,
  AgentApiErrorCode,
  AgentRunResult,
  AgentSessionState,
  StartAgentRunResult
} from "@/features/pitch/domain/agentRun";
import {
  AgentApiErrorResponseSchema,
  AgentSessionStateSchema,
  CancelAgentRunResultSchema,
  ResetAgentSessionResultSchema,
  SlideXAgentRunProtocol,
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
  fetch?: typeof globalThis.fetch;
};

type SlideXAgentRunClient = ConversationRunHttpSseClient<
  StartAgentRunInput,
  StartAgentRunResult,
  AgentActivity,
  AgentRunResult,
  { cancelled: boolean }
>;

export class SlideXAgentClient {
  readonly runs: SlideXAgentRunClient;
  private readonly baseUrl: string;
  private readonly fetch: typeof globalThis.fetch;
  private readonly getHeaders?: SlideXAgentClientOptions["getHeaders"];

  constructor(options: SlideXAgentClientOptions = {}) {
    const baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_SLIDEX_AGENT_SERVER_URL;
    this.baseUrl = (baseUrl || DEFAULT_AGENT_SERVER_URL).replace(/\/+$/, "");
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.getHeaders = options.getHeaders;
    this.runs = new ConversationRunHttpSseClient({
      baseUrl: `${this.baseUrl}/api/agent`,
      protocol: SlideXAgentRunProtocol,
      accepted: StartAgentRunResultSchema,
      cancellation: CancelAgentRunResultSchema,
      getHeaders: options.getHeaders,
      fetch: this.fetch
    });
  }

  session(sessionId: string, signal?: AbortSignal): Promise<AgentSessionState> {
    return this.request(
      `/api/agent/sessions/${encodeURIComponent(sessionId)}`,
      AgentSessionStateSchema,
      { method: "GET", signal }
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
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
    const response = await this.fetch(`${this.baseUrl}${path}`, {
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
