"use client";

import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { easeSmooth, type DocsGroup, type DocsSectionLink } from "@/features/docs/ui/mdxDocsModel";

export function DesktopDocsSidebar({ docsGroups }: { docsGroups: DocsGroup[] }) {
  return (
    <aside className="hidden border-r border-white/[0.08] lg:block">
      <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto py-8 pr-5 xl:pr-6">
        <nav className="divide-y divide-white/[0.08]">
          {docsGroups.map((group) => (
            <div className="py-5 first:pt-0" key={group.title}>
              <p className="mb-3 px-1 text-sm font-semibold text-neutral-300">{group.title}</p>
              <div className="space-y-1">
                {group.links.map((item) => (
                  <Link
                    className={`group relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm leading-6 transition overflow-hidden ${
                      item.active ? "text-white" : "text-neutral-400 hover:text-white"
                    }`}
                    href={item.href}
                    key={`${group.title}-${item.href}`}
                  >
                    {item.active && (
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/20 to-transparent border-l-2 border-blue-500" />
                    )}
                    <span className={item.active ? "font-medium" : ""}>{item.label}</span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 transition ${
                        item.active ? "text-sky-400 translate-x-1" : "text-neutral-600 group-hover:text-neutral-300"
                      }`}
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function MobileDocsNav({
  currentSection,
  docsGroups,
  isMobileNavOpen,
  setIsMobileNavOpen
}: {
  currentSection: DocsSectionLink;
  docsGroups: DocsGroup[];
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const CurrentIcon = currentSection.icon;

  return (
    <div className="mb-8 lg:hidden">
      <button
        aria-expanded={isMobileNavOpen}
        className="flex w-full items-center justify-between rounded-2xl bg-[#0a0a0c] border border-blue-500/20 px-4 py-3.5 text-left shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-3xl transition-colors hover:border-blue-500/40"
        onClick={() => setIsMobileNavOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-3">
          <CurrentIcon className="h-4 w-4 shrink-0 text-neutral-400" />
          <span className="truncate text-sm font-semibold text-neutral-200">{currentSection.label}</span>
        </span>
        {isMobileNavOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-neutral-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isMobileNavOpen ? (
          <motion.div
            animate={{ height: "auto", opacity: 1, y: 0 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0, y: -8 }}
            initial={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: easeSmooth }}
          >
            <nav className="mt-3 rounded-2xl border border-white/[0.1] bg-white/[0.035] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur">
              <div className="space-y-6">
                {docsGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-600">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.links.map((item) => {
                        const Icon = item.icon;

                        return (
                          <Link
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition relative overflow-hidden ${
                              item.active ? "text-white font-medium" : "text-neutral-400 hover:bg-white/[0.03] hover:text-white"
                            }`}
                            href={item.href}
                            key={`${group.title}-${item.href}`}
                            onClick={() => setIsMobileNavOpen(false)}
                          >
                            {item.active && (
                              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/20 to-transparent border-l-2 border-blue-500" />
                            )}
                            <Icon className={`h-4 w-4 shrink-0 ${item.active ? "text-sky-400" : ""}`} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
