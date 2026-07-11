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

export type AgentRunEvent =
  | {
      type: "activity";
      runId: string;
      sequence: number;
      activity: AgentActivity;
    }
  | {
      type: "complete";
      runId: string;
      sequence: number;
      session: AgentSession;
      motionDoc: string;
      assistantMessage: string;
      baseSourceRevision: string;
    }
  | {
      type: "cancelled";
      runId: string;
      sequence: number;
      reason: string;
    }
  | {
      type: "error";
      runId: string;
      sequence: number;
      message: string;
    };

export type AgentToolActivity = {
  key: string;
  name: string;
  status: "running" | "completed" | "failed";
};
