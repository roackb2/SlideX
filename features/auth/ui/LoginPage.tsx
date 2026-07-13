"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { appRoutes } from "@/common/lib/appRoutes";
import type { AuthProvider } from "@/features/auth/domain/authSession";
import { createFakeOAuthSession } from "@/features/auth/infrastructure/localAuthSession";
import { useLocalAuthSession } from "@/features/auth/ui/useLocalAuthSession";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 24 24">
      <path d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.51c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.59A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.39 13.9A6.02 6.02 0 0 1 6.08 12c0-.66.11-1.3.31-1.9V7.51H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.49l3.35-2.59Z" fill="#FBBC05" />
      <path d="M12 5.97c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.59C7.18 7.73 9.39 5.97 12 5.97Z" fill="#EA4335" />
    </svg>
  );
}

export function LoginPage() {
  const router = useRouter();
  const { isReady, session } = useLocalAuthSession();

  useEffect(() => {
    if (isReady && session) {
      router.replace(appRoutes.workspace);
    }
  }, [isReady, router, session]);

  function continueWith(provider: AuthProvider) {
    createFakeOAuthSession(provider);
    router.replace(appRoutes.workspace);
  }

  if (!isReady || session) {
    return <main className="min-h-[100dvh] bg-[#111111]" />;
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#111111] px-5 py-12 text-[#f3f3f0]">
      <section className="w-full max-w-[430px]">
        <Link aria-label="SlideX home" className="mx-auto flex w-fit items-center justify-center" href="/en/">
          <Image alt="SlideX" className="h-auto w-[96px] object-contain" height={72} priority src="/logo.png" width={260} />
        </Link>

        <div className="mt-8 rounded-[12px] border border-white/[0.11] bg-[#1a1a1a] px-6 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:px-8 sm:py-8">
          <div className="text-center">
            <h1 className="text-[22px] font-medium tracking-[-0.025em] text-white/92">Sign in to SlideX</h1>
            <p className="mt-2 text-[13px] text-white/38">Continue to your workspace.</p>
          </div>

          <div className="mt-7 space-y-3">
            <button className="relative flex h-11 w-full items-center justify-center rounded-[7px] bg-[#f1f0eb] px-4 text-[13px] font-medium text-[#171717] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/16" onClick={() => continueWith("google")} type="button">
              <span className="absolute left-4"><GoogleMark /></span>
              Continue with Google
            </button>
            <button className="relative flex h-11 w-full items-center justify-center rounded-[7px] border border-white/[0.14] bg-white/[0.025] px-4 text-[13px] font-medium text-white/78 transition-colors hover:border-white/[0.24] hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/10" onClick={() => continueWith("github")} type="button">
              Continue with GitHub
            </button>
          </div>

          <p className="mt-6 border-t border-white/[0.07] pt-5 text-center text-[10px] leading-4 text-white/26">
            Demo sign-in is active until OAuth is connected.
          </p>
        </div>

        <p className="mt-5 text-center text-[10px] leading-4 text-white/24">
          By continuing, you agree to the <Link className="text-white/46 hover:text-white" href="/en/terms/">Terms</Link> and <Link className="text-white/46 hover:text-white" href="/en/privacy/">Privacy Policy</Link>.
        </p>
      </section>
    </main>
  );
}
