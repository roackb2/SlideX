export function resolveSafeAuthNextPath(candidate: string | null, fallback: string) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) return fallback;
  if (candidate.includes("\\") || /[\r\n]/.test(candidate)) return fallback;
  return candidate;
}
