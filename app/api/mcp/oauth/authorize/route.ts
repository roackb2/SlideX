import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { createSupabaseServerClient } from "@/common/lib/supabase/serverClient";
import { resolveRequestOrigin } from "@/common/lib/siteUrl";
import {
  appendOAuthRedirectParams,
  isExactMcpRedirectUri,
  mcpAuthorizationRequestSchema,
  normalizeMcpScopes
} from "@/mcp/oauth";
import { mcpResourceUrl } from "@/mcp/oauthMetadata";
import {
  applyOAuthSecurityHeaders,
  hashMcpAuthorizationRequest,
  isSameOriginMcpConsentPost,
  mcpOAuthRateLimitFailure,
  recordMcpOAuthSecurityEvent
} from "@/mcp/oauthSecurity";
import { consumeMcpOAuthRateLimit } from "@/mcp/oauthRateLimit";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    logInvalidAuthorizationRequest(request, "form_unreadable");
    return oauthJsonError("invalid_request", 400);
  }
  const input = Object.fromEntries(
    [...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
  const parsed = mcpAuthorizationRequestSchema.safeParse(input);
  if (!parsed.success) {
    logInvalidAuthorizationRequest(request, "schema_invalid", {
      invalidFields: [...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? "form")))]
    });
    return oauthJsonError("invalid_request", 400);
  }

  const origin = resolveRequestOrigin(request);
  if (!isSameOriginMcpConsentPost(request.headers.get("origin"), origin)) {
    logInvalidAuthorizationRequest(request, "origin_mismatch", {
      actualOrigin: describePublicOrigin(request.headers.get("origin")),
      expectedOrigin: describePublicOrigin(origin),
      originPresent: request.headers.has("origin")
    });
    return oauthJsonError("invalid_request", 400);
  }

  const store = new SupabaseMcpOAuthStore(createSupabaseAdminClient());
  const rateLimit = await consumeMcpOAuthRateLimit({
    headers: request.headers,
    identity: "ip",
    kind: "authorize",
    store
  }).catch(() => null);
  if (!rateLimit) return oauthJsonError("temporarily_unavailable", 503);
  if (!rateLimit.allowed) {
    await recordMcpOAuthSecurityEvent({
      errorCode: "authorize_ip",
      eventType: "rate_limit_triggered",
      headers: request.headers,
      route: "/api/mcp/oauth/authorize",
      severity: "medium",
      store
    });
    return oauthRateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const clientResult = await store.getClient(parsed.data.client_id)
    .then((client) => ({ client }))
    .catch(() => null);
  if (!clientResult) return oauthJsonError("temporarily_unavailable", 503);
  const { client } = clientResult;
  if (
    !client ||
    !client.grant_types.includes("authorization_code") ||
    !client.response_types.includes("code")
  ) {
    return oauthJsonError("invalid_client", 400);
  }
  if (!isExactMcpRedirectUri(parsed.data.redirect_uri, client.redirect_uris)) {
    await recordMcpOAuthSecurityEvent({
      clientId: client.client_id,
      errorCode: "invalid_client",
      eventType: "redirect_mismatch",
      headers: request.headers,
      route: "/api/mcp/oauth/authorize",
      severity: "medium",
      store
    });
    return oauthJsonError("invalid_client", 400);
  }

  const clientRateLimit = await consumeMcpOAuthRateLimit({
    clientId: client.client_id,
    headers: request.headers,
    identity: "client_ip",
    kind: "authorize",
    store
  }).catch(() => null);
  if (!clientRateLimit) return oauthJsonError("temporarily_unavailable", 503);
  if (!clientRateLimit.allowed) {
    await recordMcpOAuthSecurityEvent({
      clientId: client.client_id,
      errorCode: "authorize_client",
      eventType: "rate_limit_triggered",
      headers: request.headers,
      route: "/api/mcp/oauth/authorize",
      severity: "medium",
      store
    });
    return oauthRateLimitResponse(clientRateLimit.retryAfterSeconds);
  }

  if (parsed.data.resource !== mcpResourceUrl(origin)) {
    return oauthRedirect(parsed.data.redirect_uri, "invalid_target", parsed.data.state);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return oauthRedirect(parsed.data.redirect_uri, "access_denied", parsed.data.state);
  }

  let scopes;
  try {
    scopes = normalizeMcpScopes(parsed.data.scope);
  } catch {
    return oauthRedirect(parsed.data.redirect_uri, "invalid_scope", parsed.data.state);
  }

  const consentNonce = input.consent_nonce;
  const consentResult = consentNonce
    ? await store.consumeConsentRequest({
      clientId: parsed.data.client_id,
      nonce: consentNonce,
      requestHash: hashMcpAuthorizationRequest(parsed.data),
      userId: data.user.id
    }).then((consumed) => ({ consumed, storeError: false }))
      .catch(() => ({ consumed: false, storeError: true }))
    : { consumed: false, storeError: false };
  if (!consentResult.consumed) {
    logInvalidAuthorizationRequest(request, "consent_rejected", {
      noncePresent: Boolean(consentNonce),
      storeError: consentResult.storeError
    });
    return oauthJsonError("invalid_request", 400);
  }

  if (input.decision !== "allow") {
    return oauthRedirect(parsed.data.redirect_uri, "access_denied", parsed.data.state);
  }

  const code = await store.issueAuthorizationCode({
    client,
    codeChallenge: parsed.data.code_challenge,
    redirectUri: parsed.data.redirect_uri,
    resource: parsed.data.resource,
    scopes,
    userId: data.user.id
  }).catch(() => null);
  if (!code) return oauthJsonError("temporarily_unavailable", 503);

  return applyOAuthSecurityHeaders(NextResponse.redirect(
    appendOAuthRedirectParams(parsed.data.redirect_uri, {
      code,
      state: parsed.data.state
    }),
    303
  ));
}

function logInvalidAuthorizationRequest(
  request: NextRequest,
  stage: "consent_rejected" | "form_unreadable" | "origin_mismatch" | "schema_invalid",
  details: Record<string, boolean | string | string[]> = {}
) {
  console.warn("[mcp-oauth] authorization request rejected", {
    ...details,
    requestId: request.headers.get("x-request-id") ?? undefined,
    stage
  });
}

function describePublicOrigin(value: string | null) {
  if (!value) return "missing";
  try {
    const origin = new URL(value).origin;
    return origin === "null" ? "opaque" : origin;
  } catch {
    return "invalid";
  }
}

function oauthRedirect(redirectUri: string, error: string, state?: string) {
  return applyOAuthSecurityHeaders(NextResponse.redirect(
    appendOAuthRedirectParams(redirectUri, { error, state }),
    303
  ));
}

function oauthJsonError(error: string, status: number) {
  return applyOAuthSecurityHeaders(NextResponse.json({ error }, { status }));
}

function oauthRateLimitResponse(retryAfterSeconds: number) {
  const failure = mcpOAuthRateLimitFailure(retryAfterSeconds);
  return applyOAuthSecurityHeaders(NextResponse.json(failure.body, {
    headers: failure.headers,
    status: failure.status
  }));
}
