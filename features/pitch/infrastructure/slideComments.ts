import type { SlideComment, SlideComments } from "@/features/pitch/application/slideComments";

const storagePrefix = "slidex_slide_comments_v2";
const legacyStoragePrefixes = ["slidex_slide_notes_v1", "slidex_mobile_notes_v1"] as const;

export function slideCommentsDeckId(projectName: string) {
  return `${slugPart(projectName)}-${hashText(projectName.trim().toLowerCase())}`;
}

export function readSlideComments(deckId: string): SlideComments {
  if (typeof window === "undefined") return {};

  try {
    const currentValue = window.localStorage.getItem(storageKey(deckId));
    if (currentValue) return parseStoredComments(JSON.parse(currentValue) as unknown);

    for (const prefix of legacyStoragePrefixes) {
      const legacyValue = window.localStorage.getItem(`${prefix}:${deckId}`);
      if (legacyValue) return migrateLegacyNotes(JSON.parse(legacyValue) as unknown);
    }

    return {};
  } catch {
    return {};
  }
}

export function writeSlideComments(deckId: string, comments: SlideComments) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(deckId), JSON.stringify(comments));
}

function parseStoredComments(value: unknown): SlideComments {
  if (!isObjectRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([index, comments]) => {
      const numericIndex = Number(index);
      if (!Number.isInteger(numericIndex) || !Array.isArray(comments)) return [];
      const validComments = comments.flatMap((comment) => {
        const parsedComment = parseSlideComment(comment);
        return parsedComment ? [parsedComment] : [];
      });
      return validComments.length > 0 ? [[numericIndex, validComments]] : [];
    })
  );
}

function migrateLegacyNotes(value: unknown): SlideComments {
  if (!isObjectRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([index, note]) => {
      const numericIndex = Number(index);
      if (!Number.isInteger(numericIndex) || typeof note !== "string" || !note.trim()) return [];
      return [[numericIndex, [{
        authorId: "local-user",
        authorName: "You",
        body: note.trim(),
        createdAt: null,
        id: `legacy-${numericIndex}`,
        resolvedAt: null,
        status: "open",
        updatedAt: null,
        version: 1
      } satisfies SlideComment]]];
    })
  );
}

function parseSlideComment(value: unknown): SlideComment | null {
  if (!isObjectRecord(value)) return null;

  const isValid = typeof value.authorId === "string"
    && typeof value.authorName === "string"
    && typeof value.body === "string"
    && (typeof value.createdAt === "string" || value.createdAt === null)
    && typeof value.id === "string"
    && Number.isInteger(value.version)
    && Number(value.version) > 0;

  if (!isValid) return null;

  return {
    authorId: value.authorId as string,
    authorName: value.authorName as string,
    body: value.body as string,
    createdAt: value.createdAt as string | null,
    id: value.id as string,
    resolvedAt: typeof value.resolvedAt === "string" ? value.resolvedAt : null,
    status: value.status === "resolved" ? "resolved" : "open",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
    version: value.version as number
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function storageKey(deckId: string) {
  return `${storagePrefix}:${deckId}`;
}

function slugPart(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
}

function hashText(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}
