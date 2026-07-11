import type { ConversationRunProtocolEvent } from "@roackb2/heddle-remote";

export type AgentActivity = {
  type: string;
  text?: string;
  tool?: string;
  result?: { ok?: boolean };
};

export type AgentSession = {
  id: string;
};

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
