type WorkspaceCardSkeletonVariant = "presentation" | "template";

type WorkspaceCardSkeletonGridProps = {
  className?: string;
  count: number;
  label: string;
  variant?: WorkspaceCardSkeletonVariant;
};

function WorkspaceCardSkeleton({ variant }: { variant: WorkspaceCardSkeletonVariant }) {
  if (variant === "template") {
    return (
      <article aria-hidden="true" className="rounded-[12px] border border-white/[0.065] bg-[#1b1b1b] p-2">
        <div className="aspect-video animate-pulse rounded-[10px] bg-white/[0.045]" />
        <div className="flex min-h-[72px] items-start justify-between gap-4 px-2 pb-2 pt-3">
          <div className="min-w-0 flex-1">
            <div className="h-4 w-3/5 animate-pulse rounded bg-white/[0.07]" />
            <div className="mt-2.5 h-2.5 w-full animate-pulse rounded bg-white/[0.04]" />
            <div className="mt-1.5 h-2.5 w-4/5 animate-pulse rounded bg-white/[0.035]" />
          </div>
          <div className="h-7 w-7 shrink-0 animate-pulse rounded-[7px] bg-white/[0.055]" />
        </div>
      </article>
    );
  }

  return (
    <article aria-hidden="true">
      <div className="aspect-video animate-pulse rounded-[12px] border border-white/[0.06] bg-white/[0.045]" />
      <div className="mt-3 h-4 w-3/5 animate-pulse rounded bg-white/[0.07]" />
      <div className="mt-2 h-2.5 w-2/5 animate-pulse rounded bg-white/[0.04]" />
    </article>
  );
}

export function WorkspaceCardSkeletonGrid({
  className = "grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3",
  count,
  label,
  variant = "presentation"
}: WorkspaceCardSkeletonGridProps) {
  return (
    <div aria-busy="true" aria-live="polite" className={className} role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <WorkspaceCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
}
