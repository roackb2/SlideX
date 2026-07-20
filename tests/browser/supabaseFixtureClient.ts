import type { Page } from "@playwright/test";

export const supabaseFixtureURL = "http://127.0.0.1:54328";

type SupabaseFixtureUser = {
  id: string;
  [key: string]: unknown;
};

/** Creates the cookie and access token shape consumed by @supabase/ssr. */
export function createSupabaseFixtureSession(user: SupabaseFixtureUser) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 24 * 60 * 60;
  const accessToken = [
    base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    base64Url(JSON.stringify({
      aud: "authenticated",
      exp: expiresAt,
      iat: issuedAt,
      iss: `${supabaseFixtureURL}/auth/v1`,
      role: "authenticated",
      sub: user.id
    })),
    "test-signature"
  ].join(".");
  const session = {
    access_token: accessToken,
    expires_at: expiresAt,
    expires_in: 24 * 60 * 60,
    refresh_token: "test-authenticated-refresh-token",
    token_type: "bearer",
    user
  };
  return {
    accessToken,
    cookie: `base64-${base64Url(JSON.stringify(session))}`,
    user
  };
}

/** Keeps production Realtime subscriptions active without a real Supabase socket. */
export async function installSupabaseRealtimeFixture(page: Page) {
  await page.routeWebSocket(`${supabaseFixtureURL.replace("http", "ws")}/realtime/v1/websocket**`, (socket) => {
    socket.onMessage((message) => {
      const frame: unknown = JSON.parse(message.toString());
      if (!Array.isArray(frame) || frame.length !== 5) return;
      const [joinReference, reference, topic, event, payload] = frame;
      if (typeof reference !== "string" || typeof topic !== "string") return;
      if (event !== "phx_join" && event !== "heartbeat") return;
      socket.send(JSON.stringify([
        joinReference,
        reference,
        topic,
        "phx_reply",
        {
          response: {
            postgres_changes: event === "phx_join"
              ? realtimePostgresChanges(payload)
              : []
          },
          status: "ok"
        }
      ]));
    });
  });
}

function realtimePostgresChanges(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("config" in payload)) return [];
  const config = payload.config;
  if (!config || typeof config !== "object" || !("postgres_changes" in config)) return [];
  const changes = config.postgres_changes;
  return Array.isArray(changes)
    ? changes.map((change, index) => ({ ...change, id: index + 1 }))
    : [];
}

function base64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}
