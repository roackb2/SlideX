# Browser regression fixtures

The default Playwright suite verifies the SlideX agent lifecycle through the
real editor UI while replacing only external service boundaries:

- `supabase-fixture.mjs` supplies deterministic Supabase auth,
  presentation, and MCP activity HTTP responses to both browser suites. It
  exists because the protected workspace and editor now use the production
  Supabase session and presentation paths; old local-storage seeds do not
  exercise those paths and redirect to login.
- `supabaseFixtureClient.ts` creates the matching browser session cookie and
  acknowledges the Supabase Realtime protocol used by the production hooks.
- `DeterministicAgentApi` in `agent-lifecycle.spec.ts` supplies agent HTTP/SSE
  and OpenAI device-auth responses. It proves API keys and Codex runtime
  credentials stay out of browser persistence and are forgotten on refresh.
  The agent server repository separately verifies its real router, storage,
  credential redaction, and run service.

Run the suite with:

```sh
npm run test:agent:e2e
```

The MCP activity visual regression has its own config and uses the same shared
fixture; run it separately with `npm run test:mcp-activity:e2e`.

The fixtures are test-only. They do not bypass production authentication code,
write to a real Supabase project, or encode product lifecycle rules.
