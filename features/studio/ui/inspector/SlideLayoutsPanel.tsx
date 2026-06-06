import { slideLayouts } from "@/core/motion-doc/presets/templates/slideLayouts";
import { Plus } from "lucide-react";

export function SlideLayoutsPanel({
  addSlideWithLayout
}: {
  addSlideWithLayout: (layoutSource: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 animate-[bubble-appear_0.2s_ease-out]">
      <div className="grid grid-cols-2 gap-3">
        {slideLayouts.map((layout) => (
          <button
            key={layout.id}
            type="button"
            className="group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/[0.04] bg-[#1a1a1a] p-3 text-left transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.1] hover:bg-white/[0.04] hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.5)] active:scale-95"
            onClick={() => addSlideWithLayout(layout.source)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-neutral-400 transition-colors group-hover:bg-[#788bfd]/20 group-hover:text-[#788bfd]">
                <Plus size={16} />
              </div>
              <span className="text-center text-xs font-semibold text-neutral-300 transition-colors group-hover:text-white">
                {layout.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
