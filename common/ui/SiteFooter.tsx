"use client";

import Link from "next/link";
import { useI18n } from "@/common/lib/I18nProvider";

export function SiteFooter() {
  const { t, localePath } = useI18n();
  
  return (
    <footer className="bg-[#070707] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 grid gap-12 lg:grid-cols-4">
        <div className="lg:col-span-2 pr-8">
          <Link href={localePath("/")} className="font-bold text-2xl tracking-tight text-white block mb-6 flex items-center gap-2">
            <img src="/logo.png" alt="SlideX Logo" className="w-[70px] h-auto object-contain" />
          </Link>
          <p className="text-white/40 text-[15px] leading-relaxed max-w-sm">
            {t.footer.description}
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide text-sm">{t.nav.products}</h4>
          <ul className="space-y-4 text-[14px]">
            <li><Link href={localePath("/pitch")} className="text-white/50 hover:text-white transition-colors">SlideX Pitch</Link></li>
            <li><Link href={localePath("/briefly")} className="text-white/50 hover:text-white transition-colors">SlideX Briefly</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide text-sm">{t.nav.resources}</h4>
          <ul className="space-y-4 text-[14px]">
            <li><Link href={localePath("/docs")} className="text-white/50 hover:text-white transition-colors">Docs Hub</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 text-white/40 text-[13px]">
        <p>{t.footer.rights}</p>
      </div>
    </footer>
  );
}
