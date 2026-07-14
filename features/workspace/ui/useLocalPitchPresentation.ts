"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appRoutes } from "@/common/lib/appRoutes";
import {
  liveDemoPresentationId,
  liveDemoPresentationSource,
  liveDemoPresentationTemplateId,
  liveDemoPresentationTitle
} from "@/core/motion-doc/presets/liveDemo";
import { useLocalAuthSession } from "@/features/auth/ui/useLocalAuthSession";
import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";
import {
  ensureGuestDemoDraft,
  promoteGuestDemoDraft,
  updateGuestDemoDraft
} from "@/features/workspace/infrastructure/guestDemoDraft";
import { getLocalPresentation, updateLocalPresentation } from "@/features/workspace/infrastructure/localPresentationRepository";

export type PitchAccessMode = "authenticated" | "guest";

export function useLocalPitchPresentation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady: isAuthReady, session } = useLocalAuthSession();
  const [presentation, setPresentation] = useState<WorkspacePresentation | null>(null);
  const [isReady, setIsReady] = useState(false);
  const presentationId = searchParams.get("presentation");
  const isDemoEntry = searchParams.get("demo") === "1";
  const accessMode: PitchAccessMode = isDemoEntry && !session ? "guest" : "authenticated";
  const agentSessionId = searchParams.get("agentSession") ?? undefined;

  useEffect(() => {
    if (!isAuthReady) return;
    if (isDemoEntry) {
      const guestDraft = ensureGuestDemoDraft({
        id: liveDemoPresentationId,
        source: liveDemoPresentationSource,
        templateId: liveDemoPresentationTemplateId,
        title: liveDemoPresentationTitle
      });

      if (session) {
        const promotedPresentation = promoteGuestDemoDraft(session.user.id, guestDraft);
        const intent = searchParams.get("intent") === "export" ? "&intent=export" : "";
        router.replace(`${appRoutes.pitch}?presentation=${encodeURIComponent(promotedPresentation.id)}${intent}`);
        return;
      }

      setPresentation({
        createdAt: guestDraft.createdAt,
        id: guestDraft.id,
        kind: "presentation",
        lastOpenedAt: guestDraft.updatedAt,
        ownerId: "guest",
        source: guestDraft.source,
        templateId: guestDraft.templateId,
        title: guestDraft.title,
        updatedAt: guestDraft.updatedAt
      });
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

    const storedPresentation = getLocalPresentation(session.user.id, presentationId);
    if (!storedPresentation) {
      router.replace(appRoutes.workspace);
      return;
    }

    setPresentation(storedPresentation);
    setIsReady(true);
  }, [isAuthReady, isDemoEntry, presentationId, router, searchParams, session]);

  const save = useCallback((source: string, title: string) => {
    if (isDemoEntry && !session) {
      updateGuestDemoDraft(source, title);
      return;
    }
    if (!session || !presentationId) return;
    updateLocalPresentation(session.user.id, presentationId, { source, title });
  }, [isDemoEntry, presentationId, session]);

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
    isReady,
    openAgentSession,
    presentation,
    save,
    selectAgentSession
  };
}
