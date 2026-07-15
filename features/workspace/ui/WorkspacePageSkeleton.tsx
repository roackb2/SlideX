import { WorkspaceCardSkeletonGrid } from "@/features/workspace/ui/WorkspaceCardSkeleton";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-white/[0.055] motion-reduce:animate-none ${className}`} />;
}

export function WorkspacePageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading workspace" className="min-h-[100dvh] bg-[#171717] text-[#f2f2ef]" role="status">
      <aside aria-hidden="true" className="fixed inset-y-0 left-0 hidden w-[232px] border-r border-white/[0.07] bg-[#1b1b1b] p-5 md:block">
        <Pulse className="h-6 w-20" />
        <div className="mt-12 space-y-3">
          <Pulse className="h-10 w-full" />
          <Pulse className="h-9 w-4/5" />
          <Pulse className="h-9 w-3/4" />
          <Pulse className="h-9 w-2/3" />
        </div>
        <Pulse className="absolute bottom-4 left-4 right-4 h-12" />
      </aside>

      <div className="border-b border-white/[0.07] px-4 py-4 md:hidden">
        <Pulse className="h-6 w-20" />
      </div>

      <div className="md:pl-[232px]">
        <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-7 sm:px-8 md:px-10 md:pt-9 xl:px-12">
          <header aria-hidden="true" className="border-b border-white/[0.075] pb-7">
            <Pulse className="h-10 w-36" />
          </header>

          <div className="space-y-12 pt-9">
            <section className="grid items-stretch gap-6 lg:grid-cols-[minmax(240px,0.58fr)_minmax(0,1.42fr)]">
              <div aria-hidden="true" className="min-h-[280px] rounded-[12px] border border-white/[0.07] bg-[#1b1b1b] p-7">
                <Pulse className="h-7 w-32" />
                <Pulse className="mt-5 h-3 w-4/5" />
                <Pulse className="mt-2 h-3 w-3/5" />
                <Pulse className="mt-32 h-10 w-20" />
              </div>
              <div>
                <Pulse className="mb-5 h-5 w-28" />
                <WorkspaceCardSkeletonGrid className="grid gap-5 sm:grid-cols-2" count={2} label="Loading templates" variant="template" />
              </div>
            </section>

            <section className="border-t border-white/[0.075] pt-8">
              <Pulse className="mb-6 h-5 w-28" />
              <WorkspaceCardSkeletonGrid count={3} label="Loading presentations" />
            </section>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </main>
  );
}
