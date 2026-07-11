export type HexColor = `#${string}`;

export function hexColorValue(value: string): HexColor | null {
  const trimmed = value.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed as HexColor;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }

  return null;
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function uniqueColors(colors: readonly string[]) {
  const seen = new Set<string>();

  return colors.filter((color) => {
    const normalized = color.trim();
    const key = normalized.toLowerCase();

    if (!normalized || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function normalizeSwatches(colors: readonly string[]) {
  return uniqueColors(colors.map((color) => hexColorValue(color) ?? color).filter((color) => color.trim())).slice(0, 32);
}
