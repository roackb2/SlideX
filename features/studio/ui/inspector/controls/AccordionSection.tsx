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
    <div className="border border-white/[0.05] bg-white/[0.015] rounded-xl overflow-hidden transition-all duration-300 shadow-sm">
      <button
        className="flex w-full items-center justify-between px-3.5 py-3 bg-white/[0.02] hover:bg-white/[0.04] text-left transition-colors cursor-pointer select-none"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="flex items-center gap-2.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-neutral-300">
          {icon}
          {title}
        </span>
        {isOpen ? (
          <ChevronDown size={13} className="text-neutral-500 transition-transform duration-200" />
        ) : (
          <ChevronRight size={13} className="text-neutral-500 transition-transform duration-200" />
        )}
      </button>
      {isOpen ? (
        <div className="p-4 flex flex-col gap-4.5 border-t border-white/[0.04] bg-black/25 animate-[bubble-appear_0.15s_ease-out]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
