"use client";

import { SiteFooter } from "@/common/ui";

export function MarketingFooter() {
  return (
    <SiteFooter
      background={
        <div aria-hidden="true" className="marketing-footer-surface pointer-events-none absolute inset-0 -z-20" />
      }
    />
  );
}
