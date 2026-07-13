"use client";

import { useEffect, useState } from "react";
import type { AuthSession } from "@/features/auth/domain/authSession";
import { readLocalAuthSession, subscribeToLocalAuthSession } from "@/features/auth/infrastructure/localAuthSession";

export function useLocalAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(readLocalAuthSession());
    setIsReady(true);
    return subscribeToLocalAuthSession(setSession);
  }, []);

  return { isReady, session, setSession };
}
