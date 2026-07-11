# Pitch agent boundary

This feature owns the conversational editing experience inside the SlideX pitch
editor. It is a product boundary, not an agent runtime:

- `infrastructure/slidexAgentProtocol.ts` owns the public SlideX activity/result
  schemas and canonical Heddle run-envelope validation.
- `infrastructure/slidexAgentClient.ts` owns HTTP requests, SSE framing, and
  transport error classification. It accepts injected sync/async headers for
  the host's eventual production auth provider, but does not acquire tokens or
  choose model-credential policy. It does not decide cursor or terminal policy.
- `infrastructure/slidexAgentPersistence.ts` owns the tab-scoped project and
  product-conversation binding. Project instance identity survives refresh,
  rotates for new/imported decks, and never derives from a mutable project name.
- `ui/usePitchAgent.ts` coordinates editor-facing state, retry timers, tool
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

Until SlideX has durable projects, identity and conversation binding use
`sessionStorage`: refresh can restore the matching server MotionDoc plus chat,
while a new tab starts clean. The server exposes active-run discovery and the
editor can replay a retained active run after refresh. The persisted cursor is
recorded together with the run's base source revision. If retained replay has
expired, the panel keeps the run detached and lets the user check its durable
status. A completed result reuses the same source-revision policy as a live
terminal: unchanged decks apply through the undo-aware path, while diverged
decks stay pending for review. Heddle remote v4.3 still cannot seed a consumer
with a nonzero cursor; add that generic capability in Heddle before relying on
cursor-bounded refresh recovery instead of retained replay from sequence zero.

## Rollout flag

The conversational agent is disabled by default so shipping this code does not
change the upstream editor experience. Set
`NEXT_PUBLIC_SLIDEX_AGENT_ENABLED=true` when building the editor to mount the
Agent button and panel. Next.js inlines public environment variables into the
client bundle, so changing the flag requires a rebuild and redeploy.

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
