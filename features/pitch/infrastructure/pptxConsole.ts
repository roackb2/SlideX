type PptxConsoleMethod = "debug" | "error" | "info" | "log" | "warn";
type PptxConsoleFunction = (...args: unknown[]) => void;

const CONSOLE_METHODS: readonly PptxConsoleMethod[] = ["debug", "error", "info", "log", "warn"];
const PPTX_IMAGE_PROCESSING_FAILED = "[PPTX] Image processing failed";
const PPTX_SOURCE_OMITTED = "[PPTX source omitted]";
const PPTX_IMAGE_DETAIL_OMITTED = "[PPTX image detail omitted]";
const SENSITIVE_SOURCE_PATTERN = /(?:data:[^\s"'<>]+|blob:[^\s"'<>]+|https?:\/\/[^\s"'<>]+)/gi;
const IMAGE_DETAIL_PATTERN = /\b(?:base64|mime(?:type)?|length|bytes?)\s*[=:]\s*[^\s,;]+/gi;

type PptxConsoleGuardState = {
  depth: number;
  originals: Record<PptxConsoleMethod, PptxConsoleFunction>;
  wrappers: Record<PptxConsoleMethod, PptxConsoleFunction>;
};

let activeGuard: PptxConsoleGuardState | null = null;

/**
 * PPTX libraries may log the image argument they are about to embed. During
 * export, discard all ordinary console arguments so media data and URLs can
 * never be emitted by those logs.
 */
export function redactPptxConsoleArguments(
  _args: readonly unknown[],
  method: PptxConsoleMethod
) {
  return method === "error" ? [PPTX_IMAGE_PROCESSING_FAILED] : [];
}

export async function withPptxConsoleRedaction<T>(operation: () => Promise<T>) {
  const release = acquireConsoleGuard();

  try {
    return await operation();
  } finally {
    release();
  }
}

export function sanitizePptxExportError(error: unknown) {
  if (!(error instanceof Error)) return new Error("PowerPoint export failed");

  const message = sanitizePptxErrorText(error.message);
  const sanitized = new Error(message || "PowerPoint export failed");
  sanitized.name = error.name;
  return sanitized;
}

function acquireConsoleGuard() {
  if (activeGuard) {
    activeGuard.depth += 1;
    return releaseConsoleGuard;
  }

  const target = console as unknown as Record<PptxConsoleMethod, PptxConsoleFunction>;
  const originals = {} as Record<PptxConsoleMethod, PptxConsoleFunction>;
  const wrappers = {} as Record<PptxConsoleMethod, PptxConsoleFunction>;

  for (const method of CONSOLE_METHODS) {
    const original = target[method];
    originals[method] = original;
    wrappers[method] = (...args: unknown[]) => {
      const safeArgs = redactPptxConsoleArguments(args, method);
      if (safeArgs.length > 0) original.apply(console, safeArgs);
    };
  }

  for (const method of CONSOLE_METHODS) {
    target[method] = wrappers[method];
  }

  activeGuard = { depth: 1, originals, wrappers };
  return releaseConsoleGuard;
}

function releaseConsoleGuard() {
  if (!activeGuard) return;
  activeGuard.depth -= 1;
  if (activeGuard.depth > 0) return;

  const state = activeGuard;
  const target = console as unknown as Record<PptxConsoleMethod, PptxConsoleFunction>;
  activeGuard = null;

  for (const method of CONSOLE_METHODS) {
    if (target[method] === state.wrappers[method]) {
      target[method] = state.originals[method];
    }
  }
}

function sanitizePptxErrorText(message: string) {
  return message
    .replace(SENSITIVE_SOURCE_PATTERN, PPTX_SOURCE_OMITTED)
    .replace(IMAGE_DETAIL_PATTERN, PPTX_IMAGE_DETAIL_OMITTED);
}
