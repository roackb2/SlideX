"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Globe2, Menu, X } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";
import { stripLocaleFromPath } from "@/common/lib/i18nRouting";

const languages = [
  { code: "zh-TW" as const, label: "繁體中文" },
  { code: "en" as const, label: "English" }
];

const productItems = [
  { href: "/agent", en: "Agent", zh: "Agent" },
  { href: "/download", en: "Download", zh: "下載" }
];

const resourceItems = [
  { href: "/docs", en: "Docs", zh: "文件" },
  { href: "/blog", en: "Blog", zh: "部落格" }
];

const pricingItem = { href: "/pricing", en: "Pricing", zh: "價格" };

const mobileGroups = [
  { en: "Product", items: productItems, zh: "產品" },
  { en: "Resources", items: resourceItems, zh: "資源" }
];

const languageSwitchNavigationStateKey = "slidex:language-switch-navigation-state";

type NavigationState = {
  menuOpen: boolean;
  navigationOpen: "product" | "resources" | null;
};

export function SiteNav() {
  const { locale, localePath, setLocale } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState<"product" | "resources" | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isZh = locale === "zh-TW";
  const previousContentPathRef = useRef(stripLocaleFromPath(pathname));
  const islandTransition = shouldReduceMotion ? { duration: 0 } : { damping: 28, stiffness: 330, type: "spring" as const };

  useEffect(() => {
    const nextContentPath = stripLocaleFromPath(pathname);

    if (previousContentPathRef.current !== nextContentPath) {
      setMenuOpen(false);
      setLanguageOpen(false);
      setNavigationOpen(null);
    }

    previousContentPathRef.current = nextContentPath;
  }, [pathname]);

  useEffect(() => {
    const savedState = consumeLanguageSwitchNavigationState();

    if (!savedState) {
      return;
    }

    setMenuOpen(savedState.menuOpen);
    setNavigationOpen(savedState.navigationOpen);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLocaleChange = (nextLocale: (typeof languages)[number]["code"]) => {
    if (nextLocale === locale) {
      setLanguageOpen(false);
      return;
    }

    persistLanguageSwitchNavigationState({ menuOpen, navigationOpen });
    setLanguageOpen(false);
    setLocale(nextLocale);
  };

  return (
    <>
      <AnimatePresence>
        {menuOpen ? (
          <motion.button
            aria-label={isZh ? "關閉選單" : "Close menu"}
            className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px] lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            type="button"
          />
        ) : null}
      </AnimatePresence>
      <header className="fixed inset-x-0 top-6 z-[110] flex justify-center px-4 pointer-events-none">
        <motion.div
          className={`pointer-events-auto relative isolate mx-auto flex flex-col overflow-hidden border border-white/[0.12] bg-[#10120f]/[0.94] shadow-[0_22px_64px_rgba(3,6,2,0.56)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_86%_4%,rgba(216,242,125,0.11),transparent_28%),radial-gradient(circle_at_12%_80%,rgba(100,128,65,0.09),transparent_34%)] lg:h-14 lg:w-auto lg:overflow-visible lg:rounded-full ${
            menuOpen
              ? "h-auto max-h-[calc(100dvh-3rem)] w-[calc(100vw-2rem)] max-w-[560px] rounded-[28px]"
              : "h-14 w-[calc(100vw-2rem)] max-w-[260px] rounded-full sm:max-w-[300px] lg:max-w-none"
          }`}
          layout
          transition={islandTransition}
        >
          <div className="relative z-10 flex h-14 shrink-0 items-center gap-4 px-5 lg:px-6">
            <div className="flex shrink-0 items-center gap-3">
              <Link aria-label={isZh ? "SlideX 首頁" : "SlideX home"} className="inline-flex items-center opacity-95 transition-opacity hover:opacity-70" href={localePath("/")}>
                <Image alt="SlideX" className="h-auto w-[82px] object-contain" height={72} loading="eager" priority src="/logo.png" width={260} />
              </Link>
              <span className="whitespace-nowrap rounded-full border border-white/[0.14] px-2 py-0.5 font-mono-geist text-[9px] font-medium tracking-[0.14em] text-white/62">BETA</span>
            </div>

            <nav aria-label={isZh ? "主要導覽" : "Main navigation"} className="ml-4 hidden items-center gap-1 lg:flex">
            <div className="relative">
              <button
                aria-controls="product-menu"
                aria-expanded={navigationOpen === "product"}
                className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[15px] font-medium tracking-[-0.01em] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                onClick={() => {
                  setNavigationOpen((open) => (open === "product" ? null : "product"));
                  setLanguageOpen(false);
                }}
                type="button"
              >
                {isZh ? "產品" : "Product"}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${navigationOpen === "product" ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {navigationOpen === "product" ? (
                  <NavMenu id="product-menu" isZh={isZh} items={productItems} localePath={localePath} />
                ) : null}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button
                aria-controls="resources-menu"
                aria-expanded={navigationOpen === "resources"}
                className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[15px] font-medium tracking-[-0.01em] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                onClick={() => {
                  setNavigationOpen((open) => (open === "resources" ? null : "resources"));
                  setLanguageOpen(false);
                }}
                type="button"
              >
                {isZh ? "資源" : "Resources"}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${navigationOpen === "resources" ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {navigationOpen === "resources" ? (
                  <NavMenu id="resources-menu" isZh={isZh} items={resourceItems} localePath={localePath} />
                ) : null}
              </AnimatePresence>
            </div>
            <Link
              className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[15px] font-medium tracking-[-0.01em] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
              href={localePath(pricingItem.href)}
            >
              {isZh ? pricingItem.zh : pricingItem.en}
            </Link>
            </nav>

            <div className="ml-4 hidden items-center gap-2 lg:flex">
            <div className="relative">
              <button
                aria-expanded={languageOpen}
                aria-haspopup="menu"
                className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-[14px] font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
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
                    className="absolute right-0 top-[calc(100%+8px)] w-40 rounded-xl border border-white/14 bg-[#0b0c0f] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                    exit={{ opacity: 0, y: -5 }}
                    initial={{ opacity: 0, y: -5 }}
                    role="menu"
                    transition={{ duration: 0.16 }}
                  >
                    {languages.map((language) => (
                      <button
                        className={`flex h-9 w-full items-center rounded-lg px-2.5 text-left text-[14px] transition-colors ${
                          locale === language.code ? "bg-white/[0.1] text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                        }`}
                        key={language.code}
                        onClick={() => handleLocaleChange(language.code)}
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
            <Link className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[15px] font-medium tracking-[-0.01em] text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white" href={localePath("/login")}>
              {isZh ? "登入" : "Log in"}
            </Link>
            <Link className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-5 text-[15px] font-semibold text-on-accent transition-colors hover:bg-accent-hover active:translate-y-px" href={appRoutes.liveDemo}>
              {isZh ? "Live Demo" : "Live Demo"}
            </Link>
            </div>

            <button
              aria-controls="mobile-navigation-island"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? (isZh ? "關閉選單" : "Close menu") : (isZh ? "開啟選單" : "Open menu")}
              className="ml-auto inline-flex h-10 w-10 items-center justify-center text-white lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {menuOpen ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-4 text-white lg:hidden"
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                id="mobile-navigation-island"
                initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.1, duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
              >
                <nav aria-label={isZh ? "手機導覽" : "Mobile navigation"} className="grid gap-3">
                  {mobileGroups.map((group, groupIndex) => (
                    <motion.section
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[20px] border border-white/[0.08] bg-black/[0.13] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                      key={group.en}
                      transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.13 + groupIndex * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="px-3 pb-1.5 pt-0.5 font-mono-geist text-[10px] font-medium tracking-[0.16em] text-white/40">{isZh ? group.zh : group.en}</p>
                      <div className="grid gap-0.5">
                        {group.items.map((item, itemIndex) => (
                          <motion.div
                            animate={{ opacity: 1, x: 0 }}
                            initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                            key={item.href}
                            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.18 + groupIndex * 0.08 + itemIndex * 0.045, duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <Link
                              className="group flex min-h-11 items-center justify-between rounded-xl px-3 text-[18px] font-semibold tracking-[-0.035em] text-white/88 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                              href={localePath(item.href)}
                              onClick={() => setMenuOpen(false)}
                            >
                              {isZh ? item.zh : item.en}
                              <ArrowUpRight className="h-3.5 w-3.5 text-white/30 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  ))}
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-[20px] border border-accent/20 bg-[linear-gradient(120deg,rgba(216,242,125,0.17),rgba(216,242,125,0.055)_58%,rgba(255,255,255,0.025))] p-1"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.28, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link className="group flex h-13 items-center justify-between rounded-[15px] px-3.5 text-[18px] font-semibold tracking-[-0.035em] text-white transition-colors hover:bg-white/[0.055] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent" href={localePath(pricingItem.href)} onClick={() => setMenuOpen(false)}>
                      {isZh ? pricingItem.zh : pricingItem.en}
                      <ArrowUpRight className="h-4 w-4 text-accent transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                </nav>

                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-auto pt-4"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.34, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/[0.08] bg-black/[0.16] p-1.5 pl-3">
                    <span className="flex items-center gap-2 text-[12px] font-medium text-white/46">
                      <Globe2 className="h-3.5 w-3.5" />
                      {isZh ? "語言" : "Language"}
                    </span>
                    <div className="flex gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => {
                            handleLocaleChange(language.code);
                          }}
                          type="button"
                          className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                            locale === language.code
                              ? "bg-white/[0.12] text-white shadow-sm"
                              : "text-white/50 hover:text-white"
                          }`}
                        >
                          {language.code === "zh-TW" ? "繁中" : "EN"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-[auto_1fr] gap-2">
                    <Link className="inline-flex h-11 items-center justify-center rounded-[15px] px-4 text-[14px] font-semibold text-white/68 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white" href={localePath("/login")} onClick={() => setMenuOpen(false)}>
                      {isZh ? "登入" : "Log in"}
                    </Link>
                    <Link className="group inline-flex h-11 items-center justify-center gap-1.5 rounded-[15px] bg-accent text-[14px] font-semibold text-on-accent shadow-[0_10px_26px_rgba(154,186,75,0.17)] transition-all hover:-translate-y-0.5 hover:bg-accent-hover active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" href={appRoutes.liveDemo} onClick={() => setMenuOpen(false)}>
                      {isZh ? "立即試用" : "Try Live Demo"}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </header>
    </>
  );
}

function persistLanguageSwitchNavigationState(state: NavigationState) {
  try {
    window.sessionStorage.setItem(languageSwitchNavigationStateKey, JSON.stringify(state));
  } catch {
    // Navigation still works if session storage is unavailable.
  }
}

function consumeLanguageSwitchNavigationState(): NavigationState | null {
  try {
    const rawState = window.sessionStorage.getItem(languageSwitchNavigationStateKey);
    window.sessionStorage.removeItem(languageSwitchNavigationStateKey);

    if (!rawState) {
      return null;
    }

    const state = JSON.parse(rawState) as Partial<NavigationState>;

    if (typeof state.menuOpen !== "boolean" || ![null, "product", "resources"].includes(state.navigationOpen ?? null)) {
      return null;
    }

    return {
      menuOpen: state.menuOpen,
      navigationOpen: state.navigationOpen ?? null
    };
  } catch {
    return null;
  }
}

function NavMenu({
  id,
  isZh,
  items,
  localePath
}: {
  id: string;
  isZh: boolean;
  items: typeof productItems | typeof resourceItems;
  localePath: (path: string) => string;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="absolute left-0 top-[calc(100%+8px)] min-w-44 rounded-xl border border-white/14 bg-[#0b0c0f] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      exit={{ opacity: 0, y: -5 }}
      id={id}
      initial={{ opacity: 0, y: -5 }}
      role="menu"
      transition={{ duration: 0.16 }}
    >
      {items.map((item) => (
        <Link
          className="flex h-9 items-center rounded-lg px-2.5 text-[14px] font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
          href={localePath(item.href)}
          key={item.href}
          role="menuitem"
        >
          {isZh ? item.zh : item.en}
        </Link>
      ))}
    </motion.div>
  );
}
