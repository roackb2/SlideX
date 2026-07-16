import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { resolveRequestOrigin } from "@/common/lib/siteUrl";
import { createSlideXMcpServer } from "@/mcp/server";
import { mcpResourceUrl } from "@/mcp/oauthMetadata";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";
import { SupabaseMcpPresentationStore } from "@/mcp/supabasePresentationStore";

export const runtime = "nodejs";

export const GET = handleMcpRequest;
export const POST = handleMcpRequest;
export const DELETE = handleMcpRequest;

async function handleMcpRequest(request: NextRequest) {
  const origin = resolveRequestOrigin(request);
  const resource = mcpResourceUrl(origin);
  const resourceMetadataUrl = new URL("/.well-known/oauth-protected-resource/mcp", origin).toString();
  const token = bearerToken(request.headers.get("authorization"));
  if (!token) return unauthorized(resourceMetadataUrl);

  const admin = createSupabaseAdminClient();
  const oauthStore = new SupabaseMcpOAuthStore(admin);
  let auth;
  try {
    auth = await oauthStore.verifyAccessToken(token, resource);
  } catch {
    return unauthorized(resourceMetadataUrl);
  }

  if (!auth.scopes.includes("presentations:read")) {
    return NextResponse.json({ error: "insufficient_scope" }, { status: 403 });
  }

  const server = createSlideXMcpServer({
    enablePresentationWrites: auth.scopes.includes("presentations:write"),
    profile: "remote",
    presentationStore: new SupabaseMcpPresentationStore(admin, auth.userId)
  });
  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined
  });

  await server.connect(transport);
  return transport.handleRequest(request, {
    authInfo: {
      clientId: auth.clientId,
      expiresAt: auth.expiresAt,
      extra: { userId: auth.userId },
      resource: new URL(auth.resource),
      scopes: auth.scopes,
      token
    }
  });
}

function bearerToken(header: string | null) {
  const match = header?.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1];
}

function unauthorized(resourceMetadataUrl: string) {
  return NextResponse.json(
    { error: "unauthorized" },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": `Bearer resource_metadata="${resourceMetadataUrl}"`
      }
    }
  );
}
