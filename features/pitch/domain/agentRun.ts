import type { ConversationRunProtocolEvent } from "@roackb2/heddle-remote";

export type AgentActivity = {
  type: string;
  text?: string;
  tool?: string;
  result?: { ok?: boolean };
};

export type AgentSession = {
  id: string;
  title: string;
  latestMotionDoc: string;
  messages: AgentSessionMessage[];
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

export type AgentApiErrorCode =
  | "auth_required"
  | "invalid_request"
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
};

export type AgentRunEvent = ConversationRunProtocolEvent<AgentActivity, AgentRunResult>;

export type AgentToolActivity = {
  key: string;
  name: string;
  status: "running" | "completed" | "failed";
};
