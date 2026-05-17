"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/resources", label: "Docs" },
  { href: "/templates", label: "Presets" }
];

const easeSmooth = [0.22, 1, 0.36, 1] as const;

const menuVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: easeSmooth }
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    filter: "blur(4px)",
    transition: { duration: 0.25, ease: easeSmooth }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.06, duration: 0.35, ease: easeSmooth }
  })
};

export function SiteNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        {/* ─── Nav Bar ─── */}
        <motion.nav
          initial={{ y: -24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: easeSmooth }}
          whileHover={{ boxShadow: "0 0 40px rgba(94,106,210,0.12)" }}
          className="flex items-center justify-between rounded-full border border-white/[0.10] bg-[#111118]/80 px-4 py-2 backdrop-blur-2xl"
        >
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-3 md:gap-5">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                className="flex items-center shrink-0"
                href="/"
                onClick={() => setIsMenuOpen(false)}
              >
                <img
                  src="/logo.png"
                  alt="SlideX"
                  className="w-[72px] md:w-[88px] h-auto rounded-md object-contain"
                />
              </Link>
            </motion.div>

            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-0.5">
              {navItems.map((item) => (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/[0.07] hover:text-neutral-300"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: CTA + Hamburger */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Desktop CTA */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden sm:block"
            >
              <Link
                href="/studio"
                className="group relative overflow-hidden rounded-full bg-white px-4 md:px-5 py-1.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(94,106,210,0.25)]"
              >
                <span className="relative z-10">Open Studio</span>
                <div className="absolute inset-0 bg-neutral-200 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </motion.div>

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] text-neutral-400 transition-colors hover:text-white hover:border-white/[0.18]"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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

        {/* ─── Backdrop (same layer, inside wrapper) ─── */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[-1] sm:hidden"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Dynamic Island Dropdown (same layer, flush with nav) ─── */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full left-0 right-0 pt-2 sm:hidden z-10"
            >
              <div className="mx-auto max-w-5xl">
                <div className="rounded-[2rem] border border-white/[0.12] bg-[#111118]/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
                  <div className="p-3">
                    {navItems.map((item, idx) => (
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
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-neutral-300 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]">
                            <span className="text-xs text-neutral-400">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                          </div>
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3, ease: easeSmooth }}
                    className="border-t border-white/[0.08] p-3"
                  >
                    <Link
                      href="/studio"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition-all hover:bg-neutral-200"
                    >
                      Open Studio
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
