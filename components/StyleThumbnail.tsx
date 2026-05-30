import { BarChart3, Layers, Play, Sparkles } from "lucide-react";

type StyleThumbnailProps = {
  className?: string;
  label?: string;
  templateId: string;
  title: string;
  variant?: "card" | "feature" | "hero";
};

const palettes = [
  { accent: "#8ea5ff", base: "#0b0f1b", mid: "#18213a", soft: "rgba(142, 165, 255, 0.18)" },
  { accent: "#7dd3a8", base: "#07120f", mid: "#10251d", soft: "rgba(125, 211, 168, 0.18)" },
  { accent: "#f2c572", base: "#151108", mid: "#2b2110", soft: "rgba(242, 197, 114, 0.16)" },
  { accent: "#ff8ea3", base: "#170a10", mid: "#2a111b", soft: "rgba(255, 142, 163, 0.16)" },
  { accent: "#9fe7ff", base: "#06131a", mid: "#102936", soft: "rgba(159, 231, 255, 0.16)" }
];

function paletteFor(id: string) {
  const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
  return palettes[index];
}

export function StyleThumbnail({
  className = "",
  label,
  templateId,
  title,
  variant = "card"
}: StyleThumbnailProps) {
  const palette = paletteFor(templateId);
  const isHero = variant === "hero";
  const isFeature = variant === "feature";

  return (
    <div
      aria-label={`${title} style thumbnail`}
      className={`relative overflow-hidden bg-[#0c0f17] ${className}`}
      role="img"
      style={{
        background:
          `radial-gradient(circle at 22% 14%, ${palette.soft}, transparent 34%), ` +
          `linear-gradient(135deg, ${palette.base}, ${palette.mid} 58%, #05060a)`
      }}
    >
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
      <div
        className="absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl"
        style={{ backgroundColor: palette.accent, opacity: 0.16 }}
      />

      <div className="absolute inset-0 p-4 md:p-5">
        <div className="flex h-full flex-col">
          <div className="mb-auto flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 rounded-full border border-white/[0.14] bg-black/25 px-3 py-1 text-xs font-medium text-neutral-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" style={{ color: palette.accent }} />
              {label ?? "Preset"}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-black/25 text-neutral-200 backdrop-blur-md">
              <Play className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className={`grid gap-3 ${isHero ? "sm:grid-cols-[1.1fr_0.9fr]" : ""}`}>
            <div className="rounded-[20px] border border-white/[0.12] bg-black/25 p-4 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette.accent }} />
                <span className="h-px flex-1 bg-white/[0.14]" />
              </div>
              <p className={`${isHero ? "text-2xl md:text-3xl" : "text-lg"} font-semibold leading-tight tracking-tight text-white`}>
                {title}
              </p>
              <div className="mt-4 flex items-end gap-2">
                {[38, 56, 72, 92].map((height, index) => (
                  <span
                    key={height}
                    className="w-4 rounded-t-md bg-white/[0.14]"
                    style={{ height: isFeature ? `${height * 0.42}px` : `${height * 0.36}px` }}
                  >
                    <span
                      className="block w-full rounded-t-md"
                      style={{
                        backgroundColor: palette.accent,
                        height: `${70 - index * 7}%`,
                        opacity: 0.72
                      }}
                    />
                  </span>
                ))}
              </div>
            </div>

            {(isHero || isFeature) && (
              <div className="hidden rounded-[20px] border border-white/[0.12] bg-black/20 p-4 backdrop-blur-md sm:block">
                <div className="mb-4 flex items-center gap-2 text-xs font-medium text-neutral-300">
                  <Layers className="h-3.5 w-3.5" style={{ color: palette.accent }} />
                  Scene layers
                </div>
                <div className="space-y-2">
                  {["Title", "Metric", "Chart"].map((item, index) => (
                    <div key={item} className="flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: index === 0 ? palette.accent : "rgba(255,255,255,0.28)" }}
                      />
                      <span className="text-xs text-neutral-300">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Motion ready
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
