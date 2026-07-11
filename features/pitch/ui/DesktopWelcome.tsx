"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LayoutTemplate, FilePlus, ArrowRight, ChevronLeft, Upload } from "lucide-react";
import {
  getTemplateChooserItemsForCategory,
} from "@/core/motion-doc/presets/templateChooser";
import type { NewPitchProjectOptions } from "@/features/pitch/ui/hooks/usePitchProject";
import {
  CompactTemplateCard,
  LabeledTemplateCard,
} from "@/features/pitch/ui/welcome/TemplateChooserCards";

type DesktopWelcomeProps = {
  importPitchFile: (file: File) => Promise<void>;
  newProject: (options?: NewPitchProjectOptions) => void;
};

export function DesktopWelcome({ importPitchFile, newProject }: DesktopWelcomeProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [projectType, setProjectType] = useState<"blank" | "deck" | null>(null);
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const visibleItems = useMemo(() => getTemplateChooserItemsForCategory("all"), []);
  const deckItems = visibleItems.filter((item) => item.kind === "deck");
  const blankItems = visibleItems.filter((item) => item.kind === "blank");

  function createFullTemplate(templateId: string, name: string, source: string) {
    newProject({
      name: "Untitled",
      notice: `${name} template loaded`,
      source,
      templateId
    });
  }

  function handleTypeSelection(type: "blank" | "deck") {
    setProjectType(type);
    setStep(3);
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 40 : -40,
      opacity: 0,
    })
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050505] text-white overflow-hidden">
      <div className="relative flex w-full max-w-3xl flex-col items-center">
        
        <AnimatePresence mode="wait" custom={1}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center gap-8 px-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-white/10 shadow-2xl">
                <Sparkles className="text-white" size={40} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-4">Welcome to SlideX</h1>
                <p className="text-lg text-[#a0a0a0] max-w-md mx-auto leading-relaxed">
                  The modern way to author dynamic, code-driven presentations.
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="group mt-4 flex items-center gap-3 rounded-full bg-white text-black px-8 py-4 font-bold text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer"
              >
                Let&apos;s get started
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
              <div className="flex flex-col items-center gap-2">
                <input
                  accept=".html,.mdx,text/html,text/markdown"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;

                    setImportError("");
                    setIsImporting(true);
                    void importPitchFile(file)
                      .catch((error) => setImportError(error instanceof Error ? error.message : "Import failed"))
                      .finally(() => setIsImporting(false));
                  }}
                  ref={importInputRef}
                  type="file"
                />
                <button
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-white/[0.12] px-4 text-[14px] font-semibold text-white/66 transition-colors hover:border-white/25 hover:text-white disabled:cursor-wait disabled:opacity-50"
                  disabled={isImporting}
                  onClick={() => importInputRef.current?.click()}
                  type="button"
                >
                  <Upload size={16} />
                  {isImporting ? "Importing" : "Import MDX or HTML"}
                </button>
                {importError ? <p className="max-w-sm text-center text-[12px] leading-5 text-red-300" role="alert">{importError}</p> : null}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col gap-10 px-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-3">How would you like to start?</h2>
                <p className="text-[#888]">Choose a path for your new project.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                {/* Blank Option */}
                <button
                  onClick={() => handleTypeSelection("blank")}
                  className="group flex flex-col items-center text-center gap-4 rounded-3xl bg-[#111111] border border-white/10 p-8 transition-all hover:bg-[#151515] hover:border-white/20 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="rounded-2xl bg-white/5 p-4 text-[#8ea5ff] transition-transform group-hover:scale-110">
                    <FilePlus size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Start from Scratch</h3>
                    <p className="text-sm text-[#888]">Begin with a clean layout and build your story step by step.</p>
                  </div>
                </button>

                {/* Template Option */}
                <button
                  onClick={() => handleTypeSelection("deck")}
                  className="group flex flex-col items-center text-center gap-4 rounded-3xl bg-[#111111] border border-white/10 p-8 transition-all hover:bg-[#151515] hover:border-white/20 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="rounded-2xl bg-white/5 p-4 text-[#5eead4] transition-transform group-hover:scale-110">
                    <LayoutTemplate size={36} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Use a Template</h3>
                    <p className="text-sm text-[#888]">Save time with our professionally designed premium themes.</p>
                  </div>
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm font-medium text-[#666] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col gap-8 px-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">
                    {projectType === "blank" ? "Choose a Layout" : "Choose a Template"}
                  </h2>
                  <p className="text-sm text-[#888]">
                    {projectType === "blank" 
                      ? "Select a structural starting point for your blank deck." 
                      : "Pick the design theme that best fits your presentation."}
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-medium text-[#888] hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              </div>

              <div className="w-full max-w-4xl mx-auto max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                {projectType === "blank" ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {blankItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <LabeledTemplateCard
                          item={item}
                          onSelect={() => createFullTemplate("templateId" in item ? item.templateId as string : item.id, item.name, item.blankSource)}
                          selected={false}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {deckItems.map((item) => (
                      <div key={item.id} className="flex flex-col gap-3 group">
                        <CompactTemplateCard
                          item={item}
                          onSelect={() => createFullTemplate(item.templateId!, item.name, item.source)}
                          selected={false}
                        />
                        <div className="px-2">
                          <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                          <p className="text-[11px] text-[#888] mt-1">{item.slideCount} slides</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
