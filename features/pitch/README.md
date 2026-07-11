# Pitch agent boundary

This feature owns the conversational editing experience inside the SlideX pitch
editor. It is a product boundary, not an agent runtime:

- `infrastructure/slidexAgentClient.ts` owns the SlideX server HTTP/SSE protocol.
- `ui/usePitchAgent.ts` owns editor-facing run state, reconnect cursors, tool
  progress, cancellation, and stale-source conflict handling.
- `ui/PitchAgentPanel.tsx` renders the conversation and delegates MotionDoc
  application back to the editor's existing undo-aware `commitSource` path.

Execution, event replay, and cancellation semantics belong to Heddle. Product
session persistence and MotionDoc artifact finalization belong to the SlideX
agent server. Do not duplicate either concern in this feature.
