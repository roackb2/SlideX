"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Languages, Menu, X } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

const GITHUB_REPOSITORY_URL = "https://github.com/zz41354899/SlideX";
const easeSmooth = [0.22, 1, 0.36, 1] as const;

function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.14 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.7.83.58C20.56 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

export function SiteNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const nextLocale = locale === "zh-TW" ? "en" : "zh-TW";
  const navItems = [
    { href: "/resources", label: t.nav.resources },
    { href: "/templates", label: t.nav.templates }
  ];

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  return (
    <div 
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pb-3 md:px-4 md:pb-4"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
    >
      <div className="relative w-full max-w-5xl">
        <motion.nav
          initial={{ y: -24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: easeSmooth }}
          className={`flex h-[56px] items-center justify-between gap-3 rounded-full border px-4 py-2 transition-all duration-500 sm:h-[58px] sm:px-5 ${
            isMenuOpen 
              ? "border-transparent bg-transparent shadow-none" 
              : "border-white/[0.11] bg-[#111118]/82 shadow-2xl shadow-black/35 backdrop-blur-2xl"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3 md:gap-5">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                className="flex items-center shrink-0"
                href="/"
                aria-label={t.nav.homeLabel}
                onClick={() => setIsMenuOpen(false)}
              >
                <img
                  src="/logo.png"
                  alt={t.common.productName}
                  className="h-auto w-[64px] rounded-md object-contain sm:w-[72px] md:w-[88px]"
                />
              </Link>
            </motion.div>

            <div className="hidden items-center gap-0.5 md:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                          : "text-neutral-400 hover:bg-white/[0.07] hover:text-neutral-200"
                      }`}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="shrink-0"
            >
              <a
                href={GITHUB_REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.nav.githubLabel}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-neutral-300 transition-colors hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white"
              >
                <GithubMark className="h-4 w-4" />
              </a>
            </motion.div>

            <div className="relative hidden sm:block">
              <button
                className="flex h-9 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 text-xs font-semibold text-neutral-300 transition hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white"
                type="button"
                aria-label={t.nav.languageLabel}
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              >
                <Languages className="h-3.5 w-3.5" />
                {locale === "en" ? "EN" : "TW"}
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsLangMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-50 mt-2 w-32 origin-top-right rounded-xl border border-white/[0.12] bg-[#111118] p-1 shadow-2xl shadow-black/50"
                    >
                      <button
                        onClick={() => { setLocale("en"); setIsLangMenuOpen(false); }}
                        className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                          locale === "en" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => { setLocale("zh-TW"); setIsLangMenuOpen(false); }}
                        className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                          locale === "zh-TW" ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        繁體中文
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden shrink-0 md:block"
            >
              <Link
                href="/studio"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.2)] transition-all hover:bg-neutral-200 hover:shadow-[0_0_22px_rgba(94,106,210,0.28)] md:px-5"
              >
                <span>{t.nav.getStarted}</span>
              </Link>
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-neutral-300 transition-colors hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white md:hidden"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={isMenuOpen}
              type="button"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: easeSmooth }}
              className="fixed inset-0 z-[-1] flex flex-col justify-between bg-[#050505]/95 backdrop-blur-3xl md:hidden"
            >
              <div className="h-[80px] shrink-0" />
              
              <div className="flex flex-1 flex-col justify-center px-8 sm:px-12">
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 50, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 + idx * 0.08, duration: 0.6, ease: easeSmooth }}
                    className="overflow-hidden py-3"
                    style={{ perspective: 1000 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center text-[2.75rem] font-black tracking-tighter text-neutral-500 transition-all duration-500 hover:translate-x-6 hover:text-white leading-none sm:text-6xl"
                    >
                      <span className="mr-5 text-xl font-bold text-neutral-800 transition-colors duration-500 group-hover:text-blue-500">
                        0{idx + 1}
                      </span>
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3, duration: 0.5, ease: easeSmooth }}
                className="flex flex-col gap-6 px-8 pb-10 sm:px-12"
              >
                <button
                  className="flex w-max items-center gap-3 text-sm font-semibold text-neutral-400 transition hover:text-white"
                  type="button"
                  onClick={() => setLocale(nextLocale)}
                >
                  <Languages className="h-5 w-5" />
                  {t.nav.languageLabel} ({nextLocale})
                </button>
                <Link
                  href="/studio"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-14 w-full items-center justify-center rounded-full bg-white text-lg font-bold text-black transition-transform duration-300 hover:scale-[1.02] active:scale-95"
                >
                  {t.nav.getStarted}
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
