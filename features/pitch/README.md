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
