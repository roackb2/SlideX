function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-white/[0.065] motion-reduce:animate-none ${className}`} />;
}

export function SiteHomeSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading SlideX" className="min-h-[100dvh] overflow-hidden bg-[#0b0c0f] text-white" role="status">
      <header aria-hidden="true" className="flex h-20 items-center justify-between border-b border-white/[0.07] px-5 sm:px-8 lg:px-12">
        <Pulse className="h-6 w-24" />
        <div className="hidden items-center gap-7 md:flex">
          <Pulse className="h-3 w-14" />
          <Pulse className="h-3 w-16" />
          <Pulse className="h-3 w-14" />
        </div>
        <Pulse className="h-9 w-24" />
      </header>

      <section aria-hidden="true" className="mx-auto flex max-w-[1280px] flex-col items-center px-5 pb-20 pt-20 text-center sm:pt-28">
        <Pulse className="h-7 w-36 rounded-full" />
        <Pulse className="mt-8 h-12 w-[680px] max-w-[92%] sm:h-16" />
        <Pulse className="mt-4 h-12 w-[520px] max-w-[78%] sm:h-16" />
        <Pulse className="mt-8 h-4 w-[560px] max-w-[88%]" />
        <Pulse className="mt-3 h-4 w-[420px] max-w-[70%]" />
        <div className="mt-9 flex gap-3">
          <Pulse className="h-11 w-32" />
          <Pulse className="h-11 w-28" />
        </div>
        <div className="mt-16 aspect-video w-full max-w-[1040px] animate-pulse rounded-[18px] border border-white/[0.08] bg-white/[0.045] motion-reduce:animate-none" />
      </section>
      <span className="sr-only">Loading…</span>
    </main>
  );
}
