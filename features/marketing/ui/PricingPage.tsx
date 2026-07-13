"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { useI18n } from "@/common/lib/I18nProvider";

export function PricingPage() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const planItems = isZh ? ["瀏覽器工作區", "單色 Fill 與動態背景", "畫布編輯"] : ["Browser workspace", "Solid fill and dynamic backgrounds", "Canvas editing"];

  return (
    <main className="min-h-[100dvh] bg-[#0b0c0f] px-5 pb-24 pt-28 text-[#f4f4f1] sm:px-7 lg:px-10 lg:pt-36">
      <section className="mx-auto max-w-4xl">
        <p className="text-[13px] font-semibold text-[#79b6ff]">Pricing</p>
        <h1 className="mt-5 max-w-3xl text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.95] tracking-[-0.065em]">
          {isZh ? "現在免費。" : "Free today."}
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-8 text-white/58">
          {isZh ? "Pitch 目前可以免費使用。如果未來推出付費功能，我們會先清楚說明價格與條件。" : "Pitch is free to use today. If paid functionality arrives, its price and terms will be clear before it becomes available."}
        </p>
      </section>

      <section className="mx-auto mt-20 max-w-4xl border-t border-white/[0.09] pt-8 lg:mt-24">
        <div className="rounded-lg border border-white/[0.1] bg-white/[0.025] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[17px] font-semibold text-white">Pitch</p>
              <p className="mt-2 text-[14px] text-white/48">{isZh ? "目前的完整工作區" : "The current complete workspace"}</p>
            </div>
            <p className="text-[42px] font-semibold leading-none tracking-[-0.06em]">$0</p>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {planItems.map((item) => (
              <div className="flex items-start gap-2 text-[14px] leading-6 text-white/62" key={item}>
                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#79b6ff]" />
                {item}
              </div>
            ))}
          </div>
          <Link className="group mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-[#f4f4f1] px-4 text-[14px] font-semibold text-[#0b0c0f] transition-colors hover:bg-white active:translate-y-px" href={appRoutes.workspace}>
            {isZh ? "開始使用 Pitch" : "Use Pitch"}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
