"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="grid min-h-[100dvh] bg-white text-[#111315] lg:grid-cols-[0.46fr_0.54fr]">
      <aside className="relative hidden min-h-[100dvh] overflow-hidden bg-[#0a0b0d] p-10 text-white lg:flex lg:flex-col">
        <Link href="/en" aria-label="SlideX home" className="relative z-10 w-fit">
          <img src="/logo.png" alt="SlideX" className="h-auto w-[150px] object-contain" />
        </Link>

        <div className="relative my-auto flex min-h-[520px] items-center justify-center">
          <div className="absolute left-[4%] top-[12%] aspect-video w-[56%] -rotate-6 rounded-lg border border-white/16 bg-[#d8ff76] p-[6%] shadow-[0_30px_90px_rgba(0,0,0,0.44)]">
            <div className="h-[56%] w-[46%] rounded-full bg-[#7b5cff]" />
            <div className="mt-[8%] h-[5%] w-[64%] bg-[#111315]" />
          </div>
          <div className="absolute bottom-[10%] right-[2%] aspect-video w-[58%] rotate-6 rounded-lg border border-white/16 bg-[#8fcfff] p-[6%] shadow-[0_30px_90px_rgba(0,0,0,0.44)]">
            <div className="h-[18%] w-[52%] bg-[#111315]" />
            <div className="mt-[10%] grid h-[48%] grid-cols-5 items-end gap-[5%]">
              {[44, 72, 58, 92, 68].map((height, index) => (
                <span key={height} className={index === 3 ? "bg-[#ff6f8f]" : "bg-[#111315]/48"} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="relative z-10 w-[68%] rounded-lg border border-white/14 bg-[#111416] p-3 shadow-[0_36px_110px_rgba(0,0,0,0.62)]">
            <div className="grid aspect-[16/10] grid-cols-[0.28fr_0.72fr] overflow-hidden rounded-md bg-[#090b0d]">
              <div className="border-r border-white/10 p-[10%]">
                <div className="h-[5px] w-[42%] bg-[#9ad7ff]" />
                <div className="mt-[18%] space-y-[8%]">
                  {[72, 100, 82, 64].map((width, index) => (
                    <div key={width} className={`h-8 rounded-sm ${index === 1 ? "bg-[#9ad7ff]" : "bg-white/[0.055]"}`} style={{ width: `${width}%` }} />
                  ))}
                </div>
              </div>
              <div className="bg-[#e7f2f7] p-[10%]">
                <div className="mx-auto h-full w-[78%] bg-white p-[10%] shadow-[0_16px_40px_rgba(24,46,57,0.14)]">
                  <div className="h-[5%] w-[28%] bg-[#9ad7ff]" />
                  <div className="mt-[9%] h-[9%] w-[74%] bg-[#111315]" />
                  <div className="mt-[8%] space-y-[5px]">
                    <div className="h-[3px] bg-[#111315]/14" />
                    <div className="h-[3px] w-[78%] bg-[#111315]/14" />
                  </div>
                  <div className="mt-[14%] h-[34%] bg-[#d8ff76]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 max-w-md text-2xl font-semibold leading-tight">
          Shape the brief. Build the slides. Keep the whole story moving.
        </p>
      </aside>

      <section className="relative flex min-h-[100dvh] items-center justify-center px-5 py-20 sm:px-8">
        <div className="absolute inset-x-5 top-6 flex items-center justify-between lg:inset-x-10 lg:top-8">
          <Link href="/en" className="inline-flex items-center gap-2 text-sm font-medium text-[#111315]/52 transition-colors hover:text-[#111315]">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-[13px] text-[#111315]/42">
            New to SlideX?{" "}
            <a href="#create-account" className="font-semibold text-[#111315] hover:underline">Create account</a>
          </span>
        </div>

        <div className="w-full max-w-[430px]">
          <div className="mb-10 lg:hidden">
            <span className="text-2xl font-semibold">Slide<span className="text-[#6b70ff]">X</span></span>
          </div>
          <h1 className="text-[clamp(38px,5vw,52px)] font-semibold leading-none tracking-normal">Welcome back.</h1>
          <p className="mt-4 text-[15px] leading-7 text-[#111315]/52">Sign in to continue to your SlideX workspace.</p>

          <button
            type="button"
            className="mt-9 flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#111315]/16 bg-white text-sm font-semibold transition-colors hover:bg-[#f7f7f4]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#111315]/16 text-[10px] font-bold">G</span>
            Continue with Google
          </button>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-[#111315]/12" />
            <span className="text-[11px] font-medium uppercase text-[#111315]/34">or use email</span>
            <span className="h-px flex-1 bg-[#111315]/12" />
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-[13px] font-semibold" htmlFor="email">Email</label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111315]/34" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="h-12 w-full rounded-md border border-[#111315]/16 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#111315]/54 focus:ring-2 focus:ring-[#9ad7ff]/32"
              />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <label className="text-[13px] font-semibold" htmlFor="password">Password</label>
              <a href="#forgot-password" className="text-[12px] font-medium text-[#39708a] hover:underline">Forgot password?</a>
            </div>
            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111315]/34" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={6}
                placeholder="Enter your password"
                className="h-12 w-full rounded-md border border-[#111315]/16 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[#111315]/54 focus:ring-2 focus:ring-[#9ad7ff]/32"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[#111315]/38 transition-colors hover:text-[#111315]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <label className="mt-5 flex w-fit cursor-pointer items-center gap-2.5 text-[13px] text-[#111315]/58">
              <input type="checkbox" name="remember" className="h-4 w-4 accent-[#111315]" />
              Remember me
            </label>

            <button type="submit" className="group mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#111315] text-sm font-semibold text-white transition-colors hover:bg-black">
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {submitted && (
              <div role="status" className="mt-4 flex items-start gap-2 rounded-md bg-[#e9f7d5] px-4 py-3 text-[13px] leading-5 text-[#20320b]">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                Demo mode: the form works, but no account data is sent.
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-[11px] leading-5 text-[#111315]/36">
            By continuing, you agree to the Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}
