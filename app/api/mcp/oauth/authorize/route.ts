import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { createSupabaseServerClient } from "@/common/lib/supabase/serverClient";
import { resolveRequestOrigin } from "@/common/lib/siteUrl";
import {
  appendOAuthRedirectParams,
  mcpAuthorizationRequestSchema,
  normalizeMcpScopes
} from "@/mcp/oauth";
import { mcpResourceUrl } from "@/mcp/oauthMetadata";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const input = Object.fromEntries(
    [...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
  const parsed = mcpAuthorizationRequestSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const store = new SupabaseMcpOAuthStore(createSupabaseAdminClient());
  const client = await store.getClient(parsed.data.client_id);
  if (
    !client ||
    !client.grant_types.includes("authorization_code") ||
    !client.response_types.includes("code") ||
    !client.redirect_uris.includes(parsed.data.redirect_uri)
  ) {
    return NextResponse.json({ error: "invalid_client" }, { status: 400 });
  }

  if (parsed.data.resource !== mcpResourceUrl(resolveRequestOrigin(request))) {
    return oauthRedirect(parsed.data.redirect_uri, "invalid_target", parsed.data.state);
  }

  if (input.decision !== "allow") {
    return oauthRedirect(parsed.data.redirect_uri, "access_denied", parsed.data.state);
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

  const code = await store.issueAuthorizationCode({
    client,
    codeChallenge: parsed.data.code_challenge,
    redirectUri: parsed.data.redirect_uri,
    resource: parsed.data.resource,
    scopes,
    userId: data.user.id
  });

  return NextResponse.redirect(
    appendOAuthRedirectParams(parsed.data.redirect_uri, {
      code,
      state: parsed.data.state
    }),
    303
  );
}

function oauthRedirect(redirectUri: string, error: string, state?: string) {
  return NextResponse.redirect(
    appendOAuthRedirectParams(redirectUri, { error, state }),
    303
  );
}
