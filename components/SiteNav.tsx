"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Languages, Menu, X } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

const menuVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.97, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: easeSmooth }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    filter: "blur(6px)",
    transition: { duration: 0.25, ease: easeSmooth }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.06, duration: 0.35, ease: easeSmooth }
  })
};

export function SiteNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center p-3 md:p-4">
      <div className="relative w-full max-w-5xl">
        <motion.nav
          initial={{ y: -24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: easeSmooth }}
          whileHover={{ boxShadow: "0 0 42px rgba(94,106,210,0.16)" }}
          className="flex h-[58px] items-center justify-between gap-3 overflow-hidden rounded-full border border-white/[0.11] bg-[#111118]/82 px-3.5 py-2 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:px-4"
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
                  className="w-[72px] md:w-[88px] h-auto rounded-md object-contain"
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
            <button
              className="hidden h-9 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 text-xs font-semibold text-neutral-300 transition hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white sm:inline-flex"
              type="button"
              aria-label={t.nav.languageLabel}
              onClick={() => setLocale(nextLocale)}
            >
              <Languages className="h-3.5 w-3.5" />
              {t.nav.localeShortLabel}
            </button>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden shrink-0 md:block"
            >
              <Link
                href="/download"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.2)] transition-all hover:bg-neutral-200 hover:shadow-[0_0_22px_rgba(94,106,210,0.28)] md:px-5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.nav.download}</span>
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
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[-1] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 right-0 top-full z-10 pt-2 md:hidden"
            >
              <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-[2rem] border border-white/[0.13] bg-[#111118]/96 shadow-2xl shadow-black/60 backdrop-blur-2xl">
                  <div className="border-b border-white/[0.08] px-5 py-4">
                    <p className="text-sm font-semibold text-white">{t.common.productName}</p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                      {t.nav.mobileDescription}
                    </p>
                  </div>

                  <div className="p-3">
                    {navItems.map((item, idx) => {
                      const isActive = pathname === item.href;

                      return (
                        <motion.div
                          key={item.href}
                          custom={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition-colors ${
                              isActive
                                ? "bg-white/[0.09] text-white"
                                : "text-neutral-300 hover:bg-white/[0.07] hover:text-white"
                            }`}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.06]">
                              <span className="text-xs text-neutral-400">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                            </div>
                            <span>{item.label}</span>
                            {isActive && (
                              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#8b95e0]" />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3, ease: easeSmooth }}
                    className="border-t border-white/[0.08] p-3"
                  >
                    <button
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-sm font-semibold text-neutral-200 transition hover:border-white/[0.2] hover:bg-white/[0.09]"
                      type="button"
                      aria-label={t.nav.languageLabel}
                      onClick={() => setLocale(nextLocale)}
                    >
                      <Languages className="h-4 w-4" />
                      {t.nav.localeShortLabel}
                    </button>
                    <Link
                      href="/download"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4" />
                      {t.nav.download}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
