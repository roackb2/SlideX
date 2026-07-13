"use client";

import { chartCatalog, chartCategories, type ChartType } from "@/core/motion-doc/domain/chartCatalog";

export function ChartTypePicker({ onChange, value }: { onChange: (value: ChartType) => void; value: ChartType }) {
  return (
    <div className="space-y-3">
      {chartCategories.map((category) => (
        <section key={category.id}>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">{category.label}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {chartCatalog.filter((chart) => chart.category === category.id).map((chart) => (
              <button className={`group flex h-10 items-center gap-2 rounded-lg border px-2.5 text-left transition ${value === chart.type ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/[0.05] bg-white/[0.025] text-neutral-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-neutral-200"}`} key={chart.type} onClick={() => onChange(chart.type)} type="button">
                <MiniChart type={chart.type} />
                <span className="truncate text-[11px] font-medium">{chart.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MiniChart({ type }: { type: ChartType }) {
  const round = type === "pie" || type === "donut" || type === "gauge" || type === "polar-area";
  return round ? <span className={`h-5 w-5 shrink-0 rounded-full border-2 border-current ${type === "pie" ? "border-r-transparent" : ""}`} /> : (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 20 20">
      {type === "bar" || type === "funnel" || type === "pyramid" ? <><path d="M2 4h15v3H2zM2 9h11v3H2zM2 14h7v3H2z" fill="currentColor" opacity=".8" /></> : type === "column" || type === "waterfall" ? <path d="M2 17V9h4v8m2 0V3h4v14m2 0V6h4v11" fill="currentColor" opacity=".8" /> : <path d="M2 15 6 9l4 3 4-8 4 5" fill="none" stroke="currentColor" strokeWidth="2" />}
    </svg>
  );
}
