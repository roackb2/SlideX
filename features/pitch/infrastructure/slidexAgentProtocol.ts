import { z } from "zod";
import { ConversationRunProtocolCodec } from "@roackb2/heddle-remote";
import type {
  AgentActivity,
  AgentApiErrorCode,
  AgentRunResult,
  AgentSessionPage,
  AgentSessionState,
  AttachAgentSessionResult,
  OpenAiDeviceCodeChallenge,
  StartAgentRunResult
} from "@/features/pitch/domain/agentRun";

const AgentSessionSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  presentationId: z.string().min(1).optional(),
  presentationTitle: z.string().min(1).optional(),
  latestMotionDoc: z.string(),
  messages: z.array(z.object({
    id: z.string().min(1),
    role: z.enum(["user", "assistant", "system", "tool"]),
    content: z.string(),
    createdAt: z.string().min(1)
  }))
});

export const AgentSessionPageSchema: z.ZodType<AgentSessionPage> = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    presentation: z.object({
      id: z.string().min(1),
      title: z.string().min(1)
    }),
    createdAt: z.iso.datetime(),
    lastActivityAt: z.iso.datetime(),
    messageCount: z.number().int().nonnegative()
  })),
  nextCursor: z.string().min(1).optional()
});

export const AttachAgentSessionResultSchema: z.ZodType<AttachAgentSessionResult> = z.object({
  session: AgentSessionSchema
});

const AgentActivitySchema: z.ZodType<AgentActivity> = z.object({
  type: z.string().min(1),
  text: z.string().optional(),
  done: z.boolean().optional(),
  tool: z.string().optional(),
  result: z.object({
    ok: z.boolean().optional()
  }).optional()
});

const AgentRunResultSchema: z.ZodType<AgentRunResult> = z.object({
  session: AgentSessionSchema,
  motionDoc: z.string(),
  assistantMessage: z.string(),
  baseSourceRevision: z.string().min(1),
  presentationSourceRevision: z.number().int().nonnegative().optional()
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

export const OpenAiRuntimeCredentialSchema = z.object({
  type: z.literal("oauth-access-token"),
  provider: z.literal("openai"),
  accessToken: z.string().trim().min(1).max(20_000),
  expiresAt: z.number().int().positive(),
  accountId: z.string().trim().min(1).max(512).optional()
});

export const ModelCredentialSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("api-key"),
    provider: z.literal("openai"),
    apiKey: z.string().trim().min(8).max(20_000)
  }),
  OpenAiRuntimeCredentialSchema
]);

export const OpenAiDeviceCodeChallengeSchema: z.ZodType<OpenAiDeviceCodeChallenge> = z.object({
  deviceAuthId: z.string().trim().min(1).max(2_048),
  userCode: z.string().trim().min(1).max(128),
  verificationUrl: z.url().refine(isOpenAiAuthUrl, {
    message: "OpenAI device verification must use auth.openai.com over HTTPS"
  }),
  intervalMs: z.number().int().positive(),
  expiresAt: z.number().int().positive()
});

export const OpenAiDeviceCodePollResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("pending") }),
  z.object({ status: z.literal("expired") }),
  z.object({
    status: z.literal("authorized"),
    credential: OpenAiRuntimeCredentialSchema
  })
]);

const AgentApiErrorCodeSchema: z.ZodType<AgentApiErrorCode> = z.enum([
  "auth_required",
  "invalid_request",
  "rate_limited",
  "model_auth_unavailable",
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

function isOpenAiAuthUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "auth.openai.com";
  } catch {
    return false;
  }
}
