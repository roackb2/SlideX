export type ExportSlideSelection = {
  indices: number[];
  label: string;
};

const ALL_SLIDES_VALUES = new Set(["", "*", "all"]);

export function parseExportSlideSelection(value: string, slideCount: number): ExportSlideSelection {
  const normalizedValue = value.trim().toLowerCase();

  if (slideCount < 1) {
    throw new Error("No slides to export");
  }

  if (ALL_SLIDES_VALUES.has(normalizedValue)) {
    return {
      indices: Array.from({ length: slideCount }, (_, index) => index),
      label: "all slides"
    };
  }

  const seen = new Set<number>();
  const indices: number[] = [];
  const parts = normalizedValue.split(",").map((part) => part.trim()).filter(Boolean);

  if (parts.length === 0) {
    throw new Error("Enter all or a slide range like 1-3");
  }

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);

    if (rangeMatch) {
      const start = parseSlideNumber(rangeMatch[1], slideCount);
      const end = parseSlideNumber(rangeMatch[2], slideCount);

      if (start > end) {
        throw new Error("Slide ranges must go from low to high, like 1-3");
      }

      for (let slideNumber = start; slideNumber <= end; slideNumber += 1) {
        pushSlideIndex(indices, seen, slideNumber - 1);
      }
      continue;
    }

    if (/^\d+$/.test(part)) {
      pushSlideIndex(indices, seen, parseSlideNumber(part, slideCount) - 1);
      continue;
    }

    throw new Error("Enter all or a slide range like 1-3,5");
  }

  if (indices.length === 0) {
    throw new Error("No slides selected for PNG export");
  }

  return {
    indices,
    label: formatSelectionLabel(indices)
  };
}

function parseSlideNumber(value: string, slideCount: number) {
  const slideNumber = Number.parseInt(value, 10);

  if (!Number.isInteger(slideNumber) || slideNumber < 1 || slideNumber > slideCount) {
    throw new Error(`Slide range must be between 1 and ${slideCount}`);
  }

  return slideNumber;
}

function pushSlideIndex(indices: number[], seen: Set<number>, index: number) {
  if (seen.has(index)) return;
  seen.add(index);
  indices.push(index);
}

function formatSelectionLabel(indices: number[]) {
  if (indices.length === 1) {
    return `slide ${indices[0] + 1}`;
  }

  return `${indices.length} slides`;
}
