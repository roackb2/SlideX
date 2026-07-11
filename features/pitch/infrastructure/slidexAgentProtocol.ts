import type { EventSourceMessage } from "eventsource-parser";
import { z } from "zod";
import { ConversationRunProtocolCodec } from "@roackb2/heddle/remote";
import type {
  AgentActivity,
  AgentRunEvent,
  AgentRunResult,
  StartAgentRunResult
} from "@/features/pitch/domain/agentRun";

const AgentSessionSchema = z.object({
  id: z.string().min(1)
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
