function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-white/[0.07] motion-reduce:animate-none ${className}`} />;
}

export function PitchWorkspaceSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading presentation editor" className="flex h-[100dvh] flex-col overflow-hidden bg-black" role="status">
      <header aria-hidden="true" className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#111] px-4">
        <div className="flex items-center gap-4">
          <Pulse className="h-5 w-16" />
          <Pulse className="hidden h-4 w-40 sm:block" />
        </div>
        <div className="flex items-center gap-2">
          <Pulse className="h-8 w-16" />
          <Pulse className="h-8 w-20" />
          <Pulse className="h-8 w-8" />
        </div>
      </header>

      <div aria-hidden="true" className="flex min-h-0 flex-1">
        <aside className="hidden w-[252px] shrink-0 border-r border-white/[0.07] bg-[#101010] p-3 md:block">
          <Pulse className="h-8 w-full" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div className="aspect-video animate-pulse rounded-lg border border-white/[0.06] bg-white/[0.045] motion-reduce:animate-none" key={item} />
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 items-center justify-center bg-[#080808] p-5 sm:p-8">
          <div className="aspect-video w-full max-w-[1040px] animate-pulse rounded-[10px] border border-white/[0.07] bg-white/[0.045] shadow-[0_28px_90px_rgba(0,0,0,0.45)] motion-reduce:animate-none" />
        </section>

        <aside className="hidden w-[320px] shrink-0 border-l border-white/[0.07] bg-[#111] p-5 xl:block">
          <Pulse className="h-5 w-32" />
          <div className="mt-7 space-y-5">
            <Pulse className="h-9 w-full" />
            <Pulse className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Pulse className="h-9 w-full" />
              <Pulse className="h-9 w-full" />
            </div>
            <Pulse className="h-9 w-full" />
          </div>
        </aside>
      </div>
      <span className="sr-only">Loading…</span>
    </main>
  );
}
