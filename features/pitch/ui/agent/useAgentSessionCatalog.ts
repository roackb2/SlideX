"use client";

import { useMemo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import type { AgentSessionSummary } from "@/features/pitch/domain/agentRun";
import type { SlideXAgentClient } from "@/features/pitch/infrastructure/slidexAgentClient";
import { loadReconciledAgentSessionPage } from "@/features/pitch/infrastructure/slidexAgentSessionCatalog";

const AGENT_SESSION_CATALOG_QUERY_KEY = ["slidex", "agent-sessions"] as const;
const AGENT_SESSION_PAGE_SIZE = 20;

/**
 * Owns the server-backed, user-scoped conversation catalog cache. Runtime
 * selection and deck reconciliation stay in usePitchAgent.
 */
export function useAgentSessionCatalog(
  client: SlideXAgentClient,
  synchronizeMetadata: boolean
) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => [...AGENT_SESSION_CATALOG_QUERY_KEY, synchronizeMetadata] as const,
    [synchronizeMetadata]
  );
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => loadReconciledAgentSessionPage(
      client,
      synchronizeMetadata ? createSupabaseBrowserClient() : undefined,
      {
        limit: AGENT_SESSION_PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {})
      },
      signal
    ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 10_000,
    retry: 2
  });
  const sessions = useMemo<AgentSessionSummary[]>(
    () => query.data?.pages.flatMap(({ items }) => items) ?? [],
    [query.data]
  );
  const warning = useMemo(
    () => [...new Set(
      query.data?.pages.flatMap(({ projectionWarning }) =>
        projectionWarning ? [projectionWarning] : []
      ) ?? []
    )].join(" ") || undefined,
    [query.data]
  );

  return {
    sessions,
    error: query.error instanceof Error ? query.error.message : undefined,
    warning,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    invalidate: () => queryClient.invalidateQueries({
      queryKey
    }),
    loadMore: () => query.fetchNextPage(),
    retry: () => query.refetch()
  };
}
