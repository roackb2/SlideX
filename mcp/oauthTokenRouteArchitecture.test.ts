import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tokenRouteUrl = new URL("../app/api/mcp/oauth/token/route.ts", import.meta.url);
const oauthStoreUrl = new URL("./supabaseOAuthStore.ts", import.meta.url);
const authorizeRouteUrl = new URL("../app/api/mcp/oauth/authorize/route.ts", import.meta.url);
const authorizePageUrl = new URL("../app/mcp/authorize/page.tsx", import.meta.url);

test("public OAuth clients reject client authentication and use two independent rate-limit buckets", async () => {
  const source = await readFile(tokenRouteUrl, "utf8");

  assert.match(source, /request\.headers\.has\("authorization"\)/);
  assert.match(source, /form\.has\("client_secret"\)/);
  assert.match(source, /client\.token_endpoint_auth_method !== "none"/);
  assert.match(source, /identity: "ip"/);
  assert.match(source, /identity: "client_ip"/);
  assert.ok(source.indexOf('identity: "ip"') < source.indexOf("store.getClient(clientId)"));
  assert.ok(source.indexOf("store.getClient(clientId)") < source.indexOf('identity: "client_ip"'));
});

test("raw PKCE verifier is validated in Node and never enters the OAuth store RPC", async () => {
  const [routeSource, storeSource] = await Promise.all([
    readFile(tokenRouteUrl, "utf8"),
    readFile(oauthStoreUrl, "utf8")
  ]);

  assert.match(routeSource, /isValidPkceCodeVerifier\(codeVerifier\)/);
  assert.match(routeSource, /codeChallenge: createPkceS256Challenge\(codeVerifier\)/);
  assert.doesNotMatch(storeSource, /codeVerifier|code_verifier/);
  assert.match(storeSource, /presented_code_challenge: input\.codeChallenge/);
});

test("redirect URI binding uses one shared exact-equality helper on every application path", async () => {
  const sources = await Promise.all([
    readFile(tokenRouteUrl, "utf8"),
    readFile(authorizeRouteUrl, "utf8"),
    readFile(authorizePageUrl, "utf8")
  ]);

  for (const source of sources) {
    assert.match(source, /isExactMcpRedirectUri/);
    assert.doesNotMatch(source, /redirect_uris\.includes/);
    assert.doesNotMatch(source, /redirect(?:Uri|_uri).*\.(?:startsWith|includes)\(/);
  }
});

test("token route serializes only standard OAuth errors and keeps SQL security context server-side", async () => {
  const source = await readFile(tokenRouteUrl, "utf8");

  assert.match(source, /const code: OAuthTokenError = grantError\?\.oauthError/);
  assert.match(source, /function oauthError\(error: OAuthTokenError[\s\S]*?NextResponse\.json\(\{ error \}/);
  assert.doesNotMatch(source, /oauthError\(grantError\?\.securityEvent/);
  assert.doesNotMatch(source, /NextResponse\.json\(\{[\s\S]{0,160}security(?:User|Grant)Id/);
});
