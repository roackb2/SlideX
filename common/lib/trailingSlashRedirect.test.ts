import assert from "node:assert/strict";
import test from "node:test";

import {
  isMcpTransportPath,
  trailingSlashRedirectPath
} from "@/common/lib/trailingSlashRedirect";

test("canonical and legacy Remote MCP paths bypass trailing-slash redirects", () => {
  assert.equal(isMcpTransportPath("/mcp"), true);
  assert.equal(isMcpTransportPath("/mcp/"), true);
  assert.equal(trailingSlashRedirectPath("/mcp"), undefined);
  assert.equal(trailingSlashRedirectPath("/mcp/"), undefined);
});

test("non-MCP routes retain the existing trailing-slash behavior", () => {
  assert.equal(trailingSlashRedirectPath("/docs"), "/docs/");
  assert.equal(trailingSlashRedirectPath("/api/mcp/oauth/token"), "/api/mcp/oauth/token/");
  assert.equal(trailingSlashRedirectPath("/image.png/"), "/image.png");
  assert.equal(trailingSlashRedirectPath("/image.png/", true), undefined);
  assert.equal(trailingSlashRedirectPath("/.well-known/oauth-authorization-server"), undefined);
  assert.equal(trailingSlashRedirectPath("/"), undefined);
});
