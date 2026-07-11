"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/common/lib/I18nProvider";

const productLinks = [
  { href: "/download", label: "Download" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docx" },
  { href: "/blog", label: "Blog" }
];

const legalLinks = [
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" }
];

export function SiteFooter() {
  const { locale, localePath } = useI18n();
  const isZh = locale === "zh-TW";

  return (
    <footer className="border-t border-white/[0.09] bg-[#08090a] px-5 pb-7 pt-14 sm:px-7 lg:px-10 lg:pt-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)_minmax(0,0.55fr)] md:gap-8">
          <div>
            <Link href={localePath("/")} className="inline-flex items-center opacity-95 transition-opacity hover:opacity-70">
              <Image alt="SlideX" className="h-auto w-[96px] object-contain" height={72} src="/logo.png" width={260} />
            </Link>
            <p className="mt-5 max-w-xs text-[14px] leading-6 text-white/48">
              {isZh ? "Pitch 是一個專注於清楚敘事的簡報工作區。" : "Pitch is a focused workspace for clear presentation stories."}
            </p>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-white/85">Product</p>
            <nav aria-label="Product links" className="mt-4 grid gap-3 text-[14px]">
              {productLinks.map((link) => (
                <Link className="w-fit text-white/49 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white" href={localePath(link.href)} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-white/85">Legal</p>
            <nav aria-label="Legal links" className="mt-4 grid gap-3 text-[14px]">
              {legalLinks.map((link) => (
                <Link className="w-fit text-white/49 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-white" href={localePath(link.href)} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.09] pt-5 text-[12px] text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SlideX. {isZh ? "保留所有權利。" : "All rights reserved."}</p>
          <p>{isZh ? "用單色與動態，讓簡報保持清楚。" : "Keep presentation stories clear with color and motion."}</p>
        </div>
      </div>
    </footer>
  );
}
