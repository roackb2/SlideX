import assert from "node:assert/strict";
import test from "node:test";

import { SupabaseMcpPresentationStore } from "@/mcp/supabasePresentationStore";

const presentationId = "f98fc7be-38cf-4233-81b0-b2e731557092";
const ownerId = "a04a2db0-f114-49a9-ae9a-f357a815af17";
const row = {
  id: presentationId,
  last_opened_at: "2026-07-16T00:00:02.000Z",
  source: "# Remote\n\n<Slide duration={5}></Slide>",
  source_revision: 7,
  title: "Remote",
  updated_at: "2026-07-16T00:00:00.000Z"
};

test("remote presentation reads always filter by presentation id and OAuth owner", async () => {
  const filters: Array<[string, string]> = [];
  const query = {
    eq(field: string, value: string) {
      filters.push([field, value]);
      return this;
    },
    async maybeSingle() {
      return { data: row, error: null };
    },
    select() {
      return this;
    }
  };
  const client = { from: () => query } as never;
  const store = new SupabaseMcpPresentationStore(client, ownerId);

  assert.equal((await store.getPresentation(presentationId)).sourceRevision, 7);
  assert.deepEqual(filters, [
    ["user_id", ownerId],
    ["id", presentationId]
  ]);
});

test("remote presentation reads auto-select the owner's most recently opened deck", async () => {
  const calls: string[] = [];
  const query = {
    eq(field: string, value: string) {
      calls.push(`eq:${field}:${value}`);
      return this;
    },
    limit(value: number) {
      calls.push(`limit:${value}`);
      return this;
    },
    async maybeSingle() {
      return { data: row, error: null };
    },
    order(field: string, options: { ascending: boolean }) {
      calls.push(`order:${field}:${options.ascending}`);
      return this;
    },
    select() {
      return this;
    }
  };
  const store = new SupabaseMcpPresentationStore({ from: () => query } as never, ownerId);

  assert.equal((await store.getPresentation()).id, presentationId);
  assert.deepEqual(calls, [
    `eq:user_id:${ownerId}`,
    "order:last_opened_at:false",
    "limit:1"
  ]);
});

test("remote presentation listing stays owner-scoped and ordered by recent use", async () => {
  const calls: string[] = [];
  const query = {
    eq(field: string, value: string) {
      calls.push(`eq:${field}:${value}`);
      return this;
    },
    async limit(value: number) {
      calls.push(`limit:${value}`);
      return { data: [row], error: null };
    },
    order(field: string, options: { ascending: boolean }) {
      calls.push(`order:${field}:${options.ascending}`);
      return this;
    },
    select() {
      return this;
    }
  };
  const store = new SupabaseMcpPresentationStore({ from: () => query } as never, ownerId);

  assert.deepEqual(await store.listPresentations(5), [{
    id: presentationId,
    lastOpenedAt: row.last_opened_at,
    sourceRevision: row.source_revision,
    title: row.title,
    updatedAt: row.updated_at
  }]);
  assert.deepEqual(calls, [
    `eq:user_id:${ownerId}`,
    "order:last_opened_at:false",
    "limit:5"
  ]);
});

test("remote presentation saves pass OAuth ownership and expected revision to CAS", async () => {
  const calls: Array<{ args: unknown; name: string }> = [];
  const client = {
    async rpc(name: string, args: unknown) {
      calls.push({ args, name });
      return {
        data: [{
          presentation_id: presentationId,
          result_status: "saved",
          source_revision: 8,
          title: "Remote",
          updated_at: "2026-07-16T00:00:01.000Z"
        }],
        error: null
      };
    }
  } as never;
  const store = new SupabaseMcpPresentationStore(client, ownerId);

  assert.equal((await store.savePresentation({
    expectedRevision: 7,
    presentationId,
    source: row.source
  })).sourceRevision, 8);
  assert.deepEqual(calls, [{
    args: {
      actor_user_id: ownerId,
      expected_source_revision: 7,
      next_source: row.source,
      target_presentation_id: presentationId
    },
    name: "mcp_compare_and_swap_presentation_document"
  }]);
});

test("remote presentation maps revision and ownership failures without leaking rows", async () => {
  const revisionClient = {
    rpc: async () => ({
      data: [{
        presentation_id: presentationId,
        result_status: "conflict",
        source_revision: null,
        title: null,
        updated_at: null
      }],
      error: null
    })
  } as never;
  const ownershipClient = {
    rpc: async () => ({
      data: [{
        presentation_id: presentationId,
        result_status: "inaccessible",
        source_revision: null,
        title: null,
        updated_at: null
      }],
      error: null
    })
  } as never;

  await assert.rejects(
    new SupabaseMcpPresentationStore(revisionClient, ownerId).savePresentation({
      expectedRevision: 6,
      presentationId,
      source: row.source
    }),
    /changed/
  );
  await assert.rejects(
    new SupabaseMcpPresentationStore(ownershipClient, ownerId).savePresentation({
      expectedRevision: 7,
      presentationId,
      source: row.source
    }),
    /not found or not accessible/
  );
});
