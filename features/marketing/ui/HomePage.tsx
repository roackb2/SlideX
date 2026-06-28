"use client";

import Link from "next/link";
import { useI18n } from "@/common/lib/I18nProvider";
import { BorderBeam } from "border-beam";
import { motion } from "framer-motion";

export function HomePage() {
  const { t, localePath } = useI18n();
  const secondary = t.home.secondaryFeatures;

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

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
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-balance text-[#fcfbf8]">
            {t.home.hero.title.regular} <br className="hidden md:block" />
            <span className="text-blue-500 font-semibold">{t.home.hero.title.highlight}</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl md:text-2xl text-white/50 leading-relaxed text-balance">
            {t.home.hero.body}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              href={localePath("/pitch")}
              className="w-full sm:w-auto h-12 px-8 inline-flex items-center justify-center rounded-full bg-white text-black font-medium text-[15px] transition-transform hover:scale-105"
            >
              {t.home.hero.primary}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. CORE PRODUCTS BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
            {t.home.productsSection.title}
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            {t.home.productsSection.body}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* Briefly Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0 } }
            }}
            className="flex flex-col h-full group rounded-[24px]"
          >
            <BorderBeam size="line" className="flex flex-col h-full rounded-[24px]">
              <div className="flex flex-col justify-end h-full min-h-[520px] relative overflow-hidden rounded-[24px] bg-[#0d0d0d] border border-white/10 p-10 group-hover:bg-[#141414] group-hover:border-red-500/30 group-hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.15)] transition-all duration-500">
                <div className="relative z-10 mt-auto pt-24">
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-2">
                    {t.home.products.briefly.title}
                  </h3>
                  <p className="text-blue-500 font-medium text-lg mb-8">
                    {t.home.products.briefly.core}
                  </p>
                  <div className="space-y-6">
                    <div>
                      <span className="block text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2 font-semibold">{t.home.productsSection.targetLabel}</span>
                      <p className="text-white/80 text-[15px] font-medium leading-relaxed">
                        {t.home.products.briefly.target}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Mars (火星) - The Red Planet */}
                <motion.svg className="absolute top-6 left-1/2 -translate-x-1/2 w-[280px] h-[280px] text-white/30 group-hover:text-red-500/90 group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-700 ease-out pointer-events-none" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                  {/* Atmospheric Glow */}
                  <motion.circle cx="100" cy="100" r="55" fill="currentColor" fillOpacity="0.05" stroke="none" />
                  
                  {/* Mars Core */}
                  <motion.circle initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} cx="100" cy="100" r="45" strokeWidth="1.5" strokeOpacity="1" fill="#0d0d0d" />
                  
                  {/* Topographic Lines (Minimalist Surface) */}
                  <clipPath id="mars-clip">
                    <circle cx="100" cy="100" r="45" />
                  </clipPath>
                  <motion.g clipPath="url(#mars-clip)">
                    {/* Concentric rings representing Olympus Mons or craters, drawn precisely */}
                    <motion.circle cx="115" cy="85" r="12" strokeWidth="1" strokeOpacity="0.5" />
                    <motion.circle cx="115" cy="85" r="6" strokeWidth="1" strokeOpacity="0.8" />
                    <motion.circle cx="80" cy="120" r="25" strokeWidth="1" strokeOpacity="0.3" />
                    <motion.circle cx="80" cy="120" r="15" strokeWidth="1" strokeOpacity="0.4" />
                    <motion.path d="M 60 90 Q 90 100 120 140" strokeWidth="1" strokeOpacity="0.3" />
                    <motion.path d="M 70 80 Q 100 90 140 130" strokeWidth="1" strokeOpacity="0.2" />
                    {/* Polar Cap - very clean */}
                    <motion.path d="M 85 62 Q 100 70 115 62 Q 100 55 85 62" strokeWidth="1" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.1" />
                  </motion.g>

                  {/* Elegant Orbital Ring */}
                  <motion.ellipse cx="100" cy="100" rx="75" ry="18" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 6" animate={{ strokeDashoffset: [0, -100] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} transform="rotate(-20 100 100)" />
                  <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "100px 100px" }}>
                    <circle cx="25" cy="100" r="3" strokeWidth="1.5" strokeOpacity="1" fill="#0d0d0d" />
                  </motion.g>
                </motion.svg>
              </div>
            </BorderBeam>
          </motion.div>

          {/* Pitch Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 } }
            }}
            className="flex flex-col h-full group rounded-[24px]"
          >
            <BorderBeam size="line" className="flex flex-col h-full rounded-[24px]">
              <div className="flex flex-col justify-end h-full min-h-[520px] relative overflow-hidden rounded-[24px] bg-[#0d0d0d] border border-white/10 p-10 group-hover:bg-[#141414] group-hover:border-orange-400/30 group-hover:shadow-[0_0_40px_-10px_rgba(251,146,60,0.15)] transition-all duration-500">
                <div className="relative z-10 mt-auto pt-24">
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-2">
                    {t.home.products.pitch.title}
                  </h3>
                  <p className="text-blue-500 font-medium text-lg mb-8">
                    {t.home.products.pitch.core}
                  </p>
                  <div className="space-y-6">
                    <div>
                      <span className="block text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2 font-semibold">{t.home.productsSection.targetLabel}</span>
                      <p className="text-white/80 text-[15px] font-medium leading-relaxed">
                        {t.home.products.pitch.target}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Jupiter (木星) - The Gas Giant */}
                <motion.svg className="absolute top-6 left-1/2 -translate-x-1/2 w-[280px] h-[280px] text-white/30 group-hover:text-orange-400/90 group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-700 ease-out pointer-events-none" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                  <defs>
                    <clipPath id="jupiter-clip">
                      <circle cx="100" cy="100" r="45" />
                    </clipPath>
                  </defs>
                  
                  {/* Jupiter Glow */}
                  <motion.circle cx="100" cy="100" r="55" fill="currentColor" fillOpacity="0.05" stroke="none" />
                  
                  {/* Jupiter Core */}
                  <motion.circle initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} cx="100" cy="100" r="45" strokeWidth="1.5" strokeOpacity="1" fill="#0d0d0d" />
                  
                  {/* Thin elegant rings */}
                  <motion.g transform="rotate(-15 100 100)">
                    <motion.ellipse cx="100" cy="100" rx="75" ry="8" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="6 4" animate={{ strokeDashoffset: [0, 100] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />
                    <motion.ellipse cx="100" cy="100" rx="65" ry="5" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 4" animate={{ strokeDashoffset: [0, -100] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
                  </motion.g>

                  {/* Gas Bands perfectly clipped inside r=45 */}
                  <motion.g clipPath="url(#jupiter-clip)" transform="rotate(-15 100 100)">
                    {/* The Great Red Spot */}
                    <motion.ellipse cx="85" cy="115" rx="10" ry="5" strokeWidth="1" strokeOpacity="0.8" fill="currentColor" fillOpacity="0.1" />
                    <motion.ellipse cx="85" cy="115" rx="5" ry="2.5" strokeWidth="1" strokeOpacity="0.5" />

                    {/* Moving Gas Bands */}
                    <motion.path initial={{ x: -20 }} animate={{ x: 20 }} transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 40 80 Q 100 85 160 80" strokeWidth="1" strokeOpacity="0.6" />
                    <motion.path initial={{ x: 15 }} animate={{ x: -15 }} transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 40 88 Q 100 95 160 88" strokeWidth="1.5" strokeOpacity="0.4" />
                    <motion.path initial={{ x: -25 }} animate={{ x: 25 }} transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 40 100 Q 100 105 160 100" strokeWidth="1" strokeOpacity="0.8" />
                    <motion.path initial={{ x: 20 }} animate={{ x: -20 }} transition={{ duration: 4.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 40 110 Q 100 115 160 110" strokeWidth="2" strokeOpacity="0.3" />
                    <motion.path initial={{ x: -10 }} animate={{ x: 10 }} transition={{ duration: 5.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 40 125 Q 100 130 160 125" strokeWidth="1" strokeOpacity="0.5" />
                  </motion.g>

                  {/* Moons */}
                  <motion.g animate={{ rotate: 15 }} transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} style={{ transformOrigin: "100px 100px" }}>
                    <motion.circle cx="10" cy="100" r="3" fill="currentColor" stroke="none" />
                    <motion.circle cx="190" cy="100" r="4" fill="currentColor" stroke="none" />
                  </motion.g>
                </motion.svg>
              </div>
            </BorderBeam>
          </motion.div>


        </div>
      </section>

      {/* 3. SECONDARY FEATURES */}
      <section className="max-w-7xl mx-auto px-4 py-32 border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-start mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight whitespace-pre-wrap"
          >
            {secondary?.header?.title || "Craft persuasive narratives\n"}
            <span className="text-white/40">{secondary?.header?.highlight || "with zero friction."}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="text-xl text-white/50 leading-relaxed max-w-lg lg:ml-auto mt-2"
          >
            {secondary?.header?.body || "A complete toolkit for modern leaders. Ideate, track, and deliver impactful project documents without ever leaving your workflow."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Components */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-end h-full min-h-[440px] relative overflow-hidden rounded-[24px] bg-[#0a0a0a] border border-white/10 p-10 group-hover:bg-[#141414] group-hover:border-white/30 group-hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-all duration-500 group"
          >
            <div className="relative z-10 mt-auto pt-24">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-4">
                {secondary?.components?.title || "Component Library"}
              </h3>
              <p className="text-white/50 text-[15px] leading-relaxed">
                {secondary?.components?.desc || "Pre-built, animated MDX components ready for your next presentation."}
              </p>
            </div>
            {/* Saturn (土星) - For Components */}
            <motion.svg className="absolute top-6 left-1/2 -translate-x-1/2 w-[240px] h-[240px] pointer-events-none text-white/20 group-hover:text-white/90 group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-700 ease-out" viewBox="0 0 200 200" fill="none" stroke="currentColor">
              {/* Saturn Core */}
              <motion.circle initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} cx="100" cy="100" r="35" strokeWidth="1.5" strokeOpacity="1" fill="#0a0a0a" />
              {/* Subtle Core Rings */}
              <motion.ellipse cx="100" cy="100" rx="30" ry="7.5" strokeWidth="1" strokeOpacity="0.6" />
              <motion.ellipse cx="100" cy="100" rx="25" ry="5" strokeWidth="1" strokeOpacity="0.3" />
              
              {/* Massive Outer Rings */}
              <motion.g transform="rotate(-25 100 100)">
                <motion.ellipse initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} cx="100" cy="100" rx="80" ry="16" strokeWidth="1" strokeOpacity="0.8" />
                <motion.ellipse initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.1, ease: "easeInOut" }} cx="100" cy="100" rx="70" ry="14" strokeWidth="1.5" strokeOpacity="0.5" />
                <motion.ellipse initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }} cx="100" cy="100" rx="60" ry="10" strokeWidth="1" strokeOpacity="1" />
                <motion.ellipse initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }} cx="100" cy="100" rx="50" ry="8" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 3" />
              </motion.g>
            </motion.svg>
          </motion.div>

          {/* Feature 2: Built-in Motion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="flex flex-col justify-end h-full min-h-[440px] relative overflow-hidden rounded-[24px] bg-[#0a0a0a] border border-white/10 p-10 group-hover:bg-[#141414] group-hover:border-white/30 group-hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-all duration-500 group"
          >
            <div className="relative z-10 mt-auto pt-24">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-4">
                {secondary?.animations?.title || "Built-in Motion"}
              </h3>
              <p className="text-white/50 text-[15px] leading-relaxed">
                {secondary?.animations?.desc || "Add high-quality animations to your slides instantly. No keyframes required."}
              </p>
            </div>
            {/* Venus (金星) - For Built-in Motion */}
            <motion.svg className="absolute top-6 left-1/2 -translate-x-1/2 w-[240px] h-[240px] pointer-events-none text-white/20 group-hover:text-white/90 group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-700 ease-out" viewBox="0 0 200 200" fill="none" stroke="currentColor">
              <clipPath id="venus-clip">
                <circle cx="100" cy="100" r="35" />
              </clipPath>
              
              {/* Venus Core */}
              <motion.circle initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} cx="100" cy="100" r="35" strokeWidth="1.5" strokeOpacity="1" fill="#0a0a0a" />
              
              {/* Swirling Clouds (Motion) */}
              <motion.g clipPath="url(#venus-clip)">
                <motion.path initial={{ x: -10 }} animate={{ x: 10 }} transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 60 80 Q 100 65 140 80" strokeWidth="1.5" strokeOpacity="0.9" />
                <motion.path initial={{ x: 15 }} animate={{ x: -15 }} transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 60 90 Q 100 110 140 90" strokeWidth="2" strokeOpacity="0.6" />
                <motion.path initial={{ x: -20 }} animate={{ x: 20 }} transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 60 100 Q 100 85 140 100" strokeWidth="1" strokeOpacity="1" />
                <motion.path initial={{ x: 10 }} animate={{ x: -10 }} transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 60 110 Q 100 125 140 110" strokeWidth="1.5" strokeOpacity="0.8" />
                <motion.path initial={{ x: -5 }} animate={{ x: 5 }} transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} d="M 60 120 Q 100 110 140 120" strokeWidth="1" strokeOpacity="1" strokeDasharray="2 2" />
              </motion.g>

              {/* Atmospheric waves outside */}
              <motion.circle initial={{ scale: 1 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} cx="100" cy="100" r="35" strokeWidth="1" strokeOpacity="0.8" />
              <motion.circle initial={{ scale: 1 }} animate={{ scale: 1.35, opacity: 0 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }} cx="100" cy="100" r="35" strokeWidth="1" strokeOpacity="0.5" />
            </motion.svg>
          </motion.div>

          {/* Feature 3: Export */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col justify-end h-full min-h-[440px] relative overflow-hidden rounded-[24px] bg-[#0a0a0a] border border-white/10 p-10 group-hover:bg-[#141414] group-hover:border-white/30 group-hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-all duration-500 group"
          >
            <div className="relative z-10 mt-auto pt-24">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-4">
                {secondary?.export?.title || "Multi-format Export"}
              </h3>
              <p className="text-white/50 text-[15px] leading-relaxed">
                {secondary?.export?.desc || "Export to Web, PDF, or video with a single click. Always pixel perfect."}
              </p>
            </div>
            {/* Uranus (天王星) - For Export */}
            <motion.svg className="absolute top-6 left-1/2 -translate-x-1/2 w-[240px] h-[240px] pointer-events-none text-white/20 group-hover:text-white/90 group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-700 ease-out" viewBox="0 0 200 200" fill="none" stroke="currentColor">
              {/* Uranus Core */}
              <motion.circle initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} cx="100" cy="100" r="35" strokeWidth="1.5" strokeOpacity="1" fill="#0a0a0a" />
              
              {/* Vertical Rings (Uranus is tilted ~90 deg) */}
              <motion.g transform="rotate(80 100 100)">
                <motion.ellipse initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} cx="100" cy="100" rx="55" ry="8" strokeWidth="1" strokeOpacity="1" />
                <motion.ellipse initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }} cx="100" cy="100" rx="70" ry="12" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="2 2" />
              </motion.g>

              {/* Moons/Data streaming outwards (Export) */}
              <motion.circle initial={{ x: 100, y: 100, opacity: 1 }} animate={{ x: 50, y: 30, opacity: 0 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }} r="2" fill="currentColor" stroke="none" />
              <motion.circle initial={{ x: 100, y: 100, opacity: 1 }} animate={{ x: 140, y: 10, opacity: 0 }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.5 }} r="1.5" fill="currentColor" stroke="none" />
              <motion.circle initial={{ x: 100, y: 100, opacity: 1 }} animate={{ x: 70, y: 20, opacity: 0 }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }} r="2.5" fill="currentColor" stroke="none" />
              <motion.circle initial={{ x: 100, y: 100, opacity: 1 }} animate={{ x: 160, y: 40, opacity: 0 }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", delay: 1.5 }} r="1.5" fill="currentColor" stroke="none" />
              <motion.circle initial={{ x: 100, y: 100, opacity: 1 }} animate={{ x: 30, y: 70, opacity: 0 }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.8 }} r="2" fill="currentColor" stroke="none" />
              <motion.circle initial={{ x: 100, y: 100, opacity: 1 }} animate={{ x: 120, y: -10, opacity: 0 }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: 1.2 }} r="1" fill="currentColor" stroke="none" />
            </motion.svg>
          </motion.div>
        </div>
      </section>

      {/* 4. DEVELOPER/PITCH SPLIT SCREEN (CODE VS PREVIEW) */}
      <section className="max-w-7xl mx-auto px-4 py-32 border-t border-white/5 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          
          {/* Left: Copy & Code Mock */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="space-y-10"
          >
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-tight whitespace-pre-wrap">
              {t.home.devSection.title.regular}
              <span className="text-white/40">{t.home.devSection.title.highlight}</span>
            </h2>
            <p className="text-xl text-white/50 leading-relaxed max-w-lg">
              {t.home.devSection.body}
            </p>
            
            <div className="rounded-[16px] bg-[#0a0a0a] border border-white/10 p-6 font-mono text-[14px] leading-relaxed text-white/70 overflow-x-auto shadow-2xl relative">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <p><span className="text-blue-500">#</span> Growth Investment Memo</p>
              <br/>
              <p>{`<Slide duration={6} theme="dark">`}</p>
              <p className="pl-4">{`<Text enter="fadeUp" fontSize={72} fontWeight={800}>`}</p>
              <p className="pl-8 text-white">{t.home.devSection.mockTitle}</p>
              <p className="pl-4">{`</Text>`}</p>
              <p className="pl-4">{`<Chart type="bar" data={revenueData} delay={0.3} />`}</p>
              <p>{`</Slide>`}</p>
            </div>
          </motion.div>

          {/* Right: Pitch Preview Mock */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 } }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative w-full"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full" />
            <BorderBeam size="line" className="rounded-[24px]">
              <div className="relative aspect-[4/3] rounded-[24px] bg-[#111] border border-white/10 p-2 overflow-hidden flex flex-col shadow-2xl">
                {/* Header mock */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0d0d0d] rounded-t-[16px]">
                  <div className="text-xs font-semibold tracking-wider text-white/50 uppercase">{t.home.devSection.mockPreview}</div>
                  <div className="flex gap-1">
                    <div className="h-2 w-8 bg-blue-500/80 rounded-full" />
                    <div className="h-2 w-2 bg-white/20 rounded-full" />
                    <div className="h-2 w-2 bg-white/20 rounded-full" />
                  </div>
                </div>
                {/* Canvas mock */}
                <div className="flex-1 bg-[#050505] rounded-b-[16px] m-1 mt-0 border border-t-0 border-white/5 relative flex flex-col justify-center items-center p-8 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
                  <motion.h3 
                    animate={{ scale: [0.98, 1, 0.98], opacity: [0.8, 1, 0.8] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-5xl font-bold tracking-tighter text-white z-10"
                  >
                    {t.home.devSection.mockTitle}
                  </motion.h3>
                  <div className="mt-12 w-full max-w-sm flex items-end justify-between h-40 gap-3 z-10">
                    <motion.div initial={{ height: "0%" }} whileInView={{ height: "30%" }} transition={{ duration: 1, ease: "easeOut" }} className="w-full bg-white/10 rounded-t-sm" />
                    <motion.div initial={{ height: "0%" }} whileInView={{ height: "50%" }} transition={{ duration: 1, delay: 0.1, ease: "easeOut" }} className="w-full bg-white/20 rounded-t-sm" />
                    <motion.div initial={{ height: "0%" }} whileInView={{ height: "70%" }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }} className="w-full bg-white/30 rounded-t-sm" />
                    <motion.div initial={{ height: "0%" }} whileInView={{ height: "90%" }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} className="w-full bg-blue-500 rounded-t-sm shadow-[0_0_30px_rgba(59,130,246,0.4)]" />
                  </div>
                </div>
              </div>
            </BorderBeam>
          </motion.div>

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
          {t.home.finalCta.title}
        </h2>
        <Link 
          href={localePath("/pitch")}
          className="h-14 px-10 inline-flex items-center justify-center rounded-full bg-white text-black font-semibold text-[16px] hover:scale-105 transition-transform"
        >
          {t.home.cta.button}
        </Link>
      </motion.section>

    </main>
  );
}
