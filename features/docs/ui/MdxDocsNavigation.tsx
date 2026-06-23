"use client";

import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { easeSmooth, type DocsGroup, type DocsSectionLink } from "@/features/docs/ui/mdxDocsModel";

export function DesktopDocsSidebar({ docsGroups }: { docsGroups: DocsGroup[] }) {
  return (
    <aside className="hidden lg:block w-[220px]">
      <div className="sticky top-32 max-h-[calc(100dvh-8rem)] overflow-y-auto pb-10 pr-6">
        <nav className="space-y-6">
          {docsGroups.map((group) => (
            <CollapsibleDocsGroup group={group} key={group.title} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function CollapsibleDocsGroup({ group, onLinkClick }: { group: DocsGroup; onLinkClick?: () => void }) {
  const hasActiveLink = group.links.some(link => link.active);
  const [isOpen, setIsOpen] = useState(hasActiveLink);

  return (
    <div className="py-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-3 hover:text-white transition-colors text-[#888]"
      >
        <span className="text-[12px] uppercase tracking-widest font-semibold">{group.title}</span>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-white/40" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-white/40" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: easeSmooth }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 mt-1 border-l border-[#222] ml-1 pl-3">
              {group.links.map((item) => (
                <Link
                  className={`group flex items-center gap-2 py-2 text-[14px] leading-snug transition-all ${
                    item.active 
                      ? "text-white font-medium -ml-[13px] pl-[12px] border-l border-white" 
                      : "text-[#888] hover:text-[#ededed] hover:translate-x-0.5"
                  }`}
                  href={item.href}
                  key={`${group.title}-${item.href}`}
                  onClick={onLinkClick}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
        className="flex w-full items-center justify-between rounded-lg border border-[#333] bg-black px-4 py-3 text-left transition-colors hover:border-[#888]"
        onClick={() => setIsMobileNavOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm font-medium text-[#ededed]">{currentSection.label}</span>
        </span>
        {isMobileNavOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-white/40" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-white/40" />
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
            <nav className="mt-2 rounded-lg border border-[#333] bg-black p-4">
              <div className="space-y-2">
                {docsGroups.map((group) => (
                  <CollapsibleDocsGroup 
                    group={group} 
                    key={group.title} 
                    onLinkClick={() => setIsMobileNavOpen(false)} 
                  />
                ))}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
