"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import {
  launchDeckPresentationId,
  launchDeckPresentationSource,
  launchDeckPresentationTitle
} from "@/core/motion-doc/presets/launchDeck";
import {
  welcomePresentationId,
  welcomePresentationSource,
  welcomePresentationTitle
} from "@/core/motion-doc/presets/welcomeToSlideX";
import type { WorkspacePresentation } from "@/features/workspace/domain/presentation";
import { migrateLocalPresentationsToSupabase } from "@/features/workspace/infrastructure/migrateLocalPresentations";
import {
  createSupabasePresentation,
  deleteSupabasePresentation,
  duplicateSupabasePresentation,
  ensureSupabaseWorkspaceStarterPresentations,
  listSupabasePresentations,
  parseSupabasePresentationRealtimeChange,
  renameSupabasePresentation
} from "@/features/workspace/infrastructure/supabasePresentationRepository";

export function useSupabaseWorkspacePresentations(userId?: string, searchQuery = "") {
  const [presentations, setPresentations] = useState<WorkspacePresentation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const initializedUserRef = useRef<string | null>(null);
  const isLoadingMoreRef = useRef(false);
  const loadGenerationRef = useRef(0);

  const reload = useCallback(async () => {
    if (!userId) {
      setPresentations([]);
      setTotalCount(0);
      initializedUserRef.current = null;
      setIsLoading(false);
      return;
    }

    const generation = ++loadGenerationRef.current;
    isLoadingMoreRef.current = false;
    setError(null);
    setIsLoading(true);
    setIsLoadingMore(false);
    try {
      const client = createSupabaseBrowserClient();
      if (initializedUserRef.current !== userId) {
        await migrateLocalPresentationsToSupabase(client, userId);
        await ensureSupabaseWorkspaceStarterPresentations(client, [
          {
            source: welcomePresentationSource,
            templateId: welcomePresentationId,
            title: welcomePresentationTitle
          },
          {
            source: launchDeckPresentationSource,
            templateId: launchDeckPresentationId,
            title: launchDeckPresentationTitle
          }
        ]);
        initializedUserRef.current = userId;
      }
      const page = await listSupabasePresentations(client, { searchQuery });
      if (loadGenerationRef.current === generation) {
        setPresentations(page.items);
        setTotalCount(page.totalCount);
      }
    } catch {
      if (loadGenerationRef.current === generation) {
        setError("Your presentations could not be loaded from Supabase.");
      }
    } finally {
      if (loadGenerationRef.current === generation) {
        setIsLoading(false);
      }
    }
  }, [searchQuery, userId]);

  useEffect(() => {
    void reload();
    return () => {
      loadGenerationRef.current += 1;
    };
  }, [reload]);

  useEffect(() => {
    if (!userId) return;

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
          if (!parseSupabasePresentationRealtimeChange(message, userId)) return;
          void reload();
        })
        .subscribe((status) => {
          if (!isCancelled && (status === "CHANNEL_ERROR" || status === "TIMED_OUT")) {
            setError("Presentations could not connect to Supabase Realtime.");
          }
        });
    }).catch(() => {
      if (!isCancelled) setError("Presentations could not connect to Supabase Realtime.");
    });

    return () => {
      isCancelled = true;
      if (channel) void client.removeChannel(channel);
    };
  }, [reload, userId]);

  const loadMore = useCallback(async () => {
    if (!userId || isLoadingMoreRef.current || presentations.length >= totalCount) return;

    const generation = loadGenerationRef.current;
    isLoadingMoreRef.current = true;
    setError(null);
    setIsLoadingMore(true);
    try {
      const page = await listSupabasePresentations(createSupabaseBrowserClient(), {
        offset: presentations.length,
        searchQuery
      });
      if (loadGenerationRef.current === generation) {
        setPresentations((current) => {
          const existingIds = new Set(current.map((presentation) => presentation.id));
          return [...current, ...page.items.filter((presentation) => !existingIds.has(presentation.id))];
        });
        setTotalCount(page.totalCount);
      }
    } catch {
      if (loadGenerationRef.current === generation) {
        setError("More presentations could not be loaded from Supabase.");
      }
    } finally {
      isLoadingMoreRef.current = false;
      if (loadGenerationRef.current === generation) setIsLoadingMore(false);
    }
  }, [presentations.length, searchQuery, totalCount, userId]);

  const createPresentation = useCallback(async (input: {
    source: string;
    templateId?: string;
    title: string;
  }) => {
    setError(null);
    try {
      const presentation = await createSupabasePresentation(createSupabaseBrowserClient(), input);
      setPresentations((current) => [presentation, ...current]);
      setTotalCount((current) => current + 1);
      return presentation;
    } catch {
      setError("The presentation could not be created in Supabase.");
      return null;
    }
  }, []);

  const duplicatePresentation = useCallback(async (presentation: WorkspacePresentation, title: string) => {
    setError(null);
    try {
      const duplicate = await duplicateSupabasePresentation(
        createSupabaseBrowserClient(),
        presentation,
        title
      );
      setPresentations((current) => [duplicate, ...current]);
      setTotalCount((current) => current + 1);
      return duplicate;
    } catch {
      setError("The presentation could not be duplicated in Supabase.");
      return null;
    }
  }, []);

  const renamePresentation = useCallback(async (presentationId: string, title: string) => {
    const presentation = presentations.find((item) => item.id === presentationId);
    if (!presentation || !title.trim()) return;

    setError(null);
    try {
      const renamed = await renameSupabasePresentation(
        createSupabaseBrowserClient(),
        presentation,
        title
      );
      if (searchQuery.trim()) {
        await reload();
      } else {
        setPresentations((current) => current.map((item) => item.id === renamed.id ? renamed : item));
      }
    } catch {
      setError("The presentation could not be renamed. Reload if another editor changed it.");
    }
  }, [presentations, reload, searchQuery]);

  const removePresentation = useCallback(async (presentationId: string) => {
    setError(null);
    setPresentations((current) => current.filter((item) => item.id !== presentationId));
    setTotalCount((current) => Math.max(0, current - 1));

    try {
      await deleteSupabasePresentation(createSupabaseBrowserClient(), presentationId);
      return true;
    } catch {
      await reload();
      setError("The presentation and its images could not be deleted from Supabase.");
      return false;
    }
  }, [reload]);

  return {
    createPresentation,
    duplicatePresentation,
    error,
    hasMore: presentations.length < totalCount,
    isLoading,
    isLoadingMore,
    loadMore,
    presentations,
    reload,
    removePresentation,
    renamePresentation,
    totalCount
  };
}
