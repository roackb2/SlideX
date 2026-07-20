import assert from "node:assert/strict";
import test from "node:test";

import { SupabaseMcpOperationActivityStore } from "@/mcp/supabaseOperationActivityStore";

test("operation activity resolves and reuses the OAuth client name lazily", async () => {
  const inserts: Array<Record<string, unknown>> = [];
  let resolverCalls = 0;
  const client = {
    from() {
      return {
        insert(input: Record<string, unknown>) {
          inserts.push(input);
          return this;
        },
        select() {
          return this;
        },
        async single() {
          return { data: { id: `operation-${inserts.length}` }, error: null };
        }
      };
    }
  } as never;
  const store = new SupabaseMcpOperationActivityStore(client, {
    clientId: "slx_client_test",
    async resolveClientName() {
      resolverCalls += 1;
      return "  Codex  ";
    },
    userId: "0b7e63d0-1c53-45fb-980e-42706433295e"
  });

  assert.equal(resolverCalls, 0);
  await store.startOperation({
    presentationId: "e2ca7435-859e-402e-a6f8-96d2f5c3a18e",
    target: { kind: "presentation" },
    toolName: "slidex_save_presentation"
  });
  await store.startOperation({
    presentationId: "e2ca7435-859e-402e-a6f8-96d2f5c3a18e",
    target: { kind: "slide", slideIndex: 0 },
    toolName: "slidex_add_block"
  });

  assert.equal(resolverCalls, 1);
  assert.deepEqual(inserts.map((input) => input.client_name), ["Codex", "Codex"]);
});

test("operation activity falls back to a safe client name", async () => {
  let insertedClientName: unknown;
  const client = {
    from() {
      return {
        insert(input: Record<string, unknown>) {
          insertedClientName = input.client_name;
          return this;
        },
        select() {
          return this;
        },
        async single() {
          return { data: { id: "operation-1" }, error: null };
        }
      };
    }
  } as never;
  const store = new SupabaseMcpOperationActivityStore(client, {
    clientId: "slx_client_test",
    async resolveClientName() {
      throw new Error("database unavailable");
    },
    userId: "0b7e63d0-1c53-45fb-980e-42706433295e"
  });

  await store.startOperation({
    presentationId: "e2ca7435-859e-402e-a6f8-96d2f5c3a18e",
    target: { kind: "presentation" },
    toolName: "slidex_save_presentation"
  });

  assert.equal(insertedClientName, "MCP client");
});
