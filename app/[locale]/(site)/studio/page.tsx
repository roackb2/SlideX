"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileCode2, PlayCircle, Layout, MonitorPlay, Sparkles, Building2, Briefcase, Frame } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";
import { BorderBeam } from "border-beam";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function StudioLandingPage() {
  const { t } = useI18n();
  const page = t.studioPage;

  return (
    <main className="min-h-[100dvh] bg-[#070707] text-white selection:bg-blue-500/30 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center pt-48 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 top-0 -z-10 h-full w-full bg-[#070707] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeUpVariant}
          className="max-w-5xl mx-auto text-center space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-4 backdrop-blur-md">
            <MonitorPlay className="h-3.5 w-3.5 text-blue-500" />
            {page.hero.eyebrow}
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-balance text-[#fcfbf8]">
            {page.hero.title.regular} <br className="hidden md:block" />
            <span className="text-blue-500 font-semibold">{page.hero.title.highlight}</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl md:text-2xl text-white/50 leading-relaxed text-balance">
            {page.hero.body}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              href="/workspace/studio" 
              className="w-full sm:w-auto h-12 px-8 inline-flex items-center justify-center rounded-full bg-white text-black font-medium text-[15px] transition-transform hover:scale-105"
            >
              {page.hero.primary}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. Feature Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 py-32 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[400px] gap-6 grid-flow-dense">
          
          {/* Main Feature - MDX Editor */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="md:col-span-8 md:row-span-2 h-full flex flex-col group rounded-[24px]"
          >
            <BorderBeam size="line" className="flex flex-col h-full rounded-[24px]">
              <div className="flex flex-col h-full relative overflow-hidden rounded-[24px] bg-[#0d0d0d] border border-white/10 p-10 hover:bg-[#111111] transition-colors">
                <div className="w-14 h-14 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center mb-10 text-blue-500 backdrop-blur-md">
                  <FileCode2 className="h-6 w-6 stroke-[1.5]" />
                </div>
                <h3 className="text-white font-semibold text-[32px] tracking-tight mb-4">{page.bentoFeatures[0].title}</h3>
                <p className="text-[18px] leading-relaxed text-white/50 max-w-lg mb-12">
                  {page.bentoFeatures[0].body}
                </p>
                
                <div className="flex-1 rounded-[20px] border border-white/10 bg-[#0a0a0a] relative overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between border-b border-white/10 bg-[#050505] px-6 py-4">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-white/20" />
                      <span className="w-3 h-3 rounded-full bg-white/20" />
                      <span className="w-3 h-3 rounded-full bg-white/20" />
                    </div>
                    <div className="text-[11px] text-white/50 font-mono tracking-widest uppercase">{page.bentoFeatures[0].codeLabel}</div>
                    <div className="w-12"></div>
                  </div>
                  <div className="font-mono text-[14px] leading-relaxed p-8 text-white/70 bg-transparent flex-1">
                    <p className="text-white/30">{`<Slide>`}</p>
                    <p className="pl-6">{`<HeroText>`}</p>
                    <p className="pl-12 text-white font-semibold text-[16px] my-2">{page.bentoFeatures[0].codeTitle}</p>
                    <p className="pl-6">{`</HeroText>`}</p>
                    <p className="pl-6 text-blue-500">{`<BarChart data={revenue} animate />`}</p>
                    <p className="text-white/30">{`</Slide>`}</p>
                  </div>
                </div>
              </div>
            </BorderBeam>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 } }
            }}
            className="md:col-span-4 h-full flex flex-col group rounded-[24px]"
          >
            <BorderBeam size="line" className="flex flex-col h-full rounded-[24px]">
              <div className="flex flex-col h-full relative p-10 justify-between rounded-[24px] bg-[#0d0d0d] border border-white/10 hover:bg-[#111111] transition-colors">
                <div className="w-14 h-14 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 backdrop-blur-md">
                  <PlayCircle className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-[24px] tracking-tight mb-4">{page.bentoFeatures[1].title}</h3>
                  <p className="text-[16px] leading-relaxed text-white/50">
                    {page.bentoFeatures[1].body}
                  </p>
                </div>
              </div>
            </BorderBeam>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 } }
            }}
            className="md:col-span-4 h-full flex flex-col group rounded-[24px]"
          >
            <BorderBeam size="line" className="flex flex-col h-full rounded-[24px]">
              <div className="flex flex-col h-full relative p-10 justify-between rounded-[24px] bg-[#0d0d0d] border border-white/10 hover:bg-[#111111] transition-colors">
                <div className="w-14 h-14 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 backdrop-blur-md">
                  <Layout className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-[24px] tracking-tight mb-4">{page.bentoFeatures[2].title}</h3>
                  <p className="text-[16px] leading-relaxed text-white/50">
                    {page.bentoFeatures[2].body}
                  </p>
                </div>
              </div>
            </BorderBeam>
          </motion.div>

        </div>
      </section>

      {/* 3. Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 py-32 border-t border-white/5 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="mb-16 sm:mb-24 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
            {page.workflow.title}
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            {page.workflow.body}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {page.workflow.steps.map((step: any, index: number) => (
            <motion.div 
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 } }
              }}
              className="flex flex-col h-full group rounded-[24px]"
            >
              <BorderBeam size="line" className="flex flex-col h-full rounded-[24px]">
                <div className="flex flex-col h-full p-10 rounded-[24px] bg-[#0d0d0d] border border-white/10 hover:bg-[#111111] transition-colors min-h-[320px]">
                  <div className="flex items-start justify-between mb-12">
                    <span className="text-[32px] font-semibold text-white/10 tabular-nums">{step.label}</span>
                  </div>
                  <h3 className="text-white font-semibold text-[24px] tracking-tight mb-4 mt-auto">{step.title}</h3>
                  <p className="text-white/50 text-[16px] leading-relaxed">{step.body}</p>
                </div>
              </BorderBeam>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Use Cases Section */}
      <section className="max-w-7xl mx-auto px-4 py-32 border-t border-white/5 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="mb-16 sm:mb-24 text-center max-w-2xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-4 backdrop-blur-md">
            <Building2 className="h-3.5 w-3.5 text-blue-500" />
            {page.useCases.eyebrow}
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
            {page.useCases.title}
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            {page.useCases.body}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {page.useCases.cases.map((useCase: any, index: number) => {
            const icons = [Briefcase, Sparkles, Frame];
            const Icon = icons[index];
            return (
              <motion.div 
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 } }
                }}
                className="flex flex-col h-full group rounded-[24px]"
              >
                <BorderBeam size="line" className="flex flex-col h-full rounded-[24px]">
                  <div className="p-10 flex flex-col h-full rounded-[24px] bg-[#0d0d0d] border border-white/10 hover:bg-[#111111] transition-colors">
                    <div className="w-14 h-14 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 mb-8 backdrop-blur-md">
                      <Icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <h3 className="text-[24px] font-semibold text-white mb-4 tracking-tight">{useCase.title}</h3>
                    <p className="text-[16px] leading-relaxed text-white/50">{useCase.body}</p>
                  </div>
                </BorderBeam>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariant}
        className="py-40 text-center px-4 border-t border-white/5 bg-[#0a0a0a]"
      >
        <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-10">
          {page.cta.title}
        </h2>
        <p className="mx-auto max-w-[600px] text-xl text-white/50 leading-relaxed mb-10">
          {page.cta.body}
        </p>
        <Link 
          href="/workspace/studio" 
          className="h-14 px-10 inline-flex items-center justify-center rounded-full bg-white text-black font-semibold text-[16px] hover:scale-105 transition-transform"
        >
          {page.cta.button}
        </Link>
      </motion.section>

    </main>
  );
}
