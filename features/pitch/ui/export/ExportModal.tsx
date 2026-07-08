"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { X, FileCode2, FileText, Download, Check } from "lucide-react";

export type ExportFormat = "html" | "mdx";

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, filename: string) => void;
  documentTitle: string;
  isExporting: boolean;
};

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  ext: string;
  description: string;
  icon: typeof FileText;
}[] = [
  {
    id: "html",
    label: "HTML",
    ext: ".html",
    description: "Self-contained interactive presentation with animations & shaders",
    icon: FileText
  },
  {
    id: "mdx",
    label: "MDX",
    ext: ".mdx",
    description: "Raw MDX source for editing in code editors",
    icon: FileCode2
  }
];

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  documentTitle,
  isExporting
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("html");
  const [filename, setFilename] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(() => {
    if (isExporting) return;
    const finalFilename = filename.trim() || documentTitle || "slidesx-deck";
    onExport(selectedFormat, finalFilename);
  }, [isExporting, filename, documentTitle, selectedFormat, onExport]);

  // Sync filename with document title when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilename(documentTitle || "slidesx-deck");
      // Focus the filename input after a brief delay for the animation
      const timer = setTimeout(() => inputRef.current?.select(), 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen, documentTitle]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Enter" && !isExporting) {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isExporting, handleExport]);

  // Click outside to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]"
      onClick={handleBackdropClick}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) {
          e.stopPropagation();
        }
      }}
    >
      <div
        ref={modalRef}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] mx-4 rounded-2xl border border-white/[0.08] bg-neutral-950/95 backdrop-blur-2xl shadow-2xl shadow-black/80 animate-[modal-pop_0.25s_cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Download size={16} />
            </div>
            <h2 className="text-[15px] font-bold text-white tracking-tight">Export Presentation</h2>
          </div>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-white"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Format Selection */}
        <div className="px-6 pb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2.5">
            Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map((fmt) => {
              const isActive = selectedFormat === fmt.id;
              const Icon = fmt.icon;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`group relative flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-violet-500/50 bg-violet-500/[0.06] ring-1 ring-violet-500/20"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive ? "bg-violet-500/15 text-violet-400" : "bg-white/[0.04] text-neutral-500 group-hover:text-neutral-300"
                    }`}
                  >
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[13px] font-semibold transition-colors ${
                          isActive ? "text-violet-300" : "text-neutral-300 group-hover:text-white"
                        }`}
                      >
                        {fmt.label}
                      </span>
                      <span className="text-[10px] font-medium text-neutral-600">{fmt.ext}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] leading-snug text-neutral-500 line-clamp-2">
                      {fmt.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-white">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filename Input */}
        <div className="px-6 pb-3">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
            Filename
          </label>
          <div className="flex items-center gap-0 rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="slidesx-deck"
              className="flex-1 bg-transparent px-3 py-2 text-[13px] text-white placeholder:text-neutral-600 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="pr-3 text-[12px] font-medium text-neutral-600 select-none">
              {FORMAT_OPTIONS.find((f) => f.id === selectedFormat)?.ext}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-white/[0.04] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-[13px] font-semibold text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-[13px] font-bold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-500 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Exporting…
              </>
            ) : (
              <>
                <Download size={14} />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-pop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
