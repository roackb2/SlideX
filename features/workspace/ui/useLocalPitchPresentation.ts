"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appRoutes } from "@/common/lib/appRoutes";
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import {
  liveDemoPresentationId,
  liveDemoPresentationSource,
  liveDemoPresentationTemplateId,
  liveDemoPresentationTitle
} from "@/core/motion-doc/presets/liveDemo";
import { useAuthSession } from "@/features/auth/ui/useAuthSession";
import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";
import {
  clearGuestDemoDraft,
  ensureGuestDemoDraft,
  updateGuestDemoDraft
} from "@/features/workspace/infrastructure/guestDemoDraft";
import {
  getSupabasePresentation,
  importGuestDemoPresentation,
  parseSupabasePresentationRealtimeChange,
  updateSupabasePresentation,
  updateSupabasePresentationTemplate
} from "@/features/workspace/infrastructure/supabasePresentationRepository";

export type PitchAccessMode = "authenticated" | "guest";

export function useLocalPitchPresentation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady: isAuthReady, session } = useAuthSession();
  const [presentation, setPresentation] = useState<WorkspacePresentation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const activeImportRef = useRef<string | null>(null);
  const sourceRevisionRef = useRef(0);
  const templateIdRef = useRef<string | undefined>(undefined);
  const presentationRef = useRef<WorkspacePresentation | null>(null);
  const localSourceRef = useRef<string | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const presentationId = searchParams.get("presentation");
  const isDemoEntry = searchParams.get("demo") === "1";
  const accessMode: PitchAccessMode = isDemoEntry && !session ? "guest" : "authenticated";

  useEffect(() => {
    if (!isAuthReady) return;
    let isCancelled = false;

    void (async () => {
      setError(null);

      if (isDemoEntry) {
        const guestDraft = ensureGuestDemoDraft({
          id: liveDemoPresentationId,
          source: liveDemoPresentationSource,
          templateId: liveDemoPresentationTemplateId,
          title: liveDemoPresentationTitle
        });

        if (session) {
          const importKey = `${session.user.id}:${guestDraft.importId}`;
          if (activeImportRef.current === importKey) return;
          activeImportRef.current = importKey;

          try {
            const importedPresentation = await importGuestDemoPresentation({
              importId: guestDraft.importId,
              source: guestDraft.source,
              templateId: guestDraft.templateId,
              title: guestDraft.title
            });
            if (isCancelled) return;
            clearGuestDemoDraft(guestDraft.importId);
            const intent = searchParams.get("intent") === "export" ? "&intent=export" : "";
            router.replace(`${appRoutes.pitch}?presentation=${encodeURIComponent(importedPresentation.id)}${intent}`);
          } catch {
            if (!isCancelled) {
              activeImportRef.current = null;
              setError("Your demo is still stored in this browser, but it could not be added to SQL. Please retry after checking Supabase.");
              setIsReady(true);
            }
          }
          return;
        }

        const guestPresentation: WorkspacePresentation = {
          createdAt: guestDraft.createdAt,
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
        presentationRef.current = guestPresentation;
        localSourceRef.current = guestPresentation.source;
        setPresentation(guestPresentation);
        sourceRevisionRef.current = 0;
        templateIdRef.current = guestDraft.templateId;
        setIsReady(true);
        return;
      }

      if (!session) {
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
        if (isCancelled) return;
        if (!remotePresentation) {
          router.replace(appRoutes.workspace);
          return;
        }
        sourceRevisionRef.current = remotePresentation.sourceRevision;
        templateIdRef.current = remotePresentation.templateId;
        presentationRef.current = remotePresentation;
        localSourceRef.current = remotePresentation.source;
        saveQueueRef.current = Promise.resolve();
        setPresentation(remotePresentation);
        setIsReady(true);
      } catch {
        if (!isCancelled) {
          setError("This presentation could not be loaded from Supabase.");
          setIsReady(true);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthReady, isDemoEntry, presentationId, router, searchParams, session]);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId || !presentationId || isDemoEntry) return;

    const client = createSupabaseBrowserClient();
    let channel: ReturnType<typeof client.channel> | null = null;
    let isCancelled = false;

    void client.realtime.setAuth().then(() => {
      if (isCancelled) return;
      channel = client
        .channel(`workspace-presentations:${userId}`, {
          config: { private: true }
        })
        .on("broadcast", { event: "*" }, (message) => {
          const change = parseSupabasePresentationRealtimeChange(message, userId);
          if (!change || change.presentation.id !== presentationId) return;

          if (change.event === "DELETE") {
            presentationRef.current = null;
            setPresentation(null);
            router.replace(appRoutes.workspace);
            return;
          }

          if (change.event !== "UPDATE") return;
          const remotePresentation = change.presentation;

          // updated_at also changes for metadata-only writes such as
          // last_opened_at. Only a newer source revision may replace the
          // editor document, otherwise an upload that is still being saved
          // can be reverted to the previous image-less source.
          if (remotePresentation.sourceRevision <= sourceRevisionRef.current) return;
          const persistedSource = presentationRef.current?.source;
          const localSource = localSourceRef.current;
          const hasLocalSourceChanges = persistedSource !== undefined &&
            localSource !== null &&
            localSource !== persistedSource;
          if (hasLocalSourceChanges && remotePresentation.source !== localSource) return;

          sourceRevisionRef.current = remotePresentation.sourceRevision;
          templateIdRef.current = remotePresentation.templateId;
          presentationRef.current = remotePresentation;
          localSourceRef.current = remotePresentation.source;
          setPresentation(remotePresentation);
        })
        .subscribe((status) => {
          if (!isCancelled && (status === "CHANNEL_ERROR" || status === "TIMED_OUT")) {
            setError("The presentation could not connect to Supabase Realtime.");
          }
        });
    }).catch(() => {
      if (!isCancelled) setError("The presentation could not connect to Supabase Realtime.");
    });

    return () => {
      isCancelled = true;
      if (channel) void client.removeChannel(channel);
    };
  }, [isDemoEntry, presentationId, router, session?.user.id]);

  const save = useCallback(async (source: string, title: string, templateId?: string) => {
    if (isDemoEntry && !session) {
      updateGuestDemoDraft(source, title, templateId);
      return;
    }
    if (!session || !presentationId) return;
    const currentPresentation = presentationRef.current;
    const normalizedTitle = title.trim() || currentPresentation?.title || title;
    if (
      currentPresentation?.source === source &&
      currentPresentation.title === normalizedTitle &&
      currentPresentation.templateId === templateId
    ) {
      return;
    }
    const saveOperation = saveQueueRef.current.then(async () => {
      const persistedPresentation = presentationRef.current;
      if (!persistedPresentation || persistedPresentation.id !== presentationId) return;

      let sourceRevision = persistedPresentation.sourceRevision;
      let updatedAt = persistedPresentation.updatedAt;
      if (persistedPresentation.source !== source || persistedPresentation.title !== normalizedTitle) {
        const result = await updateSupabasePresentation(
          createSupabaseBrowserClient(),
          presentationId,
          sourceRevisionRef.current,
          { source, title }
        );
        sourceRevision = result.sourceRevision;
        updatedAt = result.updatedAt;
        sourceRevisionRef.current = result.sourceRevision;
      }
      const savedTemplateId = templateId === templateIdRef.current
        ? templateId
        : await updateSupabasePresentationTemplate(
            createSupabaseBrowserClient(),
            presentationId,
            templateId
          );
      templateIdRef.current = savedTemplateId;
      const savedPresentation = {
        ...persistedPresentation,
        source,
        sourceRevision,
        templateId: savedTemplateId,
        title: normalizedTitle,
        updatedAt
      };
      presentationRef.current = savedPresentation;
      localSourceRef.current = source;
      setPresentation(savedPresentation);
    });
    saveQueueRef.current = saveOperation.catch(() => undefined);
    await saveOperation;
  }, [isDemoEntry, presentationId, session]);

  const trackLocalSource = useCallback((source: string) => {
    localSourceRef.current = source;
  }, []);

  return {
    accessMode,
    error,
    isReady,
    presentation,
    save,
    trackLocalSource
  };
}
