import { mcpOAuthScopes } from "@/mcp/oauth";

export function mcpResourceUrl(origin: string) {
  return new URL("/mcp", origin).toString();
}

export function mcpProtectedResourceMetadata(origin: string) {
  return {
    authorization_servers: [new URL("/", origin).toString().replace(/\/$/, "")],
    bearer_methods_supported: ["header"],
    resource: mcpResourceUrl(origin),
    resource_name: "SlideX Remote MCP",
    scopes_supported: [...mcpOAuthScopes]
  };
}

export function mcpAuthorizationServerMetadata(origin: string) {
  const issuer = new URL("/", origin).toString().replace(/\/$/, "");
  return {
    authorization_endpoint: new URL("/mcp/authorize/", origin).toString(),
    code_challenge_methods_supported: ["S256"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    issuer,
    registration_endpoint: new URL("/api/mcp/oauth/register/", origin).toString(),
    response_types_supported: ["code"],
    revocation_endpoint: new URL("/api/mcp/oauth/revoke/", origin).toString(),
    scopes_supported: [...mcpOAuthScopes],
    token_endpoint: new URL("/api/mcp/oauth/token/", origin).toString(),
    token_endpoint_auth_methods_supported: ["none"]
  };
}
