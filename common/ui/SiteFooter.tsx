"use client";

import Link from "next/link";
import { useI18n } from "@/common/lib/I18nProvider";

export function SiteFooter() {
  const { t, localePath } = useI18n();

  const links = [
    { href: "/pitch", label: "Pitch" },
    { href: "/briefly", label: "Briefly" },
    { href: "/docs", label: "Docs" }
  ];

  return (
    <footer className="border-t border-white/10 bg-[#08090a] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Link href={localePath("/")} className="inline-flex items-center">
            <img src="/logo.png" alt="SlideX Logo" className="h-auto w-[68px] object-contain" />
          </Link>
          <p className="text-[13px] text-white/42">{t.footer.rights}</p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-4 text-[13px] font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={localePath(link.href)}
              className="text-white/52 transition-colors duration-300 hover:text-[#9ad7ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
