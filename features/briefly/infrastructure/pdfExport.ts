import { execFile } from "node:child_process";
import fs from "node:fs";
import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type BrieflyPdfExportInput = {
  basename: string;
  chromePath?: string;
  html: string;
  includeBrowserHeaderFooter?: boolean;
  outputPath?: string;
};

export type BrieflyPdfExportResult = {
  bytes: number;
  chromePath: string;
  filePath: string;
  filename: string;
  mimeType: "application/pdf";
};

const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium"
].filter(Boolean) as string[];

export async function exportBrieflyPdf(input: BrieflyPdfExportInput): Promise<BrieflyPdfExportResult> {
  const chromePath = resolveChromePath(input.chromePath);
  const outputPath = resolveOutputPath(input.outputPath, input.basename);
  const outputDir = path.dirname(outputPath);
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "briefly-pdf-"));
  const htmlPath = path.join(tempDir, `${input.basename}.html`);

  await mkdir(outputDir, { recursive: true });

  try {
    await writeFile(htmlPath, input.html, "utf8");

    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-dev-shm-usage",
      "--disable-extensions"
    ];

    if (!input.includeBrowserHeaderFooter) {
      args.push("--no-pdf-header-footer");
    }

    args.push(`--print-to-pdf=${outputPath}`, pathToFileURL(htmlPath).href);

    await execFileAsync(chromePath, args, {
      maxBuffer: 1024 * 1024 * 4,
      timeout: 30_000
    });

    const pdfStat = await stat(outputPath);

    if (pdfStat.size <= 0) {
      throw new Error("Chrome created an empty PDF file.");
    }

    return {
      bytes: pdfStat.size,
      chromePath,
      filePath: outputPath,
      filename: path.basename(outputPath),
      mimeType: "application/pdf"
    };
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

function resolveOutputPath(outputPath: string | undefined, basename: string) {
  const fallback = path.join(process.cwd(), "tmp", "briefly-mcp-exports", `${basename}.pdf`);
  const candidate = outputPath?.trim() || fallback;
  const normalized = candidate.endsWith(".pdf") ? candidate : `${candidate}.pdf`;
  return path.resolve(normalized);
}

function resolveChromePath(explicitPath: string | undefined) {
  if (explicitPath?.trim()) {
    if (!fs.existsSync(explicitPath)) {
      throw new Error(`Chrome executable was not found at: ${explicitPath}`);
    }

    return explicitPath;
  }

  const candidate = chromeCandidates.find((item) => fs.existsSync(item));

  if (candidate) {
    return candidate;
  }

  throw new Error(
    "Could not find a local Chrome or Chromium executable. Set CHROME_PATH or pass chromePath to briefly_export_pdf."
  );
}
