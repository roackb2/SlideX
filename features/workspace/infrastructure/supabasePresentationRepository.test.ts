import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSupabasePresentationRealtimeChange,
  PresentationRevisionConflictError,
  updateSupabasePresentation
} from "@/features/workspace/infrastructure/supabasePresentationRepository";

const presentationRow = {
  created_at: "2026-07-15T05:00:00.000Z",
  editor_template_id: "black-commercial",
  id: "f98fc7be-38cf-4233-81b0-b2e731557092",
  kind: "presentation",
  last_opened_at: "2026-07-15T05:10:00.000Z",
  source: '<Slide><ImageBlock src="/api/presentation-images/user/deck/image.webp" /></Slide>',
  source_revision: 7,
  template_id: null,
  title: "Realtime image",
  updated_at: "2026-07-15T05:12:00.000Z",
  user_id: "a04a2db0-f114-49a9-ae9a-f357a815af17"
};
const ownerId = presentationRow.user_id;

test("parses a validated Supabase presentation UPDATE broadcast", () => {
  const change = parseSupabasePresentationRealtimeChange({
    event: "UPDATE",
    payload: {
      id: "broadcast-id",
      old_record: { ...presentationRow, source_revision: 6 },
      operation: "UPDATE",
      record: presentationRow,
      schema: "public",
      table: "presentations"
    },
    type: "broadcast"
  }, ownerId);

  assert.deepEqual(change, {
    event: "UPDATE",
    presentation: {
      createdAt: presentationRow.created_at,
      editorTemplateId: "black-commercial",
      id: presentationRow.id,
      kind: "presentation",
      lastOpenedAt: presentationRow.last_opened_at,
      ownerId: presentationRow.user_id,
      source: presentationRow.source,
      sourceRevision: 7,
      templateId: undefined,
      title: presentationRow.title,
      updatedAt: presentationRow.updated_at
    }
  });
});

test("parses INSERT and DELETE broadcasts from their matching records", () => {
  assert.equal(parseSupabasePresentationRealtimeChange({
    event: "INSERT",
    payload: {
      operation: "INSERT",
      record: presentationRow,
      schema: "public",
      table: "presentations"
    },
    type: "broadcast"
  }, ownerId)?.event, "INSERT");
  assert.deepEqual(parseSupabasePresentationRealtimeChange({
    event: "DELETE",
    payload: {
      old_record: presentationRow,
      operation: "DELETE",
      record: null,
      schema: "public",
      table: "presentations"
    },
    type: "broadcast"
  }, ownerId), {
    event: "DELETE",
    presentation: {
      createdAt: presentationRow.created_at,
      editorTemplateId: "black-commercial",
      id: presentationRow.id,
      kind: "presentation",
      lastOpenedAt: presentationRow.last_opened_at,
      ownerId: presentationRow.user_id,
      source: presentationRow.source,
      sourceRevision: 7,
      templateId: undefined,
      title: presentationRow.title,
      updatedAt: presentationRow.updated_at
    }
  });
});

test("rejects unsupported and malformed Realtime payloads", () => {
  assert.equal(parseSupabasePresentationRealtimeChange({
    payload: { operation: "TRUNCATE", record: presentationRow }
  }, ownerId), null);
  assert.equal(parseSupabasePresentationRealtimeChange({
    payload: { operation: "UPDATE", record: { ...presentationRow, source_revision: "7" } }
  }, ownerId), null);
});

test("rejects broadcasts for another owner, schema, or table", () => {
  const message = {
    event: "UPDATE",
    payload: {
      operation: "UPDATE",
      record: presentationRow,
      schema: "public",
      table: "presentations"
    },
    type: "broadcast"
  };

  assert.equal(parseSupabasePresentationRealtimeChange(message, "another-owner"), null);
  assert.equal(parseSupabasePresentationRealtimeChange({
    ...message,
    payload: { ...message.payload, schema: "storage" }
  }, ownerId), null);
  assert.equal(parseSupabasePresentationRealtimeChange({
    ...message,
    payload: { ...message.payload, table: "slide_comments" }
  }, ownerId), null);
});

test("saves source, title, and template through one atomic document RPC", async () => {
  const calls: Array<{ args: unknown; name: string }> = [];
  const client = {
    rpc: async (name: string, args: unknown) => {
      calls.push({ args, name });
      return {
        data: [{
          editor_template_id: "blank:basic-white",
          presentation_id: presentationRow.id,
          source_revision: 8,
          updated_at: "2026-07-15T05:13:00.000Z"
        }],
        error: null
      };
    }
  } as unknown as Parameters<typeof updateSupabasePresentation>[0];

  const result = await updateSupabasePresentation(client, presentationRow.id, 7, {
    editorTemplateId: "blank:basic-white",
    source: "next-source",
    title: " Next title "
  });

  assert.deepEqual(calls, [{
    args: {
      expected_source_revision: 7,
      next_editor_template_id: "blank:basic-white",
      next_source: "next-source",
      next_title: "Next title",
      target_presentation_id: presentationRow.id
    },
    name: "compare_and_swap_presentation_document"
  }]);
  assert.deepEqual(result, {
    editorTemplateId: "blank:basic-white",
    sourceRevision: 8,
    updatedAt: "2026-07-15T05:13:00.000Z"
  });
});

test("maps an atomic save revision conflict to the domain error", async () => {
  const client = {
    rpc: async () => ({
      data: null,
      error: { code: "40001", message: "source_revision_conflict" }
    })
  } as unknown as Parameters<typeof updateSupabasePresentation>[0];

  await assert.rejects(
    updateSupabasePresentation(client, presentationRow.id, 6, {
      source: "stale-source",
      title: presentationRow.title
    }),
    PresentationRevisionConflictError
  );
});
