import { z } from "zod";

const AGENT_PRESENTATION_BINDINGS_KEY = "slidex_agent_presentation_bindings_v1";
const LEGACY_AGENT_PROJECT_BINDING_KEY = "slidex_agent_project_binding";

const AgentPresentationBindingSchema = z.object({
  presentationId: z.string().min(1),
  sessionId: z.string().min(1),
  runId: z.string().min(1).optional(),
  afterSequence: z.number().int().nonnegative().optional(),
  baseSourceRevision: z.string().min(1).optional()
});

const AgentPresentationBindingsSchema = z.record(
  z.string().min(1),
  AgentPresentationBindingSchema
);

export type AgentPresentationBinding = z.infer<
  typeof AgentPresentationBindingSchema
>;

export type SlideXSessionStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

/**
 * Owns the tab-scoped active conversation selection for each durable
 * presentation. The catalog remains server-owned; this map only remembers
 * which conversation the current tab last selected for a presentation.
 */
export function readAgentPresentationBinding(
  storage: SlideXSessionStorage,
  presentationId: string
): AgentPresentationBinding | undefined {
  const bindings = readBindings(storage);
  const binding = bindings[presentationId];
  return binding?.presentationId === presentationId ? binding : undefined;
}

export function writeAgentPresentationBinding(
  storage: SlideXSessionStorage,
  binding: AgentPresentationBinding
): void {
  const parsedBinding = AgentPresentationBindingSchema.parse(binding);
  const bindings = readBindings(storage);
  storage.setItem(
    AGENT_PRESENTATION_BINDINGS_KEY,
    JSON.stringify({
      ...bindings,
      [parsedBinding.presentationId]: parsedBinding
    })
  );
  storage.removeItem(LEGACY_AGENT_PROJECT_BINDING_KEY);
}

export function clearAgentPresentationBinding(
  storage: SlideXSessionStorage,
  presentationId: string
): void {
  const bindings = readBindings(storage);
  const remainingBindings = Object.fromEntries(
    Object.entries(bindings).filter(([id]) => id !== presentationId)
  );

  if (Object.keys(remainingBindings).length === 0) {
    storage.removeItem(AGENT_PRESENTATION_BINDINGS_KEY);
  } else {
    storage.setItem(
      AGENT_PRESENTATION_BINDINGS_KEY,
      JSON.stringify(remainingBindings)
    );
  }
  storage.removeItem(LEGACY_AGENT_PROJECT_BINDING_KEY);
}

function readBindings(
  storage: SlideXSessionStorage
): Record<string, AgentPresentationBinding> {
  const raw = storage.getItem(AGENT_PRESENTATION_BINDINGS_KEY);
  if (!raw) {
    storage.removeItem(LEGACY_AGENT_PROJECT_BINDING_KEY);
    return {};
  }

  try {
    const parsed = AgentPresentationBindingsSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // Invalid browser state is discarded below and recovered as a fresh chat.
  }

  storage.removeItem(AGENT_PRESENTATION_BINDINGS_KEY);
  storage.removeItem(LEGACY_AGENT_PROJECT_BINDING_KEY);
  return {};
}
