import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { href: "/studio", label: "Studio" },
      { href: "/download", label: "Download" }
    ]
  },
  {
    title: "Library",
    links: [
      { href: "/templates", label: "Presets" },
      { href: "/resources", label: "Docs" }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.1] bg-[#080a0f] px-6">
      <div className="mx-auto max-w-7xl py-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center" aria-label="SlideX home">
              <img
                src="/logo.png"
                alt="SlideX"
                className="h-auto w-[92px] rounded-md object-contain"
              />
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-500">
              Motion decks for teams that want source, timing, and export in one place.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/download"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200 active:scale-95"
              >
                <Download className="h-4 w-4" />
                Download
              </Link>
              <Link
                href="/studio"
                className="group inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-white/[0.22] hover:bg-white/[0.08] active:scale-95"
              >
                Open Studio
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:justify-self-end lg:min-w-[360px]">
            {footerSections.map((section) => (
              <div key={section.title}>
                <p className="text-sm font-semibold text-white">{section.title}</p>
                <div className="mt-4 grid gap-3">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-neutral-500 transition hover:text-neutral-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-xs text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 SlideX. All rights reserved.</span>
          <span className="font-mono uppercase tracking-[0.18em] text-neutral-700">
            MDX Motion Studio
          </span>
        </div>
      </div>
    </footer>
  );
}
