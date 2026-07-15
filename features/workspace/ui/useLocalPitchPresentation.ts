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
import { getLocalPresentation, updateLocalPresentation } from "@/features/workspace/infrastructure/localPresentationRepository";
import {
  getSupabasePresentation,
  importGuestDemoPresentation,
  updateSupabasePresentation
} from "@/features/workspace/infrastructure/supabasePresentationRepository";

export type PitchAccessMode = "authenticated" | "guest";

export function useLocalPitchPresentation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady: isAuthReady, session } = useAuthSession();
  const [presentation, setPresentation] = useState<WorkspacePresentation | null>(null);
  const [persistence, setPersistence] = useState<"local" | "supabase" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const activeImportRef = useRef<string | null>(null);
  const sourceRevisionRef = useRef(0);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const presentationId = searchParams.get("presentation");
  const isDemoEntry = searchParams.get("demo") === "1";
  const accessMode: PitchAccessMode = isDemoEntry && !session ? "guest" : "authenticated";
  const agentSessionId = searchParams.get("agentSession") ?? undefined;

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

        setPresentation({
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
        });
        sourceRevisionRef.current = 0;
        setPersistence(null);
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

      const localPresentation = getLocalPresentation(session.user.id, presentationId);
      if (localPresentation) {
        sourceRevisionRef.current = localPresentation.sourceRevision;
        saveQueueRef.current = Promise.resolve();
        setPresentation(localPresentation);
        setPersistence("local");
        setIsReady(true);
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
        saveQueueRef.current = Promise.resolve();
        setPresentation(remotePresentation);
        setPersistence("supabase");
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

  const save = useCallback(async (source: string, title: string) => {
    if (isDemoEntry && !session) {
      updateGuestDemoDraft(source, title);
      return;
    }
    if (!session || !presentationId) return;
    if (persistence === "supabase") {
      const saveOperation = saveQueueRef.current.then(async () => {
        const result = await updateSupabasePresentation(
          createSupabaseBrowserClient(),
          presentationId,
          sourceRevisionRef.current,
          { source, title }
        );
        sourceRevisionRef.current = result.sourceRevision;
        setPresentation((currentPresentation) => currentPresentation?.id === presentationId
          ? {
              ...currentPresentation,
              source,
              sourceRevision: result.sourceRevision,
              title: title.trim() || currentPresentation.title,
              updatedAt: result.updatedAt
            }
          : currentPresentation);
      });
      saveQueueRef.current = saveOperation.catch(() => undefined);
      await saveOperation;
      return;
    }
    if (persistence === "local") {
      const updatedPresentation = updateLocalPresentation(
        session.user.id,
        presentationId,
        { source, title }
      );
      if (updatedPresentation) {
        sourceRevisionRef.current = updatedPresentation.sourceRevision;
        setPresentation(updatedPresentation);
      }
    }
  }, [isDemoEntry, persistence, presentationId, session]);

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
    selectAgentSession
  };
}
