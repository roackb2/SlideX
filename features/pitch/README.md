# Pitch agent boundary

This feature owns the conversational editing experience inside the SlideX pitch
editor. It is a product boundary, not an agent runtime:

The cross-repository system map, deployment contract, operations checklist, and
next session-list design live in `docs/conversational-agent.md` in the companion
[SlideX agent server repository](https://github.com/zz41354899/slidex-agent-server).
This file remains authoritative for the editor-local boundary.

- `infrastructure/slidexAgentProtocol.ts` owns the public SlideX activity/result
  schemas and canonical Heddle run-envelope validation.
- `infrastructure/slidexAgentClient.ts` composes SlideX's public schemas and
  product-session routes with Heddle Remote's HTTP/SSE run client. Heddle owns
  run start/subscribe/cancel requests, framing, validation, abort cleanup, and
  transport errors. SlideX injects sync/async auth headers and retains its
  session/reset API, but does not acquire tokens or choose model credentials.
- `infrastructure/slidexAgentIdentity.ts` lazily restores or creates the
  Supabase anonymous product identity and supplies its bearer token to the
  client. Concurrent requests share one sign-in attempt. This identity may
  persist across refresh; it never receives the user's model key.
- `infrastructure/slidexAgentPersistence.ts` owns the tab-scoped project and
  product-conversation binding. Project instance identity survives refresh,
  rotates for new/imported decks, and never derives from a mutable project name.
- `ui/agent/usePitchAgent.ts` coordinates editor-facing state, retry timers, tool
  progress, history hydration, reset/stale-session recovery, cancellation, and
  stale-source conflict handling. Heddle's
  `ConversationRunConsumerService` owns cursor advancement, duplicate/gap
  detection, terminal state, and bounded retry attempts.
- `ui/PitchAgentPanel.tsx` renders the conversation and delegates MotionDoc
  application back to the editor's existing undo-aware `commitSource` path.

Execution, event replay, run-consumer policy, and cancellation semantics belong
to Heddle. Product
session persistence and MotionDoc artifact finalization belong to the SlideX
agent server. Do not duplicate either concern in this feature.

Until SlideX has durable projects, project and conversation binding use
`sessionStorage`: refresh can restore the matching server MotionDoc plus chat,
while a new tab starts clean. Supabase separately persists the anonymous
product session so the server can keep that conversation scoped to one user.
The OpenAI API key is different: it lives only in `PitchAgentPanel` React state,
is sent only in a run-start body, and is forgotten on refresh or through the
explicit **Forget key** action. Never add it to local/session storage, cookies,
URLs, analytics, run events, or project persistence.

The server exposes active-run discovery and the editor can replay a retained
active run after refresh. The persisted cursor is
recorded together with the run's base source revision. If retained replay has
expired, the panel keeps the run detached and lets the user check its durable
status. A completed result reuses the same source-revision policy as a live
terminal: unchanged decks apply through the undo-aware path, while diverged
decks stay pending for review. A matching stored `runId` seeds Heddle's
consumer at the validated persisted cursor; a different active run deliberately
starts from zero so a stale project checkpoint cannot skip its events.

## Rollout flag

The conversational agent is disabled by default so shipping this code does not
change the upstream editor experience. Set
`NEXT_PUBLIC_SLIDEX_AGENT_ENABLED=true` when building the editor to mount the
Agent button and panel. Next.js inlines public environment variables into the
client bundle, so changing the flag requires a rebuild and redeploy.

The enabled editor also requires `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, with anonymous sign-ins enabled for that
Supabase project. These values establish product identity only. The user's
OpenAI key is entered at runtime and must not be placed in an environment
variable or deployment secret.

The editor flag only controls presentation. A deployment must also set
`SLIDEX_AGENT_ENABLED=true` on the SlideX agent server to register the
reconnectable run API. Keep both flags disabled for the upstream-compatible
experience, and enable both for internal validation.

## Browser regression boundary

Run `npm run test:agent:e2e:install` once, then `npm run test:agent:e2e` for the
deterministic editor lifecycle regression. Playwright starts SlideX with the
agent flag enabled and verifies multi-turn MotionDoc continuity, visible
history after refresh, conversation reset without erasing the deck, and
manual-edit-safe recovery after live replay expires. It proves that importing a
second same-name deck rotates project identity and resets the old conversation.
It also locks stale-session self-healing, explicit cancellation, sanitized
start failure with retry, and active-run conflict reattachment. An accepted run
whose event stream cannot be opened enters the same durable status-recovery
path instead of leaving the composer locked behind a generic error. The same
test runs in `.github/workflows/agent-regression.yml`. The route fixture in
`tests/browser/agent-lifecycle.spec.ts` owns only deterministic HTTP/SSE test
responses; it must not reimplement product session or Heddle run policy. The
real server repository verifies those policies and route semantics separately.
