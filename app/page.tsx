"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Layers,
  Type,
  AlignLeft,
  Layout,
  MousePointer,
  Keyboard,
  ChevronRight,
  Zap,
  Palette,
  Eye,
  Download,
  Plus,
  ChevronDown,
  Trash2,
  Image,
  BarChart3,
  CreditCard,
  MousePointerClick,
  Code2,
  FileCode2,
  FileText,
  Film,
  Timer,
  Sparkles
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { motionTemplates } from "@/lib/templates";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: easeSmooth }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

function AnimatedSection({
  children,
  className = "",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay, ease: easeSmooth }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Studio Interface Mockup (matches real Studio layout) ─── */
function StudioMockup() {
  const slides = [
    { title: "Growth Investment Memo", duration: 5, active: true },
    { title: "Decision Summary", duration: 5, active: false },
    { title: "Market Inflection", duration: 5, active: false },
    { title: "Revenue Momentum", duration: 5, active: false },
  ];

  const layers = [
    { type: "Title", label: "Growth Investment Memo", icon: Type },
    { type: "Text", label: "Supporting narrative", icon: AlignLeft },
    { type: "Chart", label: "Quarterly traction", icon: BarChart3 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.4, ease: easeSmooth }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Glow behind */}
      <div className="absolute -inset-8 bg-gradient-to-b from-[#5e6ad2]/10 via-transparent to-transparent rounded-3xl blur-2xl pointer-events-none" />

      <div className="relative rounded-xl border border-white/[0.10] bg-[#0a0a0a] overflow-hidden shadow-2xl shadow-black/60">
        {/* Header bar — matches StudioHeader */}
        <div className="flex items-center justify-between border-b border-white/[0.10] bg-[#111118] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-tight text-white">Studio</span>
            <div className="h-3 w-px bg-white/[0.08]" />
            <span className="text-[10px] text-neutral-400">Project Alpha</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-neutral-400">Ready</span>
            <span className="rounded bg-white px-2.5 py-1 text-[10px] font-semibold text-black">Export</span>
          </div>
        </div>

        {/* Body: Sidebar + Canvas */}
        <div className="flex flex-col md:flex-row min-h-[280px] md:min-h-[420px]">
          {/* Mobile scenes strip — shown only on small screens */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto border-b border-white/[0.10] bg-[#0a0a0a] px-3 py-2">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ${slide.active ? "bg-white/[0.08] text-white border border-white/[0.1]" : "text-neutral-400 border border-transparent"}`}
              >
                <Layers size={11} className={slide.active ? "text-white" : "text-neutral-400"} />
                <span className="text-[10px] font-medium whitespace-nowrap">Slide {idx + 1}</span>
                <span className="font-mono text-[9px] text-neutral-400">{slide.duration}s</span>
              </div>
            ))}
          </div>

          {/* Left Sidebar — desktop only */}
          <div className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-white/[0.10] bg-[#0a0a0a]">
            {/* Sidebar header */}
            <div className="flex items-center justify-between border-b border-white/[0.10] px-3 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Layers</span>
              <span className="font-mono text-[10px] text-neutral-400">4 scenes</span>
            </div>

            <div className="flex-1 overflow-hidden p-2">
              {/* New slide button */}
              <div className="mb-3 flex items-center gap-2.5 rounded-md border border-white/[0.10] bg-white/[0.08] p-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-white text-black">
                  <Plus size={14} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold text-neutral-300">New slide</span>
                  <span className="text-[9px] text-neutral-400">Choose a template</span>
                </div>
                <ChevronDown size={12} className="ml-auto text-neutral-400" />
              </div>

              {/* Scenes label */}
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400">Scenes</span>
                <span className="font-mono text-[9px] text-neutral-500">4</span>
              </div>

              {/* Slide list */}
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`mb-0.5 flex items-center justify-between rounded-md px-2 py-1.5 ${slide.active ? "bg-white/[0.08] text-white" : "text-neutral-400 hover:bg-white/[0.07]"}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Layers size={12} className={slide.active ? "text-white" : "text-neutral-400"} />
                    <span className="truncate text-[11px] font-medium">Slide {idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-neutral-400">{slide.duration}s</span>
                    {idx > 0 && <Trash2 size={11} className="text-neutral-500" />}
                  </div>
                </div>
              ))}

              {/* Active slide layers */}
              <div className="ml-3 mt-2 flex flex-col gap-1 border-l border-white/[0.10] pl-2">
                {layers.map((layer, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${idx === 0 ? "bg-white/[0.08] border border-white/[0.10]" : ""}`}
                  >
                    <layer.icon size={12} className={idx === 0 ? "text-white" : "text-neutral-400"} />
                    <span className={`truncate text-[10px] ${idx === 0 ? "text-white font-medium" : "text-neutral-400"}`}>
                      {layer.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Canvas — matches PreviewCanvas */}
          <div className="flex-1 relative flex flex-col bg-[#050505] min-h-[220px] md:min-h-0">
            {/* Subtle grid background */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            {/* Top nav bar */}
            <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-md border border-white/[0.12] bg-[#0a0a0a] p-0.5 shadow-sm">
              <button className="rounded p-1 text-neutral-400">
                <svg fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="12"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="flex min-w-[40px] items-center justify-center px-2 py-0.5">
                <span className="font-mono text-[10px] font-medium text-neutral-300">
                  1 <span className="text-neutral-400">/</span> 4
                </span>
              </div>
              <button className="rounded p-1 text-neutral-400">
                <svg fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="12"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            {/* Canvas content */}
            <div className="flex flex-1 items-start justify-center overflow-hidden p-3 pt-10 pb-14 md:p-6 md:pt-12 md:pb-16">
              <div className="relative aspect-video w-full max-w-lg overflow-hidden bg-black shadow-xl ring-1 ring-white/[0.08]">
                {/* Slide content inside canvas */}
                <div className="absolute inset-0 flex flex-col justify-center p-4 md:p-8">
                  <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: "radial-gradient(circle at 30% 20%, rgba(94,106,210,0.1), transparent 50%)" }} />
                  <div className="relative z-10">
                    <div className="mb-2 md:mb-3 flex items-center gap-2">
                      <span className="text-[8px] md:text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Slide 01</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
                    </div>
                    <h3 className="text-sm md:text-xl font-semibold text-white mb-1.5 md:mb-2 tracking-tight">Growth Investment Memo</h3>
                    <p className="text-[10px] md:text-xs text-neutral-400 leading-relaxed max-w-[200px] md:max-w-[240px] mb-3 md:mb-5">
                      A boardroom-ready narrative for framing the decision, sizing the opportunity, and aligning the next operating move.
                    </p>
                    <div className="flex items-end gap-1 md:gap-1.5 mb-3 md:mb-4 h-7 md:h-10">
                      {[38, 52, 71, 94].map((h, i) => (
                        <div key={i} className="w-3 md:w-4 rounded-sm bg-white/[0.08] relative overflow-hidden" style={{ height: `${h}%` }}>
                          <div className="absolute bottom-0 left-0 right-0 rounded-sm bg-white/[0.18]" style={{ height: `${h * 0.6}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5">
                      {["<", "1", "2", ">"].map((item) => (
                        <span key={item} className="rounded border border-white/[0.09] bg-white/[0.07] px-1.5 md:px-2 py-0.5 text-[8px] md:text-[9px] font-mono text-neutral-400">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-md border border-white/[0.12] bg-[#0a0a0a] p-0.5 shadow-lg">
              {[
                { icon: Type, label: "Title" },
                { icon: AlignLeft, label: "Text" },
                { icon: CreditCard, label: "Card" },
                { icon: BarChart3, label: "Chart" },
                { icon: Image, label: "Image" },
                { icon: MousePointerClick, label: "CTA" },
              ].map((tool) => (
                <div key={tool.label} className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded text-neutral-400 hover:bg-white/[0.07] hover:text-white transition-colors">
                  <tool.icon size={12} className="md:w-[14px] md:h-[14px]" />
                </div>
              ))}
            </div>

            {/* Timeline bar */}
            <div className="relative z-10 flex h-1 w-full shrink-0 overflow-hidden border-t border-white/[0.10] bg-white/[0.07]">
              {[25, 25, 25, 25].map((width, idx) => (
                <div
                  key={idx}
                  className={`h-full border-r border-black/50 ${idx === 0 ? "bg-[#5e6ad2]" : "bg-white/[0.08]"}`}
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Feature Visual Components ─── */
function FeatureVisual({ type }: { type: string }) {
  if (type === "design") {
    return (
      <div className="relative rounded-2xl border border-white/[0.10] bg-[#16161f] p-5 md:p-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: "radial-gradient(circle at 30% 20%, rgba(94,106,210,0.12), transparent 50%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={12} className="text-[#5e6ad2]" />
            <span className="text-[10px] font-mono text-neutral-400">scene.mdx</span>
          </div>
          {/* Code editor mockup */}
          <div className="rounded-lg border border-white/[0.08] bg-black p-3 font-mono text-[10px] leading-5">
            <div className="text-neutral-600">{`<Slide duration={5} theme="dark">`}</div>
            <div className="pl-3">
              <div className="text-white">{`<Title enter="fadeUp" delay={0.2}>`}</div>
              <div className="pl-3 text-[#8b95e0]">Growth Investment Memo</div>
              <div className="text-white">{`</Title>`}</div>
            </div>
            <div className="pl-3 mt-1">
              <div className="text-white">{`<Text enter="fadeUp" delay={0.4}>`}</div>
              <div className="pl-3 text-neutral-500">Boardroom-ready narrative...</div>
              <div className="text-white">{`</Text>`}</div>
            </div>
            <div className="text-neutral-600">{`</Slide>`}</div>
          </div>
          {/* Block palette */}
          <div className="mt-4 flex gap-2">
            {[
              { icon: Type, label: "Title" },
              { icon: AlignLeft, label: "Text" },
              { icon: CreditCard, label: "Card" },
              { icon: BarChart3, label: "Chart" },
              { icon: Image, label: "Image" },
            ].map((block) => (
              <div key={block.label} className="flex flex-col items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 hover:border-[#5e6ad2]/30 transition-colors">
                <block.icon size={12} className="text-neutral-400" />
                <span className="text-[8px] text-neutral-500">{block.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "preview") {
    return (
      <div className="relative rounded-2xl border border-white/[0.10] bg-[#16161f] p-5 md:p-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: "radial-gradient(circle at 70% 30%, rgba(94,106,210,0.12), transparent 50%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={12} className="text-[#5e6ad2]" />
            <span className="text-[10px] font-mono text-neutral-400">Live Preview</span>
          </div>
          {/* Slide canvas */}
          <div className="rounded-lg border border-white/[0.08] bg-black p-4 md:p-6 aspect-video flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: "radial-gradient(circle at 40% 30%, rgba(94,106,210,0.15), transparent 50%)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-600">Scene 01</span>
                <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
              </div>
              <h4 className="text-sm md:text-base font-semibold text-white mb-1 tracking-tight">Growth Investment Memo</h4>
              <p className="text-[10px] md:text-xs text-neutral-500 max-w-[180px] md:max-w-[240px] mb-3 md:mb-4">A boardroom-ready narrative for framing the decision.</p>
              {/* Animated bars */}
              <div className="flex items-end gap-1 md:gap-1.5 h-7 md:h-9">
                {[35, 55, 75, 95].map((h, i) => (
                  <div key={i} className="w-3 md:w-4 rounded-sm bg-white/[0.08] relative overflow-hidden" style={{ height: `${h}%` }}>
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.15, ease: easeSmooth }}
                      className="absolute bottom-0 left-0 right-0 rounded-sm bg-[#5e6ad2]/60"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Play indicator */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 border border-white/[0.06]">
              <Timer size={8} className="text-neutral-500" />
              <span className="text-[8px] text-neutral-500 font-mono">00:02</span>
            </div>
          </div>
          {/* Slide thumbnails strip */}
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`flex-1 rounded-md border p-1.5 ${num === 1 ? "border-[#5e6ad2]/30 bg-[#5e6ad2]/8" : "border-white/[0.06] bg-white/[0.03]"}`}
              >
                <div className="h-1 w-1/2 rounded bg-white/[0.08] mb-1" />
                <div className="h-1 w-3/4 rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "export") {
    return (
      <div className="relative rounded-2xl border border-white/[0.10] bg-[#16161f] p-5 md:p-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: "radial-gradient(circle at 60% 40%, rgba(94,106,210,0.12), transparent 50%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Download size={12} className="text-[#5e6ad2]" />
            <span className="text-[10px] font-mono text-neutral-400">Export Options</span>
          </div>
          {/* Export format cards */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-black p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#5e6ad2]/10 border border-[#5e6ad2]/20">
                <FileCode2 size={14} className="text-[#8b95e0]" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-medium text-white">MDX Source</div>
                <div className="text-[9px] text-neutral-500">Editable markdown with components</div>
              </div>
              <div className="rounded bg-white/[0.06] px-2 py-0.5 text-[9px] text-neutral-400">.mdx</div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-black p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <FileText size={14} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-medium text-white">Interactive HTML</div>
                <div className="text-[9px] text-neutral-500">Self-contained slide player</div>
              </div>
              <div className="rounded bg-white/[0.06] px-2 py-0.5 text-[9px] text-neutral-400">.html</div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-black p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20">
                <Film size={14} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-medium text-white">Video Sequence</div>
                <div className="text-[9px] text-neutral-500">Browser capture timeline</div>
              </div>
              <div className="rounded bg-white/[0.06] px-2 py-0.5 text-[9px] text-neutral-400">.mp4</div>
            </div>
          </div>
          {/* Export progress */}
          <div className="mt-4 flex items-center gap-2">
            <Sparkles size={10} className="text-[#5e6ad2]" />
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#5e6ad2] to-[#8b95e0]" />
            </div>
            <span className="text-[9px] text-neutral-500">75%</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ─── Feature row data ─── */
const features = [
  {
    label: "Design",
    title: "Built for purpose",
    desc: "A motion design system shaped by the practices of world-class presentation teams. Compose each scene with MDX blocks, timing, and motion props.",
    icon: Palette,
    align: "left" as const,
    visual: "design"
  },
  {
    label: "Preview",
    title: "Powered by motion",
    desc: "Designed for real-time preview. Use keyboard navigation to move through the deck and see animations play instantly.",
    icon: Eye,
    align: "right" as const,
    visual: "preview"
  },
  {
    label: "Export",
    title: "Designed for speed",
    desc: "Reduces friction and restores momentum. Export MDX, interactive HTML, or prepare the same sequence for video output.",
    icon: Download,
    align: "left" as const,
    visual: "export"
  }
];

const componentRows: [string, string, React.ElementType][] = [
  ["Scene", "A timed presentation page written in MDX.", Layers],
  ["Title", "Large animated headline layer.", Type],
  ["Text", "Supporting body copy with animation timing.", AlignLeft],
  ["Card", "Structured information block for benefits and proof points.", Layout],
  ["CTA", "Final action label for a scene.", MousePointer],
  ["Navigation", "Keyboard and arrow-key movement between scenes.", Keyboard]
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111118] text-neutral-200 overflow-x-hidden">
      <SiteNav />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative px-6 pb-16 pt-32 md:pb-20 md:pt-40">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[600px] w-[700px] rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, rgba(94,106,210,0.08) 0%, transparent 65%)" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Linear-style asymmetric hero: left big title, right copy */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 lg:gap-16">
            {/* Left: Massive title */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex-1"
            >
              <motion.h1
                variants={fadeInUp}
                custom={0}
                className="text-[clamp(3rem,8vw,7rem)] font-bold tracking-tighter leading-[0.95] text-white"
              >
                The motion
                <br />
                design system
                <br />
                <span className="text-neutral-400">for teams</span>
              </motion.h1>
            </motion.div>

            {/* Right: Description + CTA */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:max-w-sm lg:pb-2"
            >
              <motion.p
                variants={fadeInUp}
                custom={1}
                className="text-base md:text-lg leading-relaxed text-neutral-400 mb-8"
              >
                Purpose-built for designing animated presentations. Edit scenes in MDX, preview motion in real time, and export sequences.
              </motion.p>

              <motion.div variants={fadeInUp} custom={2} className="flex flex-wrap items-center gap-3">
                <Link
                  href="/studio"
                  className="group inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200 hover:shadow-[0_0_20px_rgba(94,106,210,0.2)] active:scale-95"
                >
                  Open Studio
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/templates"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.08] px-5 py-2.5 text-sm font-medium text-neutral-400 transition-all hover:border-white/[0.18] hover:text-white active:scale-95"
                >
                  Browse Presets
                </Link>
              </motion.div>


            </motion.div>
          </div>

          {/* Studio mockup below hero */}
          <div className="mt-16 md:mt-24">
            <StudioMockup />
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />

        <div className="mx-auto max-w-6xl px-6 py-32 md:py-40">
          {features.map((feature) => (
            <AnimatedSection key={feature.label} className={`mb-32 md:mb-40 last:mb-0`}>
              <div className={`grid gap-12 lg:grid-cols-2 lg:items-center ${feature.align === "right" ? "lg:[direction:rtl]" : ""}`}>
                <div className={`${feature.align === "right" ? "lg:[direction:ltr]" : ""}`}>
                  <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-[#5e6ad2]">
                    <feature.icon className="h-3.5 w-3.5" />
                    {feature.label}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-5">
                    {feature.title}
                  </h2>
                  <p className="text-base md:text-lg leading-relaxed text-neutral-400 max-w-md">
                    {feature.desc}
                  </p>
                </div>

                {/* Feature visual */}
                <div className={`${feature.align === "right" ? "lg:[direction:ltr]" : ""}`}>
                  <FeatureVisual type={feature.visual} />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════ DECK PRESETS ═══════════════════ */}
      <section className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />

        <div className="mx-auto max-w-6xl px-6 py-32 md:py-40">
          <AnimatedSection className="mb-16 md:mb-20">
            <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-[#5e6ad2]">
              <Zap className="h-3.5 w-3.5" />
              Presets
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-5">
              Start from a template
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-neutral-400 max-w-xl">
              Each preset is a complete MDX scene deck. Load one into the Studio, customize, and export.
            </p>
          </AnimatedSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid gap-4 md:grid-cols-2"
          >
            {motionTemplates.map((template, idx) => (
              <motion.div
                key={template.id}
                variants={fadeInUp}
                custom={idx}
              >
                <Link
                  href="/studio"
                  className="group flex flex-col rounded-2xl border border-white/[0.09] bg-white/[0.035] p-6 md:p-8 transition-all hover:border-[#5e6ad2]/20 hover:bg-white/[0.07]"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      {template.category} · {template.duration}
                    </span>
                    <ArrowRight className="h-4 w-4 text-neutral-500 transition-all group-hover:text-[#8b95e0] group-hover:translate-x-0.5" />
                  </div>
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-400 mb-3">
                    {template.description}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {template.useCase}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ COMPONENT MAP ═══════════════════ */}
      <section className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />

        <div className="mx-auto max-w-6xl px-6 py-32 md:py-40">
          <AnimatedSection className="mb-16 md:mb-20">
            <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-[#5e6ad2]">
              <Layers className="h-3.5 w-3.5" />
              Components
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-5">
              Scene MDX Map
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-neutral-400 max-w-xl">
              A small set of powerful building blocks for motion-rich presentations.
            </p>
          </AnimatedSection>

          <div className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-2">
            <div className="divide-y divide-white/[0.06]">
              {componentRows.map(([name, desc, Icon], i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: easeSmooth }}
                  className="group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-white/[0.08]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.08] text-neutral-400 transition-colors group-hover:border-[#5e6ad2]/15 group-hover:text-neutral-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium text-white">{name}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/[0.04] to-transparent" />
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-400">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section className="relative border-t border-white/[0.12]">
        <div className="absolute inset-x-0 top-0 h-px shimmer-line" />

        <div className="mx-auto max-w-6xl px-6 py-32 md:py-40 text-center">
          <AnimatedSection>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: easeSmooth }}
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.08]"
            >
              <Zap className="h-7 w-7 text-[#8b95e0]" />
            </motion.div>

            <h2 className="mx-auto max-w-2xl text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
              Built for the future.
              <br />
              <span className="text-neutral-400">Available today.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-lg text-neutral-400 mb-10">
              Start building motion-rich presentations in minutes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/studio"
                className="group inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-black transition-all hover:bg-neutral-200 hover:shadow-[0_0_30px_rgba(94,106,210,0.25)] active:scale-95"
              >
                Open Studio
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.08] px-7 py-3 text-sm font-medium text-neutral-400 transition-all hover:border-white/[0.18] hover:text-white active:scale-95"
              >
                Browse Presets
              </Link>
            </div>
          </AnimatedSection>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.12]">
          <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-sm text-neutral-400">
              <img src="/logo.png" alt="SlideX" className="w-[88px] h-auto rounded-md object-contain" />
            </div>
            <div className="flex items-center gap-8 text-sm text-neutral-400">
              <Link href="/resources" className="hover:text-neutral-400 transition-colors">Docs</Link>
              <Link href="/templates" className="hover:text-neutral-400 transition-colors">Presets</Link>
              <Link href="/studio" className="hover:text-neutral-400 transition-colors">Studio</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
