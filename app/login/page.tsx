"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/common/lib/I18nProvider";

export default function LoginPage() {
  const { locale, localePath } = useI18n();
  const isZh = locale === "zh-TW";

  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#0b0c0f] px-5 py-6 text-[#f4f4f1] sm:px-8 lg:px-10">
      <div className="flex items-center justify-between">
        <Link aria-label={isZh ? "SlideX 首頁" : "SlideX home"} className="inline-flex items-center gap-3" href={localePath("/")}>
          <Image alt="SlideX" className="h-auto w-[96px] object-contain" height={72} priority src="/logo.png" width={260} />
          <span className="rounded-md border border-white/[0.14] px-2 py-1 text-[11px] font-semibold text-white/62">Pitch Beta</span>
        </Link>
        <Link className="inline-flex h-10 items-center gap-2 text-[14px] font-medium text-white/50 transition-colors hover:text-white" href={localePath("/")}>
          <ArrowLeft className="h-4 w-4" />
          {isZh ? "返回首頁" : "Back home"}
        </Link>
      </div>

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-20">
        <p className="text-[13px] font-semibold text-[#9ad7ff]">Login</p>
        <h1 className="mt-5 text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.065em]">
          {isZh ? "登入功能正在開發中。" : "Login is in progress."}
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-8 text-white/55">
          {isZh ? "Pitch 目前正在封閉測試。帳號登入會在準備完成後開放。" : "Pitch is currently in closed beta. Account login will open when it is ready."}
        </p>
        <div className="mt-10 border-t border-white/[0.1] pt-5 text-[13px] leading-6 text-white/38">
          {isZh ? "目前不會收集任何登入資料。" : "No login information is collected at this time."}
        </div>
      </section>
    </main>
  );
}
