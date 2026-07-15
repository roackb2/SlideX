import assert from "node:assert/strict";
import test from "node:test";
import {
  appUrl,
  resolveRequestOrigin,
  resolveSiteOrigin
} from "@/common/lib/siteUrl";

function requestContext(url: string, headers: Record<string, string> = {}) {
  return {
    headers: new Headers(headers),
    nextUrl: new URL(url)
  };
}

test("production routing never exposes Railway's internal localhost origin", () => {
  const request = requestContext("https://localhost:8080/auth/callback/", {
    host: "localhost:8080"
  });

  assert.equal(
    resolveRequestOrigin(request, { NODE_ENV: "production" }),
    "https://slidexdeck.com"
  );
  assert.equal(
    appUrl(request, "/workspace/pitch?demo=1", { NODE_ENV: "production" }).toString(),
    "https://slidexdeck.com/workspace/pitch?demo=1"
  );
});

test("an explicit site URL overrides the production fallback", () => {
  assert.equal(
    resolveSiteOrigin({ NODE_ENV: "production", SITE_URL: "https://preview.example.com/path" }),
    "https://preview.example.com"
  );
});

test("production ignores a misconfigured localhost site URL", () => {
  assert.equal(
    resolveSiteOrigin({ NODE_ENV: "production", SITE_URL: "http://localhost:8080" }),
    "https://slidexdeck.com"
  );
});

test("development routing follows the forwarded browser origin", () => {
  const request = requestContext("http://localhost:8080/auth/callback/", {
    "x-forwarded-host": "localhost:3001",
    "x-forwarded-proto": "http"
  });

  assert.equal(
    resolveRequestOrigin(request, {
      NODE_ENV: "development",
      SITE_URL: "http://localhost:3000"
    }),
    "http://localhost:3001"
  );
});
