import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Json
} from "@/common/lib/supabase/database.types";
import type {
  AgentSession,
  AgentSessionSummary
} from "@/features/pitch/domain/agentRun";

type Client = SupabaseClient<Database>;

export type AgentSessionMetadata = {
  id: string;
  messageCount: number;
  presentationId: string;
  title: string;
};

export async function syncSupabaseAgentSession(
  client: Client,
  presentationId: string,
  session: AgentSession
) {
  await syncSupabaseAgentSessionMetadata(client, [{
    id: session.id,
    messageCount: session.messages.length,
    presentationId,
    title: normalizeSessionTitle(session.title)
  }]);
}

export async function syncSupabaseAgentSessionSummaries(
  client: Client,
  sessions: readonly AgentSessionSummary[]
) {
  await syncSupabaseAgentSessionMetadata(
    client,
    sessions.map((session) => ({
      id: session.id,
      messageCount: session.messageCount,
      presentationId: session.presentation.id,
      title: normalizeSessionTitle(session.title)
    }))
  );
}

export async function syncSupabaseAgentSessionMetadata(
  client: Client,
  sessions: readonly AgentSessionMetadata[]
) {
  if (sessions.length === 0) return;

  const entries: Json = sessions.map((session) => ({
    id: session.id,
    message_count: session.messageCount,
    presentation_id: session.presentationId,
    title: normalizeSessionTitle(session.title)
  }));
  const { error } = await client.rpc("sync_agent_session_catalog", { entries });

  if (error) throw error;
}

export async function deleteSupabaseAgentSession(
  client: Client,
  sessionId: string
) {
  const { error } = await client
    .from("agent_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) throw error;
}

function normalizeSessionTitle(title: string) {
  return title.trim() || "New session";
}
