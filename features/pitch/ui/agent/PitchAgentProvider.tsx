"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from "react";
import {
  usePitchAgent,
  type PitchAgentRuntime,
  type PitchAgentRuntimeInput
} from "@/features/pitch/ui/agent/usePitchAgent";

type PitchAgentContextValue = {
  state: PitchAgentRuntime["state"] & {
    draft: string;
    llmApiKey: string;
  };
  actions: PitchAgentRuntime["actions"] & {
    setDraft: Dispatch<SetStateAction<string>>;
    setLlmApiKey: Dispatch<SetStateAction<string>>;
  };
  meta: PitchAgentRuntime["meta"];
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
  const runtime = usePitchAgent(runtimeInput);
  const [draft, setDraft] = useState("");
  const [llmApiKey, setLlmApiKey] = useState("");

  return (
    <PitchAgentContext.Provider
      value={{
        state: {
          ...runtime.state,
          draft,
          llmApiKey
        },
        actions: {
          ...runtime.actions,
          setDraft,
          setLlmApiKey
        },
        meta: runtime.meta
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
