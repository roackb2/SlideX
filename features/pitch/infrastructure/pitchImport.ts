import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { externalizeEmbeddedPitchImages } from "@/features/pitch/infrastructure/pitchLocalAssets";

export type ImportedPitchProject = {
  name: string;
  source: string;
};

export async function importPitchProjectFile(file: File): Promise<ImportedPitchProject> {
  const extension = file.name.split(".").pop()?.toLocaleLowerCase();

  if (extension !== "mdx" && extension !== "html") {
    throw new Error("Choose a SlideX MDX or HTML file");
  }

  const fileContent = await file.text();
  const embeddedSource = extension === "html" ? extractSourceFromHtml(fileContent) : fileContent;
  const source = await externalizeEmbeddedPitchImages(embeddedSource);
  const document = parseMotionDoc(source);

  if (document.scenes.length === 0) {
    throw new Error("This file does not contain any Pitch slides");
  }

  return {
    name: document.title || file.name.replace(/\.(?:html|mdx)$/i, ""),
    source
  };
}

function extractSourceFromHtml(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const sourceElement = document.querySelector<HTMLScriptElement>("#slidex-motion-doc-source");

  if (!sourceElement?.textContent) {
    throw new Error("This HTML file was not exported by the current SlideX Pitch version");
  }

  try {
    const source = JSON.parse(sourceElement.textContent);

    if (typeof source !== "string") {
      throw new Error("Invalid source payload");
    }

    return source;
  } catch {
    throw new Error("The embedded Pitch source could not be read");
  }
}
