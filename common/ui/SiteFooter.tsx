"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

export function SiteFooter() {
  const { t } = useI18n();
  const footerSections = [
    {
      title: t.footer.product,
      links: [
        { href: "/studio", label: t.footer.studio }
      ]
    },
    {
      title: t.footer.library,
      links: [
        { href: "/templates", label: t.footer.presets },
        { href: "/resources", label: t.footer.docs }
      ]
    }
  ];

  return (
    <footer className="border-t border-white/[0.04] bg-[#050505] px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,112,243,0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="mx-auto max-w-[1400px] py-24 md:py-32 relative z-10">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center transition-transform duration-700 hover:scale-105" aria-label={t.footer.homeLabel}>
              <img
                src="/logo.png"
                alt={t.common.productName}
                className="h-auto w-[92px] object-contain"
              />
            </Link>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-zinc-500 font-light">
              {t.footer.description}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative group/btn inline-flex w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-1000 group-hover/btn:duration-200" />
                <Link
                  href="/studio"
                  className="relative inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 rounded-full bg-[#0a0a0c] border border-blue-500/20 pl-6 pr-2 py-2 text-[15px] font-medium text-white transition-all duration-700 hover:bg-[#121218] hover:border-blue-500/40 active:scale-[0.98]"
                >
                  <span>{t.nav.getStarted}</span>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-transform duration-700 group-hover/btn:translate-x-1 group-hover/btn:scale-105">
                    <ArrowRight className="h-4 w-4 text-white drop-shadow-md" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:justify-self-end w-full">
            {footerSections.map((section) => (
              <div key={section.title}>
                <p className="text-base font-medium text-white">{section.title}</p>
                <div className="mt-8 grid gap-4">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-base font-light text-zinc-500 transition-colors duration-500 hover:text-white inline-block"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-4 border-t border-white/[0.04] pt-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between font-light">
          <span>{t.footer.rights}</span>
          <span className="font-mono tracking-wide text-zinc-700">
            {t.footer.signature}
          </span>
        </div>
      </div>
    </footer>
  );
}
