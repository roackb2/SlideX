"use client";

import { motion } from "framer-motion";
import { AlignLeft, BarChart3, CreditCard, Image, MousePointerClick, Plus, Sparkles, Type } from "lucide-react";
import type { Dictionary } from "@/common/lib/i18n";
import { springTransition } from "@/features/marketing/ui/home/homeMotion";

const toolIcons = [Type, Image, BarChart3, Sparkles];
const layerIcons = [Type, AlignLeft, BarChart3, CreditCard];

export function HeroStudio({ copy }: { copy: Dictionary["home"]["heroStudio"] }) {
  const layers = copy.layers.map((label, index) => ({
    icon: layerIcons[index] ?? Type,
    label,
    active: index === 0
  }));

  const toolButtons = copy.toolLabels.slice(0, 4).map((label, index) => ({
    icon: toolIcons[index] ?? Type,
    label
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 42, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, ...springTransition }}
      className="relative"
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_70%_10%,rgba(0,112,243,0.12),transparent_42%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#0b0d14]/[0.92] shadow-2xl shadow-black/50 md:rounded-[28px] pb-2">
        <div className="mx-4 mt-4 mb-2 flex items-center justify-between rounded-[2rem] border border-white/[0.06] bg-[#050505]/45 px-4 py-2.5 backdrop-blur-[32px] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_20px_40px_-10px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center text-sm font-semibold tracking-tight text-white">
              <span className="mr-2 h-2 w-2 rounded-full bg-[#0070f3]" />
              {copy.title}
            </span>
            <div className="hidden h-3.5 w-[1px] bg-white/[0.08] sm:block mx-1" />
            <span className="hidden max-w-[180px] truncate whitespace-nowrap rounded-xl bg-neutral-900/40 px-3 py-1 text-[13px] font-medium tracking-wide text-neutral-300 sm:block border border-white/[0.04] shadow-inner">
              {copy.project}
            </span>
          </div>
          <span className="flex h-7 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-black shadow-md shadow-white/[0.01]">
            <span className="hidden sm:inline">{copy.export}</span>
          </span>
        </div>

        <div className="grid min-h-[300px] grid-cols-1 sm:min-h-[360px] md:grid-cols-[164px_1fr] lg:min-h-[430px]">
          <aside className="hidden border-r border-white/[0.1] bg-black/20 p-3 md:block">
            <button className="mb-4 flex w-full items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-left text-xs font-medium text-neutral-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                <Plus className="h-3.5 w-3.5" />
              </span>
              {copy.newSlide}
            </button>

            <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-neutral-500">
              <span>{copy.scenes}</span>
              <span className="font-mono">4</span>
            </div>

            <div className="space-y-1">
              {copy.slides.map((slide, index) => (
                <div
                  key={slide}
                  className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs ${
                    index === 0 ? "bg-white/[0.08] text-white" : "text-neutral-500"
                  }`}
                >
                  <span>{slide}</span>
                  <span className="font-mono">0{index + 1}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-1 border-l border-white/[0.1] pl-3">
              {layers.map((layer) => (
                <div
                  key={layer.label}
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs ${
                    layer.active
                      ? "border border-white/[0.1] bg-white/[0.08] text-white"
                      : "text-neutral-500"
                  }`}
                >
                  <layer.icon className="h-3.5 w-3.5" />
                  <span className="truncate">{layer.label}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="relative flex min-h-[300px] flex-col overflow-hidden bg-[#05060a] sm:min-h-[360px] rounded-2xl mx-2 md:ml-0 border border-white/5 shadow-inner">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_38%_22%,rgba(0,112,243,0.12),transparent_32%)]" />

            <div className="relative z-10 flex items-center justify-center px-5 pb-16 pt-8 sm:px-8 md:px-10 md:pt-12">
              <div className="aspect-video w-full max-w-[580px] overflow-hidden rounded-[22px] border border-white/[0.12] bg-black shadow-2xl shadow-black/70">
                <div className="relative flex h-full flex-col justify-center p-6 sm:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,112,243,0.12),transparent_42%)]" />
                  <div className="relative z-10 max-w-[320px]">
                    <div className="mb-4 flex items-center gap-2 text-xs text-neutral-500">
                      <span>{copy.sceneLabel}</span>
                      <span className="h-px flex-1 bg-white/[0.12]" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
                      {copy.slideTitle}
                    </h3>
                    <p className="mb-5 text-sm leading-relaxed text-neutral-400">
                      {copy.slideBody}
                    </p>
                    <div className="flex h-16 items-end gap-2">
                      {[42, 58, 72, 92].map((height, index) => (
                        <motion.span
                          key={height}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.8 + index * 0.12, ...springTransition }}
                          className="w-5 rounded-t-md bg-[#0070f3]/[0.85]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border border-white/[0.04] bg-neutral-950/60 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:bottom-5 md:bottom-7">
              {toolButtons.map((tool) => (
                <button
                  key={tool.label}
                  className="group relative flex h-8 w-8 cursor-pointer flex-col items-center justify-center overflow-visible rounded-lg text-neutral-400 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.06] hover:bg-white/[0.03] hover:text-white active:scale-[0.93] sm:h-9.5 sm:w-9.5 md:h-10.5 md:w-10.5"
                  type="button"
                  aria-label={tool.label}
                >
                  <tool.icon className="scale-80 sm:scale-95 md:scale-105" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

