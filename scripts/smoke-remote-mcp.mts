import { createHash } from "node:crypto";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/common/lib/supabase/database.types";
import { createSlideXMcpServer } from "@/mcp/server";
import { SupabaseMcpOAuthStore, type McpTokenSet } from "@/mcp/supabaseOAuthStore";
import { SupabaseMcpPresentationStore } from "@/mcp/supabasePresentationStore";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const httpBaseUrl = normalizeOptionalBaseUrl(process.env.REMOTE_MCP_SMOKE_BASE_URL);
const verifyLiveTokenRateLimit = process.env.REMOTE_MCP_SMOKE_VERIFY_RATE_LIMIT === "1";
if (!supabaseUrl || !serviceRoleKey || !publishableKey) {
  throw new Error("Remote MCP smoke requires Supabase URL, publishable, and service-role variables.");
}

const admin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const oauthStore = new SupabaseMcpOAuthStore(admin);
const presentationId = crypto.randomUUID();
let oauthClientId: string | undefined;
let temporaryUserId: string | undefined;
let realtimeClient: SupabaseClient<Database> | undefined;
let realtimeChannel: ReturnType<SupabaseClient<Database>["channel"]> | undefined;

try {
  const email = `mcp-smoke-${crypto.randomUUID()}@example.invalid`;
  const password = `Mcp-${crypto.randomUUID()}-Aa1!`;
  const { data: createdUser, error: userError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password
  });
  if (userError) throw userError;
  temporaryUserId = createdUser.user.id;
  checkpoint("temporary user created");

  realtimeClient = createClient<Database>(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: session, error: signInError } = await realtimeClient.auth.signInWithPassword({
    email,
    password
  });
  if (signInError || !session.session) {
    throw signInError ?? new Error("Temporary Realtime user could not sign in.");
  }
  checkpoint("temporary user signed in");

  const oauthClient = await oauthStore.registerClient({
    clientName: "SlideX remote MCP smoke",
    grantTypes: ["authorization_code", "refresh_token"],
    redirectUris: ["http://127.0.0.1:43119/callback"],
    responseTypes: ["code"]
  });
  oauthClientId = oauthClient.client_id;

  const verifier = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const resource = httpBaseUrl
    ? new URL("/mcp", httpBaseUrl).toString()
    : "https://slidexdeck.com/mcp";
  const legacyResource = `${resource}/`;
  const code = await oauthStore.issueAuthorizationCode({
    client: oauthClient,
    codeChallenge: challenge,
    redirectUri: oauthClient.redirect_uris[0],
    resource: legacyResource,
    scopes: ["presentations:read", "presentations:write"],
    userId: createdUser.user.id
  });
  const wrongVerifier = "~".repeat(43);
  await assertRejectsWithMessage(
    () => httpBaseUrl
      ? exchangeAuthorizationCodeOverHttp({
          baseUrl: httpBaseUrl,
          clientId: oauthClient.client_id,
          code,
          codeVerifier: wrongVerifier,
          redirectUri: oauthClient.redirect_uris[0],
          resource: legacyResource
        })
      : oauthStore.exchangeAuthorizationCode({
          clientId: oauthClient.client_id,
          code,
          codeChallenge: createHash("sha256").update(wrongVerifier).digest("base64url"),
          redirectUri: oauthClient.redirect_uris[0],
          resource: legacyResource
        }),
    "invalid_grant"
  );
  await assertRejectsWithMessage(
    () => httpBaseUrl
      ? exchangeAuthorizationCodeOverHttp({
          baseUrl: httpBaseUrl,
          clientId: oauthClient.client_id,
          code,
          codeVerifier: verifier,
          redirectUri: `${oauthClient.redirect_uris[0]}?modified=1`,
          resource: legacyResource
        })
      : oauthStore.exchangeAuthorizationCode({
          clientId: oauthClient.client_id,
          code,
          codeChallenge: challenge,
          redirectUri: `${oauthClient.redirect_uris[0]}?modified=1`,
          resource: legacyResource
        }),
    "invalid_grant"
  );
  if (httpBaseUrl) {
    await assertTokenError(httpBaseUrl, {
      client_id: oauthClient.client_id,
      code,
      grant_type: "authorization_code",
      redirect_uri: oauthClient.redirect_uris[0],
      resource: legacyResource
    }, "invalid_grant");
  }
  const tokens = httpBaseUrl
    ? await exchangeAuthorizationCodeOverHttp({
        baseUrl: httpBaseUrl,
        clientId: oauthClient.client_id,
        code,
        codeVerifier: verifier,
        redirectUri: oauthClient.redirect_uris[0],
        resource: legacyResource
      })
    : await oauthStore.exchangeAuthorizationCode({
        clientId: oauthClient.client_id,
        code,
        codeChallenge: challenge,
        redirectUri: oauthClient.redirect_uris[0],
        resource: legacyResource
      });
  assertEqual(
    (await oauthStore.verifyAccessToken(tokens.access_token, resource)).userId,
    createdUser.user.id
  );
  assertEqual(
    (await oauthStore.verifyAccessToken(tokens.access_token, legacyResource)).resource,
    resource
  );
  await assertRejects(() => oauthStore.verifyAccessToken(tokens.access_token, `${resource}/wrong`));

  await assertRejectsWithMessage(
    () => httpBaseUrl
      ? refreshTokenOverHttp({
          baseUrl: httpBaseUrl,
          clientId: oauthClient.client_id,
          refreshToken: tokens.refresh_token,
          resource: `${resource}/wrong`
        })
      : oauthStore.exchangeRefreshToken({
          clientId: oauthClient.client_id,
          refreshToken: tokens.refresh_token,
          resource: `${resource}/wrong`
        }),
    httpBaseUrl ? "invalid_target" : "invalid_grant"
  );
  await assertRejectsWithMessage(
    () => httpBaseUrl
      ? refreshTokenOverHttp({
          baseUrl: httpBaseUrl,
          clientId: oauthClient.client_id,
          refreshToken: tokens.refresh_token,
          resource,
          scope: "presentations:read presentations:write presentation-assets:write"
        })
      : oauthStore.exchangeRefreshToken({
          clientId: oauthClient.client_id,
          refreshToken: tokens.refresh_token,
          resource,
          scopes: [
            "presentations:read",
            "presentations:write",
            "presentation-assets:write"
          ]
        }),
    "invalid_scope"
  );

  const firstRefresh = httpBaseUrl
    ? await refreshTokenOverHttp({
        baseUrl: httpBaseUrl,
        clientId: oauthClient.client_id,
        refreshToken: tokens.refresh_token
      })
    : await oauthStore.exchangeRefreshToken({
        clientId: oauthClient.client_id,
        refreshToken: tokens.refresh_token,
        resource: legacyResource
      });
  assertEqual(
    (await oauthStore.verifyAccessToken(firstRefresh.access_token, resource)).userId,
    createdUser.user.id
  );

  const initialSource = `# Remote MCP smoke

<Slide duration={5} theme="dark" background="#000000">
  <Text x={10} y={10} w={80} h={20}>Before</Text>
</Slide>`;
  const { error: insertError } = await admin.from("presentations").insert({
    id: presentationId,
    source: initialSource,
    title: "Remote MCP smoke",
    user_id: createdUser.user.id
  });
  if (insertError) throw insertError;
  checkpoint("presentation inserted");

  const ownerStore = new SupabaseMcpPresentationStore(admin, createdUser.user.id);
  const otherOwnerStore = new SupabaseMcpPresentationStore(admin, crypto.randomUUID());
  assertEqual((await ownerStore.getPresentation(presentationId)).sourceRevision, 0);
  assertEqual((await ownerStore.getPresentation()).id, presentationId);
  assertEqual((await ownerStore.listPresentations(5))[0]?.id, presentationId);
  await assertRejects(() => otherOwnerStore.getPresentation(presentationId));
  await assertRejects(() => otherOwnerStore.getPresentation());
  checkpoint("ownership and automatic discovery verified");

  const refreshedAuth = await oauthStore.verifyAccessToken(
    firstRefresh.access_token,
    resource
  );
  const mcpConnection = httpBaseUrl
    ? await connectRemoteHttpMcp(httpBaseUrl, firstRefresh.access_token)
    : await connectRemoteMcp(
        new SupabaseMcpPresentationStore(admin, refreshedAuth.userId),
        refreshedAuth.scopes.includes("presentations:write")
      );
  try {
    const mcpResult = await mcpConnection.client.callTool({
      arguments: { presentationId },
      name: "slidex_get_presentation"
    });
    assertEqual(mcpResult.isError, undefined);
    assertEqual(
      "source" in (mcpResult.structuredContent as {
        result: { presentation: Record<string, unknown> };
      }).result.presentation,
      false
    );
    if (httpBaseUrl) {
      assertMatch(mcpConnection.serverTiming(), /auth;dur=[0-9.]+/);
      assertMatch(mcpConnection.serverTiming(), /store;dur=[0-9.]+/);
      assertMatch(mcpConnection.serverTiming(), /handler;dur=[0-9.]+/);
      assertMatch(mcpConnection.serverTiming(), /total;dur=[0-9.]+/);
    }
  } finally {
    await mcpConnection.close();
  }

  const secondRefresh = httpBaseUrl
    ? await refreshTokenOverHttp({
        baseUrl: httpBaseUrl,
        clientId: oauthClient.client_id,
        refreshToken: firstRefresh.refresh_token,
        resource
      })
    : await oauthStore.exchangeRefreshToken({
        clientId: oauthClient.client_id,
        refreshToken: firstRefresh.refresh_token,
        resource
      });
  assertEqual(
    (await oauthStore.verifyAccessToken(secondRefresh.access_token, legacyResource)).resource,
    resource
  );
  await assertRejectsWithMessage(
    () => httpBaseUrl
      ? refreshTokenOverHttp({
          baseUrl: httpBaseUrl,
          clientId: oauthClient.client_id,
          refreshToken: tokens.refresh_token,
          resource
        })
      : oauthStore.exchangeRefreshToken({
          clientId: oauthClient.client_id,
          refreshToken: tokens.refresh_token,
          resource
        }),
    "invalid_grant"
  );
  await assertRejectsWithMessage(
    () => httpBaseUrl
      ? refreshTokenOverHttp({
          baseUrl: httpBaseUrl,
          clientId: oauthClient.client_id,
          refreshToken: firstRefresh.refresh_token,
          resource
        })
      : oauthStore.exchangeRefreshToken({
          clientId: oauthClient.client_id,
          refreshToken: firstRefresh.refresh_token,
          resource
        }),
    "invalid_grant"
  );
  await oauthStore.revokeTokenFamily(secondRefresh.access_token);
  await assertRejects(() => oauthStore.verifyAccessToken(secondRefresh.access_token, resource));
  if (httpBaseUrl) await verifyInvalidBearerResponse(httpBaseUrl);
  checkpoint("refreshed MCP call, second rotation, replay rejection, and revocation verified");

  const concurrentCode = await oauthStore.issueAuthorizationCode({
    client: oauthClient,
    codeChallenge: challenge,
    redirectUri: oauthClient.redirect_uris[0],
    resource,
    scopes: ["presentations:read", "presentations:write"],
    userId: createdUser.user.id
  });
  const concurrentTokens = httpBaseUrl
    ? await exchangeAuthorizationCodeOverHttp({
        baseUrl: httpBaseUrl,
        clientId: oauthClient.client_id,
        code: concurrentCode,
        codeVerifier: verifier,
        redirectUri: oauthClient.redirect_uris[0],
        resource
      })
    : await oauthStore.exchangeAuthorizationCode({
        clientId: oauthClient.client_id,
        code: concurrentCode,
        codeChallenge: challenge,
        redirectUri: oauthClient.redirect_uris[0],
        resource
      });
  const concurrentRefresh = () => httpBaseUrl
    ? refreshTokenOverHttp({
        baseUrl: httpBaseUrl,
        clientId: oauthClient.client_id,
        refreshToken: concurrentTokens.refresh_token,
        resource
      })
    : oauthStore.exchangeRefreshToken({
        clientId: oauthClient.client_id,
        refreshToken: concurrentTokens.refresh_token,
        resource
      });
  const concurrentResults = await Promise.allSettled([
    concurrentRefresh(),
    concurrentRefresh()
  ]);
  const concurrentSuccesses = concurrentResults.filter(
    (result): result is PromiseFulfilledResult<McpTokenSet> => result.status === "fulfilled"
  );
  const concurrentInvalidGrants = concurrentResults.filter((result) => (
    result.status === "rejected" &&
    result.reason instanceof Error &&
    result.reason.message === "invalid_grant"
  ));
  assertEqual(concurrentSuccesses.length, 1);
  assertEqual(concurrentInvalidGrants.length, 1);
  const concurrentlyIssuedTokens = concurrentSuccesses[0].value;
  await assertRejects(() => oauthStore.verifyAccessToken(
    concurrentlyIssuedTokens.access_token,
    resource
  ));
  await assertRejectsWithMessage(
    () => oauthStore.exchangeRefreshToken({
      clientId: oauthClient.client_id,
      refreshToken: concurrentlyIssuedTokens.refresh_token,
      resource
    }),
    "invalid_grant"
  );
  checkpoint("concurrent refresh replay revoked the newly issued token family");

  if (httpBaseUrl && verifyLiveTokenRateLimit) {
    await verifyTokenEndpointRateLimit(httpBaseUrl, oauthClient.client_id, resource);
    checkpoint("token endpoint rate limit verified");
  }

  await realtimeClient.realtime.setAuth(session.session.access_token);
  realtimeChannel = realtimeClient.channel(`workspace-presentations:${createdUser.user.id}`, {
    config: { private: true }
  });
  const realtimeUpdate = waitForBroadcast(realtimeChannel, presentationId);
  await waitForSubscription(realtimeChannel);
  checkpoint("realtime subscribed");

  const nextSource = initialSource.replace("Before", "After");
  assertEqual((await ownerStore.savePresentation({
    expectedRevision: 0,
    presentationId,
    source: nextSource
  })).sourceRevision, 1);
  checkpoint("revision saved");
  assertEqual(await realtimeUpdate, 1);
  checkpoint("realtime received");
  await assertRejects(() => ownerStore.savePresentation({
    expectedRevision: 0,
    presentationId,
    source: initialSource
  }));
  checkpoint("revision conflict verified");

  process.stdout.write(`${JSON.stringify({
    audienceValidation: "valid",
    automaticPresentationDiscovery: "valid",
    httpBearerChain: httpBaseUrl ? "valid" : "skipped",
    oauthPkceRefreshRotationMcpCallAndRevocation: "valid",
    refreshReplayRevokedConcurrentWinner: "valid",
    tokenEndpointRateLimit: httpBaseUrl && verifyLiveTokenRateLimit ? "valid" : "skipped",
    ownership: "valid",
    realtimeRevision: 1,
    revisionConflict: "valid"
  })}\n`);
} finally {
  checkpoint("cleanup started");
  if (realtimeChannel && realtimeClient) {
    await withTimeout(
      realtimeClient.removeChannel(realtimeChannel),
      "Realtime channel cleanup timed out."
    ).catch(() => undefined);
  }
  realtimeClient?.realtime.disconnect();
  await withTimeout(
    Promise.resolve(admin.from("presentations").delete().eq("id", presentationId)).then(() => undefined),
    "Presentation cleanup timed out."
  ).catch(() => undefined);
  if (oauthClientId) {
    await withTimeout(
      Promise.resolve(
        admin.from("mcp_oauth_clients").delete().eq("client_id", oauthClientId)
      ).then(() => undefined),
      "OAuth client cleanup timed out."
    ).catch(() => undefined);
  }
  if (temporaryUserId) {
    await withTimeout(
      admin.auth.admin.deleteUser(temporaryUserId).then(() => undefined),
      "Temporary user cleanup timed out."
    ).catch(() => undefined);
  }
  admin.realtime.disconnect();
  checkpoint("cleanup finished");
}

function waitForSubscription(channel: ReturnType<SupabaseClient<Database>["channel"]>) {
  return withTimeout(new Promise<void>((resolve, reject) => {
    channel.subscribe((status, error) => {
      if (status === "SUBSCRIBED") resolve();
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        reject(error ?? new Error(`Realtime subscription failed: ${status}`));
      }
    });
  }), "Realtime subscription timed out.");
}

function waitForBroadcast(
  channel: ReturnType<SupabaseClient<Database>["channel"]>,
  expectedPresentationId: string
) {
  return withTimeout(new Promise<number>((resolve) => {
    channel.on("broadcast", { event: "*" }, (message) => {
      const record = message.payload?.record;
      if (
        record &&
        typeof record === "object" &&
        "id" in record &&
        record.id === expectedPresentationId &&
        "source_revision" in record &&
        typeof record.source_revision === "number"
      ) {
        resolve(record.source_revision);
      }
    });
  }), "Presentation Realtime broadcast timed out.");
}

async function assertRejects(callback: () => Promise<unknown>) {
  let rejected = false;
  try {
    await callback();
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error("Expected the remote MCP operation to reject.");
}

async function assertRejectsWithMessage(callback: () => Promise<unknown>, expected: string) {
  try {
    await callback();
  } catch (error) {
    if (error instanceof Error && error.message === expected) return;
    throw error;
  }
  throw new Error(`Expected the remote MCP operation to reject with ${expected}.`);
}

async function connectRemoteMcp(
  presentationStore: SupabaseMcpPresentationStore,
  enablePresentationWrites: boolean
) {
  const server = createSlideXMcpServer({
    enablePresentationWrites,
    profile: "remote",
    presentationStore
  });
  const client = new Client({ name: "slidex-remote-smoke", version: "0.6.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return {
    client,
    serverTiming: () => undefined,
    async close() {
      await client.close();
      await server.close();
    }
  };
}

async function connectRemoteHttpMcp(baseUrl: string, accessToken: string) {
  let serverTiming: string | undefined;
  const trackedFetch: typeof fetch = async (input, init) => {
    const response = await fetch(input, init);
    serverTiming = response.headers.get("server-timing") ?? serverTiming;
    return response;
  };
  const transport = new StreamableHTTPClientTransport(new URL("/mcp", baseUrl), {
    fetch: trackedFetch,
    requestInit: {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  });
  const client = new Client({ name: "slidex-remote-http-smoke", version: "0.6.0" });
  await client.connect(transport);

  return {
    client,
    async close() {
      await client.close();
    },
    serverTiming: () => serverTiming
  };
}

async function exchangeAuthorizationCodeOverHttp(input: {
  baseUrl: string;
  clientId: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
  resource: string;
}) {
  return postTokenRequest(input.baseUrl, {
    client_id: input.clientId,
    code: input.code,
    code_verifier: input.codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: input.redirectUri,
    resource: input.resource
  });
}

async function refreshTokenOverHttp(input: {
  baseUrl: string;
  clientId: string;
  refreshToken: string;
  resource?: string;
  scope?: string;
}) {
  return postTokenRequest(input.baseUrl, {
    client_id: input.clientId,
    grant_type: "refresh_token",
    refresh_token: input.refreshToken,
    ...(input.resource ? { resource: input.resource } : {}),
    ...(input.scope ? { scope: input.scope } : {})
  });
}

async function assertTokenError(
  baseUrl: string,
  values: Record<string, string>,
  expectedError: string
) {
  const response = await fetch(new URL("/api/mcp/oauth/token/", baseUrl), {
    body: new URLSearchParams(values),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST"
  });
  const payload = await response.json() as { error?: string };
  assertEqual(payload.error, expectedError);
}

async function verifyTokenEndpointRateLimit(
  baseUrl: string,
  clientId: string,
  resource: string
) {
  let rateLimited = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await fetch(new URL("/api/mcp/oauth/token/", baseUrl), {
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "refresh_token",
        resource
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST"
    });
    if (response.status === 429) {
      assertMatch(response.headers.get("retry-after"), /^[1-9][0-9]*$/);
      rateLimited = true;
      break;
    }
  }
  assertEqual(rateLimited, true);
}

async function postTokenRequest(baseUrl: string, values: Record<string, string>) {
  const response = await fetch(new URL("/api/mcp/oauth/token/", baseUrl), {
    body: new URLSearchParams(values),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST"
  });
  const payload = await response.json() as McpTokenSet | { error?: string };
  if (!response.ok || !("access_token" in payload)) {
    throw new Error("error" in payload && payload.error ? payload.error : "token_request_failed");
  }
  assertEqual(response.headers.get("cache-control"), "no-store, private");
  return payload;
}

async function verifyInvalidBearerResponse(baseUrl: string) {
  const response = await fetch(new URL("/mcp", baseUrl), {
    headers: { Authorization: "Bearer invalid-smoke-token" }
  });
  assertEqual(response.status, 401);
  assertEqual(response.headers.get("cache-control"), "no-store, private");
  assertMatch(response.headers.get("www-authenticate"), /error="invalid_token"/);
}

function normalizeOptionalBaseUrl(value: string | undefined) {
  if (!value?.trim()) return undefined;
  return new URL(value).toString();
}

function assertEqual<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}.`);
  }
}

function assertMatch(actual: string | undefined | null, expected: RegExp) {
  if (!actual || !expected.test(actual)) {
    throw new Error(`Expected ${String(actual)} to match ${String(expected)}.`);
  }
}

async function withTimeout<T>(promise: Promise<T>, message: string) {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), 10_000);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function checkpoint(message: string) {
  process.stderr.write(`[remote-mcp-smoke] ${message}\n`);
}
