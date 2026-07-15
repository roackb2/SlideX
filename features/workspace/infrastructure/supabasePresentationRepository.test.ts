import assert from "node:assert/strict";
import test from "node:test";
import { parseSupabasePresentationRealtimeChange } from "@/features/workspace/infrastructure/supabasePresentationRepository";

const presentationRow = {
  created_at: "2026-07-15T05:00:00.000Z",
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
