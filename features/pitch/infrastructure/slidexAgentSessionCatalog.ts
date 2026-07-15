import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/common/lib/supabase/database.types";
import type {
  AgentSessionPage,
  AgentSessionSummary
} from "@/features/pitch/domain/agentRun";
import type { SlideXAgentClient } from "@/features/pitch/infrastructure/slidexAgentClient";
import { syncSupabaseAgentSessionSummaries } from "@/features/pitch/infrastructure/supabaseAgentSessions";

const presentationIdSchema = z.string().uuid();

type CatalogClient = Pick<SlideXAgentClient, "sessions">;
type Client = SupabaseClient<Database>;

export type ReconciledAgentSessionPage = AgentSessionPage & {
  projectionWarning?: string;
};

/**
 * Reconciles the Heddle-owned conversation catalog with SlideX's current
 * presentation ownership. Conversation content never enters Supabase; the
 * product database receives only an idempotent metadata projection.
 */
export async function loadReconciledAgentSessionPage(
  agentClient: CatalogClient,
  supabaseClient: Client | undefined,
  input: { cursor?: string; limit: number },
  signal?: AbortSignal
): Promise<ReconciledAgentSessionPage> {
  const page = await agentClient.sessions(input, signal);
  if (!supabaseClient || page.items.length === 0) return page;

  const canonicalSessions = page.items.filter(({ presentation }) =>
    presentationIdSchema.safeParse(presentation.id).success
  );
  const presentationIds = [...new Set(
    canonicalSessions.map(({ presentation }) => presentation.id)
  )];
  if (presentationIds.length === 0) {
    return {
      ...page,
      items: [],
      projectionWarning: unavailablePresentationWarning(page.items.length)
    };
  }

  const { data: presentations, error } = await supabaseClient
    .from("presentations")
    .select("id,title")
    .in("id", presentationIds);
  if (error) {
    return {
      ...page,
      projectionWarning: "Conversation history is available, but SlideX could not reconcile its Supabase session index."
    };
  }

  const presentationTitles = new Map(
    presentations.map((presentation) => [presentation.id, presentation.title])
  );
  const items = canonicalSessions.flatMap((session) => {
    const presentationTitle = presentationTitles.get(session.presentation.id);
    return presentationTitle === undefined
      ? []
      : [{
          ...session,
          presentation: {
            id: session.presentation.id,
            title: presentationTitle
          }
        } satisfies AgentSessionSummary];
  });
  const warnings = page.items.length === items.length
    ? []
    : [unavailablePresentationWarning(page.items.length - items.length)];

  try {
    await syncSupabaseAgentSessionSummaries(supabaseClient, items);
  } catch {
    warnings.push(
      "Conversation history is available, but SlideX could not update its Supabase session index."
    );
  }

  return {
    ...page,
    items,
    ...(warnings.length > 0 ? { projectionWarning: warnings.join(" ") } : {})
  };
}

function unavailablePresentationWarning(count: number) {
  return count === 1
    ? "One conversation was hidden because its presentation is no longer available."
    : `${count} conversations were hidden because their presentations are no longer available.`;
}
