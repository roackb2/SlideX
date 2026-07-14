"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { appRoutes } from "@/common/lib/appRoutes";
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import { resolveSafeAuthNextPath } from "@/features/auth/application/authRedirect";
import type { AuthProvider } from "@/features/auth/domain/authSession";
import { useAuthSession } from "@/features/auth/ui/useAuthSession";

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
  const searchParams = useSearchParams();
  const { isReady, session } = useAuthSession();
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  const [oauthError, setOAuthError] = useState<string | null>(null);
  const requestedNextPath = searchParams.get("next");
  const nextPath = resolveSafeAuthNextPath(requestedNextPath, appRoutes.workspace);
  const isDemoContinuation = nextPath.startsWith(appRoutes.pitch) && nextPath.includes("demo=1");
  const callbackFailed = searchParams.get("error") === "oauth_callback_failed";

  useEffect(() => {
    if (isReady && session) {
      router.replace(nextPath);
    }
  }, [isReady, nextPath, router, session]);

  async function continueWith(provider: AuthProvider) {
    setIsStartingOAuth(true);
    setOAuthError(null);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", nextPath);
    const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() }
    });

    if (error) {
      setOAuthError("Google sign-in could not start. Please try again.");
      setIsStartingOAuth(false);
    }
  }

  if (!isReady || session) {
    return <main className="min-h-[100dvh] bg-[#111111]" />;
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#111111] px-5 py-12 text-[#f3f3f0]">
      <section className="w-full max-w-[460px]">
        <Link aria-label="SlideX home" className="mx-auto flex w-fit items-center justify-center" href="/">
          <Image alt="SlideX" className="h-auto w-[112px] object-contain" height={72} priority src="/logo.png" width={260} />
        </Link>

        <div className="mt-9 rounded-[12px] border border-white/[0.11] bg-[#1a1a1a] px-7 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:px-9 sm:py-10">
          <div className="text-center">
            <h1 className="text-[29px] font-medium tracking-[-0.035em] text-white/92">{isDemoContinuation ? "Keep your Live Demo" : "Sign in to SlideX"}</h1>
            <p className="mt-3 text-[15px] leading-6 text-white/44">{isDemoContinuation ? "Your edits will be added to your workspace after sign in." : "Continue to your presentation workspace."}</p>
          </div>

          <div className="mt-8 space-y-3">
            <button className="relative flex h-12 w-full items-center justify-center rounded-[7px] bg-[#f1f0eb] px-4 text-[15px] font-medium text-[#171717] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/16 disabled:cursor-wait disabled:opacity-60" disabled={isStartingOAuth} onClick={() => void continueWith("google")} type="button">
              <span className="absolute left-4"><GoogleMark /></span>
              {isStartingOAuth ? "Opening Google…" : "Continue with Google"}
            </button>
          </div>

          {oauthError || callbackFailed ? (
            <p className="mt-5 text-center text-[13px] leading-5 text-red-300/80">
              {oauthError ?? "Google sign-in did not complete. Please try again."}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-[12px] leading-5 text-white/34">
          By continuing, you agree to the <Link className="text-white/46 hover:text-white" href="/en/terms/">Terms</Link> and <Link className="text-white/46 hover:text-white" href="/en/privacy/">Privacy Policy</Link>.
        </p>
      </section>
    </main>
  );
}
