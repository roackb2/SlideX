import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import {
  isMcpTransportPath,
  trailingSlashRedirectPath
} from "@/common/lib/trailingSlashRedirect";
import { proxy } from "@/proxy";

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

test("proxy redirects to the exact trailing-slash URL without caching a self-loop", async () => {
  for (const pathname of ["/login", "/workspace"]) {
    const response = await proxy(new NextRequest(
      `https://slidexdeck.com${pathname}?next=%2Fworkspace%2F`
    ));

    assert.equal(response.status, 307);
    assert.equal(
      response.headers.get("location"),
      `https://slidexdeck.com${pathname}/?next=%2Fworkspace%2F`
    );
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("pragma"), "no-cache");
  }
});
