export function createUntitledPresentationName(existingTitles: string[], label = "Untitled presentation") {
  const normalizedTitles = new Set(existingTitles.map((title) => title.trim().toLowerCase()));

  if (!normalizedTitles.has(label.toLowerCase())) {
    return label;
  }

  let suffix = 2;
  while (normalizedTitles.has(`${label} ${suffix}`.toLowerCase())) {
    suffix += 1;
  }

  return `${label} ${suffix}`;
}
