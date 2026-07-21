"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Copy } from "lucide-react";

export const mktgEase = [0.16, 1, 0.3, 1] as const;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4ee87]";

export function MktgSection({
  children,
  className = "",
  id
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`px-5 sm:px-7 lg:px-10 ${className}`} id={id}>
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}

export function MktgPrimaryLink({
  children,
  className = "",
  href
}: {
  children: ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <Link
      className={`inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-7 text-[16px] font-semibold text-on-accent transition-colors hover:bg-accent-hover active:translate-y-px ${focusRing} ${className}`}
      href={href}
    >
      {children}
    </Link>
  );
}

export function MktgGhostLink({
  children,
  className = "",
  external = false,
  href
}: {
  children: ReactNode;
  className?: string;
  external?: boolean;
  href: string;
}) {
  const classes = `inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/16 bg-white/[0.045] px-6 text-[15px] font-semibold text-white/72 transition-colors hover:border-white/30 hover:text-white active:translate-y-px ${focusRing} ${className}`;

  if (external) {
    return (
      <a className={classes} href={href} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}

export function MktgTextLink({
  children,
  className = "",
  external = false,
  href
}: {
  children: ReactNode;
  className?: string;
  external?: boolean;
  href: string;
}) {
  const classes = `group inline-flex w-fit items-center gap-2 text-[15px] font-semibold text-white transition-colors hover:text-accent ${focusRing} ${className}`;
  const icon = <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />;

  if (external) {
    return (
      <a className={classes} href={href} rel="noreferrer" target="_blank">
        {children}
        {icon}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {children}
      {icon}
    </Link>
  );
}

export function CodeCard({
  code,
  copyLabel,
  copiedLabel,
  title
}: {
  code: string;
  copyLabel: string;
  copiedLabel: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-white/10 bg-canvas-deep">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
        <p className="font-mono-geist text-[11px] tracking-[0.18em] text-white/36">{title ?? "TERMINAL"}</p>
        <button
          aria-label={copied ? copiedLabel : copyLabel}
          className={`inline-flex h-7 items-center gap-1.5 rounded px-2 font-mono-geist text-[11px] text-white/46 transition-colors hover:bg-white/[0.06] hover:text-white ${focusRing}`}
          onClick={copy}
          type="button"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="w-full min-w-0 max-w-full overflow-x-auto px-5 py-4 font-mono-geist text-[14px] leading-6 text-white/78">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function BrowserFrame({
  alt,
  priority = false,
  src,
  url
}: {
  alt: string;
  priority?: boolean;
  src: string;
  url: string;
}) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-accent/20 via-transparent to-transparent opacity-60 blur-xl transition duration-500 group-hover:opacity-100" />
      <div className="relative overflow-hidden rounded-xl border border-white/14 bg-canvas-deep shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 border-b border-white/[0.08] bg-white/[0.03] px-4 py-3 backdrop-blur-md">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]/80 border border-[#e0443e]/40" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]/80 border border-[#dea123]/40" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]/80 border border-[#1aab29]/40" />
          </span>
          <span className="flex min-w-0 flex-1 justify-center">
            <span className="truncate rounded-md border border-white/[0.09] bg-white/[0.04] px-4 py-1 font-mono-geist text-[11px] tracking-[0.08em] text-white/50">
              {url}
            </span>
          </span>
          <span aria-hidden="true" className="w-[52px]" />
        </div>
        <div className="relative aspect-[16/10] w-full">
          <Image alt={alt} className="object-cover object-top" fill priority={priority} sizes="(min-width: 1024px) 880px, 100vw" src={src} />
        </div>
      </div>
    </div>
  );
}

export function TrustBadgeRow({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-center">
      {items.map((item) => (
        <li className="inline-flex items-center gap-2 font-mono-geist text-[12px] text-white/50" key={item}>
          <Check className="h-3.5 w-3.5 text-accent shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function StatStrip({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 border-y border-white/10 md:grid-cols-4">
      {items.map((item, index) => (
        <div
          className={`px-5 py-6 sm:px-6 ${index > 0 ? "border-l border-white/10 max-md:[&:nth-child(3)]:border-l-0 max-md:[&:nth-child(n+3)]:border-t max-md:[&:nth-child(n+3)]:border-white/10" : ""}`}
          key={item.label}
        >
          <dt className="font-mono-geist text-[10px] uppercase tracking-[0.22em] text-white/36">{item.label}</dt>
          <dd className="mt-2.5 text-[15px] font-semibold text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
