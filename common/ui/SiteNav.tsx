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

  const navLinks = [
    { href: "/studio", label: "Studio" },
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
      <nav className="fixed top-0 left-0 right-0 z-50 w-full flex-col bg-[#070707]/80 backdrop-blur-md border-b border-white/5 hidden md:flex">
        <div className="max-w-7xl mx-auto w-full px-4 h-16 flex items-center justify-between">
          <Link href={localePath("/")} className="flex items-center shrink-0">
            <span className="font-bold text-2xl tracking-tight text-white flex items-center gap-2">
              <img src="/logo.png" alt="SlideX Logo" className="w-[70px] h-auto object-contain" />
            </span>
          </Link>
      
          <ul className="flex items-center gap-8 text-[14px] font-medium">
            <li className="relative group cursor-pointer text-white/60 hover:text-white transition-colors py-4">
              <span className="flex items-center gap-1">{t.nav.products} <ChevronDown className="w-3.5 h-3.5 opacity-50" /></span>
              <div className="absolute left-0 top-full hidden group-hover:block -mt-2">
                <div className="bg-[#0d0d0d] border border-white/10 rounded-[16px] p-2 w-[220px] shadow-2xl backdrop-blur-xl">
                  <Link href={localePath("/studio")} className="block px-3 py-2.5 rounded-xl hover:bg-white/10 text-white transition-colors">
                    <div className="font-medium">SlideX Studio</div>
                    <div className="text-xs text-white/40 mt-0.5">Motion Design Editor</div>
                  </Link>
                  <Link href={localePath("/briefly")} className="block px-3 py-2.5 rounded-xl hover:bg-white/10 text-white transition-colors">
                    <div className="font-medium">SlideX Briefly</div>
                    <div className="text-xs text-white/40 mt-0.5">Project Brief Builder</div>
                  </Link>
                </div>
              </div>
            </li>
            <li><Link href={localePath("/docs")} className="text-white/60 hover:text-white transition-colors">{t.nav.resources}</Link></li>
          </ul>

          {/* Language Dropdown */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[13px] font-medium"
              >
                <Globe className="w-4 h-4" />
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
                    className="absolute right-0 top-full mt-3 bg-[#0d0d0d] border border-white/10 rounded-[14px] p-1.5 w-[180px] shadow-2xl backdrop-blur-xl z-[60]"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLocale(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                          locale === lang.code
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span className="flex-1 text-left">{lang.label}</span>
                        {locale === lang.code && (
                          <Check className="w-3.5 h-3.5 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-[70] bg-[#070707]/90 backdrop-blur-md border-b border-white/5 md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href={localePath("/")} className="font-bold text-xl tracking-tight text-white flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <img src="/logo.png" alt="SlideX Logo" className="w-[65px] h-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white relative z-[70] w-8 h-8 flex items-center justify-center">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-[65] bg-[#0a0a0a] flex flex-col md:hidden pt-28 px-6 pb-12 overflow-y-auto"
          >
            <div className="flex flex-col gap-8 h-full">
              <div className="flex flex-col gap-6 text-4xl font-medium tracking-tight">
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
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 font-semibold mb-1">Language</p>
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
                      <Check className="w-4 h-4 text-blue-500" />
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
