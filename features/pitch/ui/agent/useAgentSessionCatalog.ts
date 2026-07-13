"use client";

import { useMemo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { AgentSessionSummary } from "@/features/pitch/domain/agentRun";
import type { SlideXAgentClient } from "@/features/pitch/infrastructure/slidexAgentClient";

const AGENT_SESSION_CATALOG_QUERY_KEY = ["slidex", "agent-sessions"] as const;
const AGENT_SESSION_PAGE_SIZE = 20;

/**
 * Owns the server-backed, user-scoped conversation catalog cache. Runtime
 * selection and deck reconciliation stay in usePitchAgent.
 */
export function useAgentSessionCatalog(client: SlideXAgentClient) {
  const queryClient = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: AGENT_SESSION_CATALOG_QUERY_KEY,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => client.sessions({
      limit: AGENT_SESSION_PAGE_SIZE,
      ...(pageParam ? { cursor: pageParam } : {})
    }, signal),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 10_000,
    retry: 2
  });
  const sessions = useMemo<AgentSessionSummary[]>(
    () => query.data?.pages.flatMap(({ items }) => items) ?? [],
    [query.data]
  );

  return {
    sessions,
    error: query.error instanceof Error ? query.error.message : undefined,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    invalidate: () => queryClient.invalidateQueries({
      queryKey: AGENT_SESSION_CATALOG_QUERY_KEY
    }),
    loadMore: () => query.fetchNextPage(),
    retry: () => query.refetch()
  };
}
