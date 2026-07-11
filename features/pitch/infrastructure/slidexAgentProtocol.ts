import type { EventSourceMessage } from "eventsource-parser";
import { z } from "zod";
import { ConversationRunProtocolCodec } from "@roackb2/heddle-remote";
import type {
  AgentActivity,
  AgentApiErrorCode,
  AgentRunEvent,
  AgentRunResult,
  AgentSessionState,
  StartAgentRunResult
} from "@/features/pitch/domain/agentRun";

const AgentSessionSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  latestMotionDoc: z.string(),
  messages: z.array(z.object({
    id: z.string().min(1),
    role: z.enum(["user", "assistant", "system", "tool"]),
    content: z.string(),
    createdAt: z.string().min(1)
  }))
});

const AgentActivitySchema: z.ZodType<AgentActivity> = z.object({
  type: z.string().min(1),
  text: z.string().optional(),
  tool: z.string().optional(),
  result: z.object({
    ok: z.boolean().optional()
  }).optional()
});

const AgentRunResultSchema: z.ZodType<AgentRunResult> = z.object({
  session: AgentSessionSchema,
  motionDoc: z.string(),
  assistantMessage: z.string(),
  baseSourceRevision: z.string().min(1)
});

export const StartAgentRunResultSchema: z.ZodType<StartAgentRunResult> = z.object({
  accepted: z.literal(true),
  runId: z.string().min(1),
  acceptedAt: z.iso.datetime(),
  session: AgentSessionSchema
});

export const CancelAgentRunResultSchema = z.object({
  cancelled: z.boolean()
});

export const AgentSessionStateSchema: z.ZodType<AgentSessionState> = z.object({
  session: AgentSessionSchema,
  activeRun: z.object({
    runId: z.string().min(1),
    acceptedAt: z.string().min(1)
  }).nullable()
});

export const ResetAgentSessionResultSchema = z.object({
  reset: z.literal(true)
});

const AgentApiErrorCodeSchema: z.ZodType<AgentApiErrorCode> = z.enum([
  "auth_required",
  "invalid_request",
  "session_not_found",
  "run_not_found",
  "active_run_conflict",
  "replay_unavailable",
  "internal_error"
]);

export const AgentApiErrorResponseSchema = z.object({
  error: z.object({
    code: AgentApiErrorCodeSchema,
    message: z.string().min(1)
  })
});

export const SlideXAgentRunProtocol = new ConversationRunProtocolCodec({
  activity: AgentActivitySchema,
  result: AgentRunResultSchema
});

export function parseSlideXAgentSseMessage(message: EventSourceMessage): AgentRunEvent {
  let body: unknown;
  try {
    body = JSON.parse(message.data);
  } catch {
    throw new Error("SlideX agent event contained invalid JSON");
  }

  const event = SlideXAgentRunProtocol.parseEvent(body);
  if (message.id !== String(event.sequence)) {
    throw new Error("SlideX agent event ID did not match its canonical sequence");
  }
  if (message.event !== event.kind) {
    throw new Error("SlideX agent SSE event name did not match its payload kind");
  }
  return event;
}
