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
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import type {
  AgentSessionSummary,
  ModelCredential
} from "@/features/pitch/domain/agentRun";
import { SlideXAgentClient } from "@/features/pitch/infrastructure/slidexAgentClient";
import { SlideXAgentIdentityService } from "@/features/pitch/infrastructure/slidexAgentIdentity";
import {
  usePitchAgent,
  type PitchAgentRuntime,
  type PitchAgentRuntimeInput
} from "@/features/pitch/ui/agent/usePitchAgent";
import { useAgentSessionCatalog } from "@/features/pitch/ui/agent/useAgentSessionCatalog";
import {
  useOpenAiModelCredential,
  type OpenAiDeviceAuthState
} from "@/features/pitch/ui/agent/useOpenAiModelCredential";

type PitchAgentContextValue = {
  state: PitchAgentRuntime["state"] & {
    draft: string;
    modelCredential?: ModelCredential;
    deviceAuth: OpenAiDeviceAuthState;
    sessions: AgentSessionSummary[];
    sessionsError?: string;
  };
  actions: PitchAgentRuntime["actions"] & {
    setDraft: Dispatch<SetStateAction<string>>;
    setApiKey: (apiKey: string) => void;
    connectCodex: () => Promise<void>;
    cancelCodexConnection: () => void;
    clearModelCredential: () => void;
    loadMoreSessions: () => Promise<unknown>;
    retrySessions: () => Promise<unknown>;
    selectSession: (session: AgentSessionSummary) => Promise<boolean>;
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
  const identity = useMemo(() => new SlideXAgentIdentityService({
    createClient: createSupabaseBrowserClient
  }), []);
  const client = useMemo(() => new SlideXAgentClient({
    getHeaders: () => identity.authorizationHeaders()
  }), [identity]);

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
  const credential = useOpenAiModelCredential(client);
  const [draft, setDraft] = useState("");

  const selectSession = async (session: AgentSessionSummary) => {
    if (session.presentation.id === runtimeInput.presentationId) {
      const selected = await runtime.actions.selectConversation(session.id);
      if (selected) {
        runtimeInput.onSelectedSessionChange?.(session.id);
      }
      return selected;
    }
    if (!runtimeInput.onOpenSession) {
      return false;
    }
    runtimeInput.onOpenSession(session);
    return true;
  };

  return (
    <PitchAgentContext.Provider
      value={{
        state: {
          ...runtime.state,
          draft,
          ...credential.state,
          sessions: catalog.sessions,
          sessionsError: catalog.error
        },
        actions: {
          ...runtime.actions,
          setDraft,
          ...credential.actions,
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
