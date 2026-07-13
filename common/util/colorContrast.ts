type RgbColor = { blue: number; green: number; red: number };

const DARK_TEXT = "#111827";
const LIGHT_TEXT = "#f8fafc";

/**
 * Returns a readable foreground for a solid background. Unsupported values
 * (gradients, CSS variables, transparent colors) intentionally fall back to
 * the slide theme so the presentation remains the source of truth.
 */
export function resolveContrastingTextColor(background: string | undefined, explicitColor?: string) {
  const explicit = explicitColor?.trim();
  if (explicit) return explicit;

  const rgb = parseSolidColor(background);
  if (!rgb) return undefined;

  const backgroundLuminance = relativeLuminance(rgb);
  const darkContrast = contrastRatio(backgroundLuminance, relativeLuminance(parseHex(DARK_TEXT)!));
  const lightContrast = contrastRatio(backgroundLuminance, relativeLuminance(parseHex(LIGHT_TEXT)!));

  return darkContrast >= lightContrast ? DARK_TEXT : LIGHT_TEXT;
}

function parseSolidColor(value: string | undefined): RgbColor | undefined {
  const color = value?.trim();
  if (!color || color === "transparent") return undefined;

  if (color.startsWith("#")) return parseHex(color);

  const rgbMatch = color.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d+(?:\.\d+)?%?))?\s*\)$/i);
  if (!rgbMatch) return undefined;

  const alpha = rgbMatch[4];
  if (alpha && alpha !== "1" && alpha !== "100%") return undefined;

  return {
    red: clampChannel(Number(rgbMatch[1])),
    green: clampChannel(Number(rgbMatch[2])),
    blue: clampChannel(Number(rgbMatch[3]))
  };
}

function parseHex(value: string): RgbColor | undefined {
  const hex = value.slice(1);
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return {
      red: parseInt(hex[0] + hex[0], 16),
      green: parseInt(hex[1] + hex[1], 16),
      blue: parseInt(hex[2] + hex[2], 16)
    };
  }

  if (!/^[0-9a-f]{6}$/i.test(hex)) return undefined;

  return {
    red: parseInt(hex.slice(0, 2), 16),
    green: parseInt(hex.slice(2, 4), 16),
    blue: parseInt(hex.slice(4, 6), 16)
  };
}

function clampChannel(value: number) {
  return Math.min(Math.max(value, 0), 255);
}

function relativeLuminance({ blue, green, red }: RgbColor) {
  const channels = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(first: number, second: number) {
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
