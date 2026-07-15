import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentSession } from "@/features/pitch/domain/agentRun";

type Client = SupabaseClient;

export async function syncSupabaseAgentSession(
  client: Client,
  presentationId: string,
  session: AgentSession
) {
  const { data: existing, error: readError } = await client
    .from("agent_sessions")
    .select("id")
    .eq("id", session.id)
    .maybeSingle();

  if (readError) throw readError;

  if (!existing) {
    const { error: insertError } = await client.from("agent_sessions").insert({
      id: session.id,
      presentation_id: presentationId,
      title: session.title
    });
    if (insertError) throw insertError;
  }

  const { error: updateError } = await client
    .from("agent_sessions")
    .update({ message_count: session.messages.length, title: session.title })
    .eq("id", session.id)
    .eq("presentation_id", presentationId);

  if (updateError) throw updateError;
}

export async function deleteSupabaseAgentSession(
  client: Client,
  presentationId: string,
  sessionId: string
) {
  const { error } = await client
    .from("agent_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("presentation_id", presentationId);

  if (error) throw error;
}
