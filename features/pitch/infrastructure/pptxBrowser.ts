import type PptxGenJS from "pptxgenjs";

type PptxGenConstructor = new () => PptxGenJS;

declare global {
  interface Window {
    PptxGenJS?: PptxGenConstructor;
    __slidexPptxLoader?: Promise<PptxGenConstructor>;
  }
}

const PPTX_BROWSER_BUNDLE = "/vendor/pptxgen.bundle.js";

export async function createPptxPresentation() {
  const PptxConstructor = await loadPptxConstructor();
  return new PptxConstructor();
}

function loadPptxConstructor(): Promise<PptxGenConstructor> {
  if (window.PptxGenJS) {
    return Promise.resolve(window.PptxGenJS);
  }

  if (window.__slidexPptxLoader) {
    return window.__slidexPptxLoader;
  }

  window.__slidexPptxLoader = new Promise<PptxGenConstructor>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${PPTX_BROWSER_BUNDLE}"]`);
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      if (window.PptxGenJS) {
        resolve(window.PptxGenJS);
        return;
      }

      reject(new Error("PowerPoint exporter failed to initialize"));
    };

    const handleError = () => reject(new Error("PowerPoint exporter could not be loaded"));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.async = true;
      script.src = PPTX_BROWSER_BUNDLE;
      document.head.appendChild(script);
    }
  });

  return window.__slidexPptxLoader;
}
