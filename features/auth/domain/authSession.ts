export type AuthProvider = "github" | "google";

export type AuthUser = {
  avatarUrl?: string;
  displayName: string;
  email: string;
  id: string;
};

export type AuthSession = {
  createdAt: string;
  provider: AuthProvider;
  user: AuthUser;
};
