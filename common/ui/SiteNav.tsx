"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Globe2, Menu, X } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

const languages = [
  { code: "zh-TW" as const, label: "繁體中文" },
  { code: "en" as const, label: "English" }
];

const navItems = [
  { href: "/download", label: "Download" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docx" },
  { href: "/blog", label: "Blog" }
];

export function SiteNav() {
  const { locale, localePath, setLocale } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const isZh = locale === "zh-TW";

  useEffect(() => {
    setMenuOpen(false);
    setLanguageOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[110] border-b border-white/[0.08] bg-[#0b0c0f]/92 backdrop-blur-xl">
        <a
          className="flex h-7 items-center justify-center bg-[#c4ee87] px-4 text-center text-[12px] font-semibold text-[#0a1a00] transition-colors hover:bg-[#d2f5a0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0a1a00]"
          href="https://tally.so/r/jaYbe4"
          rel="noreferrer"
          target="_blank"
        >
          <span className="whitespace-nowrap sm:hidden">
            {isZh ? "SlideX 封閉測試中 — 填寫回饋" : "SlideX closed beta — Share feedback"}
          </span>
          <span className="hidden whitespace-nowrap sm:inline">
            {isZh
              ? "SlideX 正在封閉測試中，歡迎填寫問卷協助我們改善"
              : "SlideX is in closed beta — help us improve by sharing your feedback"}
          </span>
        </a>
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center px-5 sm:px-7 lg:px-10">
          <div className="flex shrink-0 items-center gap-3">
            <Link aria-label={isZh ? "SlideX 首頁" : "SlideX home"} className="inline-flex items-center opacity-95 transition-opacity hover:opacity-70" href={localePath("/")}>
              <Image alt="SlideX" className="h-auto w-[92px] object-contain" height={72} priority src="/logo.png" width={260} />
            </Link>
            <span className="whitespace-nowrap rounded-md border border-white/[0.14] px-2 py-1 text-[11px] font-semibold text-white/62">Pitch Beta</span>
          </div>

          <nav aria-label={isZh ? "主要導覽" : "Main navigation"} className="ml-9 hidden items-center lg:flex">
            {navItems.map((item) => (
              <Link
                className="inline-flex h-10 items-center whitespace-nowrap px-3 text-[15px] font-medium tracking-[-0.02em] text-white/58 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                href={localePath(item.href)}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Link className="inline-flex h-10 items-center whitespace-nowrap px-3 text-[15px] font-medium tracking-[-0.02em] text-white/58 transition-colors hover:text-white" href={localePath("/login")}>
              {isZh ? "登入" : "Log in"}
            </Link>
            <Link className="group inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-[#f4f4f1] px-4 text-[14px] font-semibold text-[#0b0c0f] transition-colors hover:bg-white active:translate-y-px" href="/workspace/pitch">
              {isZh ? "開始使用" : "Start using"}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <div className="relative ml-1">
              <button
                aria-expanded={languageOpen}
                aria-haspopup="menu"
                className="inline-flex h-10 items-center gap-2 px-2 text-[13px] font-medium text-white/50 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => setLanguageOpen((open) => !open)}
                type="button"
              >
                <Globe2 className="h-4 w-4" />
                <span>{locale === "zh-TW" ? "繁中" : "EN"}</span>
              </button>
              <AnimatePresence>
                {languageOpen ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-[calc(100%+8px)] w-40 rounded-lg border border-white/[0.12] bg-[#141519] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                    exit={{ opacity: 0, y: -5 }}
                    initial={{ opacity: 0, y: -5 }}
                    role="menu"
                    transition={{ duration: 0.16 }}
                  >
                    {languages.map((language) => (
                      <button
                        className={`flex h-9 w-full items-center rounded-md px-2.5 text-left text-[13px] transition-colors ${
                          locale === language.code ? "bg-white/[0.1] text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                        }`}
                        key={language.code}
                        onClick={() => setLocale(language.code)}
                        role="menuitem"
                        type="button"
                      >
                        {language.label}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? (isZh ? "關閉選單" : "Close menu") : (isZh ? "開啟選單" : "Open menu")}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center text-white lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[#0b0c0f] px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-36 text-white lg:hidden"
            exit={{ opacity: 0, y: -12 }}
            initial={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <nav aria-label={isZh ? "手機導覽" : "Mobile navigation"} className="border-y border-white/[0.1]">
              {navItems.map((item) => (
                <Link className="flex min-h-16 items-center border-b border-white/[0.08] text-[24px] font-semibold tracking-[-0.04em] last:border-b-0" href={localePath(item.href)} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-3 pt-8">
              <Link className="inline-flex h-11 items-center justify-center rounded-md border border-white/[0.14] text-[14px] font-semibold text-white" href={localePath("/login")}>
                {isZh ? "登入" : "Log in"}
              </Link>
              <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#f4f4f1] text-[14px] font-semibold text-[#0b0c0f]" href="/workspace/pitch">
                {isZh ? "開始使用" : "Start using"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
