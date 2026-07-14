"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Download, FileCode2, Globe2, Lock, Presentation, Upload, X } from "lucide-react";

export type ExportFormat = "html" | "mdx" | "pptx";

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, filename: string) => Promise<void> | void;
  onImport: (file: File) => Promise<void>;
  documentTitle: string;
  isExporting: boolean;
  initialMode?: "export" | "import";
  lockedFormats?: readonly ExportFormat[];
  onLockedFormat?: (format: ExportFormat) => void;
};

type ExportOption = {
  description: string;
  ext: string;
  icon: typeof Presentation;
  id: ExportFormat;
  label: string;
};

const formatOptions = [
  {
    id: "pptx",
    label: "Editable PPTX",
    ext: ".pptx",
    description: "Opens in PowerPoint, Keynote, and Google Slides. Filtered images export as movable PNG objects; other native content stays editable.",
    icon: Presentation
  },
  {
    id: "html",
    label: "Interactive HTML",
    ext: ".html",
    description: "Self-contained playback with motion and shaders.",
    icon: Globe2
  },
  {
    id: "mdx",
    label: "MDX source",
    ext: ".mdx",
    description: "Editable source for continuing the project in code.",
    icon: FileCode2
  }
] satisfies ExportOption[];

const actionTabs = [
  { id: "import", icon: Upload, label: "Import" },
  { id: "export", icon: Download, label: "Export" }
] as const;

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  onImport,
  documentTitle,
  isExporting,
  initialMode = "export",
  lockedFormats = [],
  onLockedFormat
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pptx");
  const [mode, setMode] = useState<"export" | "import">("export");
  const [filename, setFilename] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    if (lockedFormats.includes(selectedFormat)) {
      onLockedFormat?.(selectedFormat);
      return;
    }
    const finalFilename = filename.trim() || documentTitle || "slidesx-deck";
    setErrorMessage("");

    try {
      await onExport(selectedFormat, finalFilename);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Export failed");
    }
  }, [documentTitle, filename, isExporting, lockedFormats, onExport, onLockedFormat, selectedFormat]);

  const handleImport = useCallback(async (file: File) => {
    setErrorMessage("");
    setIsImporting(true);
    try {
      await onImport(file);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  }, [onClose, onImport]);

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setFilename(documentTitle || "slidesx-deck");
    setErrorMessage("");
  }, [documentTitle, initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      if (mode === "export") inputRef.current?.select();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "Enter" && mode === "export" && !isExporting) {
        event.preventDefault();
        void handleExport();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExport, isExporting, isOpen, mode, onClose]);

  if (!isOpen) return null;

  const selectedOption = formatOptions.find((option) => option.id === selectedFormat) ?? formatOptions[0];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/72 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="export-dialog-title"
        aria-modal="true"
        className="w-full max-w-[560px] overflow-hidden rounded-t-[1.5rem] border border-white/[0.1] bg-[#111214] shadow-[0_30px_100px_rgba(0,0,0,0.52)] sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex items-start justify-between border-b border-white/[0.08] px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-white" id="export-dialog-title">Presentation file</h2>
            <p className="mt-1 text-[13px] leading-5 text-neutral-500">Bring a deck in or prepare it for sharing.</p>
          </div>
          <button
            aria-label="Close export dialog"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </header>

        <div className="border-b border-white/[0.08] px-4 py-3 sm:px-6">
          <div className="grid grid-cols-2 rounded-xl bg-black/30 p-1" role="tablist" aria-label="Presentation file action">
            {actionTabs.map((item) => {
              const Icon = item.icon;
              return (
              <button
                aria-selected={mode === item.id}
                className={`flex h-10 items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition ${mode === item.id ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300"}`}
                key={item.id}
                onClick={() => { setMode(item.id); setErrorMessage(""); }}
                role="tab"
                type="button"
              >
                <Icon size={15} />
                {item.label}
              </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[min(66dvh,620px)] overflow-y-auto px-4 py-4 sm:max-h-[min(72dvh,620px)] sm:px-6 sm:py-5">
          {mode === "export" ? <>
          <p className="mb-3 text-[12px] font-semibold text-neutral-400">Format</p>
          <div className="overflow-hidden rounded-lg border border-white/[0.08]">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              const isLocked = lockedFormats.includes(option.id);
              const isActive = !isLocked && selectedFormat === option.id;

              return (
                <button
                  aria-label={isLocked ? `${option.label}. Sign in required` : option.label}
                  aria-pressed={isActive}
                  className={`flex w-full items-center gap-3 border-b border-white/[0.07] px-4 py-3.5 text-left transition-colors last:border-b-0 ${
                    isActive ? "bg-[#9ad7ff]/10" : isLocked ? "bg-white/[0.01] hover:bg-white/[0.035]" : "bg-white/[0.015] hover:bg-white/[0.04]"
                  }`}
                  key={option.id}
                  onClick={() => {
                    if (isLocked) {
                      onLockedFormat?.(option.id);
                      return;
                    }
                    setSelectedFormat(option.id);
                  }}
                  type="button"
                >
                  <Icon className={isActive ? "text-[#9ad7ff]" : isLocked ? "text-neutral-600" : "text-neutral-500"} size={18} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className={`text-[14px] font-semibold ${isActive ? "text-white" : isLocked ? "text-neutral-500" : "text-neutral-300"}`}>{option.label}</span>
                      <span className="font-mono text-[10px] text-neutral-600">{option.ext}</span>
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-neutral-500">
                      {isLocked ? "Sign in required. " : ""}{option.description}
                    </span>
                  </span>
                  {isLocked ? (
                    <Lock aria-hidden="true" className="shrink-0 text-neutral-500" size={15} />
                  ) : (
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isActive ? "border-[#9ad7ff] bg-[#9ad7ff] text-[#08131a]" : "border-white/[0.12] text-transparent"}`}>
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <label className="mt-5 block text-[12px] font-semibold text-neutral-400" htmlFor="export-filename">Filename</label>
          <div className="mt-2 flex h-11 items-center overflow-hidden rounded-lg border border-white/[0.1] bg-black/20 focus-within:border-[#9ad7ff]/50 focus-within:ring-1 focus-within:ring-[#9ad7ff]/20">
            <input
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-white outline-none placeholder:text-neutral-600"
              id="export-filename"
              onChange={(event) => setFilename(event.target.value)}
              placeholder="slidesx-deck"
              ref={inputRef}
              spellCheck={false}
              type="text"
              value={filename}
            />
            <span className="pr-3 font-mono text-[11px] text-neutral-600">{selectedOption.ext}</span>
          </div>
          </> : <div>
            <input
              accept=".html,.mdx,text/html,text/markdown"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void handleImport(file);
              }}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="flex min-h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.14] bg-white/[0.015] px-6 text-center transition-colors hover:border-white/[0.28] hover:bg-white/[0.035] focus-visible:outline focus-visible:outline-1 focus-visible:outline-white"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Upload className="mb-3 text-neutral-400" size={20} />
              <span className="text-[14px] font-semibold text-white">{isImporting ? "Importing…" : "Choose an MDX or HTML file"}</span>
              <span className="mt-1.5 max-w-xs text-[12px] leading-5 text-neutral-500">MDX opens directly. SlideX HTML restores its embedded editable source.</span>
            </button>
          </div>}
          {errorMessage ? <p className="mt-3 rounded-md border border-red-400/20 bg-red-400/[0.06] px-3 py-2.5 text-[12px] leading-5 text-red-200" role="alert">{errorMessage}</p> : null}
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-white/[0.08] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:py-4">
          <p className="hidden text-[11px] text-neutral-600 sm:block">Esc to close</p>
          <div className="ml-auto flex items-center gap-2">
            <button className="h-10 rounded-md px-4 text-[13px] font-semibold text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white" onClick={onClose} type="button">Cancel</button>
            {mode === "export" ? <button
              className="inline-flex h-10 min-w-28 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#f4f4f1] px-4 text-[13px] font-semibold text-[#0b0c0f] transition-colors hover:bg-white active:translate-y-px disabled:cursor-wait disabled:opacity-55"
              disabled={isExporting}
              onClick={() => void handleExport()}
              type="button"
            >
              <Download size={14} />
              {isExporting ? "Exporting" : "Export"}
            </button> : null}
          </div>
        </footer>
      </section>
    </div>
  );
}
