"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { downloadFile } from "@/common/util/browserFile";
import {
  buildMotionDocHtml,
  buildMotionDocPngSvgFromSlideHtml,
  buildMotionDocRasterHtml,
  slugifyFilename
} from "@/core/motion-doc/infrastructure/export/motionDocExport";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { parseExportSlideSelection } from "@/features/pitch/application/exportSlideSelection";
import {
  addEditableSlides,
  pptxRasterRequirements
} from "@/features/pitch/infrastructure/editablePptxExport";
import { createPptxPresentation } from "@/features/pitch/infrastructure/pptxBrowser";
import {
  embedPitchLocalFiles,
  getPitchExportDeviceProfile
} from "@/features/pitch/infrastructure/pitchExportMedia";
import {
  preparePitchHtmlSource,
  preparePitchMdxSource,
  preparePitchPptxSource
} from "@/features/pitch/infrastructure/pitchExportSource";
import {
  downloadPitchExportBlob,
  pitchSvgToPngBlob,
  renderPitchStaticSlideHtml
} from "@/features/pitch/infrastructure/pitchPngExport";
import { renderPptxRasterAssets } from "@/features/pitch/infrastructure/pptxRasterExport";
import { wait } from "@/features/pitch/infrastructure/pitchExportRuntime";

type UsePitchExportArgs = {
  canvasSource: string;
  documentTitle: string;
  setNotice: Dispatch<SetStateAction<string>>;
};

const PNG_SLIDE_HTML_SEPARATOR = "\n<!-- slidex-png-slide-boundary -->\n";

export function countMotionDocSlides(source: string) {
  return parseMotionDoc(source).scenes.length;
}

export function usePitchExport({
  canvasSource,
  documentTitle,
  setNotice
}: UsePitchExportArgs) {
  const copySource = useCallback(async () => {
    if (!navigator.clipboard) {
      setNotice("Clipboard unavailable");
      return;
    }

    await navigator.clipboard.writeText(canvasSource);
    setNotice("Source copied");
  }, [canvasSource, setNotice]);

  const exportMdxFile = useCallback(async (filename: string) => {
    const finalTitle = filename.trim() || documentTitle || "slidesx-deck";
    const defaultFilename = `${slugifyFilename(finalTitle)}.mdx`;

    try {
      setNotice("Preparing export…");
      const finalSource = await preparePitchMdxSource(canvasSource);

      downloadFile(defaultFilename, finalSource, "text/markdown;charset=utf-8");
      setNotice("MDX exported ✓");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "MDX export failed");
    }
  }, [canvasSource, documentTitle, setNotice]);

  const exportHtmlFile = useCallback(async (filename: string) => {
    const finalTitle = filename.trim() || documentTitle || "slidesx-deck";
    const defaultFilename = `${slugifyFilename(finalTitle)}.html`;

    try {
      setNotice("Preparing export…");
      const finalSource = await preparePitchHtmlSource(canvasSource);
      const html = buildMotionDocHtml(finalSource, finalTitle);

      downloadFile(defaultFilename, html, "text/html;charset=utf-8");
      setNotice("HTML exported ✓");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "HTML export failed");
    }
  }, [canvasSource, documentTitle, setNotice]);

  const exportPngFile = useCallback(async (filename: string, slideSelectionStr?: string) => {
    const finalTitle = (filename || documentTitle || "slidesx-deck").trim();

    try {
      const slideCount = countMotionDocSlides(canvasSource);
      const selection = parseExportSlideSelection(slideSelectionStr || "all", slideCount);

      if (!selection) {
        setNotice("Invalid slide selection");
        return;
      }

      const filenamePrefix = slugifyFilename(finalTitle);

      setNotice("Preparing PNG…");
      const renderedSlides = await renderPitchStaticSlideHtml(
        buildMotionDocRasterHtml(canvasSource, finalTitle, selection.indices),
        selection.indices
      );
      const embeddedSlideHtml = await embedPitchLocalFiles(
        renderedSlides.map(({ html }) => html).join(PNG_SLIDE_HTML_SEPARATOR),
        true
      );
      const embeddedSlideHtmlList = embeddedSlideHtml.split(PNG_SLIDE_HTML_SEPARATOR);
      const selectedSlides = renderedSlides.map((slide, index) => ({
        ...slide,
        html: embeddedSlideHtmlList[index]
      }));
      const { pngConcurrency, pngDownloadDelayMs } = getPitchExportDeviceProfile();

      for (let batchStart = 0; batchStart < selectedSlides.length; batchStart += pngConcurrency) {
        const batch = selectedSlides.slice(batchStart, batchStart + pngConcurrency);
        const renderedBatch = await Promise.all(batch.map(async ({ html, slideIndex }, batchIndex) => {
          const exportIndex = batchStart + batchIndex;
          const slideNumber = String(slideIndex + 1).padStart(2, "0");
          const pngFilename = slideCount === 1
            ? `${filenamePrefix}.png`
            : `${filenamePrefix}-${slideNumber}.png`;
          const svg = buildMotionDocPngSvgFromSlideHtml(
            html,
            slideCount === 1 ? finalTitle : `${finalTitle} ${slideNumber}`
          );
          const pngBlob = await pitchSvgToPngBlob(svg);

          return { exportIndex, pngBlob, pngFilename };
        }));

        for (const { exportIndex, pngBlob, pngFilename } of renderedBatch) {
          setNotice(`Exporting PNG ${exportIndex + 1}/${selection.indices.length}…`);
          downloadPitchExportBlob(pngFilename, pngBlob);

          if (exportIndex < selection.indices.length - 1) {
            await wait(pngDownloadDelayMs);
          }
        }
      }

      setNotice(selection.indices.length === 1 ? "PNG exported ✓" : `${selection.label} exported as PNG ✓`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "PNG export failed");
    }
  }, [canvasSource, documentTitle, setNotice]);

  const exportPptxFile = useCallback(async (filename: string) => {
    const finalTitle = (filename || documentTitle || "slidesx-deck").trim();
    const pptxFilename = `${slugifyFilename(finalTitle)}.pptx`;

    try {
      setNotice("Rendering PowerPoint…");
      const [finalSource, pptx] = await Promise.all([
        preparePitchPptxSource(canvasSource),
        createPptxPresentation()
      ]);
      const document = parseMotionDoc(finalSource);
      const rasterRequirements = pptxRasterRequirements(document);
      const rasterAssets = rasterRequirements.slideIndices.length > 0
        ? await renderPptxRasterAssets(
            buildMotionDocRasterHtml(finalSource, finalTitle, rasterRequirements.slideIndices),
            rasterRequirements
          )
        : { filteredImagesBySlide: [], slideBackgrounds: [] };
      pptx.layout = "LAYOUT_WIDE";
      pptx.author = "SlideX Pitch";
      pptx.company = "SlideX";
      pptx.subject = "Presentation exported from SlideX Pitch";
      pptx.title = finalTitle;

      setNotice("Building editable slides…");
      await addEditableSlides(
        pptx,
        document,
        rasterAssets.slideBackgrounds,
        rasterAssets.filteredImagesBySlide
      );

      setNotice("Building PowerPoint…");
      await pptx.writeFile({ fileName: pptxFilename, compression: true });
      setNotice("Editable PowerPoint exported ✓");
    } catch (error) {
      const exportError = error instanceof Error ? error : new Error("PowerPoint export failed");
      setNotice(exportError.message);
      throw exportError;
    }
  }, [canvasSource, documentTitle, setNotice]);

  return {
    copySource,
    exportHtmlFile,
    exportMdxFile,
    exportPngFile,
    exportPptxFile
  };
}
