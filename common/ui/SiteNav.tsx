"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileText,
  Globe2,
  Menu,
  Presentation,
  X
} from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

const languages = [
  { code: "zh-TW" as const, label: "繁體中文" },
  { code: "en" as const, label: "English" }
];

export function SiteNav() {
  const { locale, localePath, setLocale } = useI18n();
  const pathname = usePathname();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const productMenuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isZh = locale === "zh-TW";

  const products = [
    {
      href: "/pitch",
      label: "Pitch",
      description: isZh ? "用 shader、圖層與動效製作簡報" : "Create slides with shaders, layers, and motion",
      icon: Presentation,
      accent: "bg-[#c4ee87] text-[#132303]"
    },
    {
      href: "/briefly",
      label: "Briefly",
      description: isZh ? "把目標、範圍與決策整理成 brief" : "Shape goals, scope, and decisions into a brief",
      icon: FileText,
      accent: "bg-[#9ad7ff] text-[#071117]"
    }
  ];

  useEffect(() => {
    setMenuOpen(false);
    setProductOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
      if (productMenuRef.current && !productMenuRef.current.contains(event.target as Node)) {
        setProductOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const isActive = (href: string) => pathname.includes(`/${locale}${href}`);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
          scrolled
            ? "border-white/10 bg-[#090a0c]/92 backdrop-blur-xl"
            : "border-transparent bg-[#090a0c]/72 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[78px] max-w-[1440px] items-center px-5 sm:px-7 lg:px-10">
          <Link
            href={localePath("/")}
            aria-label={isZh ? "SlideX 首頁" : "SlideX home"}
            className="relative z-10 shrink-0 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo.png"
              alt="SlideX"
              width={260}
              height={72}
              priority
              className="h-auto w-[150px] object-contain"
            />
          </Link>

          <nav aria-label={isZh ? "主要導覽" : "Main navigation"} className="ml-14 hidden h-full items-center gap-1 md:flex">
            <div
              ref={productMenuRef}
              className="relative flex h-full items-center"
              onMouseEnter={() => setProductOpen(true)}
              onMouseLeave={() => setProductOpen(false)}
            >
              <button
                type="button"
                aria-expanded={productOpen}
                aria-haspopup="menu"
                onClick={() => setProductOpen((open) => !open)}
                className={`inline-flex h-11 items-center gap-1.5 px-4 text-[15px] font-medium transition-colors ${
                  pathname.includes(`/${locale}/pitch`) || pathname.includes(`/${locale}/briefly`)
                    ? "text-white"
                    : "text-white/62 hover:text-white"
                }`}
              >
                {isZh ? "產品" : "Product"}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${productOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {productOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.985 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 top-[66px] w-[520px] rounded-lg border border-white/12 bg-[#111315] p-2 shadow-[0_28px_90px_rgba(0,0,0,0.48)]"
                  >
                    <div className="grid grid-cols-2 gap-1.5">
                      {products.map((product) => {
                        const Icon = product.icon;
                        return (
                          <Link
                            key={product.href}
                            role="menuitem"
                            href={localePath(product.href)}
                            className="group flex min-h-40 flex-col rounded-md border border-transparent p-4 transition-colors hover:border-white/10 hover:bg-white/[0.055]"
                          >
                            <span className={`flex h-9 w-9 items-center justify-center rounded-md ${product.accent}`}>
                              <Icon className="h-4 w-4" strokeWidth={1.8} />
                            </span>
                            <span className="mt-5 flex items-center justify-between text-[17px] font-semibold text-white">
                              {product.label}
                              <ArrowUpRight className="h-4 w-4 text-white/28 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                            </span>
                            <span className="mt-2 text-[13px] leading-5 text-white/46">{product.description}</span>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-white/10 px-3 pb-1 pt-3 text-[12px] text-white/38">
                      <span>{isZh ? "從內容到畫面，一套完整工作流" : "One workflow, from content to slides"}</span>
                      <Link href={localePath("/")} className="inline-flex items-center gap-1.5 text-white/62 hover:text-white">
                        {isZh ? "產品總覽" : "Overview"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {[
              { href: "/docs", label: isZh ? "文件" : "Docs" }
            ].map((link) => (
              <Link
                key={link.href}
                href={localePath(link.href)}
                className={`inline-flex h-11 items-center px-4 text-[15px] font-medium transition-colors ${
                  isActive(link.href) ? "text-white" : "text-white/58 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <div ref={languageMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={languageOpen}
                aria-haspopup="menu"
                onClick={() => setLanguageOpen((open) => !open)}
                className="inline-flex h-11 items-center gap-2 px-3 text-[14px] font-medium text-white/56 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Globe2 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden lg:inline">{locale === "zh-TW" ? "繁中" : "EN"}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${languageOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {languageOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-[calc(100%+8px)] w-44 rounded-lg border border-white/12 bg-[#111315] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
                  >
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          setLocale(language.code);
                          setLanguageOpen(false);
                        }}
                        className={`flex h-10 w-full items-center justify-between rounded-md px-3 text-left text-sm transition-colors ${
                          locale === language.code ? "bg-white/10 text-white" : "text-white/58 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        {language.label}
                        {locale === language.code && <Check className="h-4 w-4 text-[#c4ee87]" aria-hidden="true" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href={localePath("/login")}
              className="inline-flex h-11 items-center px-4 text-[14px] font-medium text-white/64 transition-colors hover:text-white"
            >
              {isZh ? "登入" : "Log in"}
            </Link>

            <Link
              href="/workspace/pitch"
              className="group ml-1 inline-flex h-11 items-center gap-2 rounded-md bg-[#c4ee87] px-5 text-[14px] font-semibold text-[#0a1a00] transition-colors hover:bg-[#d8f6ad] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c4ee87]"
            >
              {isZh ? "開始製作" : "Start creating"}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? (isZh ? "關閉選單" : "Close menu") : (isZh ? "開啟選單" : "Open menu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto inline-flex h-11 w-11 items-center justify-center text-white md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 flex flex-col bg-[#090a0c] px-5 pb-7 pt-28 text-white md:hidden"
          >
            <nav aria-label={isZh ? "手機導覽" : "Mobile navigation"} className="flex flex-col border-t border-white/10">
              {products.map((product) => (
                <Link
                  key={product.href}
                  href={localePath(product.href)}
                  className={`flex min-h-20 items-center justify-between border-b border-white/10 text-[28px] font-semibold ${
                    isActive(product.href) ? "text-[#c4ee87]" : "text-white"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-md ${product.accent}`}>
                      <product.icon className="h-5 w-5" />
                    </span>
                    {product.label}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-white/40" aria-hidden="true" />
                </Link>
              ))}
              <Link
                href={localePath("/docs")}
                className={`flex min-h-20 items-center justify-between border-b border-white/10 text-[28px] font-semibold ${
                  isActive("/docs") ? "text-[#c4ee87]" : "text-white"
                }`}
              >
                {isZh ? "文件" : "Docs"}
                <ArrowUpRight className="h-5 w-5 text-white/40" aria-hidden="true" />
              </Link>
            </nav>

            <div className="mt-auto grid gap-3">
              <div className="flex gap-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => setLocale(language.code)}
                    className={`h-11 flex-1 rounded-md border text-sm font-medium ${
                      locale === language.code
                        ? "border-white/28 bg-white/10 text-white"
                        : "border-white/10 text-white/50"
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
              <Link
                href={localePath("/login")}
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/12 text-sm font-medium text-white/72"
              >
                {isZh ? "登入" : "Log in"}
              </Link>
              <Link
                href="/workspace/pitch"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-md bg-[#c4ee87] px-5 text-[15px] font-semibold text-[#0a1a00]"
              >
                {isZh ? "開始製作" : "Start creating"}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
