import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRunConsumerService } from "@roackb2/heddle-remote";
import {
  SlideXAgentClient,
  SlideXAgentClientError
} from "./slidexAgentClient";
import {
  AgentSessionStateSchema,
  parseSlideXAgentSseMessage,
  SlideXAgentRunProtocol
} from "./slidexAgentProtocol";
import {
  clearAgentProjectBinding,
  readAgentProjectBinding,
  resolveProjectInstanceId,
  rotateProjectInstanceId,
  writeAgentProjectBinding,
  type SlideXSessionStorage
} from "./slidexAgentPersistence";

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
        session: createSession(),
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

test("validates hydrated conversation history and active-run discovery", () => {
  const state = AgentSessionStateSchema.parse({
    session: createSession(),
    activeRun: {
      runId: "run-1",
      acceptedAt: timestamp
    }
  });

  assert.equal(state.session.messages[0]?.content, "Make it clearer");
  assert.equal(state.activeRun?.runId, "run-1");
});

test("keeps one project identity across refresh and rotates it for new or imported decks", () => {
  const storage = createStorage();
  const first = resolveProjectInstanceId(storage, () => "project-1");
  const refreshed = resolveProjectInstanceId(storage, () => "project-ignored");
  writeAgentProjectBinding(storage, {
    projectId: first,
    sessionId: "session-1",
    runId: "run-1",
    afterSequence: 4,
    baseSourceRevision: "revision-1"
  });

  assert.equal(refreshed, first);
  assert.deepEqual(readAgentProjectBinding(storage, first), {
    projectId: "project-1",
    sessionId: "session-1",
    runId: "run-1",
    afterSequence: 4,
    baseSourceRevision: "revision-1"
  });

  const imported = rotateProjectInstanceId(storage, () => "project-2");
  assert.notEqual(imported, first);
  assert.equal(readAgentProjectBinding(storage, imported), undefined);
});

test("discards stale or malformed browser conversation bindings", () => {
  const storage = createStorage();
  writeAgentProjectBinding(storage, {
    projectId: "project-1",
    sessionId: "session-1"
  });

  assert.equal(readAgentProjectBinding(storage, "project-2"), undefined);
  storage.setItem("slidex_agent_project_binding", "not json");
  assert.equal(readAgentProjectBinding(storage, "project-2"), undefined);
  clearAgentProjectBinding(storage);
});

test("applies injected auth headers and preserves stable server error codes", async () => {
  const originalFetch = globalThis.fetch;
  let authorization: string | null = null;
  const client = new SlideXAgentClient({
    baseUrl: "https://agent.example.test",
    getHeaders: async () => ({ Authorization: "Bearer test-token" })
  });

  try {
    globalThis.fetch = async (_input, init) => {
      authorization = new Headers(init?.headers).get("Authorization");
      return new Response(JSON.stringify({
        session: createSession(),
        activeRun: null
      }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    };

    const state = await client.session("session-1");
    assert.equal(authorization, "Bearer test-token");
    assert.equal(state.session.id, "session-1");

    globalThis.fetch = async () => new Response(JSON.stringify({
      error: {
        code: "session_not_found",
        message: "Conversation not found"
      }
    }), {
      status: 404,
      headers: { "content-type": "application/json" }
    });

    await assert.rejects(
      client.session("missing"),
      (error: unknown) => error instanceof SlideXAgentClientError
        && error.status === 404
        && error.code === "session_not_found"
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
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

function createSession() {
  return {
    id: "session-1",
    title: "Deck",
    latestMotionDoc: "# Deck",
    messages: [
      {
        id: "message-1",
        role: "user",
        content: "Make it clearer",
        createdAt: timestamp
      }
    ]
  };
}

function createStorage(): SlideXSessionStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => {
      values.delete(key);
    }
  };
}
