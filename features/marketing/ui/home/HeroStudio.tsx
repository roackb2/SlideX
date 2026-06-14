"use client";

import { motion } from "framer-motion";
import {
  AlignLeft,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Hash,
  Image,
  LayoutTemplate,
  PaintBucket,
  Plus,
  RotateCcw,
  Sparkles,
  Type,
  Undo2
} from "lucide-react";
import type { Dictionary } from "@/common/lib/i18n";
import { springTransition } from "@/features/marketing/ui/home/homeMotion";

const toolIcons = [Type, Image, BarChart3, Sparkles];

// Mock color preset data matching the screenshot
const colorPresets = [
  { name: "Midnight", colors: ["bg-zinc-900", "bg-zinc-100", "bg-sky-400"] },
  { name: "Editorial", colors: ["bg-zinc-100", "bg-zinc-900", "bg-blue-500"] },
  { name: "Portfolio", colors: ["bg-zinc-800", "bg-zinc-200", "bg-orange-400"] },
  { name: "Sage", colors: ["bg-zinc-100", "bg-zinc-800", "bg-emerald-600"] },
  { name: "Plum", colors: ["bg-zinc-900", "bg-pink-50", "bg-pink-500"] },
  { name: "Steel", colors: ["bg-zinc-100", "bg-zinc-800", "bg-teal-600"] }
];

export function HeroStudio({ copy }: { copy: Dictionary["home"]["heroStudio"] }) {
  const tabs = copy.tabs;
  const header = copy.header;
  const inspector = copy.inspector;
  const canvas = copy.canvas;

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
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_10%,rgba(56,189,248,0.08),transparent_42%)] blur-2xl pointer-events-none" />

      {/* Main App Container with Chromatic Dispersion Glassmorphism */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.1),inset_-1px_0_2px_rgba(0,255,255,0.15),inset_1px_0_2px_rgba(255,0,255,0.15),inset_0_-1px_2px_rgba(255,255,0,0.1)] md:rounded-[28px] ring-1 ring-white/5 font-sans">
        
        {/* Top Header */}
        <div className="flex h-14 items-center justify-between border-b border-white/[0.04] px-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center text-[15px] font-bold tracking-wide text-zinc-100">
              Slide<span className="text-sky-500">X</span>
            </span>
            <div className="h-4 w-[1px] bg-white/[0.08]" />
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-400 border border-white/[0.02]">
              {header.untitled}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-[12px] font-medium text-zinc-400">
            <span className="hidden sm:block">{header.ready}</span>
            <button className="hidden sm:flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
              <Undo2 className="h-3.5 w-3.5" />
              {header.undo}
            </button>
            <button className="hidden sm:flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
              <RotateCcw className="h-3.5 w-3.5" />
              {header.replay}
            </button>
            <button className="flex h-8 items-center gap-2 rounded-lg bg-zinc-100 px-3.5 text-black hover:bg-white transition-colors ml-2 shadow-sm">
              <Download className="h-3.5 w-3.5" />
              <span className="font-semibold">{copy.export}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Workspace */}
        <div className="grid min-h-[400px] grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr_280px]">
          
          {/* Left Sidebar (hidden on sm) */}
          <aside className="hidden border-r border-white/[0.04] bg-[#0c0c0e] p-3 md:flex flex-col relative">
            
            {/* Tabs */}
            <div className="mb-4 flex items-center rounded-xl bg-[#141416] p-1 border border-white/[0.02]">
              <button className="flex-1 rounded-lg bg-[#222224] py-1.5 text-[12px] font-medium text-white shadow-sm ring-1 ring-white/5">
                {tabs.slides}
              </button>
              <button className="flex-1 rounded-lg py-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-300">
                {tabs.layers}
              </button>
            </div>

            {/* New Slide Button */}
            <button className="mb-6 flex w-full items-center justify-between rounded-xl border border-white/[0.04] bg-[#141416] p-2 text-left transition-colors hover:bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.04] text-zinc-300">
                  <Plus className="h-3 w-3" />
                </span>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-zinc-200">{copy.newSlide}</span>
                  <span className="text-[9px] text-zinc-500">Choose templates...</span>
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-500 mr-1" />
            </button>

            <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-semibold text-zinc-500 tracking-wider">
              <span>{copy.scenes}</span>
              <span className="text-zinc-600">1</span>
            </div>

            {/* Active Slide Thumbnail */}
            <div className="group relative aspect-video w-full overflow-hidden rounded-xl border-2 border-blue-500 bg-white ring-2 ring-blue-500/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#f0f9ff,transparent_50%)]" />
              <div className="absolute bottom-1 left-2 text-[10px] font-bold text-blue-500">1</div>
            </div>

            {/* Avatar bottom left */}
            <div className="absolute bottom-4 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#222] text-[10px] font-bold text-zinc-400 border border-white/[0.04]">
              N
            </div>
          </aside>

          {/* Center Canvas */}
          <main className="relative flex flex-col items-center overflow-hidden bg-[#0a0a0c] p-4 sm:p-6 pb-20">
            {/* Background Pattern */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Pagination */}
            <div className="mb-6 flex items-center gap-3 rounded-full bg-[#141416] px-3 py-1.5 text-[11px] font-medium text-zinc-400 border border-white/[0.02]">
              <ChevronLeft className="h-3 w-3 text-zinc-600" />
              <span className="text-zinc-200">{canvas.pagination}</span>
              <ChevronRight className="h-3 w-3 text-zinc-600" />
            </div>

            {/* Slide Paper */}
            <div className="relative aspect-video w-full max-w-[640px] overflow-hidden rounded-[12px] bg-[#f8fafc] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.005]">
              {/* Subtle Blue glow inside slide */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(224,242,254,0.6),transparent_60%)]" />
              
              <div className="relative z-10 flex h-full flex-col justify-center px-12 sm:px-16">
                <h2 className="mb-6 text-4xl sm:text-5xl font-bold tracking-tight text-slate-800 drop-shadow-sm">
                  {canvas.slideTitle}
                </h2>
                <p className="text-[15px] sm:text-[17px] leading-relaxed text-slate-500 font-medium">
                  {canvas.slideBody}
                </p>
              </div>
            </div>

            {/* Floating Toolbar Dock */}
            <div className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/[0.04] bg-[#222224] p-1.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,1)]">
              {toolButtons.map((tool) => (
                <button
                  key={tool.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
                  type="button"
                  aria-label={tool.label}
                >
                  <tool.icon className="h-4 w-4" strokeWidth={2} />
                </button>
              ))}
            </div>

            {/* Timeline at the very bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#141416] border-t border-white/[0.02]">
              <div className="h-full w-1/3 bg-blue-600/50 relative">
                <div className="absolute right-0 top-0 h-full w-[2px] bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              </div>
            </div>
          </main>

          {/* Right Inspector Sidebar (hidden on sm and md) */}
          <aside className="hidden flex-col border-l border-white/[0.04] bg-[#0c0c0e] p-4 lg:flex font-sans overflow-y-auto custom-scrollbar">
            
            {/* Inspector Tabs */}
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.04] pb-2 text-[10px] font-bold tracking-wider uppercase">
              <span className="text-zinc-400">{inspector.properties}</span>
              <button className="flex items-center gap-1.5 rounded-md bg-[#1a1a1c] px-2 py-1 text-zinc-300 border border-white/[0.04]">
                <Sparkles className="h-3 w-3" />
                {inspector.mdxEditor}
              </button>
            </div>

            {/* Add New Slide Component */}
            <div className="mb-6 flex items-center justify-between rounded-xl border border-white/[0.04] bg-[#141416] p-2.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-11 rounded border border-white/[0.08] bg-white flex items-center justify-center shadow-inner">
                  <div className="h-1 w-4 bg-zinc-300 rounded-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 uppercase font-semibold">{inspector.addNewSlide}</span>
                  <span className="text-[11px] font-medium text-zinc-200">{inspector.slideTemplateName}</span>
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </div>

            {/* Background Section */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-zinc-300">
                  <LayoutTemplate className="h-3.5 w-3.5 text-blue-500" />
                  {inspector.background}
                </div>
                <ChevronDown className="h-3 w-3 text-zinc-600" />
              </div>
              
              <div className="mb-2 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                {inspector.backgroundType}
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#141416] p-1 border border-white/[0.02]">
                <button className="flex-1 flex justify-center items-center rounded-md bg-[#222224] py-1.5 text-zinc-300 shadow-sm ring-1 ring-white/5">
                  <PaintBucket className="h-3.5 w-3.5" />
                </button>
                <button className="flex-1 flex justify-center items-center rounded-md py-1.5 text-zinc-600 hover:text-zinc-400">
                  <Hash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Color Presets */}
            <div className="mb-6">
              <div className="mb-3 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                {inspector.colorPresets}
              </div>
              <div className="space-y-1.5">
                {colorPresets.map((preset) => (
                  <div key={preset.name} className="flex items-center justify-between group cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/[0.02]">
                    <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200">{preset.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex h-4 w-12 overflow-hidden rounded border border-white/[0.08]">
                        <div className={`w-1/3 ${preset.colors[0]}`} />
                        <div className={`w-1/3 border-l border-white/10 ${preset.colors[1]}`} />
                        <div className={`w-1/3 border-l border-white/10 ${preset.colors[2]}`} />
                      </div>
                      <span className="flex h-5 items-center rounded bg-[#141416] px-1.5 text-[9px] font-semibold text-zinc-500 border border-white/[0.02]">
                        {inspector.all}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-0 border-t border-white/[0.04]">
              <div className="flex items-center justify-between py-3 border-b border-white/[0.02] cursor-pointer hover:bg-white/[0.01]">
                <span className="text-[11px] font-medium text-zinc-300">{inspector.themeColors}</span>
                <span className="text-[9px] text-zinc-600">Show</span>
              </div>
              <div className="flex items-center justify-between py-3 cursor-pointer hover:bg-white/[0.01]">
                <span className="text-[11px] font-medium text-zinc-300">{inspector.savedSwatches}</span>
                <span className="text-[9px] text-zinc-600">Show</span>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </motion.div>
  );
}


