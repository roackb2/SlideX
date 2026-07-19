import assert from "node:assert/strict";
import test from "node:test";

import {
  mcpAuthorizationServerMetadata,
  mcpProtectedResourceMetadata
} from "@/mcp/oauthMetadata";

test("MCP OAuth metadata publishes a canonical resource and direct routes", () => {
  const origin = "https://slidexdeck.com";
  const authorization = mcpAuthorizationServerMetadata(origin);
  const resource = mcpProtectedResourceMetadata(origin);

  assert.equal(resource.resource, "https://slidexdeck.com/mcp");
  assert.equal(authorization.authorization_endpoint, "https://slidexdeck.com/mcp/authorize/");
  assert.equal(
    authorization.registration_endpoint,
    "https://slidexdeck.com/api/mcp/oauth/register/"
  );
  assert.equal(authorization.token_endpoint, "https://slidexdeck.com/api/mcp/oauth/token/");
  assert.equal(authorization.revocation_endpoint, "https://slidexdeck.com/api/mcp/oauth/revoke/");
});
