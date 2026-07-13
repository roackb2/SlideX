"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AgentSessionSummary } from "@/features/pitch/domain/agentRun";
import { SlideXAgentClient } from "@/features/pitch/infrastructure/slidexAgentClient";
import { slideXAgentIdentity } from "@/features/pitch/infrastructure/slidexAgentIdentity";
import {
  usePitchAgent,
  type PitchAgentRuntime,
  type PitchAgentRuntimeInput
} from "@/features/pitch/ui/agent/usePitchAgent";
import { useAgentSessionCatalog } from "@/features/pitch/ui/agent/useAgentSessionCatalog";

type PitchAgentContextValue = {
  state: PitchAgentRuntime["state"] & {
    draft: string;
    llmApiKey: string;
    sessions: AgentSessionSummary[];
    sessionsError?: string;
  };
  actions: PitchAgentRuntime["actions"] & {
    setDraft: Dispatch<SetStateAction<string>>;
    setLlmApiKey: Dispatch<SetStateAction<string>>;
    loadMoreSessions: () => Promise<unknown>;
    retrySessions: () => Promise<unknown>;
    selectSession: (session: AgentSessionSummary) => Promise<void> | void;
  };
  meta: PitchAgentRuntime["meta"] & {
    hasMoreSessions: boolean;
    isFetchingMoreSessions: boolean;
    isLoadingSessions: boolean;
  };
};

const PitchAgentContext = createContext<PitchAgentContextValue | undefined>(
  undefined
);

/**
 * Keeps the active agent run, in-memory model credential, and draft alive
 * independently from whichever panel, sheet, or FAB surface renders them.
 */
export function PitchAgentProvider({
  children,
  ...runtimeInput
}: PitchAgentRuntimeInput & { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false }
    }
  }));
  const client = useMemo(() => new SlideXAgentClient({
    getHeaders: () => slideXAgentIdentity.authorizationHeaders()
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <PitchAgentRuntimeProvider client={client} runtimeInput={runtimeInput}>
        {children}
      </PitchAgentRuntimeProvider>
    </QueryClientProvider>
  );
}

function PitchAgentRuntimeProvider({
  children,
  client,
  runtimeInput
}: {
  children: ReactNode;
  client: SlideXAgentClient;
  runtimeInput: PitchAgentRuntimeInput;
}) {
  const catalog = useAgentSessionCatalog(client);
  const runtime = usePitchAgent(runtimeInput, client, catalog.invalidate);
  const [draft, setDraft] = useState("");
  const [llmApiKey, setLlmApiKey] = useState("");

  const selectSession = async (session: AgentSessionSummary) => {
    if (session.presentation.id === runtimeInput.presentationId) {
      const selected = await runtime.actions.selectConversation(session.id);
      if (selected) {
        runtimeInput.onSelectedSessionChange?.(session.id);
      }
      return;
    }
    runtimeInput.onOpenSession?.(session);
  };

  return (
    <PitchAgentContext.Provider
      value={{
        state: {
          ...runtime.state,
          draft,
          llmApiKey,
          sessions: catalog.sessions,
          sessionsError: catalog.error
        },
        actions: {
          ...runtime.actions,
          setDraft,
          setLlmApiKey,
          loadMoreSessions: catalog.loadMore,
          retrySessions: catalog.retry,
          selectSession
        },
        meta: {
          ...runtime.meta,
          hasMoreSessions: catalog.hasNextPage,
          isFetchingMoreSessions: catalog.isFetchingNextPage,
          isLoadingSessions: catalog.isLoading
        }
      }}
    >
      {children}
    </PitchAgentContext.Provider>
  );
}

export function usePitchAgentContext(): PitchAgentContextValue {
  const context = useContext(PitchAgentContext);
  if (!context) {
    throw new Error("usePitchAgentContext must be used within PitchAgentProvider");
  }
  return context;
}
