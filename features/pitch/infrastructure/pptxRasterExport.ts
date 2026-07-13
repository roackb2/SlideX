import { hidePptxEditableContent } from "@/features/pitch/infrastructure/pptxVisualFallback";

type MotionDocExportWindow = Window & {
  __motionDocExport?: {
    prepareStaticExport: () => Promise<{ slideCount: number }>;
  };
};

type PptxRasterExportOptions = {
  captureFilteredImages: boolean;
  captureSlideBackgrounds: boolean;
};

export type PptxRasterAssets = {
  filteredImagesBySlide: string[][];
  slideBackgrounds: string[];
};

const DESIGN_HEIGHT = 576;
const DESIGN_WIDTH = 1024;
const EXPORT_SCALE = 1920 / DESIGN_WIDTH;
const EXPORT_API_MAX_ATTEMPTS = 120;
const EXPORT_RENDERER_LOAD_TIMEOUT_MS = 30_000;

export async function renderPptxRasterAssets(
  rasterHtml: string,
  options: PptxRasterExportOptions
): Promise<PptxRasterAssets> {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${DESIGN_WIDTH}px;height:${DESIGN_HEIGHT}px;pointer-events:none;opacity:0;`;
  document.body.appendChild(iframe);
  const iframeLoad = waitForIframeLoad(iframe);
  iframe.srcdoc = rasterHtml;

  try {
    await iframeLoad;
    const frameWindow = iframe.contentWindow as MotionDocExportWindow | null;
    if (!frameWindow?.document) throw new Error("Export renderer failed to load");

    await prepareStaticExportWindow(frameWindow);
    const slides = Array.from(frameWindow.document.querySelectorAll<HTMLElement>(".slide"));
    if (slides.length === 0) throw new Error("No slides to export");

    const { default: html2canvas } = await import("html2canvas-pro");
    const filteredImagesBySlide: string[][] = [];
    const slideBackgrounds: string[] = [];

    for (const slide of slides) {
      slide.classList.add("is-active");

      if (options.captureFilteredImages) {
        const filteredBlocks = Array.from(slide.querySelectorAll<HTMLElement>(".motion-block"))
          .filter((block) => block.querySelector(".block-image .image-filter-canvas"));
        const filteredImages: string[] = [];

        for (const block of filteredBlocks) {
          const rect = block.getBoundingClientRect();
          const canvas = await html2canvas(block, {
            allowTaint: false,
            backgroundColor: null,
            height: Math.max(1, Math.ceil(rect.height)),
            logging: false,
            scale: EXPORT_SCALE,
            useCORS: true,
            width: Math.max(1, Math.ceil(rect.width)),
            windowHeight: DESIGN_HEIGHT,
            windowWidth: DESIGN_WIDTH
          });
          filteredImages.push(canvas.toDataURL("image/png"));
        }

        filteredImagesBySlide.push(filteredImages);
      } else {
        filteredImagesBySlide.push([]);
      }

      if (options.captureSlideBackgrounds) {
        hidePptxEditableContent(slide);
        const canvas = await html2canvas(slide, {
          allowTaint: false,
          backgroundColor: null,
          height: DESIGN_HEIGHT,
          logging: false,
          scale: EXPORT_SCALE,
          useCORS: true,
          width: DESIGN_WIDTH,
          windowHeight: DESIGN_HEIGHT,
          windowWidth: DESIGN_WIDTH
        });
        slideBackgrounds.push(canvas.toDataURL("image/png"));
      }

      slide.classList.remove("is-active");
    }

    return { filteredImagesBySlide, slideBackgrounds };
  } finally {
    iframe.remove();
  }
}

function waitForIframeLoad(iframe: HTMLIFrameElement) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Export renderer timed out"));
    }, EXPORT_RENDERER_LOAD_TIMEOUT_MS);
    iframe.addEventListener("load", () => {
      window.clearTimeout(timeout);
      resolve();
    }, { once: true });
  });
}

async function prepareStaticExportWindow(frameWindow: MotionDocExportWindow) {
  for (let attempt = 0; attempt < EXPORT_API_MAX_ATTEMPTS; attempt += 1) {
    if (frameWindow.__motionDocExport?.prepareStaticExport) {
      await frameWindow.__motionDocExport.prepareStaticExport();
      return;
    }
    await wait(100);
  }

  throw new Error("Export renderer unavailable");
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}
