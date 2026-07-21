import type { ConversationRunProtocolEvent } from "@roackb2/heddle-remote";

export type AgentActivity = {
  type: string;
  messageId?: string;
  text?: string;
  done?: boolean;
  tool?: string;
  result?: { ok?: boolean };
};

export type AgentSession = {
  id: string;
  title: string;
  presentationId?: string;
  presentationTitle?: string;
  latestMotionDoc: string;
  messages: AgentSessionMessage[];
};

export type AgentSessionSummary = {
  id: string;
  title: string;
  presentation: {
    id: string;
    title: string;
  };
  createdAt: string;
  lastActivityAt: string;
  messageCount: number;
};

export type AgentSessionPage = {
  items: AgentSessionSummary[];
  nextCursor?: string;
};

export type AgentSessionMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: string;
};

export type ActiveAgentRun = {
  runId: string;
  acceptedAt: string;
};

export type AgentSessionState = {
  session: AgentSession;
  activeRun: ActiveAgentRun | null;
};

export type OpenAiApiKeyCredential = {
  type: "api-key";
  provider: "openai";
  apiKey: string;
};

export type OpenAiRuntimeCredential = {
  type: "oauth-access-token";
  provider: "openai";
  accessToken: string;
  expiresAt: number;
  accountId?: string;
};

export type ModelCredential = OpenAiApiKeyCredential | OpenAiRuntimeCredential;

export type OpenAiDeviceCodeChallenge = {
  deviceAuthId: string;
  userCode: string;
  verificationUrl: string;
  intervalMs: number;
  expiresAt: number;
};

export type OpenAiDeviceCodePollResult =
  | { status: "pending" }
  | { status: "expired" }
  | { status: "authorized"; credential: OpenAiRuntimeCredential };

export type AttachAgentSessionResult = {
  session: AgentSession;
};

export type AgentApiErrorCode =
  | "auth_required"
  | "invalid_request"
  | "rate_limited"
  | "model_auth_unavailable"
  | "session_not_found"
  | "run_not_found"
  | "active_run_conflict"
  | "replay_unavailable"
  | "internal_error";

export type StartAgentRunResult = {
  accepted: true;
  runId: string;
  acceptedAt: string;
  session: AgentSession;
};

export type AgentRunResult = {
  session: AgentSession;
  motionDoc: string;
  assistantMessage: string;
  baseSourceRevision: string;
  presentationSourceRevision?: number;
};

export type AgentRunEvent = ConversationRunProtocolEvent<AgentActivity, AgentRunResult>;

export type AgentToolActivity = {
  key: string;
  name: string;
  status: "running" | "completed" | "failed";
};
