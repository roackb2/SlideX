export type SupabasePublicEnvironment = {
  publishableKey: string;
  url: string;
};

function jwtRole(key: string) {
  const payload = key.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const value: unknown = JSON.parse(globalThis.atob(padded));
    if (!value || typeof value !== "object" || !("role" in value)) return null;
    return typeof value.role === "string" ? value.role : null;
  } catch {
    return null;
  }
}

function assertBrowserSafeKey(key: string) {
  if (key.startsWith("sb_secret_") || jwtRole(key) === "service_role") {
    throw new Error(
      "A Supabase secret/service-role key cannot be used by browser code. Configure the anon/publishable key instead."
    );
  }
}

export function readSupabasePublicEnvironment(): SupabasePublicEnvironment {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Add both values to .env.local."
    );
  }

  assertBrowserSafeKey(publishableKey);
  return { publishableKey, url };
}
