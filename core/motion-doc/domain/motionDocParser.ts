import type {
  MotionDocBlock,
  MotionDocProps,
  ParsedMotionDoc
} from "@/core/motion-doc/domain/motionDocTypes";
import { sanitizeMotionDocMediaSource } from "@/core/motion-doc/domain/mediaSource";
import { sanitizeMotionDocVideoSource } from "@/core/motion-doc/domain/videoSource";

const mediaSourcePropNames = new Set(["backgroundImage", "poster", "src"]);

export function parseMotionDoc(source: string): ParsedMotionDoc {
  const title = source.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Slider Preview";
  const sceneMatches = Array.from(
    source.matchAll(/<(?:Slide|Scene)\b([^>]*)>([\s\S]*?)<\/(?:Slide|Scene)>/g)
  );

  return {
    title,
    scenes: sceneMatches.map((match) => {
      const props = parseProps(match[1] ?? "");
      const durationValue = props.duration;

      return {
        duration:
          typeof durationValue === "number" && Number.isFinite(durationValue)
            ? durationValue
            : 0,
        props,
        blocks: parseSceneBlocks(match[2] ?? "")
      };
    })
  };
}

function parseSceneBlocks(sceneSource: string): MotionDocBlock[] {
  const normalizedSceneSource = expandGroupMarkup(sceneSource);
  const blocks: MotionDocBlock[] = [];
  const blockPattern =
    /<(Title|Text)\b([^>]*)>([\s\S]*?)<\/\1>|<(Card|ImageBlock|VideoBlock|Metric|Icon|Shape|Stack|Table)\b([\s\S]*?)\/>/g;
  let markdownSource = normalizedSceneSource;

  for (const match of normalizedSceneSource.matchAll(blockPattern)) {
    markdownSource = markdownSource.replace(match[0], "\n");
    const pairedType = match[1] as "Title" | "Text" | undefined;
    const selfClosingType = match[4] as
      | "Card"
      | "Icon"
      | "ImageBlock"
      | "Metric"
      | "Shape"
      | "Stack"
      | "Table"
      | "VideoBlock"
      | undefined;

    if (pairedType) {
      blocks.push({
        type: pairedType,
        props: parseProps(match[2] ?? ""),
        text: normalizeText(match[3] ?? "")
      });
      continue;
    }

    if (selfClosingType) {
      const props = parseProps(match[5] ?? "");
      if (selfClosingType === "VideoBlock") {
        delete props.sourceType;
        if (typeof props.src === "string") props.src = sanitizeMotionDocVideoSource(props.src);
      }
      blocks.push({
        type: selfClosingType,
        props
      });
    }
  }

  markdownSource = markdownSource.replace(/<[A-Z][A-Za-z0-9]*\b[\s\S]*?\/>/g, "\n");

  for (const line of markdownSource.split("\n")) {
    const { blockId, content } = parseMarkdownBlockLine(line.trim());
    const trimmedLine = content;

    if (!trimmedLine || trimmedLine.startsWith("import ") || trimmedLine.startsWith("export ")) {
      continue;
    }

    if (trimmedLine.startsWith("# ")) {
      blocks.push({
        type: "Title",
        props: blockId ? { id: blockId } : {},
        text: trimmedLine.replace(/^#\s+/, "")
      });
      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      blocks.push({
        ...(blockId ? { id: blockId } : {}),
        type: "heading",
        text: trimmedLine.replace(/^##\s+/, "")
      });
      continue;
    }

    blocks.push({
      type: "Text",
      props: blockId ? { id: blockId } : {},
      text: trimmedLine
    });
  }

  return blocks;
}

function parseMarkdownBlockLine(line: string) {
  const marker = line.match(/\s*<!--\s*slidex-block-id\s*:\s*([A-Za-z0-9._:-]+)\s*-->\s*$/);

  return {
    blockId: marker?.[1]?.trim() ?? "",
    content: marker && marker.index !== undefined ? line.slice(0, marker.index).trimEnd() : line
  };
}

function expandGroupMarkup(sceneSource: string) {
  return sceneSource.replace(/<Group\b([^>]*)>([\s\S]*?)<\/Group>/g, (_match, rawProps: string, children: string, offset: number) => {
    const props = parseProps(rawProps);
    const groupId = String(props.id ?? props.groupId ?? `group-${offset}`);
    const groupName = String(props.name ?? props.groupName ?? "Group");
    const groupAttrs = ` groupId="${encodeInjectedAttribute(groupId)}" groupName="${encodeInjectedAttribute(groupName)}"`;

    return children.replace(
      /<(Title|Text|Card|ImageBlock|VideoBlock|Metric|Icon|Shape|Stack|Table)\b/g,
      (opening) => `${opening}${groupAttrs}`
    );
  });
}

function encodeInjectedAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function parseProps(rawProps: string): MotionDocProps {
  const props: MotionDocProps = {};
  const propPattern = /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;

  for (const match of rawProps.matchAll(propPattern)) {
    const key = match[1];
    const quotedValue = match[2] ?? match[3];
    const expressionValue = match[4];
    const value = quotedValue === undefined
      ? expressionValue ?? ""
      : decodeMdxAttribute(quotedValue);
    const numericValue = Number(value);

    props[key] = mediaSourcePropNames.has(key)
      ? sanitizeMotionDocMediaSource(value)
      : key !== "text" && Number.isFinite(numericValue) && value.trim() !== "" ? numericValue : value;
  }

  return props;
}

function decodeMdxAttribute(value: string) {
  return value
    .replaceAll("&#10;", "\n")
    .replaceAll("&#xA;", "\n")
    .replaceAll("&#xa;", "\n")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function normalizeText(value: string) {
  return decodeMdxText(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function decodeMdxText(value: string) {
  return value
    .replaceAll("&#123;", "{")
    .replaceAll("&#x7B;", "{")
    .replaceAll("&#x7b;", "{")
    .replaceAll("&#125;", "}")
    .replaceAll("&#x7D;", "}")
    .replaceAll("&#x7d;", "}")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}
