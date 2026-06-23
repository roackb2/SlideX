"use client";

import { useEffect, useState, useRef, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Trash2,
  User
} from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import type {
  BriefAttachment,
  BriefSection,
  BriefTimelineItem,
  LayoutSettings,
  ProjectBrief,
  SectionData,
  SectionType,
  StyleSettings
} from "@/features/briefly/domain/briefTypes";
import { richTextToHtml } from "@/features/briefly/application/richTextFormat";
import { IMAGE_UPLOAD_PRESETS, processImageFile } from "@/features/briefly/infrastructure/imageUpload";
import { getBrieflyCopy, getOptionLabel, getSectionCopy } from "@/features/briefly/ui/brieflyCopy";
import {
  attachmentsValue,
  faqValue,
  imagesValue,
  linksValue,
  stringArrayValue,
  teamValue,
  timelineItemsValue,
  budgetValue,
  decisionValue,
  textValue
} from "@/features/briefly/ui/sectionData";

interface DocumentPreviewProps {
  brief: ProjectBrief;
  sections: BriefSection[];
  activeSectionId: string;
  sectionTypeMime: string;
  onAddSectionAt: (type: SectionType, targetIndex?: number) => void;
  onMoveSectionToIndex: (sectionId: string, targetIndex: number) => void;
  onMoveSection?: (sectionId: string, direction: -1 | 1) => void;
  onDeleteSection?: (sectionId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onUpdateSectionData?: (sectionId: string, patch: SectionData) => void;
  onUpdateLayoutSetting?: <Key extends keyof LayoutSettings>(key: Key, value: LayoutSettings[Key]) => void;
  renderEditor?: (section: BriefSection) => ReactNode;
}

const BRIEFLY_SECTION_ID_MIME = "application/x-briefly-section-id";

const pageWidthClass: Record<LayoutSettings["page_width"], string> = {
  narrow: "max-w-[720px]",
  standard: "max-w-[860px]",
  wide: "max-w-[1040px]"
};

const tagClass: Record<StyleSettings["tag_style"], string> = {
  filledGray: "border-transparent bg-gray-100 text-gray-800",
  outline: "border-gray-200 bg-transparent text-gray-700",
  minimal: "rounded-none border-x-0 border-t-0 border-b-gray-300 bg-transparent px-0 text-gray-800 pb-0.5"
};

type PreviewCssVars = React.CSSProperties & Record<`--${string}`, string | undefined>;

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

function editorVarsForSection(backgroundColor: string | undefined, fallbackDark: boolean) {
  if (backgroundColor) {
    return isDarkHexColor(backgroundColor) ? darkEditorVars : lightEditorVars;
  }

  return fallbackDark ? darkEditorVars : lightEditorVars;
}

/* ─── Inline Text Editor (Tiptap) ────────────────────────── */

function InlineTextEditor({
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
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder: placeholder ?? copy.defaultPlaceholder }),
    ],
    content: editorContent,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-none ${className ?? ""}`,
      },
    },
    onFocus: () => setIsFocused(true),
    onBlur({ editor: e }) {
      setIsFocused(false);
      const html = cleanTiptapHtml(e.getHTML());
      if (html !== value) {
        onSave(html);
      }
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (!editor) return;
    const nextContent = value ? richTextToHtml(value) : "";
    const current = editor.getHTML();
    if (current !== nextContent && !editor.isFocused) {
      editor.commands.setContent(nextContent);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={`briefly-inline-editor group/editor relative rounded-xl transition-all duration-300 ${isFocused ? "is-focused z-10" : ""}`}>
      {editor && (
        <BubbleMenu editor={editor} className="flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-1.5 shadow-lg">
          <InlineToolbarButton
            active={editor.isActive("bold")}
            label={copy.toolbar.bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton
            active={editor.isActive("italic")}
            label={copy.toolbar.italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton
            active={editor.isActive("strike")}
            label={copy.toolbar.strike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </InlineToolbarButton>
          <div className="mx-1 h-5 w-px bg-[var(--border-color)]" />
          <InlineToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            label={copy.toolbar.heading2}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton
            active={editor.isActive("heading", { level: 3 })}
            label={copy.toolbar.heading3}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </InlineToolbarButton>
          <div className="mx-1 h-5 w-px bg-[var(--border-color)]" />
          <InlineToolbarButton
            active={editor.isActive("bulletList")}
            label={copy.toolbar.bulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton
            active={editor.isActive("orderedList")}
            label={copy.toolbar.orderedList}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </InlineToolbarButton>
          <InlineToolbarButton
            active={editor.isActive("blockquote")}
            label={copy.toolbar.quote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </InlineToolbarButton>
        </BubbleMenu>
      )}
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

/* ─── Main Document Preview ──────────────────────────────── */

function LogoUploader({
  label,
  value,
  onChange,
  onClear
}: {
  label: string;
  value?: string;
  onChange: (base64: string) => void;
  onClear: () => void;
}) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const image = await processImageFile(file, IMAGE_UPLOAD_PRESETS.logo);
      onChange(image.dataUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="group relative mx-auto my-4 flex w-full max-w-[200px] flex-col items-center justify-center">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      {value ? (
        <div className="relative flex w-full flex-col items-center group">
          <img src={value} alt="Logo" className="max-h-12 object-contain" />
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mr-2 rounded bg-[var(--accent)] px-2 py-1 text-xs font-medium text-[var(--accent-fg)] shadow hover:bg-black"
            >
              {copy.replace}
            </button>
            <button
              onClick={onClear}
              className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-[var(--accent-fg)] shadow hover:bg-red-600"
            >
              {copy.remove}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="briefly-upload-placeholder flex h-12 w-full items-center justify-center rounded-lg border border-dashed border-[var(--border-color)] bg-transparent text-xs font-medium opacity-50 transition hover:bg-[var(--card-bg)] hover:opacity-100 group-hover:opacity-100"
        >
          {uploading ? copy.processing : `+ ${label}`}
        </button>
      )}
    </div>
  );
}

function CoverImageUploader({
  value,
  onChange,
  onClear,
  isActive
}: {
  value?: string;
  onChange: (base64: string) => void;
  onClear: () => void;
  isActive: boolean;
}) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const image = await processImageFile(file, IMAGE_UPLOAD_PRESETS.cover);
      onChange(image.dataUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!value && !isActive) return null;

  return (
    <div className="group relative mb-12 w-full">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      {value ? (
        <div className="relative w-full overflow-hidden rounded-xl bg-black/5 aspect-[21/9] sm:aspect-video group">
          <img src={value} alt="Cover" className="h-full w-full object-cover" />
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="mr-2 rounded bg-white/20 border border-white/20 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-white/30 backdrop-blur-md"
              >
                {copy.replaceCover}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="rounded bg-red-500/80 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 backdrop-blur-md"
              >
                {copy.remove}
              </button>
            </div>
          )}
        </div>
      ) : (
        isActive && (
          <button
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-color)] bg-transparent text-sm font-medium opacity-50 transition hover:bg-[var(--card-bg)] hover:opacity-100 group-hover:opacity-100"
          >
            {uploading ? copy.processing : copy.addCover}
          </button>
        )
      )}
    </div>
  );
}

export function DocumentPreview({
  brief,
  sections,
  activeSectionId,
  sectionTypeMime,
  onAddSectionAt,
  onMoveSectionToIndex,
  onMoveSection,
  onDeleteSection,
  onSelectSection,
  onUpdateSectionData,
  onUpdateLayoutSetting,
  renderEditor
}: DocumentPreviewProps) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;
  const sectionEditorCopy = getBrieflyCopy(locale).sectionEditor;
  const layout = brief.layout_settings;
  const style = brief.style_settings;

  function handleDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    event.stopPropagation();

    const sectionId = event.dataTransfer.getData(BRIEFLY_SECTION_ID_MIME);
    const sectionType = event.dataTransfer.getData(sectionTypeMime) as SectionType;

    if (sectionId) {
      onMoveSectionToIndex(sectionId, targetIndex);
      onSelectSection(sectionId);
      return;
    }

    if (sectionType) {
      onAddSectionAt(sectionType, targetIndex);
    }
  }

  function handleDragOver(event: DragEvent) {
    if (
      event.dataTransfer.types.includes(BRIEFLY_SECTION_ID_MIME) ||
      event.dataTransfer.types.includes(sectionTypeMime)
    ) {
      event.preventDefault();
    }
  }

  const isDarkMode = style.page_background === "dark";

  return (
    <article
      id="briefly-pdf-preview-container"
      onDragOver={handleDragOver}
      onDrop={(event) => handleDrop(event, sections.length)}
      className={`briefly-print-area relative overflow-hidden shadow-2xl transition-all duration-300 mx-auto w-full rounded-[8px] sm:rounded-[12px] ${pageWidthClass[layout.page_width]} ${
        isDarkMode ? "text-white" : "text-black"
      } ${!style.background_image && !style.theme_gradient ? (isDarkMode ? "bg-black" : "bg-white") : ""}`}
      style={{
        backgroundImage: style.background_image 
          ? `url(${style.background_image})` 
          : (style.theme_gradient ? style.theme_gradient : undefined),
        backgroundSize: style.background_image ? "cover" : undefined,
        backgroundPosition: style.background_image ? "center" : undefined,
        "--card-bg": isDarkMode ? "#0a0a0a" : "#ffffff",
        "--card-bg-alt": isDarkMode ? "#111111" : "#f3f4f6",
        "--border-color": isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
        "--text-primary": isDarkMode ? "#ffffff" : "#000000",
        "--text-secondary": isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
        "--text-muted": isDarkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
        "--accent": "#3b82f6",
        "--accent-fg": "#ffffff",
        ...(isDarkMode ? darkEditorVars : lightEditorVars)
      } as PreviewCssVars}
    >
      {sections.length ? (
        <div className="flex flex-col">
          {sections.map((section, index) => {
            const isActive = section.id === activeSectionId;
            const customStyle: React.CSSProperties = {
              backgroundColor: (section.data.bg_color as string) || undefined,
              color: (section.data.text_color as string) || undefined,
            };
            const coverEditorVars = editorVarsForSection(customStyle.backgroundColor, true);

            if (section.type !== "cover") return null;

            return (
              <section
                key={section.id}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, index)}
                style={{
                  ...coverEditorVars,
                  ...(customStyle.backgroundColor ? { backgroundColor: customStyle.backgroundColor } : {}),
                  ...(customStyle.color ? { color: customStyle.color } : {})
                } as PreviewCssVars}
                className="relative break-inside-avoid bg-[var(--card-bg-alt)] text-[var(--text-primary)]"
              >
                <div
                  role="button"
                  tabIndex={0}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData(BRIEFLY_SECTION_ID_MIME, section.id);
                  }}
                  onClick={(e) => { e.stopPropagation(); onSelectSection(section.id); }}
                  className={`group relative block w-full text-left outline-none p-10 sm:p-14 lg:p-16 transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-inset ring-blue-500 bg-white/[0.02]"
                      : "hover:bg-white/[0.02] print:hover:bg-transparent"
                  }`}
                >
                  {isActive ? (
                    <SectionSelectionToolbar
                      sectionId={section.id}
                      index={index}
                      totalSections={sections.length}
                      onMoveSection={onMoveSection}
                      onDeleteSection={onDeleteSection}
                    />
                  ) : null}
                  
                  <CoverImageUploader
                    value={section.data.cover_image as string | undefined}
                    onChange={(v) => onUpdateSectionData?.(section.id, { cover_image: v })}
                    onClear={() => onUpdateSectionData?.(section.id, { cover_image: "" })}
                    isActive={isActive}
                  />

                  <div className="mb-16 flex items-center justify-between">
                    <div className="h-6">
                      {(layout.header_logo || (isActive && onUpdateLayoutSetting)) && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <LogoUploader
                            label={copy.logoLabel}
                            value={layout.header_logo}
                            onChange={(v) => onUpdateLayoutSetting?.("header_logo", v)}
                            onClear={() => onUpdateLayoutSetting?.("header_logo", "")}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {isActive && onUpdateSectionData ? (
                    <div className="relative z-10 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <InlineTextEditor
                        value={textValue(section, "project_name")}
                        placeholder="Renew launch campaign"
                        className="max-w-[780px] text-4xl font-bold leading-[1.1] tracking-tight sm:text-[2.8rem]"
                        onSave={(v) => onUpdateSectionData(section.id, { project_name: v })}
                      />
                      <InlineTextEditor
                        value={textValue(section, "one_liner")}
                        placeholder="Project brief"
                        className="max-w-[680px] text-[2rem] font-light leading-[1.2] opacity-80 sm:text-[2.5rem]"
                        onSave={(v) => onUpdateSectionData(section.id, { one_liner: v })}
                      />
                    </div>
                  ) : (
                    <div className="relative z-10 space-y-2">
                      <h1 className="max-w-[780px] text-4xl font-bold leading-[1.1] tracking-tight sm:text-[2.8rem]">
                        {textValue(section, "project_name") ? (
                          <RichTextDisplay value={textValue(section, "project_name")} inline />
                        ) : "Renew launch campaign"}
                      </h1>
                      <h2 className="max-w-[680px] text-[2rem] font-light leading-[1.2] opacity-80 sm:text-[2.5rem]">
                        {textValue(section, "one_liner") ? (
                          <RichTextDisplay value={textValue(section, "one_liner")} inline />
                        ) : "Project brief"}
                      </h2>
                    </div>
                  )}
                  
                  <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
                    {textValue(section, "project_category") && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{sectionEditorCopy.fields.category[0]}</span>
                        <p className="mt-1 text-sm font-medium opacity-90">{getOptionLabel(textValue(section, "project_category") || "", locale)}</p>
                      </div>
                    )}
                    {textValue(section, "project_stage") && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{sectionEditorCopy.fields.stage[0]}</span>
                        <p className="mt-1 text-sm font-medium opacity-90">{getOptionLabel(textValue(section, "project_stage") || "", locale)}</p>
                      </div>
                    )}
                    {textValue(section, "status") && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{sectionEditorCopy.fields.status[0]}</span>
                        <p className="mt-1 text-sm font-medium opacity-90">{getOptionLabel(textValue(section, "status") || "", locale)}</p>
                      </div>
                    )}
                    {textValue(section, "owner") && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{sectionEditorCopy.fields.owner[0]}</span>
                        <p className="mt-1 text-sm font-medium opacity-90">{textValue(section, "owner")}</p>
                      </div>
                    )}
                    {textValue(section, "confidentiality") && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{sectionEditorCopy.fields.confidentiality[0]}</span>
                        <p className="mt-1 text-sm font-medium opacity-90">{getOptionLabel(textValue(section, "confidentiality") || "", locale)}</p>
                      </div>
                    )}
                  </div>
                </div>
                {isActive && renderEditor ? renderEditor(section) : null}
              </section>
            );
          })}

          {sections.some(s => s.type !== "cover") && (
            <div className="flex flex-wrap bg-[var(--card-bg)] text-[var(--text-primary)] shadow-2xl mt-4 sm:mt-8 lg:mt-12 mx-4 sm:mx-8 lg:mx-12 mb-8 sm:mb-12 lg:mb-16 rounded-xl overflow-hidden relative z-10">
              {sections.map((section, index) => {
                if (section.type === "cover") return null;

                const isActive = section.id === activeSectionId;
                const customStyle: React.CSSProperties = {
                  backgroundColor: (section.data.bg_color as string) || undefined,
                  color: (section.data.text_color as string) || undefined,
                };
                const sectionEditorVars = editorVarsForSection(customStyle.backgroundColor, isDarkMode);
                
                const layoutClass = section.layout === "half-left" || section.layout === "half-right" 
                  ? "w-full md:w-1/2 border-r border-dashed border-[var(--border-color)]" 
                  : "w-full";

                return (
                  <section
                    key={section.id}
                    className={`relative break-inside-avoid border-b border-dashed border-[var(--border-color)] last:border-b-0 ${layoutClass}`}
                    onDragOver={handleDragOver}
                    onDrop={(event) => handleDrop(event, index)}
                    style={customStyle as PreviewCssVars}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(BRIEFLY_SECTION_ID_MIME, section.id);
                      }}
                      onClick={(e) => { e.stopPropagation(); onSelectSection(section.id); }}
                      className={`group relative block w-full h-full text-left outline-none px-8 py-10 sm:px-14 sm:py-12 transition-all duration-300 ${
                        isActive
                          ? "ring-2 ring-inset ring-blue-500 bg-[var(--card-bg-alt)]/[0.05]"
                          : "hover:bg-[var(--card-bg-alt)]/[0.05] print:bg-transparent"
                      }`}
                    >
                      {isActive ? (
                        <SectionSelectionToolbar
                          sectionId={section.id}
                          index={index}
                          totalSections={sections.length}
                          onMoveSection={onMoveSection}
                          onDeleteSection={onDeleteSection}
                        />
                      ) : null}
                      <div className="mb-6 flex items-baseline gap-3">
                        <h2 className="text-[15px] font-bold tracking-tight opacity-90">
                          {getSectionCopy(section.type, locale).title}
                        </h2>
                      </div>
                      
                      <div className="briefly-body-text text-[14.5px] leading-relaxed opacity-80">
                        <SectionContent
                          section={section}
                          style={style}
                          layout={layout}
                          isActive={isActive}
                          onUpdateSectionData={onUpdateSectionData}
                        />
                      </div>
                    </div>
                    {isActive && renderEditor ? renderEditor(section) : null}
                  </section>
                );
              })}
            </div>
          )}
        </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, 0)}
              className="min-h-[560px] bg-transparent"
            />
          )}
      {(onUpdateLayoutSetting || layout.footer_text) && (
        <div
          className="briefly-footer-editor border-t border-dashed border-[var(--border-color)] p-8 sm:p-14 flex justify-center"
          data-empty={layout.footer_text ? "false" : "true"}
        >
          {onUpdateLayoutSetting ? (
            <InlineTextEditor
              value={layout.footer_text || ""}
              placeholder={copy.footerPlaceholder}
              className="text-center text-sm text-[var(--text-secondary)] w-full max-w-2xl"
              onSave={(v) => onUpdateLayoutSetting("footer_text", v)}
            />
          ) : layout.footer_text ? (
            <RichTextDisplay value={layout.footer_text} className="text-center text-sm text-[var(--text-secondary)]" />
          ) : null}
        </div>
      )}
    </article>
  );
}

/* ─── Section Content ────────────────────────────────────── */

function SectionContent({
  section,
  style,
  layout,
  isActive = false,
  onUpdateSectionData
}: {
  section: BriefSection;
  style: StyleSettings;
  layout: LayoutSettings;
  isActive?: boolean;
  onUpdateSectionData?: (sectionId: string, patch: SectionData) => void;
}) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview.placeholders;

  switch (section.type) {
    case "background":
      return (
        <EditableTextStack
          section={section}
          fields={[
            { key: "vision_statement", placeholder: copy.visionStatement },
            { key: "problem_statement", placeholder: copy.problemStatement },
            { key: "background", placeholder: copy.background },
            { key: "context_note", placeholder: copy.contextNote }
          ]}
          isActive={isActive}
          onUpdateSectionData={onUpdateSectionData}
        />
      );
    case "goal":
      return (
        <EditableTextStack
          section={section}
          fields={[
            { key: "primary_goal", placeholder: copy.primaryGoal },
            { key: "success_signal", placeholder: copy.successSignal }
          ]}
          isActive={isActive}
          onUpdateSectionData={onUpdateSectionData}
        >
          <TagList items={stringArrayValue(section, "secondary_goals")} style={style} />
          <CalloutList title={getBrieflyCopy(locale).sectionEditor.fields.nonGoals[0]} items={stringArrayValue(section, "non_goals")} type="danger" />
        </EditableTextStack>
      );
    case "timeline":
      return <TimelinePreview section={section} />;
    case "deliverables":
      return (
        <EditableTextStack
          section={section}
          fields={[
            { key: "expected_outputs", placeholder: copy.expectedOutputs },
            { key: "scope_notes", placeholder: copy.scopeNotes }
          ]}
          isActive={isActive}
          onUpdateSectionData={onUpdateSectionData}
        >
          <BulletList items={stringArrayValue(section, "deliverables")} />
          <CalloutList title={getBrieflyCopy(locale).sectionEditor.fields.outOfScope[0]} items={stringArrayValue(section, "out_of_scope")} type="warning" />
        </EditableTextStack>
      );
    case "resources":
      return <ResourcesPreview section={section} />;
    case "risks":
      return (
        <TextStack values={[]}>
          <BulletList items={stringArrayValue(section, "risks")} />
          <CalloutList title={getBrieflyCopy(locale).sectionEditor.fields.mitigationPlans[0]} items={stringArrayValue(section, "mitigation_plans")} type="info" />
          <BulletList items={stringArrayValue(section, "open_questions")} />
          <BulletList items={stringArrayValue(section, "assumptions_to_validate")} />
        </TextStack>
      );
    case "audience":
      return (
        <EditableTextStack
          section={section}
          fields={[
            { key: "target_users", placeholder: copy.targetUsers },
            { key: "early_adopters", placeholder: copy.earlyAdopters }
          ]}
          isActive={isActive}
          onUpdateSectionData={onUpdateSectionData}
        >
          <BulletList items={stringArrayValue(section, "use_cases")} />
        </EditableTextStack>
      );

    case "team":
      return <TeamPreview section={section} />;
    case "faq":
      return <FaqPreview section={section} />;
    case "budget":
      return <BudgetPreview section={section} />;
    case "decisions":
      return <DecisionPreview section={section} />;
    default:
      return <PlaceholderText />;
  }
}

/* ─── Editable Text Stack ────────────────────────────────── */

function EditableTextStack({
  section,
  fields,
  isActive,
  onUpdateSectionData,
  children
}: {
  section: BriefSection;
  fields: { key: string; placeholder: string }[];
  isActive: boolean;
  onUpdateSectionData?: (sectionId: string, patch: SectionData) => void;
  children?: ReactNode;
}) {
  if (isActive && onUpdateSectionData) {
    return (
      <div className="space-y-5 text-[1.05em] leading-[1.65] opacity-80" onClick={(e) => e.stopPropagation()}>
        {fields.map((field) => (
          <InlineTextEditor
            key={field.key}
            value={textValue(section, field.key)}
            placeholder={field.placeholder}
            className="text-[1.05em] leading-[1.65]"
            onSave={(v) => onUpdateSectionData(section.id, { [field.key]: v })}
          />
        ))}
        {children}
      </div>
    );
  }

  const paragraphs = fields.map((f) => textValue(section, f.key)).filter(Boolean);

  if (!paragraphs.length && !children) {
    return <PlaceholderText />;
  }

  return (
    <div className="space-y-5 text-[1.05em] leading-[1.65] opacity-80">
      {paragraphs.map((value, i) => (
        <RichTextDisplay key={i} value={value} />
      ))}
      {children}
    </div>
  );
}

/* ─── Shared Components ──────────────────────────────────── */

function TextStack({
  values,
  children
}: {
  values: string[];
  children?: ReactNode;
}) {
  const paragraphs = values.filter(Boolean);

  if (!paragraphs.length && !children) {
    return <PlaceholderText />;
  }

  return (
    <div className="space-y-5 text-[1.05em] leading-[1.65] opacity-80">
      {paragraphs.map((value, i) => (
        <RichTextDisplay key={i} value={value} />
      ))}
      {children}
    </div>
  );
}

function RichTextDisplay({ value, className, inline = false }: { value: string; className?: string; inline?: boolean }) {
  const html = richTextToHtml(value);
  const output = inline ? html.replace(/^<p>([\s\S]*)<\/p>$/i, "$1") : html;

  return (
    <div
      className={className ? `briefly-rich-text ${className}` : "briefly-rich-text"}
      dangerouslySetInnerHTML={{ __html: output }}
    />
  );
}

function PlaceholderText() {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;

  return <p className="briefly-placeholder-text text-sm leading-[1.6] opacity-50 italic">{copy.addContent}</p>;
}

function SectionSelectionToolbar({
  sectionId,
  index,
  totalSections,
  onMoveSection,
  onDeleteSection
}: {
  sectionId: string;
  index: number;
  totalSections: number;
  onMoveSection?: (sectionId: string, direction: -1 | 1) => void;
  onDeleteSection?: (sectionId: string) => void;
}) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale);
  const canMoveUp = Boolean(onMoveSection) && index > 0;
  const canMoveDown = Boolean(onMoveSection) && index < totalSections - 1;

  return (
    <div
      className="briefly-section-toolbar absolute right-4 top-4 z-20 flex items-center gap-1 rounded-lg border border-black/10 bg-white p-1 text-[#161616] shadow-[0_14px_34px_rgba(15,23,42,0.22)]"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <SectionToolbarButton
        label={copy.builder.left.moveUp}
        disabled={!canMoveUp}
        onClick={() => onMoveSection?.(sectionId, -1)}
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </SectionToolbarButton>
      <SectionToolbarButton
        label={copy.builder.left.moveDown}
        disabled={!canMoveDown}
        onClick={() => onMoveSection?.(sectionId, 1)}
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </SectionToolbarButton>
      <SectionToolbarButton
        label={copy.builder.left.delete}
        danger
        disabled={!onDeleteSection}
        onClick={() => onDeleteSection?.(sectionId)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </SectionToolbarButton>
    </div>
  );
}

function SectionToolbarButton({
  label,
  danger,
  disabled,
  onClick,
  children
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "border-red-100 bg-red-50 text-red-600 hover:border-red-200 hover:bg-red-100 hover:text-red-700"
          : "border-transparent bg-transparent text-[#525252] hover:border-black/5 hover:bg-slate-100 hover:text-[#111111]"
      }`}
    >
      {children}
    </button>
  );
}

function TagList({ items, style }: { items: string[]; style: StyleSettings }) {
  const { locale } = useI18n();

  if (!items.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2.5 pt-2">
      {items.map((item) => (
        <span
          key={item}
          className={`inline-flex min-h-8 items-center rounded-full border px-3.5 text-[13px] font-medium ${tagClass[style.tag_style]}`}
        >
          {getOptionLabel(item, locale)}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  const { locale } = useI18n();

  if (!items.length) {
    return null;
  }

  return (
    <ul className="list-disc space-y-2.5 pl-6 opacity-80">
      {items.map((item) => (
        <li key={item}>{getOptionLabel(item, locale)}</li>
      ))}
    </ul>
  );
}

function CalloutList({ title, items, type = "info" }: { title: string; items: string[]; type?: "danger" | "warning" | "info" }) {
  if (!items.length) return null;
  const bgClasses = 
    type === "danger" ? "bg-red-500/10 border-red-500/20 text-red-500" :
    type === "warning" ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
    "bg-blue-500/10 border-blue-500/20 text-blue-500";
  
  return (
    <div className={`mt-5 rounded-lg border p-4 ${bgClasses}`}>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em]">{title}</p>
      <ul className="list-disc space-y-1.5 pl-5 opacity-90 text-[0.95em]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TimelinePreview({ section }: { section: BriefSection }) {
  const startDate = textValue(section, "start_date");
  const targetDate = textValue(section, "target_date");
  const milestones = stringArrayValue(section, "milestones");
  const timelineItems = timelineItemsValue(section).filter(hasTimelineContent);

  if (!startDate && !targetDate && !milestones.length && !timelineItems.length) {
    return <PlaceholderText />;
  }

  return (
    <div className="space-y-6">
      {(startDate || targetDate) ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {startDate ? <TimelineDateCard label="Start" value={startDate} /> : null}
          {targetDate ? <TimelineDateCard label="Target" value={targetDate} /> : null}
        </div>
      ) : null}

      {timelineItems.length ? (
        <div className="grid gap-3">
          {timelineItems.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-[var(--accent)]" />
              <div className="pl-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {formatTimelineRange(item)}
                </p>
                <p className="mt-2 text-[1.05em] font-bold tracking-tight text-[var(--text-primary)]">
                  {item.label || "Timeline item"}
                </p>
                {item.note ? <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.note}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <BulletList items={milestones} />
      {stringArrayValue(section, "dependencies").length > 0 ? (
        <CalloutList title="Dependencies" items={stringArrayValue(section, "dependencies")} type="warning" />
      ) : null}
    </div>
  );
}

function TimelineDateCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="border border-[var(--border-color)] bg-[var(--card-bg)] p-4 shadow-sm"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function ResourcesPreview({ section }: { section: BriefSection }) {
  const availableAssets = stringArrayValue(section, "available_assets");
  const attachments = attachmentsValue(section).filter((attachment) => attachment.dataUrl && attachment.name);
  const filesOrLinks = textValue(section, "files_or_links");
  const assetNotes = textValue(section, "asset_notes");

  if (!availableAssets.length && !attachments.length && !filesOrLinks && !assetNotes) {
    return <PlaceholderText />;
  }

  return (
    <div className="space-y-6">
      <TextStack values={[filesOrLinks, assetNotes]}>
        <BulletList items={availableAssets} />
      </TextStack>

      {attachments.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {attachments.map((attachment) => (
            <AttachmentCard key={attachment.id} attachment={attachment} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AttachmentCard({ attachment }: { attachment: BriefAttachment }) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;

  return (
    <a
      href={attachment.dataUrl}
      download={attachment.name}
      className="group block border border-[var(--border-color)] bg-[var(--card-bg)] p-4 no-underline shadow-sm transition hover:border-[var(--accent)]"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <p className="truncate text-sm font-bold text-[var(--text-primary)]">{attachment.name}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        {attachment.type || copy.attachment} · {formatBytes(attachment.size)}
      </p>
      <p className="mt-3 text-xs font-semibold text-[var(--accent)]">{copy.download}</p>
    </a>
  );
}

function hasTimelineContent(item: BriefTimelineItem) {
  return Boolean(item.label || item.date || item.endDate || item.note);
}

function formatTimelineRange(item: BriefTimelineItem) {
  if (item.date && item.endDate) return `${item.date} - ${item.endDate}`;
  return item.date || item.endDate || "TBD";
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function ContactPreview({ section, style }: { section: BriefSection; style: StyleSettings }) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;
  const cta = textValue(section, "call_to_action");

  return (
    <div className="border border-[var(--border-color)] bg-[var(--card-bg)] p-8 shadow-sm" style={{ borderRadius: "var(--radius-card)" }}>
      <div className="space-y-3 opacity-80">
        <p className="text-xl font-bold opacity-100 tracking-tight">
          {textValue(section, "contact_name") || copy.contactName}
        </p>
        <p className="text-[1.05em] font-medium">{textValue(section, "contact_email") || "email@example.com"}</p>
        <p className="text-[1.05em] underline decoration-[var(--border-color)] underline-offset-4">{textValue(section, "contact_link") || "https://example.com"}</p>
      </div>
      {cta ? (
        <div className="mt-8">
          <TagList items={[cta]} style={style} />
        </div>
      ) : null}
    </div>
  );
}

function ReferencesPreview({
  section,
  layout
}: {
  section: BriefSection;
  layout: LayoutSettings;
}) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;
  const links = linksValue(section).filter((link) => link.label || link.url);
  const images = imagesValue(section).filter((image) => image.src);
  const imageClass =
    layout.image_layout === "fullWidth"
      ? "grid-cols-1"
      : layout.image_layout === "inline"
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  if (!links.length && !images.length) {
    return <PlaceholderText />;
  }

  return (
    <div className="space-y-8">
      {links.length ? (
        <div className="space-y-3">
          {links.map((link) => (
            <p key={link.id} className="text-[1.05em]">
              <span className="font-semibold opacity-100">{link.label || copy.referenceLink}</span>
              <span className="ml-3 opacity-50">{link.url}</span>
            </p>
          ))}
        </div>
      ) : null}

      {images.length ? (
        <div className={`grid gap-6 ${imageClass}`}>
          {images.map((image) => (
            <figure key={image.id} className="space-y-3">
              <img
                src={image.src}
                alt={image.caption || copy.referenceImage}
                className="aspect-[4/3] w-full border border-[var(--border-color)] bg-[var(--card-bg-alt)] object-cover shadow-sm"
                style={{ borderRadius: "var(--radius-card)" }}
              />
              {image.caption ? (
                <figcaption className="text-sm font-medium opacity-50 text-center">{image.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TeamPreview({ section }: { section: BriefSection }) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;
  const members = teamValue(section).filter((member) => member.name || member.role);

  return (
    <TextStack values={[textValue(section, "roles"), textValue(section, "current_gaps")]}>
      {members.length ? (
        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          {members.map((member, index) => (
            <div key={`${member.id || "member"}_${index}`} className="flex items-center gap-5 border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_2px_10px_var(--shadow-color)]" style={{ borderRadius: "var(--radius-card)" }}>
              <div className="flex h-[3.5rem] w-[3.5rem] flex-shrink-0 items-center justify-center overflow-hidden bg-[var(--card-bg-alt)] border border-[var(--border-color)]" style={{ borderRadius: "var(--radius-full)" }}>
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 opacity-50" />
                )}
              </div>
              <div>
                <p className="text-[1.05em] font-bold opacity-100 tracking-tight leading-tight mb-1">{member.name || copy.memberName}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium opacity-80">{member.role || copy.memberRole}</p>
                  {member.raci_type ? (
                    <span className={`inline-flex items-center justify-center h-5 px-2 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${
                      member.raci_type === "responsible" ? "bg-blue-500/20 text-blue-300" :
                      member.raci_type === "accountable" ? "bg-red-500/20 text-red-300" :
                      member.raci_type === "consulted" ? "bg-amber-500/20 text-amber-300" :
                      "bg-emerald-500/20 text-emerald-300"
                    }`}>
                      {member.raci_type.charAt(0)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </TextStack>
  );
}

function FaqPreview({ section }: { section: BriefSection }) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).preview;
  const items = faqValue(section).filter((item) => item.question || item.answer);

  if (!items.length) {
    return <PlaceholderText />;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-sm" style={{ borderRadius: "var(--radius-card)" }}>
          <p className="text-[1.1rem] font-bold opacity-100 tracking-tight">{item.question || copy.question}</p>
          <p className="mt-3 leading-[1.6] opacity-80">{item.answer || copy.answer}</p>
        </div>
      ))}
    </div>
  );
}

function BudgetPreview({ section }: { section: BriefSection }) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).sectionEditor;
  const items = budgetValue(section);

  return (
    <TextStack values={[textValue(section, "total_budget"), textValue(section, "budget_notes")]}>
      {items.length ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-[0_2px_10px_var(--shadow-color)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--card-bg-alt)]">
              <tr>
                <th className="border-b border-[var(--border-color)] p-4 font-semibold opacity-80">{copy.budgetCategory}</th>
                <th className="border-b border-[var(--border-color)] p-4 font-semibold opacity-80">{copy.budgetAmount}</th>
                <th className="border-b border-[var(--border-color)] p-4 font-semibold opacity-80">{copy.budgetNote}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-medium opacity-100">{item.category}</td>
                  <td className="p-4 font-mono opacity-90">{item.amount}</td>
                  <td className="p-4 opacity-70">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </TextStack>
  );
}

function DecisionPreview({ section }: { section: BriefSection }) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).sectionEditor;
  const items = decisionValue(section);

  return (
    <TextStack values={[textValue(section, "decision_notes")]}>
      {items.length ? (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[var(--text-primary)] before:opacity-30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-mono">
                      {item.date}
                    </span>
                    <span className={`inline-flex h-5 items-center rounded-sm px-2 text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                      item.status === "rejected" ? "bg-red-500/20 text-red-400" :
                      "bg-amber-500/20 text-amber-400"
                    }`}>
                      {item.status === "approved" ? copy.decisionApproved : item.status === "rejected" ? copy.decisionRejected : copy.decisionPending}
                    </span>
                  </div>
                  <h4 className="text-[1.1rem] font-bold tracking-tight opacity-100">{item.decision}</h4>
                </div>
                {item.decided_by && (
                  <div className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--card-bg-alt)] px-3 py-1">
                    <User className="h-3.5 w-3.5 opacity-50" />
                    <span className="text-xs font-medium opacity-80">{item.decided_by}</span>
                  </div>
                )}
              </div>
              {item.rationale && (
                <p className="mt-3 text-[14px] leading-relaxed opacity-70 border-t border-[var(--border-color)] pt-3">
                  {item.rationale}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </TextStack>
  );
}
