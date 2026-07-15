"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import type { AuthProvider, AuthSession } from "@/features/auth/domain/authSession";

function providerFromUser(user: User): AuthProvider {
  return user.app_metadata.provider === "github" ? "github" : "google";
}

function displayNameFromUser(user: User) {
  const metadataName = user.user_metadata.full_name ?? user.user_metadata.name;
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  return user.email?.split("@")[0] || "SlideX user";
}

function avatarUrlFromUser(user: User) {
  const metadataAvatar = user.user_metadata.avatar_url ?? user.user_metadata.picture;
  return typeof metadataAvatar === "string" && metadataAvatar.trim()
    ? metadataAvatar.trim()
    : undefined;
}

function toAuthSession(session: Session | null): AuthSession | null {
  if (!session) return null;

  return {
    createdAt: session.user.created_at,
    provider: providerFromUser(session.user),
    user: {
      avatarUrl: avatarUrlFromUser(session.user),
      displayName: displayNameFromUser(session.user),
      email: session.user.email ?? "",
      id: session.user.id
    }
  };
}

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    function syncSession(nextSession: Session | null) {
      const mappedSession = toAuthSession(nextSession);
      setSession((currentSession) => {
        if (JSON.stringify(currentSession) === JSON.stringify(mappedSession)) return currentSession;
        return mappedSession;
      });
      setIsReady(true);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      syncSession(nextSession);
    });

    void supabase.auth.getSession().then(({ data }) => {
      syncSession(data.session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await createSupabaseBrowserClient().auth.signOut();
    if (error) throw error;
  }, []);

  return { isReady, session, signOut };
}
