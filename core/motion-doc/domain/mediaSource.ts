const absoluteProtocolPattern = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const controlCharacterPattern = /[\u0000-\u001f\u007f]/;
const localHttpHosts = new Set(["127.0.0.1", "::1", "localhost"]);

export function sanitizeMotionDocMediaSource(value: string) {
  const source = value.trim();
  if (!source || controlCharacterPattern.test(source) || source.includes("\\")) return "";

  if (!absoluteProtocolPattern.test(source)) {
    if (source.startsWith("//") || source.split("/").includes("..")) return "";
    return source;
  }

  try {
    const url = new URL(source);
    if (url.protocol === "https:") return source;
    if (url.protocol === "http:" && localHttpHosts.has(url.hostname)) return source;
    if (url.protocol === "blob:" && /^blob:(?:https?:\/\/|null\/)/i.test(source)) return source;
  } catch {
    return "";
  }

  return "";
}
