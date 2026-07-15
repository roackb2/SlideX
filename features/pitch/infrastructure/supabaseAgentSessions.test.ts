import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/common/lib/supabase/database.types";
import type {
  AgentSession,
  AgentSessionSummary
} from "@/features/pitch/domain/agentRun";
import {
  deleteSupabaseAgentSession,
  syncSupabaseAgentSession,
  syncSupabaseAgentSessionMetadata,
  syncSupabaseAgentSessionSummaries
} from "@/features/pitch/infrastructure/supabaseAgentSessions";

test("projects full and summary sessions through one catalog RPC", async () => {
  const calls: Array<{ entries: Json; functionName: string }> = [];
  const client = createClient({ calls });
  const session: AgentSession = {
    id: "session-full",
    latestMotionDoc: "<Slide />",
    messages: [
      { content: "Hello", createdAt: "2026-07-15T01:00:00Z", id: "message-1", role: "user" }
    ],
    title: "  Full session  "
  };
  const summary: AgentSessionSummary = {
    createdAt: "2026-07-15T01:00:00Z",
    id: "session-summary",
    lastActivityAt: "2026-07-15T01:01:00Z",
    messageCount: 2,
    presentation: {
      id: "ac33811f-c584-4115-a041-bcd5a5f14f1d",
      title: "Deck"
    },
    title: "   "
  };

  await syncSupabaseAgentSession(
    client,
    "49840b86-1f79-4e34-ad2d-83e99c89b2c7",
    session
  );
  await syncSupabaseAgentSessionSummaries(client, [summary]);

  assert.deepEqual(calls, [
    {
      entries: [{
        id: "session-full",
        message_count: 1,
        presentation_id: "49840b86-1f79-4e34-ad2d-83e99c89b2c7",
        title: "Full session"
      }],
      functionName: "sync_agent_session_catalog"
    },
    {
      entries: [{
        id: "session-summary",
        message_count: 2,
        presentation_id: "ac33811f-c584-4115-a041-bcd5a5f14f1d",
        title: "New session"
      }],
      functionName: "sync_agent_session_catalog"
    }
  ]);
});

test("skips an empty catalog projection and propagates RPC failures", async () => {
  const calls: Array<{ entries: Json; functionName: string }> = [];
  const failure = new Error("rpc unavailable");
  const client = createClient({ calls, rpcError: failure });

  await syncSupabaseAgentSessionMetadata(client, []);
  assert.equal(calls.length, 0);
  await assert.rejects(
    syncSupabaseAgentSessionMetadata(client, [{
      id: "session",
      messageCount: 0,
      presentationId: "1ad0639b-d6b0-49d1-a713-85a89f3f34f4",
      title: "Session"
    }]),
    failure
  );
});

test("deletes metadata by canonical session id without a presentation filter", async () => {
  const filters: Array<{ column: string; table: string; value: string }> = [];
  const client = createClient({ filters });

  await deleteSupabaseAgentSession(client, "session-to-delete");

  assert.deepEqual(filters, [{
    column: "id",
    table: "agent_sessions",
    value: "session-to-delete"
  }]);
});

function createClient({
  calls = [],
  filters = [],
  rpcError = null
}: {
  calls?: Array<{ entries: Json; functionName: string }>;
  filters?: Array<{ column: string; table: string; value: string }>;
  rpcError?: Error | null;
}): SupabaseClient<Database> {
  return {
    from: (table: string) => ({
      delete: () => ({
        eq: async (column: string, value: string) => {
          filters.push({ column, table, value });
          return { error: null };
        }
      })
    }),
    rpc: async (functionName: string, args: { entries: Json }) => {
      calls.push({ entries: args.entries, functionName });
      return { data: undefined, error: rpcError };
    }
  } as unknown as SupabaseClient<Database>;
}
