export type MotionDocBlock =
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "Title" | "Text";
      props: Record<string, string | number>;
      text: string;
    }
  | {
      type: "Card" | "ImageBlock" | "Metric" | "Chart";
      props: Record<string, string | number>;
    };

export type MotionDocScene = {
  duration: number;
  props: Record<string, string | number>;
  blocks: MotionDocBlock[];
};

export type ParsedMotionDoc = {
  title: string;
  scenes: MotionDocScene[];
};

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
  const blocks: MotionDocBlock[] = [];
  const blockPattern =
    /<(Title|Text)\b([^>]*)>([\s\S]*?)<\/\1>|<(Card|ImageBlock|Metric|Chart)\b([\s\S]*?)\/>/g;
  let markdownSource = sceneSource;

  for (const match of sceneSource.matchAll(blockPattern)) {
    markdownSource = markdownSource.replace(match[0], "\n");
    const pairedType = match[1] as "Title" | "Text" | undefined;
    const selfClosingType = match[4] as
      | "Card"
      | "Chart"
      | "ImageBlock"
      | "Metric"
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
      blocks.push({
        type: selfClosingType,
        props: parseProps(match[5] ?? "")
      });
    }
  }

  for (const line of markdownSource.split("\n")) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("import ") || trimmedLine.startsWith("export ")) {
      continue;
    }

    if (trimmedLine.startsWith("# ")) {
      blocks.push({
        type: "Title",
        props: {},
        text: trimmedLine.replace(/^#\s+/, "")
      });
      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      blocks.push({
        type: "heading",
        text: trimmedLine.replace(/^##\s+/, "")
      });
      continue;
    }

    blocks.push({
      type: "Text",
      props: {},
      text: trimmedLine
    });
  }

  return blocks;
}

function parseProps(rawProps: string): Record<string, string | number> {
  const props: Record<string, string | number> = {};
  const propPattern = /([A-Za-z][A-Za-z0-9]*)\s*=\s*(?:"([^"]*)"|\{([^}]*)\})/g;

  for (const match of rawProps.matchAll(propPattern)) {
    const key = match[1];
    const quotedValue = match[2];
    const expressionValue = match[3];
    const value = quotedValue ?? expressionValue ?? "";
    const numericValue = Number(value);

    props[key] = Number.isFinite(numericValue) && value.trim() !== "" ? numericValue : value;
  }

  return props;
}

function normalizeText(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
}
