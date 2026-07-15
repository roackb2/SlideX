import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/common/lib/supabase/database.types";
import type { AgentSessionPage } from "@/features/pitch/domain/agentRun";
import { loadReconciledAgentSessionPage } from "@/features/pitch/infrastructure/slidexAgentSessionCatalog";

const presentationA = "e3c17b55-2e2b-4140-a058-9246bcc87773";
const presentationB = "89bfd150-b933-4318-83df-f8b71dd52153";
const page: AgentSessionPage = {
  items: [
    {
      createdAt: "2026-07-15T01:00:00Z",
      id: "session-a",
      lastActivityAt: "2026-07-15T01:05:00Z",
      messageCount: 4,
      presentation: { id: presentationA, title: "Old title" },
      title: "First session"
    },
    {
      createdAt: "2026-07-15T02:00:00Z",
      id: "session-b",
      lastActivityAt: "2026-07-15T02:05:00Z",
      messageCount: 2,
      presentation: { id: presentationB, title: "Deleted deck" },
      title: "Second session"
    }
  ],
  nextCursor: "next-page"
};

test("returns the canonical server page when product projection is disabled", async () => {
  const result = await loadReconciledAgentSessionPage(
    { sessions: async () => page },
    undefined,
    { limit: 20 }
  );

  assert.deepEqual(result, page);
});

test("keeps owned presentations, refreshes titles, and repairs metadata in one batch", async () => {
  const projectionCalls: Json[] = [];
  const client = createClient({
    presentations: [{ id: presentationA, title: "Current deck title" }],
    projectionCalls
  });

  const result = await loadReconciledAgentSessionPage(
    { sessions: async () => page },
    client,
    { limit: 20 }
  );

  assert.deepEqual(result.items, [{
    ...page.items[0],
    presentation: { id: presentationA, title: "Current deck title" }
  }]);
  assert.equal(result.nextCursor, "next-page");
  assert.equal(
    result.projectionWarning,
    "One conversation was hidden because its presentation is no longer available."
  );
  assert.deepEqual(projectionCalls, [[{
    id: "session-a",
    message_count: 4,
    presentation_id: presentationA,
    title: "First session"
  }]]);
});

test("preserves canonical history when Supabase reconciliation is unavailable", async () => {
  const readFailure = await loadReconciledAgentSessionPage(
    { sessions: async () => page },
    createClient({ presentationError: new Error("read failed") }),
    { limit: 20 }
  );
  assert.deepEqual(readFailure.items, page.items);
  assert.match(readFailure.projectionWarning ?? "", /could not reconcile/);

  const projectionFailure = await loadReconciledAgentSessionPage(
    { sessions: async () => page },
    createClient({
      presentations: [
        { id: presentationA, title: "Deck A" },
        { id: presentationB, title: "Deck B" }
      ],
      projectionError: new Error("write failed")
    }),
    { limit: 20 }
  );
  assert.equal(projectionFailure.items.length, 2);
  assert.match(projectionFailure.projectionWarning ?? "", /could not update/);
});

test("hides sessions whose presentation identity cannot be verified", async () => {
  const invalidPage: AgentSessionPage = {
    items: [{
      ...page.items[0],
      presentation: { id: "local-presentation", title: "Local" }
    }]
  };
  const result = await loadReconciledAgentSessionPage(
    { sessions: async () => invalidPage },
    createClient(),
    { limit: 20 }
  );

  assert.deepEqual(result.items, []);
  assert.match(result.projectionWarning ?? "", /presentation is no longer available/);
});

function createClient({
  presentationError = null,
  presentations = [],
  projectionCalls = [],
  projectionError = null
}: {
  presentationError?: Error | null;
  presentations?: Array<{ id: string; title: string }>;
  projectionCalls?: Json[];
  projectionError?: Error | null;
} = {}): SupabaseClient<Database> {
  return {
    from: () => ({
      select: () => ({
        in: async () => ({ data: presentations, error: presentationError })
      })
    }),
    rpc: async (_functionName: string, args: { entries: Json }) => {
      projectionCalls.push(args.entries);
      return { data: undefined, error: projectionError };
    }
  } as unknown as SupabaseClient<Database>;
}
