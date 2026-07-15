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
  bounded catalog, detail, immutable Presentation association, and deletion
  APIs, but does not acquire tokens or choose model credentials.
- `infrastructure/slidexAgentIdentity.ts` restores the signed-in Supabase
  product identity from the application's shared browser client and supplies
  its bearer token to the agent client. Concurrent requests share one session
  read. It never creates a second auth client, falls back to another identity,
  or receives the user's model key.
- `infrastructure/slidexAgentPersistence.ts` owns the tab-scoped active
  conversation selection for each canonical presentation ID. It preserves
  independent bindings when the user moves between presentations; it is not a
  session catalog and does not invent editor-only project identity.
- `ui/agent/usePitchAgent.ts` coordinates editor-facing state, retry timers, tool
  progress, history hydration, detach/delete semantics, stale-session recovery,
  cancellation, and stale-source conflict handling. Heddle's
  `ConversationRunConsumerService` owns cursor advancement, duplicate/gap
  detection, terminal state, and bounded retry attempts.
- `ui/agent/PitchAgentProvider.tsx` owns the live run and current-tab composer
  state independently from the visual surface. A panel, sheet, or FAB may
  unmount without cancelling the run or forgetting the in-memory model key. It
  also injects the application-wide Supabase browser client into the agent
  identity service, then creates one authenticated agent client and TanStack
  Query cache shared by the runtime and catalog.
- `ui/agent/useAgentSessionCatalog.ts` owns bounded catalog loading, pagination,
  cache invalidation, and retry state. It does not own selection or deck state.
- `ui/agent/PitchAgentSessionList.tsx` renders the portable catalog surface.
  Keep it independent from the editor chrome so it can move into a panel,
  sheet, or FAB-triggered surface without changing lifecycle behavior.
- `ui/agent/PitchAgentPanel.tsx` renders the current surface and delegates
  MotionDoc application back to the editor's existing undo-aware `commitSource`
  path. An automatically accepted result is persisted through the workspace
  source callback before its terminal assistant message is rendered; therefore
  a visible completed turn is safe to reload immediately. Persistence failures
  keep the result pending instead of presenting an unsaved deck as complete.

Execution, event replay, run-consumer policy, and cancellation semantics belong
to Heddle. Product
session persistence and MotionDoc artifact finalization belong to the SlideX
agent server. Do not duplicate either concern in this feature.

The workspace route must pass its durable presentation ID into `MotionDocApp`.
Without that identity the agent is not mounted, because SlideX cannot safely
relate a conversation to the artifact. `sessionStorage` remembers only the
active session ID and replay cursor for each presentation in the current tab;
the server remains authoritative for durable session records. Hydration restores
chat/run state but never replaces the canonical presentation with a session
snapshot.

Selecting a conversation for the current Presentation hydrates its chat and
retained run only; the current Presentation source remains the base for the
next turn. Selecting a conversation for another Presentation synchronously
saves the current local source, navigates with canonical `presentation` and
`agentSession` query parameters, then hydrates the target chat. Switching is
disabled while a run, hydration, status check, or deletion is active.

**New conversation** only detaches the current selection and keeps the old
server session for the session list. **Delete conversation** is the separate,
confirmed destructive action. Neither action erases or replaces the current
deck. The OpenAI API key is different: it lives only in
`PitchAgentProvider` React state, is sent only in a run-start body, and is
forgotten on refresh or through the explicit **Forget key** action. Never add it
to local/session storage, cookies, URLs, analytics, run events, or project
persistence.

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
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, plus a supported OAuth provider for
SlideX login. Agent requests reuse that signed-in product session; anonymous
sign-in is neither required nor used. These values establish product identity
only. The user's OpenAI key is entered at runtime and must not be placed in an
environment variable or deployment secret.

The editor flag only controls presentation. A deployment must also set
`SLIDEX_AGENT_ENABLED=true` on the SlideX agent server to register the
reconnectable run API. Keep both flags disabled for the upstream-compatible
experience, and enable both for internal validation.

## Browser regression boundary

Run `npm run test:agent:e2e:install` once, then `npm run test:agent:e2e` for the
deterministic editor lifecycle regression. Playwright starts SlideX with the
agent flag enabled and verifies multi-turn MotionDoc continuity, visible
history after refresh, non-destructive conversation detach, explicit deletion,
and manual-edit-safe recovery after live replay expires. It proves that the
runtime and current-tab composer state survive visual-panel remounts and that
importing content into one presentation keeps its selected conversation. It
also locks stale-session self-healing, explicit cancellation, sanitized start
failure with retry, and active-run conflict reattachment. An accepted run whose
event stream cannot be opened enters the same durable status-recovery path
instead of leaving the composer locked behind a generic error. The same test
runs in `.github/workflows/agent-regression.yml`. The route fixture in
`tests/browser/agent-lifecycle.spec.ts` owns only deterministic HTTP/SSE test
responses; it must not reimplement product session or Heddle run policy. The
real server repository verifies those policies and route semantics separately.
