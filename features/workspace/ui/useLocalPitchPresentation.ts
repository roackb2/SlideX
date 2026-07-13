"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appRoutes } from "@/common/lib/appRoutes";
import { useLocalAuthSession } from "@/features/auth/ui/useLocalAuthSession";
import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";
import { getLocalPresentation, updateLocalPresentation } from "@/features/workspace/infrastructure/localPresentationRepository";

export function useLocalPitchPresentation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady: isAuthReady, session } = useLocalAuthSession();
  const [presentation, setPresentation] = useState<WorkspacePresentation | null>(null);
  const [isReady, setIsReady] = useState(false);
  const presentationId = searchParams.get("presentation");

  useEffect(() => {
    if (!isAuthReady) return;
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
  }, [isAuthReady, presentationId, router, session]);

  const save = useCallback((source: string, title: string) => {
    if (!session || !presentationId) return;
    updateLocalPresentation(session.user.id, presentationId, { source, title });
  }, [presentationId, session]);

  return { isReady, presentation, save };
}
