import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { resolveRequestOrigin } from "@/common/lib/siteUrl";
import {
  createPkceS256Challenge,
  isExactMcpRedirectUri,
  isValidPkceCodeVerifier,
  normalizeMcpScopes,
  resolveMcpTokenRequestResource
} from "@/mcp/oauth";
import { mcpResourceUrl } from "@/mcp/oauthMetadata";
import {
  applyOAuthSecurityHeaders,
  mcpOAuthRateLimitFailure,
  recordMcpOAuthSecurityEvent
} from "@/mcp/oauthSecurity";
import { consumeMcpOAuthRateLimit } from "@/mcp/oauthRateLimit";
import {
  McpOAuthGrantError,
  SupabaseMcpOAuthStore
} from "@/mcp/supabaseOAuthStore";

const tokenRoute = "/api/mcp/oauth/token";

type OAuthTokenError =
  | "invalid_client"
  | "invalid_grant"
  | "invalid_request"
  | "invalid_scope"
  | "invalid_target"
  | "temporarily_unavailable"
  | "unauthorized_client"
  | "unsupported_grant_type";

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) return oauthError("invalid_request");
  const clientId = stringField(form, "client_id");
  const grantType = stringField(form, "grant_type");
  const resource = stringField(form, "resource");
  const expectedResource = mcpResourceUrl(resolveRequestOrigin(request));

  const store = new SupabaseMcpOAuthStore(createSupabaseAdminClient());
  const ipRateLimit = await consumeMcpOAuthRateLimit({
    headers: request.headers,
    identity: "ip",
    kind: "token",
    store
  }).catch(() => null);
  if (!ipRateLimit) return oauthError("temporarily_unavailable", 503);
  if (!ipRateLimit.allowed) {
    await recordSecurityEvent(store, request.headers, {
      errorCode: "token_ip",
      eventType: "rate_limit_triggered",
      severity: "medium"
    });
    return oauthRateLimitResponse(ipRateLimit.retryAfterSeconds);
  }

  if (!clientId || clientId.length > 200) return oauthError("invalid_client");
  if (request.headers.has("authorization") || form.has("client_secret")) {
    return oauthError("invalid_client");
  }

  const clientResult = await store.getClient(clientId)
    .then((client) => ({ client }))
    .catch(() => null);
  if (!clientResult) return oauthError("temporarily_unavailable", 503);
  const { client } = clientResult;
  if (!client || client.token_endpoint_auth_method !== "none") {
    return oauthError("invalid_client");
  }

  const clientRateLimit = await consumeMcpOAuthRateLimit({
    clientId: client.client_id,
    headers: request.headers,
    identity: "client_ip",
    kind: "token",
    store
  }).catch(() => null);
  if (!clientRateLimit) return oauthError("temporarily_unavailable", 503);
  if (!clientRateLimit.allowed) {
    await recordSecurityEvent(store, request.headers, {
      clientId,
      errorCode: "token_client",
      eventType: "rate_limit_triggered",
      severity: "medium"
    });
    return oauthRateLimitResponse(clientRateLimit.retryAfterSeconds);
  }

  if (!grantType) return oauthError("invalid_request");
  const resourceResolution = resolveMcpTokenRequestResource({
    expectedResource,
    grantType,
    resource
  });
  if ("error" in resourceResolution) return oauthError(resourceResolution.error);
  const canonicalResource = resourceResolution.resource;

  try {
    if (grantType === "authorization_code") {
      if (!client.grant_types.includes(grantType)) return oauthError("unauthorized_client");
      const code = stringField(form, "code");
      const codeVerifier = stringField(form, "code_verifier");
      const redirectUri = stringField(form, "redirect_uri");
      if (!code || !codeVerifier || !redirectUri) {
        await recordSecurityEvent(store, request.headers, {
          clientId,
          errorCode: "invalid_grant",
          eventType: !codeVerifier
            ? "pkce_failure"
            : !redirectUri ? "redirect_mismatch" : "invalid_grant",
          severity: "medium"
        });
        return oauthError("invalid_grant");
      }
      if (!isValidPkceCodeVerifier(codeVerifier)) {
        await recordSecurityEvent(store, request.headers, {
          clientId,
          errorCode: "invalid_grant",
          eventType: "pkce_failure",
          severity: "medium"
        });
        return oauthError("invalid_grant");
      }
      if (!isExactMcpRedirectUri(redirectUri, client.redirect_uris)) {
        await recordSecurityEvent(store, request.headers, {
          clientId,
          errorCode: "invalid_grant",
          eventType: "redirect_mismatch",
          severity: "medium"
        });
        return oauthError("invalid_grant");
      }

      return tokenResponse(await store.exchangeAuthorizationCode({
        clientId,
        code,
        codeChallenge: createPkceS256Challenge(codeVerifier),
        redirectUri,
        resource: canonicalResource
      }));
    }

    if (grantType === "refresh_token") {
      if (!client.grant_types.includes(grantType)) return oauthError("unauthorized_client");
      const refreshToken = stringField(form, "refresh_token");
      if (!refreshToken) {
        await recordSecurityEvent(store, request.headers, {
          clientId,
          errorCode: "invalid_grant",
          eventType: "invalid_grant",
          severity: "medium"
        });
        return oauthError("invalid_grant");
      }
      const scope = stringField(form, "scope");
      return tokenResponse(await store.exchangeRefreshToken({
        clientId,
        refreshToken,
        resource: canonicalResource,
        scopes: scope ? normalizeMcpScopes(scope) : undefined
      }));
    }

    return oauthError("unsupported_grant_type");
  } catch (error) {
    const grantError = error instanceof McpOAuthGrantError ? error : undefined;
    const code: OAuthTokenError = grantError?.oauthError ?? (
      error instanceof Error && error.message === "invalid_scope"
        ? "invalid_scope"
        : "invalid_grant"
    );
    await recordSecurityEvent(store, request.headers, {
      clientId,
      errorCode: code,
      eventType: grantError?.securityEvent ?? "invalid_grant",
      grantId: grantError?.securityGrantId,
      severity: grantError?.securityEvent === "refresh_replay" ? "high" : "medium",
      userId: grantError?.securityUserId
    });
    return oauthError(code);
  }
}

async function recordSecurityEvent(
  store: SupabaseMcpOAuthStore,
  headers: Headers,
  event: {
    clientId?: string;
    errorCode: string;
    eventType: "invalid_grant" | "pkce_failure" | "redirect_mismatch" | "rate_limit_triggered" | "refresh_replay";
    grantId?: string;
    severity: "medium" | "high";
    userId?: string;
  }
) {
  await recordMcpOAuthSecurityEvent({
    ...event,
    headers,
    route: tokenRoute,
    store
  });
}

function stringField(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" && value ? value : undefined;
}

function oauthError(error: OAuthTokenError, status = 400) {
  return applyOAuthSecurityHeaders(NextResponse.json({ error }, { status }));
}

function tokenResponse(tokens: object) {
  return applyOAuthSecurityHeaders(NextResponse.json(tokens));
}

function oauthRateLimitResponse(retryAfterSeconds: number) {
  const failure = mcpOAuthRateLimitFailure(retryAfterSeconds);
  return applyOAuthSecurityHeaders(NextResponse.json(failure.body, {
    headers: failure.headers,
    status: failure.status
  }));
}
