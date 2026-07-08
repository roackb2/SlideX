"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/common/lib/I18nProvider";
import { Menu, X, ChevronDown, Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const languages = [
  { code: "zh-TW" as const, label: "繁體中文", flag: "🇹🇼" },
  { code: "en" as const, label: "English", flag: "🇺🇸" },
];

export function SiteNav() {
  const { t, locale, setLocale, localePath } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track scroll position for enhanced shadow state
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/pitch", label: "Pitch" },
    { href: "/briefly", label: "Briefly" },
    { href: "/docs", label: t.nav.resources },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1]
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  const linkVariants = {
    closed: { opacity: 0, y: 20 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + i * 0.05,
        duration: 0.5,
        ease: [0.33, 1, 0.68, 1]
      }
    })
  };

  const currentLang = languages.find((l) => l.code === locale) ?? languages[0];

  return (
    <>
      {/* ── Desktop Floating Pill Nav ── */}
      <nav
        className={[
          "fixed top-5 left-1/2 -translate-x-1/2 z-50",
          "hidden md:flex items-center",
          "h-14 px-3 rounded-full",
          "backdrop-blur-xl",
          "border border-white/[0.08]",
          "transition-all duration-500 ease-out",
          isScrolled
            ? "bg-[#0c0d0f]/88 shadow-[0_8px_40px_rgba(0,0,0,0.48),0_0_0_1px_rgba(255,255,255,0.06)]"
            : "bg-[#0c0d0f]/75 shadow-[0_8px_32px_rgba(0,0,0,0.32),0_0_0_1px_rgba(255,255,255,0.04)]",
        ].join(" ")}
      >
        {/* Logo */}
        <Link href={localePath("/")} className="flex items-center shrink-0 pl-2 pr-4">
          <img src="/logo.png" alt="SlideX Logo" className="w-[62px] h-auto object-contain" />
        </Link>

        {/* Center nav links */}
        <ul className="flex items-center gap-1 text-[13.5px] font-medium">
          {/* Products dropdown */}
          <li className="relative group">
            <span className="flex items-center gap-1 cursor-pointer text-white/60 hover:text-white hover:bg-white/[0.06] rounded-full px-3.5 py-1.5 transition-all duration-200">
              {t.nav.products} <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block pt-2">
              <div className="bg-[#101214]/95 border border-white/10 rounded-xl p-2 w-[220px] shadow-2xl backdrop-blur-xl">
                <Link href={localePath("/pitch")} className="block px-3 py-2.5 rounded-lg hover:bg-white/10 text-white transition-colors">
                  <div className="font-medium text-[13px]">SlideX Pitch</div>
                  <div className="text-xs text-white/40 mt-0.5">Motion Design Editor</div>
                </Link>
                <Link href={localePath("/briefly")} className="block px-3 py-2.5 rounded-lg hover:bg-white/10 text-white transition-colors">
                  <div className="font-medium text-[13px]">SlideX Briefly</div>
                  <div className="text-xs text-white/40 mt-0.5">Project Brief Builder</div>
                </Link>
              </div>
            </div>
          </li>

          {/* Static links */}
          <li>
            <Link
              href={localePath("/docs")}
              className="text-white/60 hover:text-white hover:bg-white/[0.06] rounded-full px-3.5 py-1.5 transition-all duration-200"
            >
              {t.nav.resources}
            </Link>
          </li>
        </ul>

        {/* Spacer */}
        <div className="w-4 shrink-0" />

        {/* Right side: Language + CTA */}
        <div className="flex items-center gap-3 shrink-0 pr-1.5">
          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 text-white/55 hover:text-white hover:bg-white/[0.06] rounded-full px-2.5 py-1.5 transition-all duration-200 text-[13px] font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{currentLang.label}</span>
              <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 bg-[#101214]/95 border border-white/10 rounded-xl p-1.5 w-[180px] shadow-2xl backdrop-blur-xl z-[60]"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                        locale === lang.code
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="flex-1 text-left">{lang.label}</span>
                      {locale === lang.code && (
                        <Check className="w-3.5 h-3.5 text-[#9ad7ff]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <Link
            href={localePath("/pitch")}
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-[#f7f4ec] px-5 text-[13px] font-semibold text-[#070809] transition duration-300 hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9ad7ff] active:translate-y-0"
          >
            {t.nav.getStarted}
          </Link>
        </div>
      </nav>

      {/* ── Mobile Nav Top Bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-[70] bg-[#090a0b]/92 backdrop-blur-md border-b border-white/10 md:hidden rounded-b-xl">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href={localePath("/")} className="font-bold text-xl text-white flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <img src="/logo.png" alt="SlideX Logo" className="w-[65px] h-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white relative z-[70] w-8 h-8 flex items-center justify-center">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-[65] bg-[#090a0b] flex flex-col md:hidden pt-28 px-6 pb-12 overflow-y-auto"
          >
            <div className="flex flex-col gap-8 h-full">
              <div className="flex flex-col gap-6 text-4xl font-medium">
                {navLinks.map((link, i) => (
                  <motion.div key={link.href} custom={i} variants={linkVariants} initial="closed" animate="open" exit="closed">
                    <Link 
                      href={localePath(link.href)} 
                      className={`block ${i < 3 ? "text-white" : "text-white/50 hover:text-white transition-colors"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                variants={linkVariants} 
                custom={navLinks.length} 
                initial="closed" 
                animate="open" 
                exit="closed"
                className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-3"
              >
                <p className="text-[11px] uppercase text-white/40 font-semibold mb-1">Language</p>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                      locale === lang.code
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="flex-1 text-left">{lang.label}</span>
                    {locale === lang.code && (
                      <Check className="w-4 h-4 text-[#9ad7ff]" />
                    )}
                  </button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
