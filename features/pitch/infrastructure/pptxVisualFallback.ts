const EDITABLE_CONTENT_SELECTORS = [
  ".block-title",
  ".block-text",
  ".block-table",
  ".block-icon",
  ".block-image",
  ".block-shape"
] as const;

const NATIVE_CHART_TYPES = new Set([
  "area", "bar", "bubble", "column", "donut", "line", "pie", "radar", "scatter", "sparkline", "step"
]);

/**
 * PPTX keeps these blocks as native objects. Excluding them from the visual
 * fallback prevents a second, flattened copy from remaining under editable
 * text, images, icons, shapes, or tables when a slide uses a shader or rich background.
 * Visibility preserves flow layout for any non-positioned fallback blocks.
 */
export function hidePptxEditableContent(slide: HTMLElement) {
  slide.querySelectorAll<HTMLElement>(".motion-block").forEach((block) => {
    const hasEditableContent = Array.from(block.children).some((child) => {
      if (child.matches(".block-chart")) {
        return NATIVE_CHART_TYPES.has((child as HTMLElement).dataset.chartType ?? "");
      }

      return EDITABLE_CONTENT_SELECTORS.some((selector) => child.matches(selector));
    });

    if (hasEditableContent) {
      block.style.visibility = "hidden";
    }
  });
}
