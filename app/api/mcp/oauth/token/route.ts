import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { resolveRequestOrigin } from "@/common/lib/siteUrl";
import { normalizeMcpScopes } from "@/mcp/oauth";
import { mcpResourceUrl } from "@/mcp/oauthMetadata";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const clientId = stringField(form, "client_id");
  const grantType = stringField(form, "grant_type");
  const resource = stringField(form, "resource");
  const expectedResource = mcpResourceUrl(resolveRequestOrigin(request));

  if (!clientId || resource !== expectedResource) return oauthError("invalid_request");

  const store = new SupabaseMcpOAuthStore(createSupabaseAdminClient());
  const client = await store.getClient(clientId);
  if (!client) return oauthError("invalid_client");
  if (!grantType || !client.grant_types.includes(grantType)) {
    return oauthError("unauthorized_client");
  }

  try {
    if (grantType === "authorization_code") {
      const code = stringField(form, "code");
      const codeVerifier = stringField(form, "code_verifier");
      const redirectUri = stringField(form, "redirect_uri");
      if (!code || !codeVerifier || !redirectUri || !client.redirect_uris.includes(redirectUri)) {
        return oauthError("invalid_grant");
      }

      return tokenResponse(await store.exchangeAuthorizationCode({
        clientId,
        code,
        codeVerifier,
        redirectUri,
        resource
      }));
    }

    if (grantType === "refresh_token") {
      const refreshToken = stringField(form, "refresh_token");
      if (!refreshToken) return oauthError("invalid_grant");
      const scope = stringField(form, "scope");
      return tokenResponse(await store.exchangeRefreshToken({
        clientId,
        refreshToken,
        resource,
        scopes: scope ? normalizeMcpScopes(scope) : undefined
      }));
    }

    return oauthError("unsupported_grant_type");
  } catch (error) {
    const code = error instanceof Error && ["invalid_grant", "invalid_scope"].includes(error.message)
      ? error.message
      : "invalid_grant";
    return oauthError(code);
  }
}

function stringField(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" && value ? value : undefined;
}

function oauthError(error: string) {
  return NextResponse.json({ error }, { status: 400, headers: { "cache-control": "no-store" } });
}

function tokenResponse(tokens: object) {
  return NextResponse.json(tokens, { headers: { "cache-control": "no-store" } });
}
