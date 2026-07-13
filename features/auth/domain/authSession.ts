export type AuthProvider = "github" | "google";

export type AuthUser = {
  displayName: string;
  email: string;
  id: string;
};

export type AuthSession = {
  createdAt: string;
  provider: AuthProvider;
  user: AuthUser;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseAuthSession(value: unknown): AuthSession | null {
  if (!isRecord(value) || typeof value.createdAt !== "string" || !isRecord(value.user)) {
    return null;
  }

  const { user } = value;
  if (
    typeof user.id !== "string" ||
    typeof user.email !== "string" ||
    typeof user.displayName !== "string"
  ) {
    return null;
  }

  return {
    createdAt: value.createdAt,
    provider: value.provider === "github" ? "github" : "google",
    user: {
      displayName: user.displayName,
      email: user.email,
      id: user.id
    }
  };
}
