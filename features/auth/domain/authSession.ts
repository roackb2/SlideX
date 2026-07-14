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
