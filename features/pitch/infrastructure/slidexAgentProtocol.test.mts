import assert from "node:assert/strict";
import test from "node:test";
import { ConversationRunConsumerService } from "@roackb2/heddle-remote";
import {
  SlideXAgentClient,
  SlideXAgentClientError
} from "./slidexAgentClient";
import {
  SlideXAgentIdentityError,
  SlideXAgentIdentityService,
  type SlideXAgentIdentityClient
} from "./slidexAgentIdentity";
import {
  AgentSessionStateSchema,
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

test("validates the product payload carried by Heddle's run protocol", () => {
  const event = SlideXAgentRunProtocol.parseEvent({
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
  let authorization: string | null = null;
  let response = new Response(JSON.stringify({
    session: createSession(),
    activeRun: null
  }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
  const client = new SlideXAgentClient({
    baseUrl: "https://agent.example.test",
    getHeaders: async () => ({ Authorization: "Bearer test-token" }),
    fetch: async (_input, init) => {
      authorization = new Headers(init?.headers).get("Authorization");
      return response;
    }
  });

  const state = await client.session("session-1");
  assert.equal(authorization, "Bearer test-token");
  assert.equal(state.session.id, "session-1");

  response = new Response(JSON.stringify({
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
});

test("composes SlideX payloads and auth with Heddle's HTTP/SSE client", async () => {
  const calls: Array<{ url: string; method: string; authorization: string | null }> = [];
  const resultEvent = SlideXAgentRunProtocol.parseEvent({
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
  });
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    calls.push({
      url,
      method,
      authorization: new Headers(init?.headers).get("Authorization")
    });

    if (method === "POST" && url.endsWith("/api/agent/runs")) {
      return Response.json({
        accepted: true,
        runId: "run-1",
        acceptedAt: timestamp,
        session: createSession()
      });
    }
    if (method === "GET" && url.endsWith("/api/agent/runs/run-1/events?after=0")) {
      return new Response([
        "id: 1",
        "event: result",
        `data: ${SlideXAgentRunProtocol.stringifyEvent(resultEvent)}`,
        "",
        ""
      ].join("\n"), {
        headers: { "content-type": "text/event-stream" }
      });
    }
    if (method === "POST" && url.endsWith("/api/agent/runs/run-1/cancel")) {
      return Response.json({ cancelled: true });
    }
    return new Response(null, { status: 404 });
  };
  const client = new SlideXAgentClient({
    baseUrl: "https://agent.example.test",
    getHeaders: () => ({ Authorization: "Bearer test-token" }),
    fetch
  });

  const accepted = await client.runs.start({
    title: "Deck",
    message: "Make it clearer",
    motionDoc: "# Deck",
    sourceRevision: "revision-1",
    llmApiKey: "test-key"
  });
  const events: unknown[] = [];
  await client.runs.subscribe({
    runId: accepted.runId,
    afterSequence: 0,
    onEvent: (event) => events.push(event)
  });
  const cancellation = await client.runs.cancel(accepted.runId);

  assert.deepEqual(events, [resultEvent]);
  assert.deepEqual(cancellation, { cancelled: true });
  assert.deepEqual(calls, [
    {
      url: "https://agent.example.test/api/agent/runs",
      method: "POST",
      authorization: "Bearer test-token"
    },
    {
      url: "https://agent.example.test/api/agent/runs/run-1/events?after=0",
      method: "GET",
      authorization: "Bearer test-token"
    },
    {
      url: "https://agent.example.test/api/agent/runs/run-1/cancel",
      method: "POST",
      authorization: "Bearer test-token"
    }
  ]);
});

test("reuses an existing anonymous product session for agent authorization", async () => {
  let anonymousSignIns = 0;
  const client: SlideXAgentIdentityClient = {
    auth: {
      getSession: async () => ({
        data: { session: { access_token: "existing-access-token" } },
        error: null
      }),
      signInAnonymously: async () => {
        anonymousSignIns += 1;
        return {
          data: { session: { access_token: "new-access-token" } },
          error: null
        };
      }
    }
  };
  const identity = createIdentity(client);

  const headers = new Headers(await identity.authorizationHeaders());

  assert.equal(headers.get("Authorization"), "Bearer existing-access-token");
  assert.equal(anonymousSignIns, 0);
});

test("deduplicates concurrent anonymous sign-in and returns only the bearer token", async () => {
  const sessionRead = deferred<void>();
  let sessionReads = 0;
  let anonymousSignIns = 0;
  const client: SlideXAgentIdentityClient = {
    auth: {
      getSession: async () => {
        sessionReads += 1;
        await sessionRead.promise;
        return { data: { session: null }, error: null };
      },
      signInAnonymously: async () => {
        anonymousSignIns += 1;
        return {
          data: { session: { access_token: "anonymous-access-token" } },
          error: null
        };
      }
    }
  };
  const identity = createIdentity(client);
  const first = identity.authorizationHeaders();
  const second = identity.authorizationHeaders();
  sessionRead.resolve();

  const headers = await Promise.all([first, second]);

  assert.equal(sessionReads, 1);
  assert.equal(anonymousSignIns, 1);
  assert.deepEqual(
    headers.map((value) => new Headers(value).get("Authorization")),
    ["Bearer anonymous-access-token", "Bearer anonymous-access-token"]
  );
});

test("fails safely when anonymous identity is not configured", async () => {
  const identity = new SlideXAgentIdentityService({});

  await assert.rejects(
    identity.authorizationHeaders(),
    (error: unknown) => error instanceof SlideXAgentIdentityError
      && error.message.includes("NEXT_PUBLIC_SUPABASE_URL")
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

function createIdentity(client: SlideXAgentIdentityClient): SlideXAgentIdentityService {
  return new SlideXAgentIdentityService({
    supabaseUrl: "https://identity.example.test",
    supabasePublishableKey: "test-publishable-key",
    createClient: () => client
  });
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
