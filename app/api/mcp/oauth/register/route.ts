import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { mcpClientRegistrationSchema, validateMcpRedirectUri } from "@/mcp/oauth";
import {
  applyOAuthSecurityHeaders,
  mcpOAuthRateLimitFailure,
  recordMcpOAuthSecurityEvent
} from "@/mcp/oauthSecurity";
import { consumeMcpOAuthRateLimit } from "@/mcp/oauthRateLimit";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";

export async function POST(request: Request) {
  const store = new SupabaseMcpOAuthStore(createSupabaseAdminClient());
  const rateLimit = await consumeMcpOAuthRateLimit({
    headers: request.headers,
    identity: "ip",
    kind: "register",
    store
  }).catch(() => null);
  if (!rateLimit) return oauthRegistrationError("temporarily_unavailable", 503);
  if (!rateLimit.allowed) {
    await recordMcpOAuthSecurityEvent({
      errorCode: "register_ip",
      eventType: "rate_limit_triggered",
      headers: request.headers,
      route: "/api/mcp/oauth/register",
      severity: "medium",
      store
    });
    return oauthRateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = mcpClientRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return oauthRegistrationError("invalid_client_metadata", 400);
  }

  let redirectUris: string[];
  try {
    redirectUris = parsed.data.redirect_uris.map(validateMcpRedirectUri);
  } catch {
    return oauthRegistrationError("invalid_redirect_uri", 400);
  }

  const client = await store.registerClient({
    clientName: parsed.data.client_name,
    grantTypes: parsed.data.grant_types,
    redirectUris,
    responseTypes: parsed.data.response_types
  }).catch(() => null);
  if (!client) return oauthRegistrationError("temporarily_unavailable", 503);

  return applyOAuthSecurityHeaders(NextResponse.json(
    {
      client_id: client.client_id,
      client_id_issued_at: Math.floor(new Date(client.created_at).getTime() / 1000),
      client_name: client.client_name,
      grant_types: client.grant_types,
      redirect_uris: client.redirect_uris,
      response_types: client.response_types,
      token_endpoint_auth_method: client.token_endpoint_auth_method
    },
    { status: 201 }
  ));
}

function oauthRegistrationError(error: string, status: number) {
  return applyOAuthSecurityHeaders(NextResponse.json({ error }, { status }));
}

function oauthRateLimitResponse(retryAfterSeconds: number) {
  const failure = mcpOAuthRateLimitFailure(retryAfterSeconds);
  return applyOAuthSecurityHeaders(NextResponse.json(failure.body, {
    headers: failure.headers,
    status: failure.status
  }));
}
