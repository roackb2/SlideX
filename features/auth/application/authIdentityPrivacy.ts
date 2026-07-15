import type { AuthUser } from "@/features/auth/domain/authSession";

const maskedDisplayName = "••••••";
const maskedEmail = "••••••@••••••";

export function getProtectedAuthIdentity() {
  return {
    displayName: maskedDisplayName,
    email: maskedEmail
  };
}

export function partiallyMaskEmail(email: string) {
  const normalizedEmail = email.trim();
  const separatorIndex = normalizedEmail.lastIndexOf("@");
  if (separatorIndex <= 0 || separatorIndex === normalizedEmail.length - 1) return maskedEmail;

  const localPart = normalizedEmail.slice(0, separatorIndex);
  const domain = normalizedEmail.slice(separatorIndex + 1);
  return `${localPart.slice(0, 2)}***@${domain}`;
}

export function getSidebarAuthIdentity(user: Pick<AuthUser, "displayName" | "email">, privacyModeEnabled: boolean) {
  if (privacyModeEnabled) return getProtectedAuthIdentity();
  return { displayName: user.displayName, email: partiallyMaskEmail(user.email) };
}

export function getSettingsAuthIdentity(user: Pick<AuthUser, "displayName" | "email">, privacyModeEnabled: boolean) {
  if (privacyModeEnabled) return getProtectedAuthIdentity();
  return { displayName: user.displayName, email: user.email };
}
