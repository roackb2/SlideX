"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough
} from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { getBrieflyCopy } from "@/features/briefly/application/brieflyCopy";
import { richTextToHtml } from "@/features/briefly/application/richTextFormat";

export type PreviewCssVars = React.CSSProperties & Record<`--${string}`, string | undefined>;

const lightEditorVars = {
  "--editor-bg": "rgba(37, 99, 235, 0.02)",
  "--editor-bg-hover": "rgba(37, 99, 235, 0.05)",
  "--editor-bg-focus": "#ffffff",
  "--editor-border": "rgba(37, 99, 235, 0.3)",
  "--editor-border-hover": "rgba(37, 99, 235, 0.5)",
  "--editor-border-focus": "#2563eb",
  "--editor-selection": "rgba(37, 99, 235, 0.82)",
  "--editor-selection-text": "#ffffff"
} satisfies PreviewCssVars;

const darkEditorVars = {
  "--card-bg": "rgba(2, 6, 23, 0.92)",
  "--card-bg-alt": "rgba(147, 197, 253, 0.12)",
  "--border-color": "rgba(147, 197, 253, 0.38)",
  "--text-primary": "#ffffff",
  "--text-secondary": "rgba(255,255,255,0.72)",
  "--text-muted": "rgba(255,255,255,0.48)",
  "--editor-bg": "rgba(147, 197, 253, 0.08)",
  "--editor-bg-hover": "rgba(147, 197, 253, 0.14)",
  "--editor-bg-focus": "rgba(147, 197, 253, 0.16)",
  "--editor-border": "rgba(147, 197, 253, 0.5)",
  "--editor-border-hover": "rgba(191, 219, 254, 0.76)",
  "--editor-border-focus": "#93c5fd",
  "--editor-selection": "rgba(147, 197, 253, 0.72)",
  "--editor-selection-text": "#06111f"
} satisfies PreviewCssVars;

export function editorVarsForSection(backgroundColor: string | undefined, fallbackDark: boolean) {
  if (backgroundColor) {
    return isDarkHexColor(backgroundColor) ? darkEditorVars : lightEditorVars;
  }

  return fallbackDark ? darkEditorVars : lightEditorVars;
}

export function InlineTextEditor({
  value,
  placeholder,
  className,
  onSave
}: {
  value: string;
  placeholder?: string;
  className?: string;
  onSave: (newValue: string) => void;
}) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;
  const [isFocused, setIsFocused] = useState(false);
  const editorContent = value ? richTextToHtml(value) : "";

  function cleanTiptapHtml(html: string) {
    if (html === "<p></p>") return "";
    if (
      html.startsWith("<p>") &&
      html.endsWith("</p>") &&
      html.indexOf("<p>", 3) === -1 &&
      !html.includes("<ul") &&
      !html.includes("<ol") &&
      !html.includes("<h") &&
      !html.includes("<blockquote")
    ) {
      return html.substring(3, html.length - 4);
    }
    return html;
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepAttributes: false, keepMarks: true },
        codeBlock: false,
        heading: { levels: [2, 3] },
        horizontalRule: false,
        orderedList: { keepAttributes: false, keepMarks: true }
      }),
      Placeholder.configure({ placeholder: placeholder ?? copy.defaultPlaceholder })
    ],
    content: editorContent,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-none ${className ?? ""}`
      }
    },
    onBlur({ editor: currentEditor }) {
      setIsFocused(false);
      const html = cleanTiptapHtml(currentEditor.getHTML());
      if (html !== value) {
        onSave(html);
      }
    },
    onFocus: () => setIsFocused(true)
  });

  useEffect(() => {
    if (!editor) return;
    const nextContent = value ? richTextToHtml(value) : "";
    const current = editor.getHTML();
    if (current !== nextContent && !editor.isFocused) {
      editor.commands.setContent(nextContent);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className={`briefly-inline-editor group/editor relative rounded-xl transition-all duration-300 ${isFocused ? "is-focused z-10" : ""}`}>
      {editor ? (
        <BubbleMenu editor={editor} className="flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-1.5 shadow-lg">
          <InlineToolbarButton active={editor.isActive("bold")} label={copy.toolbar.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton active={editor.isActive("italic")} label={copy.toolbar.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton active={editor.isActive("strike")} label={copy.toolbar.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough className="h-4 w-4" />
          </InlineToolbarButton>
          <span className="mx-1 h-5 w-px bg-[var(--border-color)]" />
          <InlineToolbarButton active={editor.isActive("heading", { level: 2 })} label={copy.toolbar.heading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton active={editor.isActive("heading", { level: 3 })} label={copy.toolbar.heading3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 className="h-4 w-4" />
          </InlineToolbarButton>
          <span className="mx-1 h-5 w-px bg-[var(--border-color)]" />
          <InlineToolbarButton active={editor.isActive("bulletList")} label={copy.toolbar.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton active={editor.isActive("orderedList")} label={copy.toolbar.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton active={editor.isActive("blockquote")} label={copy.toolbar.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-4 w-4" />
          </InlineToolbarButton>
        </BubbleMenu>
      ) : null}
      <EditorContent editor={editor} />
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: inherit;
          opacity: 0.5;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .briefly-inline-editor {
          background: var(--editor-bg);
          outline: 1px dashed var(--editor-border);
          padding: 0.125rem;
          margin: -0.125rem;
        }
        .briefly-inline-editor:hover {
          background: var(--editor-bg-hover);
          outline-color: var(--editor-border-hover);
        }
        .briefly-inline-editor.is-focused {
          background: var(--editor-bg-focus);
          outline: 0;
          box-shadow:
            0 0 0 2px var(--editor-border-focus),
            0 0 0 1px color-mix(in srgb, var(--editor-border-focus), transparent 42%);
        }
        .tiptap,
        .tiptap .ProseMirror {
          caret-color: #2563eb;
        }
        .briefly-inline-editor.is-focused .tiptap,
        .briefly-inline-editor.is-focused .tiptap .ProseMirror {
          caret-color: var(--editor-border-focus);
        }
        .tiptap ::selection,
        .tiptap *::selection {
          background: var(--editor-selection);
          color: var(--editor-selection-text);
        }
        .tiptap p {
          margin: 0;
        }
        .tiptap p + p {
          margin-top: 0.75em;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .tiptap blockquote {
          border-left: 3px solid var(--border-color);
          padding-left: 1rem;
          color: inherit;
          opacity: 0.5;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .tiptap h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          line-height: 1.2;
          color: inherit;
        }
        .tiptap h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.2em;
          margin-bottom: 0.5em;
          line-height: 1.2;
          color: inherit;
        }
      `}</style>
    </div>
  );
}

function InlineToolbarButton({
  active,
  label,
  onClick,
  children
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-[var(--accent)] text-[var(--accent-fg)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--card-bg-alt)] hover:text-[var(--text-primary)]"
      }`}
      title={label}
    >
      {children}
    </button>
  );
}

function isDarkHexColor(value: string) {
  const match = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return false;

  const normalized =
    match[1].length === 3
      ? match[1].split("").map((char) => `${char}${char}`).join("")
      : match[1];
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance < 0.48;
}
