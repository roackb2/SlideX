"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

const productLinks = [
  { href: "/download", en: "Download", zh: "下載" },
  { href: "/pricing", en: "Pricing", zh: "價格" },
  { href: "/docs", en: "Docs", zh: "文件" },
  { href: "/docs#mcp", en: "MCP", zh: "MCP" },
  { href: "/blog", en: "Blog", zh: "部落格" }
];

const resourceLinks = [
  { href: "https://github.com/zz41354899/SlideX", en: "GitHub", zh: "GitHub" },
  { href: "https://www.npmjs.com/package/@z7589xxz758/slidex-mcp-server", en: "MCP on npm", zh: "npm 上的 MCP" }
];

const legalLinks = [
  { href: "/terms", en: "Terms of Use", zh: "使用條款" },
  { href: "/privacy", en: "Privacy Policy", zh: "隱私權政策" }
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c4ee87]";

export function SiteFooter() {
  const { locale, localePath } = useI18n();
  const isZh = locale === "zh-TW";

  return (
    <footer className="border-t border-white/[0.09] bg-[#07080a] px-5 pb-7 pt-14 sm:px-7 lg:px-10 lg:pt-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.5fr)_minmax(0,0.5fr)_minmax(0,0.5fr)] md:gap-8">
          <div>
            <Link href={localePath("/")} className={`inline-flex w-fit items-center rounded-sm opacity-95 transition-opacity hover:opacity-70 ${focusRing}`}>
              <Image alt="SlideX" className="h-auto w-[96px] object-contain" height={72} loading="eager" src="/logo.png" width={260} />
            </Link>
            <p className="mt-5 max-w-xs text-[14px] leading-6 text-white/48">
              {isZh ? "由你與 AI 一起完成的簡報。" : "Presentations, built by you and your AI."}
            </p>
          </div>

          <div>
            <p className="font-mono-geist text-[10px] font-medium uppercase tracking-[0.24em] text-white/40">{isZh ? "產品" : "Product"}</p>
            <nav aria-label={isZh ? "產品連結" : "Product links"} className="mt-4 grid gap-3 text-[14px]">
              {productLinks.map((link) => (
                <Link className={`w-fit rounded-sm text-white/49 transition-colors hover:text-white ${focusRing}`} href={localePath(link.href)} key={link.href}>
                  {isZh ? link.zh : link.en}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="font-mono-geist text-[10px] font-medium uppercase tracking-[0.24em] text-white/40">{isZh ? "資源" : "Resources"}</p>
            <nav aria-label={isZh ? "資源連結" : "Resource links"} className="mt-4 grid gap-3 text-[14px]">
              {resourceLinks.map((link) => (
                <a
                  className={`group inline-flex w-fit items-center gap-1.5 rounded-sm text-white/49 transition-colors hover:text-white ${focusRing}`}
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {isZh ? link.zh : link.en}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </nav>
          </div>

          <div>
            <p className="font-mono-geist text-[10px] font-medium uppercase tracking-[0.24em] text-white/40">{isZh ? "法律資訊" : "Legal"}</p>
            <nav aria-label={isZh ? "法律資訊連結" : "Legal links"} className="mt-4 grid gap-3 text-[14px]">
              {legalLinks.map((link) => (
                <Link className={`w-fit rounded-sm text-white/49 transition-colors hover:text-white ${focusRing}`} href={localePath(link.href)} key={link.href}>
                  {isZh ? link.zh : link.en}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.09] pt-5 text-[12px] text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SlideX. {isZh ? "保留所有權利。" : "All rights reserved."}</p>
          <p className="font-mono-geist text-[10px] uppercase tracking-[0.22em] text-white/32">Built for you and your AI</p>
        </div>
      </div>
    </footer>
  );
}
