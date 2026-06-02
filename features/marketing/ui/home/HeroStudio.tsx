"use client";

import { motion } from "framer-motion";
import { AlignLeft, BarChart3, CreditCard, Image, MousePointerClick, Plus, Type } from "lucide-react";
import type { Dictionary } from "@/common/lib/i18n";
import { easeSmooth } from "@/features/marketing/ui/home/homeMotion";

const toolIcons = [Type, AlignLeft, CreditCard, BarChart3, Image, MousePointerClick];
const layerIcons = [Type, AlignLeft, BarChart3, CreditCard];

export function HeroStudio({ copy }: { copy: Dictionary["home"]["heroStudio"] }) {
  const layers = copy.layers.map((label, index) => ({
    icon: layerIcons[index] ?? Type,
    label,
    active: index === 0
  }));

  const toolButtons = copy.toolLabels.map((label, index) => ({
    icon: toolIcons[index] ?? Type,
    label
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 42, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: easeSmooth }}
      className="relative"
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_70%_10%,rgba(142,165,255,0.18),transparent_42%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#0b0d14]/[0.92] shadow-2xl shadow-black/50 md:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-white/[0.1] bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#8ea5ff]" />
            <span className="text-sm font-semibold text-white">{copy.title}</span>
            <span className="hidden text-xs text-neutral-500 sm:inline">{copy.project}</span>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
            {copy.export}
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

          <div className="relative flex min-h-[300px] flex-col overflow-hidden bg-[#05060a] sm:min-h-[360px]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_38%_22%,rgba(142,165,255,0.15),transparent_32%)]" />

            <div className="relative z-10 flex items-center justify-center px-5 pb-16 pt-8 sm:px-8 md:px-10 md:pt-12">
              <div className="aspect-video w-full max-w-[580px] overflow-hidden rounded-[22px] border border-white/[0.12] bg-black shadow-2xl shadow-black/70">
                <div className="relative flex h-full flex-col justify-center p-6 sm:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(142,165,255,0.18),transparent_42%)]" />
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
                          transition={{ delay: 0.8 + index * 0.12, duration: 0.6, ease: easeSmooth }}
                          className="w-5 rounded-t-md bg-[#8ea5ff]/[0.7]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/[0.12] bg-[#0b0d14]/[0.9] p-1 shadow-xl backdrop-blur-xl">
              {toolButtons.map((tool) => (
                <button
                  key={tool.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
                  type="button"
                  aria-label={tool.label}
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
