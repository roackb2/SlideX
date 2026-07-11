import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRunConsumerService } from "@roackb2/heddle/remote";
import {
  parseSlideXAgentSseMessage,
  SlideXAgentRunProtocol
} from "./slidexAgentProtocol";

const timestamp = "2026-07-11T00:00:00.000Z";

test("validates the canonical SlideX run event and its SSE metadata", () => {
  const event = parseSlideXAgentSseMessage({
    id: "1",
    event: "result",
    data: JSON.stringify({
      kind: "result",
      runId: "run-1",
      sequence: 1,
      timestamp,
      result: {
        session: { id: "session-1" },
        motionDoc: "# Updated deck",
        assistantMessage: "Updated the deck",
        baseSourceRevision: "revision-1"
      }
    })
  });

  assert.equal(event.kind, "result");
  assert.equal(event.result.motionDoc, "# Updated deck");
  assert.deepEqual(
    SlideXAgentRunProtocol.parseEvent(JSON.parse(SlideXAgentRunProtocol.stringifyEvent(event))),
    event
  );
});

test("rejects mismatched SSE IDs, event names, and malformed payloads", () => {
  const data = JSON.stringify({
    kind: "cancelled",
    runId: "run-1",
    sequence: 2,
    timestamp,
    reason: "Cancelled by user"
  });

  assert.throws(
    () => parseSlideXAgentSseMessage({ id: "1", event: "cancelled", data }),
    /ID did not match/
  );
  assert.throws(
    () => parseSlideXAgentSseMessage({ id: "2", event: "result", data }),
    /event name did not match/
  );
  assert.throws(
    () => parseSlideXAgentSseMessage({ id: "2", event: "cancelled", data: "{" }),
    /invalid JSON/
  );
});

test("uses Heddle's consumer for product cursor, duplicate, and terminal policy", () => {
  const consumer = new ConversationRunConsumerService<{ runId: string }>();
  consumer.select({ runId: "run-1" });
  const activity = SlideXAgentRunProtocol.parseEvent({
    kind: "activity",
    runId: "run-1",
    sequence: 1,
    timestamp,
    activity: { type: "assistant.stream", text: "Working" }
  });
  const terminal = SlideXAgentRunProtocol.parseEvent({
    kind: "cancelled",
    runId: "run-1",
    sequence: 2,
    timestamp,
    reason: "Cancelled by user"
  });

  assert.deepEqual(consumer.accept(activity), { accepted: true, terminal: false });
  assert.deepEqual(consumer.accept(activity), { accepted: false, terminal: false });
  assert.deepEqual(consumer.subscriptionInput(), { runId: "run-1", afterSequence: 1 });
  assert.deepEqual(consumer.accept(terminal), { accepted: true, terminal: true });
  assert.equal(consumer.subscriptionInput(), undefined);
});
