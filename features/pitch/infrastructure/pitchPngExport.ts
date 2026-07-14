import {
  preparePitchExportWindow,
  waitForPitchExportIframe,
  type MotionDocExportWindow
} from "@/features/pitch/infrastructure/pitchExportRuntime";

const PNG_EXPORT_HEIGHT = 1080;
const PNG_EXPORT_WIDTH = 1920;

export function downloadPitchExportBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function pitchSvgToPngBlob(svg: string, width = PNG_EXPORT_WIDTH, height = PNG_EXPORT_HEIGHT): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const sourceBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(sourceBlob);
    const image = new Image();
    image.width = width;
    image.height = height;
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("PNG export is unavailable in this browser");
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob((resultBlob) => {
          canvas.width = 1;
          canvas.height = 1;
          if (resultBlob) resolve(resultBlob);
          else reject(new Error("PNG export failed"));
        }, "image/png");
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("PNG render failed"));
    };
    image.src = url;
  });
}

export async function renderPitchStaticSlideHtml(rasterHtml: string, slideIndices: readonly number[]) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1024px;height:576px;pointer-events:none;opacity:0;";
  document.body.appendChild(iframe);
  const iframeLoad = waitForPitchExportIframe(iframe);
  iframe.srcdoc = rasterHtml;

  try {
    await iframeLoad;
    const frameWindow = iframe.contentWindow as MotionDocExportWindow | null;
    if (!frameWindow?.document) throw new Error("Export renderer failed to load");
    const slides = Array.from(frameWindow.document.querySelectorAll<HTMLElement>(".slide"));
    if (slides.length === 0) throw new Error("No slides to export");
    const selectedSlides = slideIndices.map((slideIndex, selectionIndex) => ({ slide: slides[selectionIndex], slideIndex }));
    if (selectedSlides.some(({ slide }) => !slide)) throw new Error("Invalid slide selection");
    await preparePitchExportWindow(frameWindow);
    return selectedSlides.map(({ slide, slideIndex }) => {
      slide.classList.add("is-active");
      const html = slide.outerHTML;
      slide.classList.remove("is-active");
      return { html, slideIndex };
    });
  } finally {
    iframe.remove();
  }
}
