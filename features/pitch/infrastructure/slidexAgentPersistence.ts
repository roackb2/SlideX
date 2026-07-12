import { z } from "zod";

const ACTIVE_PROJECT_ID_KEY = "slidex_pitch_project_instance";
const AGENT_PROJECT_BINDING_KEY = "slidex_agent_project_binding";

const AgentProjectBindingSchema = z.object({
  projectId: z.string().min(1),
  sessionId: z.string().min(1),
  runId: z.string().min(1).optional(),
  afterSequence: z.number().int().nonnegative().optional()
});

export type AgentProjectBinding = z.infer<typeof AgentProjectBindingSchema>;

export type SlideXSessionStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

/**
 * Owns the tab-scoped binding between one editor project instance and its
 * product conversation. Session storage intentionally survives refresh but
 * not a new browser tab, matching SlideX's current non-durable project model.
 */
export function resolveProjectInstanceId(
  storage: SlideXSessionStorage,
  createId: () => string = () => crypto.randomUUID()
): string {
  const existing = storage.getItem(ACTIVE_PROJECT_ID_KEY)?.trim();
  if (existing) {
    return existing;
  }
  return rotateProjectInstanceId(storage, createId);
}

export function rotateProjectInstanceId(
  storage: SlideXSessionStorage,
  createId: () => string = () => crypto.randomUUID()
): string {
  const projectId = createId();
  storage.setItem(ACTIVE_PROJECT_ID_KEY, projectId);
  storage.removeItem(AGENT_PROJECT_BINDING_KEY);
  return projectId;
}

export function readAgentProjectBinding(
  storage: SlideXSessionStorage,
  projectId: string
): AgentProjectBinding | undefined {
  const raw = storage.getItem(AGENT_PROJECT_BINDING_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = AgentProjectBindingSchema.safeParse(JSON.parse(raw));
    if (parsed.success && parsed.data.projectId === projectId) {
      return parsed.data;
    }
  } catch {
    // Invalid browser state is discarded below and recovered as a fresh chat.
  }

  storage.removeItem(AGENT_PROJECT_BINDING_KEY);
  return undefined;
}

export function writeAgentProjectBinding(
  storage: SlideXSessionStorage,
  binding: AgentProjectBinding
): void {
  storage.setItem(
    AGENT_PROJECT_BINDING_KEY,
    JSON.stringify(AgentProjectBindingSchema.parse(binding))
  );
}

export function clearAgentProjectBinding(storage: SlideXSessionStorage): void {
  storage.removeItem(AGENT_PROJECT_BINDING_KEY);
}
