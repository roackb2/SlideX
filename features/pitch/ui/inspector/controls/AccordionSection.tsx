"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";

type AccordionSectionProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  icon: ReactNode;
  title: string;
};

export function AccordionSection({ children, defaultOpen = true, icon, title }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[1.25rem] border border-white/[0.04] bg-[#0c0c0e]/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden transition-all duration-500">
      <button
        className="flex w-full items-center justify-between px-4 py-3.5 bg-transparent hover:bg-white/[0.02] text-left transition-colors cursor-pointer select-none"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-neutral-200">
          {icon}
          {title}
        </span>
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.03] text-neutral-400 transition-transform duration-300 group-hover:bg-white/[0.06] group-hover:text-neutral-200">
          {isOpen ? (
            <ChevronDown size={12} className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          ) : (
            <ChevronRight size={12} className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          )}
        </div>
      </button>
      
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="p-4 flex flex-col gap-5 border-t border-white/[0.03] bg-gradient-to-b from-white/[0.01] to-transparent">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
