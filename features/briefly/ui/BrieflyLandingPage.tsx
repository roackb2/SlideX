"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Braces,
  FileText,
  Layers3,
  Sparkles,
  Code2,
  Blocks,
  Eye,
  FileJson,
  TerminalSquare,
  Workflow,
  Copy,
  Check
} from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { getBrieflyCopy } from "@/features/briefly/application/brieflyCopy";
import { motion } from "framer-motion";
import { BorderBeam } from "border-beam";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const brieflyStack = [
  "MDX",
  "Project Brief",
  "Blocks",
  "Inspector",
  "HTML",
  "PDF",
  "Developer JSON",
  "Preview"
];

const features = [
  {
    icon: Blocks,
    colSpan: "col-span-1 md:col-span-8",
  },
  {
    icon: TerminalSquare,
    colSpan: "col-span-1 md:col-span-4",
  },
  {
    icon: Eye,
    colSpan: "col-span-1 md:col-span-4",
  },
  {
    icon: FileJson,
    colSpan: "col-span-1 md:col-span-8",
  }
];

export function BrieflyLandingPage() {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).landing;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copy.mcpInstallCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-[100dvh] bg-[#070707] text-white selection:bg-blue-500/30 selection:text-white">
      <style>{`
        @keyframes briefly-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center pt-48 pb-24 px-4 overflow-hidden min-h-[90dvh]">
        <div className="absolute inset-0 top-0 -z-10 h-full w-full bg-[#070707] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeUpVariant}
          className="max-w-5xl mx-auto text-center space-y-8 relative z-10 w-full"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-4 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            MDX Brief Builder
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-balance text-[#fcfbf8]">
            SlideX Briefly
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl md:text-2xl text-white/50 leading-relaxed text-balance">
            {copy.heroBody}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              href="/workspace/briefly" 
              className="w-full sm:w-auto h-12 px-8 inline-flex items-center justify-center rounded-full bg-white text-black font-medium text-[15px] transition-transform hover:scale-105"
            >
              {copy.primaryCta}
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto h-12 px-8 inline-flex items-center justify-center rounded-full bg-transparent border border-white/20 text-white font-medium text-[15px] hover:bg-white/5 transition-colors"
            >
              {copy.secondaryCta}
            </Link>
          </div>


        </motion.div>
      </section>

      {/* 2. Marquee Section */}
      <section className="relative border-y border-white/5 bg-[#070707] py-16">
        <div className="mx-auto max-w-[1560px] px-5">
          <p className="mb-14 text-center text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
            {copy.stackEyebrow}
          </p>
          <div className="overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
            <div className="flex w-max animate-[briefly-marquee_35s_linear_infinite] items-center gap-16 pr-16">
              {[...brieflyStack, ...brieflyStack].map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="group flex items-center gap-4 text-[15px] font-medium text-white/40 transition-colors hover:text-white/80"
                >
                  <StackIcon index={index} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/5 bg-[#070707] px-4 py-24 overflow-hidden">
        {/* Decorative Background Glow for the Terminal */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-16 lg:flex-row lg:gap-20">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/50 backdrop-blur-md">
              <TerminalSquare className="h-3.5 w-3.5 text-blue-400" />
              {copy.mcpInstallEyebrow}
            </div>
            <h2 className="font-display text-4xl font-medium tracking-tight text-white md:text-5xl">
              {copy.mcpInstallTitle}
            </h2>
            <p className="text-lg text-white/50 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {copy.mcpInstallBody}
            </p>
            <div className="pt-4 flex justify-center lg:justify-start">
              <Link
                href={copy.mcpPackageUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 px-6 text-[14px] font-medium text-white transition-all hover:bg-white hover:text-black"
              >
                {copy.mcpPackageLabel}
                <Workflow className="h-4 w-4 opacity-50 transition-transform group-hover:rotate-12" />
              </Link>
            </div>
          </div>

          <div className="w-full max-w-xl lg:w-[540px]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-[0_32px_80px_rgba(0,0,0,0.4)] overflow-hidden group"
            >
              {/* macOS Window Controls */}
              <div className="flex items-center gap-2 border-b border-white/5 bg-[#111] px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                <div className="ml-2 text-[11px] font-medium text-white/30 font-mono">bash</div>
              </div>

              {/* Terminal Content */}
              <BorderBeam size="md" colorVariant="ocean" duration={12} className="p-6 relative">
                <div className="flex items-center justify-between gap-4">
                  <code className="block flex-1 overflow-x-auto whitespace-nowrap font-mono text-[14px] leading-relaxed text-blue-300">
                    <span className="text-pink-500 mr-2">❯</span>
                    {copy.mcpInstallCommand}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white active:scale-95"
                    title="Copy command"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </BorderBeam>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Asymmetrical Bento Grid Section */}
      <section id="features" className="py-32 px-4 max-w-7xl mx-auto border-t border-white/5 relative z-10">
        <div className="mb-20 max-w-2xl">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
            {copy.featuresTitle}<br />
            <span className="text-white/40">{copy.featuresTitleMuted}</span>
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} className="mt-8 text-xl text-white/50 leading-relaxed">
            {copy.featuresBody}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {features.map((feature, i) => {
            const [title, description] = copy.features[i];
            return (
              <motion.div 
                key={i} 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.1 } } }}
                className={`${feature.colSpan} flex flex-col h-full group rounded-[24px]`}
              >
                <BorderBeam size="line" className="flex flex-col h-full rounded-[24px]">
                  <div className="flex h-full min-h-[320px] flex-col justify-between rounded-[24px] bg-[#0d0d0d] border border-white/10 p-10 hover:bg-[#111111] transition-colors">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-white/5 border border-white/10 text-blue-500">
                      <feature.icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <div className="mt-16">
                      <h3 className="text-3xl font-bold tracking-tight text-white mb-4">{title}</h3>
                      <p className="text-[16px] leading-relaxed text-white/50">
                        {description}
                      </p>
                    </div>
                  </div>
                </BorderBeam>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. Editorial Split Section (Workflow) */}
      <section className="py-32 px-4 max-w-7xl mx-auto border-t border-white/5 relative z-10">
        <div className="flex flex-col items-start gap-24 md:flex-row">
          
          <div className="w-full md:w-1/2">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="sticky top-40 max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-6 backdrop-blur-md">
                <Workflow className="h-3.5 w-3.5 text-blue-500" />
                {copy.workflowEyebrow}
              </div>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
                {copy.workflowTitle}<br />
                <span className="text-white/40">{copy.workflowTitleMuted}</span>
              </h2>
              <p className="text-xl text-white/50 leading-relaxed">
                {copy.workflowBody}
              </p>
            </motion.div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="flex flex-col gap-8">
              {copy.workflow.map(([title, desc], idx) => {
                const step = String(idx + 1).padStart(2, "0");
                return (
                  <motion.div 
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: idx * 0.1 } } }}
                    className="flex flex-col group rounded-[24px]"
                  >
                    <BorderBeam size="line" className="flex flex-col h-full rounded-[24px]">
                      <div className="relative overflow-hidden rounded-[24px] bg-[#0d0d0d] border border-white/10 p-10 hover:bg-[#111111] transition-colors">
                        <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/4 text-[12rem] font-bold leading-none text-white/[0.03] transition-transform duration-700 group-hover:-translate-x-4">
                          {step}
                        </div>
                        <div className="relative z-10">
                          <div className="text-sm font-semibold tracking-widest text-blue-500 mb-4">STEP {step}</div>
                          <h3 className="text-2xl font-bold tracking-tight text-white mb-4">{title}</h3>
                          <p className="text-[16px] leading-relaxed text-white/50 max-w-sm">
                            {desc}
                          </p>
                        </div>
                      </div>
                    </BorderBeam>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 5. Bottom CTA Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariant}
        className="py-40 text-center px-4 border-t border-white/5 bg-[#0a0a0a]"
      >
        <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-10">
          {copy.bottomTitleLine1}<br />{copy.bottomTitleLine2}
        </h2>
        <p className="mx-auto max-w-[600px] text-xl text-white/50 leading-relaxed mb-10">
          {copy.bottomBody}
        </p>
        <Link 
          href="/workspace/briefly" 
          className="h-14 px-10 inline-flex items-center justify-center rounded-full bg-white text-black font-semibold text-[16px] hover:scale-105 transition-transform"
        >
          {copy.bottomCta}
        </Link>
      </motion.section>

    </main>
  );
}

function StackIcon({ index }: { index: number }) {
  const icons = [Braces, FileText, Layers3, Code2];
  const Icon = icons[index % icons.length];

  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 group-hover:text-white group-hover:bg-white/10 transition-colors">
      <Icon className="h-5 w-5" strokeWidth={1.5} />
    </span>
  );
}
