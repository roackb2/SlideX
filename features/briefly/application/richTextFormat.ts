type MarkdownBlock =
  | { type: "paragraph"; lines: string[] }
  | { type: "ol" | "ul"; items: string[] }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "blockquote"; lines: string[] };

const orderedListItemPattern = /^\d+[.)]\s+(.+)$/;
const unorderedListItemPattern = /^[-*+]\s+(.+)$/;

export function hasHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function renderHtmlList(tag: "ol" | "ul", items: string[]): string {
  const cleanItems = items.map((item) => item.trim()).filter(Boolean);

  if (!cleanItems.length) {
    return "";
  }

  return `<${tag}>${cleanItems
    .map((item) => `<li>${renderInlineMarkdown(item).replace(/\n/g, "<br />")}</li>`)
    .join("")}</${tag}>`;
}

export function richTextToPlainText(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (!hasHtml(trimmed)) {
    return trimmed;
  }

  return decodeHtmlEntities(
    stripUnsafeHtml(trimmed)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "\n- ")
      .replace(/<\/(p|div|h[1-6]|blockquote|li)>/gi, "\n")
      .replace(/<[^>]*>/g, "")
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function richTextToMdx(value: string): string {
  const trimmed = value.trim();

  if (!trimmed || !hasHtml(trimmed)) {
    return trimmed;
  }

  let output: string = stripUnsafeHtml(trimmed)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi, (_match, body: string) => `\n${htmlListToMdx(body, "ul")}\n`)
    .replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (_match, body: string) => `\n${htmlListToMdx(body, "ol")}\n`)
    .replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_match, body: string) => `\n## ${richTextToPlainText(body)}\n`)
    .replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_match, body: string) => `\n### ${richTextToPlainText(body)}\n`)
    .replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, body: string) =>
      richTextToPlainText(body)
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")
    )
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
    .replace(/<(s|del|strike)\b[^>]*>([\s\S]*?)<\/\1>/gi, "~~$2~~")
    .replace(/<p\b[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<div\b[^>]*>/gi, "")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]*>/g, "");

  output = decodeHtmlEntities(output);

  return normalizeMdx(output);
}

export function richTextToHtml(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (hasHtml(trimmed)) {
    const safeHtml = stripUnsafeHtml(trimmed).replace(/<p>\s*<\/p>/gi, "");
    return /<(p|div|ul|ol|li|h2|h3|blockquote)\b/i.test(safeHtml) ? safeHtml : `<p>${safeHtml}</p>`;
  }

  return renderMarkdownBlocks(trimmed);
}

function htmlListToMdx(body: string, type: "ol" | "ul"): string {
  const items: string[] = Array.from(body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi))
    .map((match) => richTextToMdx(match[1]) || richTextToPlainText(match[1]))
    .filter(Boolean);

  return items
    .map((item, index) => {
      const marker = type === "ol" ? `${index + 1}.` : "-";
      return `${marker} ${item.replace(/\n/g, "\n  ")}`;
    })
    .join("\n");
}

function renderMarkdownBlocks(value: string) {
  return parseMarkdownBlocks(value)
    .map((block) => {
      if (block.type === "paragraph") {
        return `<p>${renderInlineMarkdown(block.lines.join("\n")).replace(/\n/g, "<br />")}</p>`;
      }

      if (block.type === "heading") {
        return `<h${block.level}>${renderInlineMarkdown(block.text)}</h${block.level}>`;
      }

      if (block.type === "blockquote") {
        return `<blockquote>${renderInlineMarkdown(block.lines.join("\n")).replace(/\n/g, "<br />")}</blockquote>`;
      }

      return renderHtmlList(block.type, block.items);
    })
    .join("");
}

function parseMarkdownBlocks(value: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const paragraphLines: string[] = [];
  const quoteLines: string[] = [];
  let activeList: Extract<MarkdownBlock, { type: "ol" | "ul" }> | null = null;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push({ type: "paragraph", lines: [...paragraphLines] });
    paragraphLines.length = 0;
  };

  const flushList = () => {
    if (!activeList?.items.length) {
      activeList = null;
      return;
    }

    blocks.push(activeList);
    activeList = null;
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    blocks.push({ type: "blockquote", lines: [...quoteLines] });
    quoteLines.length = 0;
  };

  value
    .trim()
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line) {
        flushList();
        flushQuote();
        flushParagraph();
        return;
      }

      const headingMatch = /^(#{2,3})\s+(.+)$/.exec(line);
      if (headingMatch) {
        flushList();
        flushQuote();
        flushParagraph();
        blocks.push({ type: "heading", level: headingMatch[1].length as 2 | 3, text: headingMatch[2].trim() });
        return;
      }

      const quoteMatch = /^>\s?(.*)$/.exec(line);
      if (quoteMatch) {
        flushList();
        flushParagraph();
        quoteLines.push(quoteMatch[1].trim());
        return;
      }

      const listItem = getMarkdownListItem(line);
      if (listItem) {
        flushQuote();
        flushParagraph();

        if (!activeList || activeList.type !== listItem.type) {
          flushList();
          activeList = { type: listItem.type, items: [] };
        }

        if (listItem.value) {
          activeList.items.push(listItem.value);
        }
        return;
      }

      if (activeList && /^\s{2,}\S/.test(rawLine) && activeList.items.length) {
        activeList.items[activeList.items.length - 1] = `${activeList.items[activeList.items.length - 1]}\n${line}`;
        return;
      }

      flushList();
      flushQuote();
      paragraphLines.push(line);
    });

  flushList();
  flushQuote();
  flushParagraph();

  return blocks;
}

function getMarkdownListItem(line: string): { type: "ol" | "ul"; value: string } | null {
  const unorderedMatch = unorderedListItemPattern.exec(line);
  if (unorderedMatch) {
    return { type: "ul", value: unorderedMatch[1].trim() };
  }

  const orderedMatch = orderedListItemPattern.exec(line);
  if (orderedMatch) {
    return { type: "ol", value: orderedMatch[1].trim() };
  }

  return null;
}

function normalizeMdx(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripUnsafeHtml(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+href\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, ' href="#"');
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([^*\n][\s\S]*?)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~\n][\s\S]*?)~~/g, "<s>$1</s>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}
