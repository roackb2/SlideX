import { hidePptxEditableContent } from "@/features/pitch/infrastructure/pptxVisualFallback";

type MotionDocExportWindow = Window & {
  __motionDocExport?: {
    prepareStaticExport: () => Promise<{ slideCount: number }>;
  };
};

type PptxRasterExportOptions = {
  captureChartsBySlide: readonly boolean[];
  captureFilteredImagesBySlide: readonly boolean[];
  captureSlideBackgroundsBySlide: readonly boolean[];
  slideCount: number;
  slideIndices: readonly number[];
};

export type PptxRasterAssets = {
  chartImagesBySlide: string[][];
  filteredImagesBySlide: string[][];
  slideBackgrounds: string[];
};

const DESIGN_HEIGHT = 576;
const DESIGN_WIDTH = 1024;
const EXPORT_SCALE = 1920 / DESIGN_WIDTH;
const PPTX_BACKGROUND_JPEG_QUALITY = 0.9;
const EXPORT_API_MAX_ATTEMPTS = 120;
const EXPORT_RENDERER_LOAD_TIMEOUT_MS = 30_000;

export async function renderPptxRasterAssets(
  rasterHtml: string,
  options: PptxRasterExportOptions
): Promise<PptxRasterAssets> {
  const html2canvasPromise = import("html2canvas-pro").then((module) => module.default);
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

    const html2canvas = await html2canvasPromise;
    const chartImagesBySlide = Array.from({ length: options.slideCount }, () => [] as string[]);
    const filteredImagesBySlide = Array.from({ length: options.slideCount }, () => [] as string[]);
    const slideBackgrounds = Array.from({ length: options.slideCount }, () => "");

    for (let renderedSlideIndex = 0; renderedSlideIndex < slides.length; renderedSlideIndex += 1) {
      const slide = slides[renderedSlideIndex];
      const sourceSlideIndex = options.slideIndices[renderedSlideIndex];
      if (sourceSlideIndex === undefined) throw new Error("PowerPoint raster slide mapping failed");
      slide.classList.add("is-active");

      chartImagesBySlide[sourceSlideIndex] = options.captureChartsBySlide[sourceSlideIndex]
        ? await captureMotionBlocks(slide, ".block-chart", html2canvas)
        : [];

      if (options.captureFilteredImagesBySlide[sourceSlideIndex]) {
        filteredImagesBySlide[sourceSlideIndex] = await captureMotionBlocks(
          slide,
          ".block-image .image-filter-canvas",
          html2canvas
        );
      }

      if (options.captureSlideBackgroundsBySlide[sourceSlideIndex]) {
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
        try {
          slideBackgrounds[sourceSlideIndex] = await canvasToDataUrl(
            canvas,
            "image/jpeg",
            PPTX_BACKGROUND_JPEG_QUALITY
          );
        } finally {
          releaseCanvas(canvas);
        }
      }

      slide.classList.remove("is-active");
    }

    return { chartImagesBySlide, filteredImagesBySlide, slideBackgrounds };
  } finally {
    iframe.remove();
  }
}

type Html2Canvas = typeof import("html2canvas-pro")["default"];

async function captureMotionBlocks(
  slide: HTMLElement,
  contentSelector: string,
  html2canvas: Html2Canvas
) {
  const blocks = Array.from(slide.querySelectorAll<HTMLElement>(".motion-block"))
    .filter((block) => block.querySelector(contentSelector));
  const images: string[] = [];

  for (const block of blocks) {
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
    images.push(canvas.toDataURL("image/png"));
    releaseCanvas(canvas);
  }

  return images;
}

function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 1;
  canvas.height = 1;
}

function canvasToDataUrl(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PowerPoint background compression failed"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    }, type, quality);
  });
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
