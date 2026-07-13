"use client";

import { useRef, useState } from "react";
import { FileUp, Play, Presentation } from "lucide-react";
import type { NewPitchProjectOptions } from "@/features/pitch/ui/hooks/usePitchProject";

type MobilePitchWelcomeProps = {
  importPitchFile: (file: File) => Promise<void>;
  newProject: (options?: NewPitchProjectOptions) => void;
};

export function MobilePitchWelcome({ importPitchFile, newProject }: MobilePitchWelcomeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  return (
    <main className="flex min-h-[100dvh] flex-col justify-between bg-[#070707] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
      <div className="flex items-center gap-2 text-sm font-semibold"><Presentation size={18} />SlideX Preview</div>
      <section className="py-10">
        <p className="text-sm font-medium text-[#9ad7ff]">Mobile presentation viewer</p>
        <h1 className="mt-3 max-w-sm text-4xl font-semibold leading-[1.02] tracking-[-0.045em]">Review your deck anywhere.</h1>
        <p className="mt-4 max-w-sm text-[15px] leading-6 text-neutral-400">Import a SlideX presentation, swipe through slides, and leave notes for later.</p>
        <input
          accept=".html,.mdx,text/html,text/markdown"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setError("");
            setIsImporting(true);
            void importPitchFile(file)
              .catch((importError) => setError(importError instanceof Error ? importError.message : "Import failed"))
              .finally(() => setIsImporting(false));
          }}
          ref={inputRef}
          type="file"
        />
        <button
          className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-black active:scale-[0.98] disabled:opacity-50"
          disabled={isImporting}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <FileUp size={18} />{isImporting ? "Importing" : "Import HTML or MDX"}
        </button>
        <button
          className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] text-sm font-semibold text-neutral-200 active:scale-[0.98]"
          onClick={() => newProject({ notice: "Preview sample opened" })}
          type="button"
        >
          <Play size={17} />Preview sample deck
        </button>
        {error ? <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3 text-xs leading-5 text-red-200">{error}</p> : null}
      </section>
      <p className="text-xs leading-5 text-neutral-600">Editing remains available on desktop.</p>
    </main>
  );
}
