# Pitch agent boundary

This feature owns the conversational editing experience inside the SlideX pitch
editor. It is a product boundary, not an agent runtime:

- `infrastructure/slidexAgentProtocol.ts` owns the public SlideX activity/result
  schemas and canonical Heddle run-envelope validation.
- `infrastructure/slidexAgentClient.ts` owns HTTP requests, SSE framing, and
  transport error classification. It does not decide cursor or terminal policy.
- `ui/usePitchAgent.ts` coordinates editor-facing state, retry timers, tool
  progress, cancellation, and stale-source conflict handling. Heddle's
  `ConversationRunConsumerService` owns cursor advancement, duplicate/gap
  detection, terminal state, and bounded retry attempts.
- `ui/PitchAgentPanel.tsx` renders the conversation and delegates MotionDoc
  application back to the editor's existing undo-aware `commitSource` path.

Execution, event replay, run-consumer policy, and cancellation semantics belong
to Heddle. Product
session persistence and MotionDoc artifact finalization belong to the SlideX
agent server. Do not duplicate either concern in this feature.

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
