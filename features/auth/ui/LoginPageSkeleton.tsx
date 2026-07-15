export function LoginPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading sign in" className="flex min-h-[100dvh] items-center justify-center bg-[#111111] px-5 py-12 text-[#f3f3f0]" role="status">
      <section aria-hidden="true" className="w-full max-w-[460px]">
        <div className="mx-auto h-8 w-28 animate-pulse rounded bg-white/[0.07] motion-reduce:animate-none" />
        <div className="mt-9 rounded-[12px] border border-white/[0.09] bg-[#1a1a1a] px-7 py-8 sm:px-9 sm:py-10">
          <div className="mx-auto h-8 w-52 animate-pulse rounded bg-white/[0.075] motion-reduce:animate-none" />
          <div className="mx-auto mt-4 h-3.5 w-64 max-w-full animate-pulse rounded bg-white/[0.04] motion-reduce:animate-none" />
          <div className="mt-8 h-12 w-full animate-pulse rounded-[7px] bg-white/[0.08] motion-reduce:animate-none" />
        </div>
        <div className="mx-auto mt-6 h-3 w-72 max-w-[80%] animate-pulse rounded bg-white/[0.035] motion-reduce:animate-none" />
      </section>
      <span className="sr-only">Loading…</span>
    </main>
  );
}
