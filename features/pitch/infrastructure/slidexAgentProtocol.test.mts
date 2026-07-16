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
  clearAgentPresentationBinding,
  readAgentPresentationBinding,
  writeAgentPresentationBinding,
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
      baseSourceRevision: "revision-1",
      presentationSourceRevision: 8
    }
  });

  assert.equal(event.kind, "result");
  assert.equal(event.result.motionDoc, "# Updated deck");
  assert.equal(event.result.presentationSourceRevision, 8);
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

test("keeps an active conversation binding for each canonical presentation", () => {
  const storage = createStorage();
  writeAgentPresentationBinding(storage, {
    presentationId: "presentation-1",
    sessionId: "session-1",
    runId: "run-1",
    afterSequence: 4,
    baseSourceRevision: "revision-1"
  });
  writeAgentPresentationBinding(storage, {
    presentationId: "presentation-2",
    sessionId: "session-2"
  });

  assert.deepEqual(readAgentPresentationBinding(storage, "presentation-1"), {
    presentationId: "presentation-1",
    sessionId: "session-1",
    runId: "run-1",
    afterSequence: 4,
    baseSourceRevision: "revision-1"
  });
  assert.deepEqual(readAgentPresentationBinding(storage, "presentation-2"), {
    presentationId: "presentation-2",
    sessionId: "session-2"
  });

  clearAgentPresentationBinding(storage, "presentation-1");
  assert.equal(
    readAgentPresentationBinding(storage, "presentation-1"),
    undefined
  );
  assert.equal(
    readAgentPresentationBinding(storage, "presentation-2")?.sessionId,
    "session-2"
  );
});

test("discards stale or malformed browser conversation bindings", () => {
  const storage = createStorage();
  writeAgentPresentationBinding(storage, {
    presentationId: "presentation-1",
    sessionId: "session-1"
  });

  assert.equal(
    readAgentPresentationBinding(storage, "presentation-2"),
    undefined
  );
  storage.setItem("slidex_agent_presentation_bindings_v1", "not json");
  assert.equal(
    readAgentPresentationBinding(storage, "presentation-1"),
    undefined
  );
  clearAgentPresentationBinding(storage, "presentation-1");
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

test("lists, attaches, and deletes presentation conversations through product routes", async () => {
  const calls: Array<{ body?: unknown; method: string; url: string }> = [];
  const client = new SlideXAgentClient({
    baseUrl: "https://agent.example.test",
    fetch: async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      calls.push({
        ...(typeof init?.body === "string" ? { body: JSON.parse(init.body) } : {}),
        method,
        url
      });
      if (method === "GET") {
        return Response.json({
          items: [{
            id: "session-1",
            title: "Clarify the opening",
            presentation: { id: "presentation-1", title: "Deck" },
            createdAt: timestamp,
            lastActivityAt: timestamp,
            messageCount: 2
          }],
          nextCursor: "next-page"
        });
      }
      if (method === "DELETE") {
        return Response.json({ reset: true });
      }
      return Response.json({
        session: {
          ...createSession(),
          presentationId: "presentation-1",
          presentationTitle: "Deck"
        }
      });
    }
  });

  const page = await client.sessions({ limit: 20, cursor: "cursor-1" });
  const attached = await client.attachSession("session-1", {
    presentationId: "presentation-1",
    presentationTitle: "Deck"
  });
  await client.deleteSession("session-1");

  assert.equal(page.items[0]?.presentation.id, "presentation-1");
  assert.equal(page.nextCursor, "next-page");
  assert.equal(attached.session.presentationId, "presentation-1");
  assert.deepEqual(calls, [
    {
      method: "GET",
      url: "https://agent.example.test/api/agent/sessions?limit=20&cursor=cursor-1"
    },
    {
      method: "PUT",
      url: "https://agent.example.test/api/agent/sessions/session-1/presentation",
      body: {
        presentationId: "presentation-1",
        presentationTitle: "Deck"
      }
    },
    {
      method: "DELETE",
      url: "https://agent.example.test/api/agent/sessions/session-1"
    }
  ]);
});

test("composes SlideX payloads and auth with Heddle's HTTP/SSE client", async () => {
  const calls: Array<{
    url: string;
    method: string;
    authorization: string | null;
    body?: unknown;
  }> = [];
  const resultEvent = SlideXAgentRunProtocol.parseEvent({
    kind: "result",
    runId: "run-1",
    sequence: 1,
    timestamp,
    result: {
      session: createSession(),
      motionDoc: "# Updated deck",
      assistantMessage: "Updated the deck",
      baseSourceRevision: "revision-1",
      presentationSourceRevision: 8
    }
  });
  const fetch: typeof globalThis.fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    calls.push({
      url,
      method,
      authorization: new Headers(init?.headers).get("Authorization"),
      ...(typeof init?.body === "string"
        ? { body: JSON.parse(init.body) }
        : {})
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
    presentationId: "presentation-1",
    presentationTitle: "Deck",
    message: "Make it clearer",
    motionDoc: "# Deck",
    sourceRevision: "revision-1",
    presentationSourceRevision: 7,
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
      authorization: "Bearer test-token",
      body: {
        presentationId: "presentation-1",
        presentationTitle: "Deck",
        message: "Make it clearer",
        motionDoc: "# Deck",
        sourceRevision: "revision-1",
        presentationSourceRevision: 7,
        llmApiKey: "test-key"
      }
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

test("reuses the signed-in product session for agent authorization", async () => {
  const client: SlideXAgentIdentityClient = {
    auth: {
      getSession: async () => ({
        data: { session: { access_token: "existing-access-token" } },
        error: null
      })
    }
  };
  const identity = createIdentity(client);

  const headers = new Headers(await identity.authorizationHeaders());

  assert.equal(headers.get("Authorization"), "Bearer existing-access-token");
});

test("deduplicates concurrent signed-in session reads", async () => {
  const sessionRead = deferred<void>();
  let sessionReads = 0;
  const client: SlideXAgentIdentityClient = {
    auth: {
      getSession: async () => {
        sessionReads += 1;
        await sessionRead.promise;
        return {
          data: { session: { access_token: "signed-in-access-token" } },
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
  assert.deepEqual(
    headers.map((value) => new Headers(value).get("Authorization")),
    ["Bearer signed-in-access-token", "Bearer signed-in-access-token"]
  );
});

test("fails safely when the signed-in product session is missing", async () => {
  const identity = createIdentity({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null })
    }
  });

  await assert.rejects(
    identity.authorizationHeaders(),
    (error: unknown) => error instanceof SlideXAgentIdentityError
      && error.message.includes("signed-in session")
  );
});

test("fails safely when agent identity is not configured", async () => {
  const identity = new SlideXAgentIdentityService({
    createClient: () => {
      throw new Error("Missing public Supabase configuration");
    }
  });

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
