import { createHash } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/common/lib/supabase/database.types";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";
import { SupabaseMcpPresentationStore } from "@/mcp/supabasePresentationStore";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
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
  const resource = "https://slidexdeck.com/mcp/";
  const code = await oauthStore.issueAuthorizationCode({
    client: oauthClient,
    codeChallenge: challenge,
    redirectUri: oauthClient.redirect_uris[0],
    resource,
    scopes: ["presentations:read", "presentations:write"],
    userId: createdUser.user.id
  });
  const tokens = await oauthStore.exchangeAuthorizationCode({
    clientId: oauthClient.client_id,
    code,
    codeVerifier: verifier,
    redirectUri: oauthClient.redirect_uris[0],
    resource
  });
  assertEqual(
    (await oauthStore.verifyAccessToken(tokens.access_token, resource)).userId,
    createdUser.user.id
  );
  await assertRejects(() => oauthStore.verifyAccessToken(tokens.access_token, `${resource}/wrong`));
  await oauthStore.revokeToken(tokens.access_token);
  await assertRejects(() => oauthStore.verifyAccessToken(tokens.access_token, resource));
  checkpoint("oauth verified");

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
    oauthPkceAndRevocation: "valid",
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

function assertEqual<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}.`);
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
