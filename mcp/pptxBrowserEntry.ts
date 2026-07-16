import PptxGenJS from "pptxgenjs";

import {
  buildMotionDocRasterHtml,
  slugifyFilename
} from "@/core/motion-doc/infrastructure/export/motionDocExport";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import {
  addEditableSlides,
  pptxRasterRequirements
} from "@/features/pitch/infrastructure/editablePptxExport";
import { renderPptxRasterAssets } from "@/features/pitch/infrastructure/pptxRasterExport";

type BrowserPptxExportInput = {
  source: string;
  title: string;
};

declare global {
  interface Window {
    __slidexExportPptx: (input: BrowserPptxExportInput) => Promise<{
      rasterizedSlideIndices: number[];
    }>;
  }
}

window.__slidexExportPptx = async ({ source, title }) => {
  const document = parseMotionDoc(source);
  const rasterRequirements = pptxRasterRequirements(document);
  const rasterAssets = rasterRequirements.slideIndices.length > 0
    ? await renderPptxRasterAssets(
        buildMotionDocRasterHtml(source, title, rasterRequirements.slideIndices),
        rasterRequirements
      )
    : { filteredImagesBySlide: [], slideBackgrounds: [] };
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "SlideX Pitch";
  pptx.company = "SlideX";
  pptx.subject = "Presentation exported from SlideX MCP";
  pptx.title = title;

  await addEditableSlides(
    pptx,
    document,
    rasterAssets.slideBackgrounds,
    rasterAssets.filteredImagesBySlide
  );

  await pptx.writeFile({
    compression: true,
    fileName: `${slugifyFilename(title || "slidex-deck")}.pptx`
  });

  return {
    rasterizedSlideIndices: [...rasterRequirements.slideIndices]
  };
};

