import type { PresentationEditorSnapshot } from "@/features/workspace/application/presentationRealtimeSync";

export type PresentationSaveRequest = {
  editorSnapshot: PresentationEditorSnapshot;
  generation: number;
  persistedSnapshot: PresentationEditorSnapshot;
  presentationId: string;
};

export type PresentationSaveCoordinator = {
  generation: number;
  pending: PresentationSaveRequest | null;
  running: Promise<void> | null;
};

export function createPresentationSaveCoordinator(generation: number): PresentationSaveCoordinator {
  return {
    generation,
    pending: null,
    running: null
  };
}

/**
 * Serializes saves while collapsing an arbitrary burst to the newest snapshot.
 * The active request always finishes, but intermediate pending snapshots are
 * replaced so a slow network cannot make the editor replay every keystroke.
 */
export function enqueueLatestPresentationSave(
  coordinator: PresentationSaveCoordinator,
  request: PresentationSaveRequest,
  persist: (request: PresentationSaveRequest, coordinator: PresentationSaveCoordinator) => Promise<void>
) {
  coordinator.pending = request;

  if (!coordinator.running) {
    const drain = async () => {
      try {
        while (coordinator.pending) {
          const nextRequest = coordinator.pending;
          coordinator.pending = null;
          try {
            await persist(nextRequest, coordinator);
          } catch (error) {
            // If the user edited again while this request was in flight, the
            // newest snapshot is still authoritative and must get its own
            // attempt. A failed older request must never discard it.
            if (coordinator.pending && !isRevisionConflict(error)) continue;
            throw error;
          }
        }
      } finally {
        coordinator.running = null;
      }
    };

    coordinator.running = drain();
  }

  return coordinator.running;
}

function isRevisionConflict(error: unknown) {
  return error instanceof Error && error.name === "PresentationRevisionConflictError";
}
