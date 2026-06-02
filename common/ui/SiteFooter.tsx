"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

export function SiteFooter() {
  const { t } = useI18n();
  const footerSections = [
    {
      title: t.footer.product,
      links: [
        { href: "/studio", label: t.footer.studio },
        { href: "/download", label: t.footer.download }
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
    <footer className="border-t border-white/[0.1] bg-[#080a0f] px-4 sm:px-6">
      <div className="mx-auto max-w-7xl py-9 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center" aria-label={t.footer.homeLabel}>
              <img
                src="/logo.png"
                alt={t.common.productName}
                className="h-auto w-[92px] rounded-md object-contain"
              />
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-neutral-500">
              {t.footer.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/download"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-95 sm:w-auto"
              >
                <Download className="h-4 w-4" />
                {t.footer.download}
              </Link>
              <Link
                href="/studio"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-white/[0.22] hover:bg-white/[0.08] active:scale-95 sm:w-auto"
              >
                {t.footer.studio}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:min-w-[360px] lg:justify-self-end">
            {footerSections.map((section) => (
              <div key={section.title}>
                <p className="text-sm font-semibold text-white">{section.title}</p>
                <div className="mt-4 grid gap-3">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-neutral-500 transition hover:text-neutral-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-xs text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
          <span>{t.footer.rights}</span>
          <span className="font-mono uppercase tracking-[0.18em] text-neutral-700">
            {t.footer.signature}
          </span>
        </div>
      </div>
    </footer>
  );
}
