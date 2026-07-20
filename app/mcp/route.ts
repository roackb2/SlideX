import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/common/lib/supabase/adminClient";
import { resolveRequestOrigin } from "@/common/lib/siteUrl";
import { createSlideXMcpServer } from "@/mcp/server";
import {
  applyMcpTransportSecurityHeaders,
  createMcpAuthorizationFailure,
  type McpAuthorizationFailureKind,
  parseMcpBearerAuthorization
} from "@/mcp/oauthHttp";
import { mcpResourceUrl } from "@/mcp/oauthMetadata";
import { SupabaseMcpOAuthStore } from "@/mcp/supabaseOAuthStore";
import { SupabaseMcpOperationActivityStore } from "@/mcp/supabaseOperationActivityStore";
import { SupabaseMcpPresentationImageUploadStore } from "@/mcp/supabasePresentationImageUploadStore";
import { SupabaseMcpPresentationStore } from "@/mcp/supabasePresentationStore";
import { applyMcpServerTiming, McpServerTiming } from "@/mcp/serverTiming";

export const runtime = "nodejs";

export const GET = handleMcpRequest;
export const POST = handleMcpRequest;
export const DELETE = handleMcpRequest;

async function handleMcpRequest(request: NextRequest) {
  const timing = new McpServerTiming();
  const origin = resolveRequestOrigin(request);
  const resource = mcpResourceUrl(origin);
  const resourceMetadataUrl = new URL("/.well-known/oauth-protected-resource/mcp", origin).toString();
  const authorization = parseMcpBearerAuthorization(
    request.headers.get("authorization")
  );
  if (authorization.kind !== "token") {
    return authorizationFailure(
      resourceMetadataUrl,
      authorization.kind === "invalid" ? "invalid_token" : "missing_token"
    );
  }
  const token = authorization.token;

  const admin = createSupabaseAdminClient();
  const oauthStore = new SupabaseMcpOAuthStore(admin);
  let auth;
  try {
    auth = await timing.measure("auth", () => oauthStore.verifyAccessToken(token, resource));
  } catch {
    return authorizationFailure(resourceMetadataUrl, "invalid_token");
  }

  if (!auth.scopes.includes("presentations:read")) {
    return authorizationFailure(
      resourceMetadataUrl,
      "insufficient_scope",
      ["presentations:read"]
    );
  }

  const operationActivity = new SupabaseMcpOperationActivityStore(admin, {
    clientId: auth.clientId,
    async resolveClientName() {
      return (await oauthStore.getClient(auth.clientId))?.client_name;
    },
    userId: auth.userId
  });

  const server = createSlideXMcpServer({
    enablePresentationWrites: auth.scopes.includes("presentations:write"),
    imageUploads: auth.scopes.includes("presentation-assets:write")
      ? {
          origin,
          store: new SupabaseMcpPresentationImageUploadStore(admin),
          userId: auth.userId
        }
      : undefined,
    operationActivity,
    profile: "remote",
    presentationStore: new SupabaseMcpPresentationStore(
      admin,
      auth.userId,
      (durationMs) => timing.add("store", durationMs)
    )
  });
  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined
  });

  await server.connect(transport);
  const response = await timing.measure("handler", () =>
    transport.handleRequest(request, {
      authInfo: {
        clientId: auth.clientId,
        expiresAt: auth.expiresAt,
        extra: { userId: auth.userId },
        resource: new URL(auth.resource),
        scopes: auth.scopes,
        token
      }
    })
  );
  return applyMcpTransportSecurityHeaders(applyMcpServerTiming(response, timing));
}

function authorizationFailure(
  resourceMetadataUrl: string,
  kind: McpAuthorizationFailureKind,
  scopes?: string[]
) {
  const failure = createMcpAuthorizationFailure(
    kind,
    resourceMetadataUrl,
    scopes
  );
  return applyMcpTransportSecurityHeaders(NextResponse.json(
    failure.body,
    {
      headers: failure.headers,
      status: failure.status
    }
  ));
}
