import { displayNameFromEmail, localUserIdFromEmail, normalizeEmail } from "@/features/auth/application/authCredentials";
import { parseAuthSession, type AuthProvider, type AuthSession } from "@/features/auth/domain/authSession";

const authSessionStorageKey = "slidex_local_auth_session_v1";
const authSessionChangeEvent = "slidex:local-auth-session-change";

function notifyAuthSessionChange() {
  window.dispatchEvent(new Event(authSessionChangeEvent));
}

export function readLocalAuthSession(): AuthSession | null {
  try {
    const storedValue = window.localStorage.getItem(authSessionStorageKey);
    return storedValue ? parseAuthSession(JSON.parse(storedValue)) : null;
  } catch {
    return null;
  }
}

const fakeProviderProfiles = {
  github: {
    displayName: "Morgan Lee",
    email: "morgan@users.noreply.github.com"
  },
  google: {
    displayName: "Alex Morgan",
    email: "alex.morgan@gmail.com"
  }
} satisfies Record<AuthProvider, { displayName: string; email: string }>;

export function createFakeOAuthSession(provider: AuthProvider): AuthSession {
  const profile = fakeProviderProfiles[provider];
  const normalizedEmail = normalizeEmail(profile.email);
  const session = {
    createdAt: new Date().toISOString(),
    provider,
    user: {
      displayName: profile.displayName || displayNameFromEmail(normalizedEmail),
      email: normalizedEmail,
      id: localUserIdFromEmail(`${provider}:${normalizedEmail}`)
    }
  } satisfies AuthSession;

  window.localStorage.setItem(authSessionStorageKey, JSON.stringify(session));
  notifyAuthSessionChange();
  return session;
}

export function clearLocalAuthSession() {
  window.localStorage.removeItem(authSessionStorageKey);
  notifyAuthSessionChange();
}

export function subscribeToLocalAuthSession(listener: (session: AuthSession | null) => void) {
  function syncSession() {
    listener(readLocalAuthSession());
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === null || event.key === authSessionStorageKey) {
      syncSession();
    }
  }

  window.addEventListener(authSessionChangeEvent, syncSession);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(authSessionChangeEvent, syncSession);
    window.removeEventListener("storage", handleStorage);
  };
}
