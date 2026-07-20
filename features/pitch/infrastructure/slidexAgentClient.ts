import type { ZodType } from "zod";
import { ConversationRunHttpSseClient } from "@roackb2/heddle-remote/http-sse";
import type {
  AgentActivity,
  AgentApiErrorCode,
  AgentRunResult,
  AgentSessionPage,
  AgentSessionState,
  AttachAgentSessionResult,
  ModelCredential,
  OpenAiDeviceCodeChallenge,
  OpenAiDeviceCodePollResult,
  StartAgentRunResult
} from "@/features/pitch/domain/agentRun";
import {
  AgentApiErrorResponseSchema,
  AgentSessionPageSchema,
  AgentSessionStateSchema,
  AttachAgentSessionResultSchema,
  CancelAgentRunResultSchema,
  OpenAiDeviceCodeChallengeSchema,
  OpenAiDeviceCodePollResultSchema,
  ResetAgentSessionResultSchema,
  SlideXAgentRunProtocol,
  StartAgentRunResultSchema
} from "@/features/pitch/infrastructure/slidexAgentProtocol";

const DEFAULT_AGENT_SERVER_URL = "http://localhost:3000";

export type StartAgentRunInput = {
  sessionId?: string;
  presentationId: string;
  presentationTitle: string;
  message: string;
  motionDoc: string;
  sourceRevision: string;
  presentationSourceRevision: number;
  modelCredential: ModelCredential;
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

  sessions(input: {
    limit?: number;
    cursor?: string;
  } = {}, signal?: AbortSignal): Promise<AgentSessionPage> {
    const search = new URLSearchParams();
    if (input.limit !== undefined) {
      search.set("limit", String(input.limit));
    }
    if (input.cursor) {
      search.set("cursor", input.cursor);
    }
    const query = search.size > 0 ? `?${search.toString()}` : "";
    return this.request(
      `/api/agent/sessions${query}`,
      AgentSessionPageSchema,
      { method: "GET", signal }
    );
  }

  attachSession(
    sessionId: string,
    input: { presentationId: string; presentationTitle: string },
    signal?: AbortSignal
  ): Promise<AttachAgentSessionResult> {
    return this.request(
      `/api/agent/sessions/${encodeURIComponent(sessionId)}/presentation`,
      AttachAgentSessionResultSchema,
      {
        method: "PUT",
        body: JSON.stringify(input),
        signal
      }
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.request(
      `/api/agent/sessions/${encodeURIComponent(sessionId)}`,
      ResetAgentSessionResultSchema,
      { method: "DELETE" }
    );
  }

  requestOpenAiDeviceCode(signal?: AbortSignal): Promise<OpenAiDeviceCodeChallenge> {
    return this.request(
      "/api/agent/model-auth/openai/device-code",
      OpenAiDeviceCodeChallengeSchema,
      { method: "POST", body: "{}", signal }
    );
  }

  pollOpenAiDeviceCode(
    challenge: OpenAiDeviceCodeChallenge,
    signal?: AbortSignal
  ): Promise<OpenAiDeviceCodePollResult> {
    return this.request(
      "/api/agent/model-auth/openai/device-code/poll",
      OpenAiDeviceCodePollResultSchema,
      {
        method: "POST",
        body: JSON.stringify({ challenge }),
        signal
      }
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
