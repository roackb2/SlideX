const simpleEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return simpleEmailPattern.test(normalizeEmail(value));
}

export function displayNameFromEmail(email: string) {
  const localPart = normalizeEmail(email).split("@")[0] ?? "Creator";
  const words = localPart.split(/[._-]+/).filter(Boolean);
  const name = words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
  return name || "Creator";
}

export function localUserIdFromEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  let hash = 2166136261;

  for (let index = 0; index < normalizedEmail.length; index += 1) {
    hash ^= normalizedEmail.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `local-${(hash >>> 0).toString(36)}`;
}
