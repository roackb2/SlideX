"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import { liveDemoPresentation } from "@/core/motion-doc/presets/liveDemo";
import { useAuthSession } from "@/features/auth/ui/useAuthSession";
import {
  decidePresentationRealtimeUpdate,
  normalizePresentationEditorTemplateId,
  presentationSnapshotEquals,
  reconcilePresentationSaveResult,
  type ActivePresentationSave,
  type PresentationEditorSnapshot
} from "@/features/workspace/application/presentationRealtimeSync";
import {
  createPresentationSaveCoordinator,
  enqueueLatestPresentationSave,
  type PresentationSaveCoordinator,
  type PresentationSaveRequest
} from "@/features/workspace/application/presentationSaveCoordinator";
import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";
import {
  clearGuestDemoDraft,
  ensureGuestDemoDraft,
  updateGuestDemoDraft
} from "@/features/workspace/infrastructure/guestDemoDraft";
import {
  advancePresentationRecoveryDraft,
  clearPresentationRecoveryDraft,
  readPresentationRecoveryDraft,
  writePresentationRecoveryDraft
} from "@/features/workspace/infrastructure/presentationRecoveryDraft";
import {
  getSupabasePresentation,
  importGuestDemoPresentation,
  parseSupabasePresentationRealtimeChange,
  PresentationRevisionConflictError,
  updateSupabasePresentation
} from "@/features/workspace/infrastructure/supabasePresentationRepository";

export type PitchAccessMode = "authenticated" | "guest";

export function useLocalPitchPresentation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const { isReady: isAuthReady, session } = useAuthSession();
  const [presentation, setPresentation] = useState<WorkspacePresentation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionWarning, setConnectionWarning] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const activeImportRef = useRef<{
    key: string;
    promise: ReturnType<typeof importGuestDemoPresentation>;
  } | null>(null);
  const resumeExportOnEntryRef = useRef(searchParams.get("intent") === "export");
  const sourceRevisionRef = useRef(0);
  const presentationRef = useRef<WorkspacePresentation | null>(null);
  const editorSnapshotRef = useRef<PresentationEditorSnapshot | null>(null);
  const persistedEditorSnapshotRef = useRef<PresentationEditorSnapshot | null>(null);
  const activeSaveRef = useRef<ActivePresentationSave | null>(null);
  const recoveryConflictRef = useRef(false);
  const loadGenerationRef = useRef(0);
  const saveCoordinatorRef = useRef<PresentationSaveCoordinator>(createPresentationSaveCoordinator(0));
  const presentationId = searchParams.get("presentation");
  const isDemoEntry = searchParams.get("demo") === "1";
  const userId = session?.user.id;
  const accessMode: PitchAccessMode = isDemoEntry && !session ? "guest" : "authenticated";
  const agentSessionId = searchParams.get("agentSession") ?? undefined;
  const syncWarning = conflictWarning ?? connectionWarning;

  useEffect(() => {
    if (!isAuthReady) return;
    let isCancelled = false;
    const generation = loadGenerationRef.current + 1;
    loadGenerationRef.current = generation;
    saveCoordinatorRef.current = createPresentationSaveCoordinator(generation);
    activeSaveRef.current = null;
    recoveryConflictRef.current = false;
    presentationRef.current = null;
    editorSnapshotRef.current = null;
    persistedEditorSnapshotRef.current = null;
    sourceRevisionRef.current = 0;
    setIsReady(false);
    setPresentation(null);

    void (async () => {
      setError(null);
      setConnectionWarning(null);
      setConflictWarning(null);

      if (isDemoEntry) {
        const demoPresentation = liveDemoPresentation(locale);
        const guestDraft = ensureGuestDemoDraft({
          id: demoPresentation.id,
          source: demoPresentation.source,
          templateId: demoPresentation.templateId,
          title: demoPresentation.title
        });

        if (userId) {
          const importKey = `${userId}:${guestDraft.importId}`;
          const importPromise = activeImportRef.current?.key === importKey
            ? activeImportRef.current.promise
            : importGuestDemoPresentation({
                editorTemplateId: guestDraft.editorTemplateId,
                importId: guestDraft.importId,
                source: guestDraft.source,
                templateId: guestDraft.templateId,
                title: guestDraft.title
              });
          activeImportRef.current = { key: importKey, promise: importPromise };

          try {
            const importedPresentation = await importPromise;
            if (isCancelled || loadGenerationRef.current !== generation) return;
            clearGuestDemoDraft(guestDraft.importId);
            const intent = resumeExportOnEntryRef.current ? "&intent=export" : "";
            router.replace(`${appRoutes.pitch}?presentation=${encodeURIComponent(importedPresentation.id)}${intent}`);
          } catch {
            if (!isCancelled && loadGenerationRef.current === generation) {
              if (activeImportRef.current?.promise === importPromise) {
                activeImportRef.current = null;
              }
              setError("Your demo is still stored in this browser, but it could not be added to SQL. Please retry after checking Supabase.");
              setIsReady(true);
            }
          }
          return;
        }

        const guestPresentation: WorkspacePresentation = {
          createdAt: guestDraft.createdAt,
          editorTemplateId: guestDraft.editorTemplateId,
          id: guestDraft.id,
          kind: "presentation",
          lastOpenedAt: guestDraft.updatedAt,
          ownerId: "guest",
          source: guestDraft.source,
          sourceRevision: 0,
          templateId: guestDraft.templateId,
          title: guestDraft.title,
          updatedAt: guestDraft.updatedAt
        };
        const guestSnapshot = presentationEditorSnapshot(guestPresentation);
        presentationRef.current = guestPresentation;
        editorSnapshotRef.current = guestSnapshot;
        persistedEditorSnapshotRef.current = guestSnapshot;
        setPresentation(guestPresentation);
        sourceRevisionRef.current = 0;
        setIsReady(true);
        return;
      }

      if (!userId) {
        router.replace(appRoutes.login);
        return;
      }
      if (!presentationId) {
        router.replace(appRoutes.workspace);
        return;
      }

      try {
        const remotePresentation = await getSupabasePresentation(
          createSupabaseBrowserClient(),
          presentationId
        );
        if (isCancelled || loadGenerationRef.current !== generation) return;
        if (!remotePresentation) {
          router.replace(appRoutes.workspace);
          return;
        }
        if (
          presentationRef.current &&
          sourceRevisionRef.current > remotePresentation.sourceRevision
        ) {
          setIsReady(true);
          return;
        }
        const remoteSnapshot = presentationEditorSnapshot(remotePresentation);
        const recoveryDraft = readPresentationRecoveryDraft(remotePresentation.id);
        let editorPresentation = remotePresentation;
        let editorSnapshot = remoteSnapshot;
        if (recoveryDraft && presentationSnapshotEquals(recoveryDraft.snapshot, remoteSnapshot)) {
          clearPresentationRecoveryDraft(remotePresentation.id);
        } else if (recoveryDraft) {
          editorSnapshot = recoveryDraft.snapshot;
          editorPresentation = {
            ...remotePresentation,
            editorTemplateId: recoveryDraft.snapshot.editorTemplateId,
            source: recoveryDraft.snapshot.source,
            title: recoveryDraft.snapshot.title
          };
          recoveryConflictRef.current = recoveryDraft.baseSourceRevision !== remotePresentation.sourceRevision;
          setConflictWarning(recoveryConflictRef.current
            ? "Recovered local edits conflict with a newer remote revision. Export or copy them before reloading."
            : "Recovered unsaved local edits from this browser.");
        }
        sourceRevisionRef.current = remotePresentation.sourceRevision;
        presentationRef.current = remotePresentation;
        editorSnapshotRef.current = editorSnapshot;
        persistedEditorSnapshotRef.current = remoteSnapshot;
        activeSaveRef.current = null;
        setPresentation(editorPresentation);
        setIsReady(true);
      } catch {
        if (!isCancelled && loadGenerationRef.current === generation) {
          setError("This presentation could not be loaded from Supabase.");
          setIsReady(true);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthReady, isDemoEntry, locale, presentationId, router, userId]);

  useEffect(() => {
    if (!isAuthReady || !userId || !presentationId || isDemoEntry) return;

    const client = createSupabaseBrowserClient();
    let channel: ReturnType<typeof client.channel> | null = null;
    let isCancelled = false;
    const generation = loadGenerationRef.current;

    function applyRemotePresentation(remotePresentation: WorkspacePresentation) {
      const decision = decidePresentationRealtimeUpdate(remotePresentation, {
        activeSave: activeSaveRef.current,
        currentSourceRevision: sourceRevisionRef.current,
        editorSnapshot: editorSnapshotRef.current,
        persistedEditorSnapshot: persistedEditorSnapshotRef.current
      });
      if (decision === "ignore-stale-update") return;
      if (decision === "preserve-local-edit") {
        setConflictWarning("A newer remote version is available. Your local edits were kept; reload before saving over it.");
        return;
      }

      sourceRevisionRef.current = remotePresentation.sourceRevision;
      presentationRef.current = remotePresentation;

      if (decision === "acknowledge-local-save") {
        const activeSave = activeSaveRef.current;
        if (activeSave) {
          persistedEditorSnapshotRef.current = activeSave.editorSnapshot;
          advancePresentationRecoveryDraft(
            remotePresentation.id,
            activeSave.editorSnapshot,
            remotePresentation.sourceRevision
          );
        }
        return;
      }

      const remoteSnapshot = presentationEditorSnapshot(remotePresentation);
      persistedEditorSnapshotRef.current = remoteSnapshot;
      editorSnapshotRef.current = remoteSnapshot;
      recoveryConflictRef.current = false;
      clearPresentationRecoveryDraft(remotePresentation.id);
      setConflictWarning(null);
      setPresentation(remotePresentation);
    }

    async function reconcileCurrentPresentation() {
      const remotePresentation = await getSupabasePresentation(client, presentationId!);
      if (
        isCancelled ||
        loadGenerationRef.current !== generation ||
        !remotePresentation
      ) return;
      applyRemotePresentation(remotePresentation);
    }

    void client.realtime.setAuth().then(() => {
      if (isCancelled) return;
      channel = client
        .channel(`workspace-presentations:${userId}`, {
          config: { private: true }
        })
        .on("broadcast", { event: "*" }, (message) => {
          if (loadGenerationRef.current !== generation) return;
          const change = parseSupabasePresentationRealtimeChange(message, userId);
          if (!change || change.presentation.id !== presentationId) return;

          if (change.event === "DELETE") {
            const nextGeneration = loadGenerationRef.current + 1;
            loadGenerationRef.current = nextGeneration;
            saveCoordinatorRef.current = createPresentationSaveCoordinator(nextGeneration);
            activeSaveRef.current = null;
            presentationRef.current = null;
            editorSnapshotRef.current = null;
            persistedEditorSnapshotRef.current = null;
            clearPresentationRecoveryDraft(change.presentation.id);
            setPresentation(null);
            router.replace(appRoutes.workspace);
            return;
          }

          if (change.event !== "UPDATE") return;
          applyRemotePresentation(change.presentation);
        })
        .subscribe((status) => {
          if (
            !isCancelled &&
            loadGenerationRef.current === generation &&
            status === "SUBSCRIBED"
          ) {
            setConnectionWarning(null);
            void reconcileCurrentPresentation().catch(() => {
              if (!isCancelled && loadGenerationRef.current === generation) {
                setConnectionWarning("Live sync reconnected, but the latest revision could not be verified.");
              }
            });
          }
          if (
            !isCancelled &&
            loadGenerationRef.current === generation &&
            (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED")
          ) {
            setConnectionWarning("Live sync is temporarily unavailable. Local editing remains active.");
          }
        });
    }).catch(() => {
      if (!isCancelled && loadGenerationRef.current === generation) {
        setConnectionWarning("Live sync is temporarily unavailable. Local editing remains active.");
      }
    });

    return () => {
      isCancelled = true;
      if (channel) void client.removeChannel(channel);
    };
  }, [isAuthReady, isDemoEntry, presentationId, router, userId]);

  const persistPresentationSave = useCallback(async (
    request: PresentationSaveRequest,
    coordinator: PresentationSaveCoordinator
  ) => {
    if (
      saveCoordinatorRef.current !== coordinator ||
      loadGenerationRef.current !== request.generation ||
      presentationRef.current?.id !== request.presentationId
    ) {
      throw new Error("The presentation save was cancelled because the editor context changed.");
    }

    const currentPresentation = presentationRef.current;
    if (presentationSnapshotEquals(currentPresentation, request.persistedSnapshot)) {
      persistedEditorSnapshotRef.current = request.editorSnapshot;
      advancePresentationRecoveryDraft(
        request.presentationId,
        request.editorSnapshot,
        sourceRevisionRef.current
      );
      return;
    }

    const expectedSourceRevision = sourceRevisionRef.current;
    const activeSave: ActivePresentationSave = {
      editorSnapshot: request.editorSnapshot,
      expectedSourceRevision,
      persistedSnapshot: request.persistedSnapshot,
      presentationId: request.presentationId
    };
    activeSaveRef.current = activeSave;

    const acknowledgeSave = (
      sourceRevision: number,
      editorTemplateId: string | undefined,
      updatedAt: string
    ) => {
      if (!presentationRef.current) return;
      sourceRevisionRef.current = sourceRevision;
      presentationRef.current = {
        ...presentationRef.current,
        editorTemplateId,
        source: request.persistedSnapshot.source,
        sourceRevision,
        title: request.persistedSnapshot.title,
        updatedAt
      };
      persistedEditorSnapshotRef.current = request.editorSnapshot;
      recoveryConflictRef.current = false;
      advancePresentationRecoveryDraft(
        request.presentationId,
        request.editorSnapshot,
        sourceRevision
      );
      setConflictWarning(null);
    };

    try {
      const result = await updateSupabasePresentation(
        createSupabaseBrowserClient(),
        request.presentationId,
        expectedSourceRevision,
        request.persistedSnapshot
      );
      if (
        saveCoordinatorRef.current !== coordinator ||
        loadGenerationRef.current !== request.generation ||
        presentationRef.current?.id !== request.presentationId ||
        sourceRevisionRef.current > result.sourceRevision
      ) {
        throw new Error("The presentation save response no longer matches the active editor context.");
      }

      acknowledgeSave(result.sourceRevision, result.editorTemplateId, result.updatedAt);
    } catch (saveError) {
      if (
        saveCoordinatorRef.current !== coordinator ||
        loadGenerationRef.current !== request.generation ||
        presentationRef.current?.id !== request.presentationId
      ) {
        throw saveError;
      }

      let remotePresentation: WorkspacePresentation | null;
      try {
        remotePresentation = await getSupabasePresentation(
          createSupabaseBrowserClient(),
          request.presentationId
        );
      } catch {
        throw saveError;
      }

      const reconciliation = reconcilePresentationSaveResult(remotePresentation, activeSave);
      if (reconciliation === "acknowledge-committed-save" && remotePresentation) {
        acknowledgeSave(
          remotePresentation.sourceRevision,
          remotePresentation.editorTemplateId,
          remotePresentation.updatedAt
        );
        return;
      }

      if (reconciliation === "remote-conflict" && remotePresentation) {
        sourceRevisionRef.current = remotePresentation.sourceRevision;
        presentationRef.current = remotePresentation;
        persistedEditorSnapshotRef.current = presentationEditorSnapshot(remotePresentation);
        recoveryConflictRef.current = true;
        setConflictWarning("This presentation changed in another editor or Agent session. Your local edits were kept.");
        throw new PresentationRevisionConflictError();
      }

      throw saveError;
    } finally {
      if (activeSaveRef.current === activeSave) activeSaveRef.current = null;
    }
  }, []);

  const save = useCallback(async (
    source: string,
    title: string,
    templateId?: string,
    editorSource: string = source
  ) => {
    const currentPresentation = presentationRef.current;
    const normalizedTitle = title.trim() || currentPresentation?.title || title;
    const normalizedTemplateId = normalizePresentationEditorTemplateId(templateId);
    const editorSnapshot: PresentationEditorSnapshot = {
      editorTemplateId: normalizedTemplateId,
      source: editorSource,
      title: normalizedTitle
    };
    if (isDemoEntry && !session) {
      updateGuestDemoDraft(source, title, normalizedTemplateId);
      persistedEditorSnapshotRef.current = editorSnapshot;
      return;
    }
    if (!session || !presentationId) return;
    if (recoveryConflictRef.current) throw new PresentationRevisionConflictError();
    const coordinator = saveCoordinatorRef.current;
    if (
      coordinator.generation !== loadGenerationRef.current ||
      currentPresentation?.id !== presentationId
    ) return;

    await enqueueLatestPresentationSave(coordinator, {
      editorSnapshot,
      generation: coordinator.generation,
      persistedSnapshot: { editorTemplateId: normalizedTemplateId, source, title: normalizedTitle },
      presentationId
    }, persistPresentationSave);
  }, [isDemoEntry, persistPresentationSave, presentationId, session]);

  const trackLocalProject = useCallback((source: string, title: string, templateId?: string) => {
    const editorSnapshot: PresentationEditorSnapshot = {
      editorTemplateId: normalizePresentationEditorTemplateId(templateId),
      source,
      title: title.trim() || presentationRef.current?.title || title
    };
    editorSnapshotRef.current = editorSnapshot;

    if (!userId || !presentationId || presentationRef.current?.id !== presentationId) return;
    const persistedSnapshot = persistedEditorSnapshotRef.current;
    if (persistedSnapshot && presentationSnapshotEquals(editorSnapshot, persistedSnapshot)) {
      clearPresentationRecoveryDraft(presentationId);
      return;
    }
    const didStoreRecovery = writePresentationRecoveryDraft({
      baseSourceRevision: sourceRevisionRef.current,
      presentationId,
      snapshot: editorSnapshot
    });
    if (!didStoreRecovery) {
      setConflictWarning("This browser could not keep a local recovery copy. Wait for the save to finish before leaving.");
    }
  }, [presentationId, userId]);

  const openAgentSession = useCallback((
    targetPresentationId: string,
    targetSessionId: string
  ) => {
    const query = new URLSearchParams({
      presentation: targetPresentationId,
      agentSession: targetSessionId
    });
    router.push(`${appRoutes.pitch}?${query.toString()}`);
  }, [router]);

  const selectAgentSession = useCallback((targetSessionId?: string) => {
    if (!presentationId) {
      return;
    }
    const query = new URLSearchParams({ presentation: presentationId });
    if (targetSessionId) {
      query.set("agentSession", targetSessionId);
    }
    router.replace(`${appRoutes.pitch}?${query.toString()}`);
  }, [presentationId, router]);

  return {
    accessMode,
    agentSessionId,
    error,
    isReady,
    openAgentSession,
    presentation,
    save,
    selectAgentSession,
    syncWarning,
    trackLocalProject
  };
}

function presentationEditorSnapshot(
  presentation: Pick<WorkspacePresentation, "editorTemplateId" | "source" | "title">
): PresentationEditorSnapshot {
  return {
    editorTemplateId: normalizePresentationEditorTemplateId(presentation.editorTemplateId),
    source: presentation.source,
    title: presentation.title
  };
}
