"use client";

import { motion } from "framer-motion";
import { Plus, Type, Triangle, Search, ChevronDown, Layers, Box } from "lucide-react";
import { BorderBeam } from "border-beam";
import type { Dictionary } from "@/common/lib/i18n";
import { springTransition } from "@/features/marketing/ui/home/homeMotion";

export function HeroPitch({ copy }: { copy: Dictionary["home"]["heroPitch"] }) {
  return (
    <div className="relative mx-auto">
      <motion.div
        initial={false}
        animate={{ opacity: 0.82 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="pointer-events-none absolute -inset-x-14 -inset-y-16 rounded-[5rem] bg-[radial-gradient(ellipse_at_18%_0%,rgba(190,232,255,0.2),transparent_38%),radial-gradient(ellipse_at_76%_18%,rgba(43,88,190,0.14),transparent_54%),linear-gradient(180deg,rgba(55,90,180,0.1),transparent_74%)] blur-[82px]"
      />

      <BorderBeam
        size="pulse-outside"
        colorVariant="ocean"
        theme="dark"
        duration={5}
        borderRadius={46}
        strength={0.9}
        className="shadow-[0_42px_140px_rgba(0,0,0,0.72),0_0_86px_rgba(37,99,235,0.12)]"
      >
        <div className="pointer-events-none absolute inset-0 z-20 rounded-[2.85rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_11px_0_26px_rgba(190,232,255,0.18),inset_-1px_-18px_44px_rgba(0,0,0,0.42)]" />
        <div className="pointer-events-none absolute -left-[14%] -top-[42%] z-20 h-[82%] w-[56%] rotate-[13deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16)_48%,transparent)] blur-[20px] mix-blend-screen" />
        <div className="pointer-events-none absolute right-[8%] top-0 z-30 h-px w-[45%] bg-gradient-to-r from-transparent via-white/55 to-transparent shadow-[0_0_34px_rgba(190,232,255,0.52)]" />
        <div className="pointer-events-none absolute left-0 top-0 z-30 h-px w-[72%] bg-gradient-to-r from-white via-cyan-100/[0.88] to-transparent shadow-[0_0_30px_rgba(125,211,252,0.72)]" />
        <div className="pointer-events-none absolute left-0 top-0 z-30 h-[82%] w-px bg-gradient-to-b from-white via-cyan-100/70 to-transparent shadow-[0_0_30px_rgba(56,189,248,0.56)]" />
        <div className="pointer-events-none absolute left-[1px] top-[1px] z-30 h-16 w-16 rounded-tl-[2.8rem] border-l border-t border-white/80 shadow-[0_0_38px_rgba(190,232,255,0.58)]" />
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.18),transparent_18%),linear-gradient(116deg,rgba(255,255,255,0.1),transparent_20%,transparent_72%,rgba(255,255,255,0.035))]" />

        <div className="relative flex min-h-[500px] w-full flex-col overflow-hidden rounded-[calc(2.85rem-1px)] border border-white/[0.095] bg-[linear-gradient(145deg,rgba(8,17,34,0.78),rgba(3,5,18,0.92)_50%,rgba(7,11,27,0.82))] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_46px_rgba(75,130,230,0.11),inset_0_-42px_70px_rgba(0,0,0,0.36)] backdrop-blur-[34px] lg:flex-row">
          <motion.div
            initial={false}
            animate={{ opacity: 0.32 }}
            transition={{ delay: 0.45, duration: 1.6 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-40 bg-[linear-gradient(180deg,rgba(220,244,255,0.16),rgba(125,211,252,0.06)_34%,transparent)]"
          />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_0%_0%,rgba(190,232,255,0.12),transparent_36%),radial-gradient(ellipse_at_72%_12%,rgba(72,112,220,0.08),transparent_48%),linear-gradient(90deg,rgba(255,255,255,0.05),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(100deg,transparent_0%,rgba(255,255,255,0.05)_18%,transparent_34%,transparent_70%,rgba(255,255,255,0.028)_82%,transparent_100%)] mix-blend-screen" />
          <div className="pointer-events-none absolute inset-x-10 top-6 z-[3] h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />

          <div className="relative z-10 flex w-full shrink-0 flex-col border-b border-white/[0.08] bg-[linear-gradient(150deg,rgba(255,255,255,0.072),rgba(255,255,255,0.022)_42%,rgba(0,0,0,0.12))] p-5 shadow-[inset_-1px_0_0_rgba(255,255,255,0.08),inset_-34px_0_54px_rgba(255,255,255,0.018)] backdrop-blur-[26px] sm:p-7 lg:w-[320px] lg:border-b-0 lg:border-r lg:p-8">
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/22 via-cyan-100/16 to-transparent" />
            <div className="mb-8 flex items-center justify-between gap-4 sm:mb-10">
              <div className="flex items-center gap-2 rounded-xl bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.045))] px-3 py-2 text-blue-50 ring-1 ring-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 hover:bg-white/[0.1]">
                <Layers className="h-4 w-4 text-cyan-100/[0.85]" />
                <span className="text-[14px] font-medium tracking-wide">{copy.canvasText}</span>
                <ChevronDown className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div className="flex items-center gap-3 pr-1 text-white/[0.66] sm:gap-5">
                <Plus className="h-5 w-5 cursor-pointer stroke-[2] transition-transform hover:scale-110 hover:text-white" />
                <div className="group relative h-5 w-5 cursor-pointer transition-transform hover:scale-110">
                  <div className="absolute left-0 top-0 h-1.5 w-1.5 rounded-tl-[1px] border-l-[1.5px] border-t-[1.5px] border-white/70 transition-colors group-hover:border-white" />
                  <div className="absolute right-0 top-0 h-1.5 w-1.5 rounded-tr-[1px] border-r-[1.5px] border-t-[1.5px] border-white/70 transition-colors group-hover:border-white" />
                  <div className="absolute bottom-0 left-0 h-1.5 w-1.5 rounded-bl-[1px] border-b-[1.5px] border-l-[1.5px] border-white/70 transition-colors group-hover:border-white" />
                  <div className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-br-[1px] border-b-[1.5px] border-r-[1.5px] border-white/70 transition-colors group-hover:border-white" />
                </div>
                <Type className="h-5 w-5 cursor-pointer stroke-[2] transition-transform hover:scale-110 hover:text-white" />
                <Triangle className="h-5 w-5 cursor-pointer stroke-[2] transition-transform hover:scale-110 hover:text-cyan-100" />
              </div>
            </div>

            <div className="mb-7 flex items-center gap-6 px-1 sm:mb-8">
              <div className="rounded-xl bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.045))] px-4 py-2 text-[14px] font-medium text-white ring-1 ring-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_12px_28px_rgba(0,0,0,0.18)]">
                Pages
              </div>
              <div className="cursor-pointer text-[14px] font-medium tracking-wide text-white/[0.38] transition-colors hover:text-white">{copy.layersText}</div>
              <div className="cursor-pointer text-[14px] font-medium tracking-wide text-white/[0.38] transition-colors hover:text-white">{copy.assetsText}</div>
            </div>

            <div className="mb-7 flex items-center gap-3 rounded-xl bg-black/[0.22] px-4 py-2.5 ring-1 ring-white/[0.08] shadow-[inset_0_2px_14px_rgba(0,0,0,0.42),inset_0_1px_1px_rgba(255,255,255,0.06)] sm:mb-8">
              <Search className="h-4 w-4 text-white/[0.32]" />
              <span className="text-[14px] font-medium tracking-wide text-white/[0.28]">{copy.searchText}</span>
            </div>

            <div className="hidden flex-1 flex-col gap-4 sm:flex">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={false}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.1, ...springTransition }}
                  className="group flex cursor-pointer items-center gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.035]"
                >
                  <Box className="h-4 w-4 text-white/20 transition-colors group-hover:text-white/60" />
                  <div className="h-1.5 w-32 rounded-full bg-white/[0.06] transition-colors group-hover:bg-white/[0.15]" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[340px] flex-1 items-center justify-center overflow-hidden px-5 py-10 sm:min-h-[420px] sm:px-8 lg:px-12">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.024)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:34px_34px] opacity-55" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_0%,rgba(190,232,255,0.1),transparent_42%),radial-gradient(ellipse_at_70%_70%,rgba(35,64,155,0.1),transparent_56%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_42%)]" />
            <div className="pointer-events-none absolute -left-20 top-8 h-44 w-[42%] rotate-[16deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] blur-[16px] mix-blend-screen" />

            <motion.div
              initial={false}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="group relative aspect-video w-full max-w-[520px] overflow-hidden rounded-[1.45rem] bg-[conic-gradient(from_225deg_at_14%_8%,rgba(255,255,255,0.5),rgba(118,207,255,0.17),rgba(255,255,255,0.05),rgba(56,189,248,0.13),rgba(255,255,255,0.32))] p-[1px] shadow-[0_30px_96px_rgba(0,0,0,0.66),0_0_48px_rgba(56,189,248,0.18)]"
            >
              <div className="pointer-events-none absolute left-0 top-0 z-30 h-px w-[78%] bg-gradient-to-r from-white via-cyan-100/90 to-transparent shadow-[0_0_24px_rgba(190,232,255,0.8)]" />
              <div className="pointer-events-none absolute left-0 top-0 z-30 h-[82%] w-px bg-gradient-to-b from-white via-cyan-100/68 to-transparent shadow-[0_0_26px_rgba(56,189,248,0.62)]" />
              <div className="pointer-events-none absolute right-4 top-0 z-30 h-px w-[28%] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[calc(1.45rem-1px)] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(7,15,30,0.72),rgba(2,5,18,0.95)_55%,rgba(7,11,25,0.82))] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_0_44px_rgba(37,99,235,0.13),inset_0_-28px_42px_rgba(0,0,0,0.28)] backdrop-blur-[34px] sm:p-6">
                <div className="pointer-events-none absolute inset-0 z-10 bg-black/[0.32]" />
                <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_0%_0%,rgba(190,232,255,0.17),transparent_50%),linear-gradient(130deg,rgba(255,255,255,0.07),transparent_32%,transparent_72%,rgba(255,255,255,0.035))]" />
                <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_54px_rgba(59,130,246,0.14)]" />
                <div className="pointer-events-none absolute -left-16 -top-24 z-20 h-40 w-[58%] rotate-[17deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)] blur-[18px] mix-blend-screen" />

                <div className="relative z-30 flex w-full items-center justify-between border-b border-white/[0.07] pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white/[0.13]" />
                    <span className="h-2 w-2 rounded-full bg-white/10" />
                    <span className="h-2 w-2 rounded-full bg-white/[0.08]" />
                  </div>
                  <span className="text-[8px] font-mono uppercase tracking-[0.22em] text-white/[0.34] sm:text-[9px]">{copy.remotionIndex}</span>
                  <div className="w-8" />
                </div>

                <div className="relative z-30 flex flex-1 flex-col items-start justify-center pl-2 sm:pl-4">
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-cyan-100/[0.62] sm:text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-200/[0.85] shadow-[0_0_12px_rgba(125,211,252,0.7)]" />
                      <span>{copy.previewComposition}</span>
                    </div>
                    <h3 className="max-w-[320px] text-[26px] font-semibold leading-tight tracking-[-0.035em] text-white drop-shadow-[0_0_24px_rgba(125,211,252,0.18)] sm:text-3xl">
                      {copy.slideTitle || "Future of Presentations"}
                    </h3>
                    <div className="space-y-2 pt-2">
                      <div className="h-1 w-24 rounded-full bg-white/[0.22]" />
                      <div className="h-1 w-40 rounded-full bg-white/[0.11]" />
                    </div>
                  </motion.div>
                </div>

                <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.014)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:24px_24px]" />
              </div>
            </motion.div>
          </div>
        </div>
      </BorderBeam>
    </div>
  );
}
