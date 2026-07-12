"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { chartCatalog, chartCategories, type ChartCategory, type ChartType } from "@/core/motion-doc/domain/chartCatalog";
import { chartDefaultProps } from "@/core/motion-doc/application/chartBlock";
import type { AddBlockOptions } from "@/features/pitch/application/motionDocCommands";
import type { AddBlockType } from "@/features/pitch/ui/pitchOptions";

type ChartLibraryModalProps = {
  onAddTool: (type: AddBlockType, options?: AddBlockOptions) => void;
  onClose: () => void;
};

export function ChartLibraryModal({ onAddTool, onClose }: ChartLibraryModalProps) {
  const [category, setCategory] = useState<ChartCategory | "all">("all");
  const reduceMotion = useReducedMotion();
  const visibleCategories = category === "all" ? chartCategories : chartCategories.filter((item) => item.id === category);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      initial={{ opacity: reduceMotion ? 1 : 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        aria-label="Chart library"
        aria-modal="true"
        className="flex h-[min(760px,calc(100dvh-3rem))] w-full max-w-[1040px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-black text-white shadow-[0_32px_100px_rgba(0,0,0,.8)]"
        initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.975, y: reduceMotion ? 0 : 14 }}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-white/10 px-5 pb-4 pt-5 sm:px-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-[-.025em]">Charts</h2>
                <p className="mt-1 text-xs text-neutral-500">Choose a chart to add to your slide.</p>
              </div>
              <button aria-label="Close chart library" className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-95" onClick={onClose} type="button"><X size={17} /></button>
            </div>
            <nav className="custom-scrollbar mt-5 flex gap-1 overflow-x-auto" aria-label="Chart categories">
              <CategoryButton active={category === "all"} label="All" onClick={() => setCategory("all")} />
              {chartCategories.map((item) => <CategoryButton active={category === item.id} key={item.id} label={item.label} onClick={() => setCategory(item.id)} />)}
            </nav>
          </div>
          <div className="custom-scrollbar min-h-0 flex-1 space-y-8 overflow-y-auto px-5 pb-8 pt-5 sm:px-6">
            {visibleCategories.map((section) => {
              const charts = chartCatalog.filter((chart) => chart.category === section.id);
              return (
                <motion.section
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 8 }}
                  key={`${category}-${section.id}`}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-xs font-medium text-neutral-300">{section.label}</h3>
                    <span className="text-[10px] tabular-nums text-neutral-600">{charts.length}</span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {charts.map((chart, index) => (
                      <motion.button
                        animate={{ opacity: 1, y: 0 }}
                        className="group overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] text-left transition duration-200 hover:border-white/25 hover:bg-[#0e0e0e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[.985]"
                        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 10 }}
                        key={chart.type}
                        onClick={() => onAddTool("ChartBar", { props: chartDefaultProps(chart.type) })}
                        transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.18), duration: reduceMotion ? 0 : 0.22 }}
                        type="button"
                        whileHover={reduceMotion ? undefined : { y: -2 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                      >
                        <div className="h-28 px-4 py-3"><ChartThumbnail type={chart.type} /></div>
                        <div className="flex items-center justify-between border-t border-white/10 px-3.5 py-2.5">
                          <span className="text-xs font-medium text-neutral-300 transition group-hover:text-white">{chart.label}</span>
                          <ArrowUpRight className="text-neutral-600 transition group-hover:text-neutral-300" size={13} />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </main>
      </motion.div>
    </motion.div>
  );
}

function CategoryButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[.98] ${active ? "bg-white text-black" : "text-neutral-500 hover:bg-white/10 hover:text-white"}`} onClick={onClick} type="button">{label}</button>;
}

function ChartThumbnail({ type }: { type: ChartType }) {
  const colors = ["#8cc9db", "#e0a55d", "#5fb9a8", "#e57f73"];
  if (type === "pie" || type === "donut" || type === "polar-area" || type === "gauge") return <RadialThumbnail colors={colors} type={type} />;
  if (type === "bar" || type === "funnel" || type === "pyramid") return <BarThumbnail colors={colors} type={type} />;
  if (type === "waterfall") return <WaterfallThumbnail colors={colors} />;
  if (type === "column" || type === "lollipop") return <ColumnThumbnail colors={colors} type={type} />;
  if (type === "treemap" || type === "heatmap") return <TileThumbnail colors={colors} type={type} />;
  if (type === "scatter" || type === "bubble") return <ScatterThumbnail colors={colors} type={type} />;
  if (type === "timeline") return <TimelineThumbnail colors={colors} />;
  if (type === "radar") return <RadarThumbnail />;
  return <LineThumbnail colors={colors} type={type} />;
}

function BarThumbnail({ colors, type }: { colors: string[]; type: ChartType }) { return <svg className="h-full w-full" viewBox="0 0 120 72">{[52,78,66,92].map((width,index)=><g key={index}><rect fill="#263038" height="7" rx="3.5" width="100" x="5" y={7+index*16}/><rect fill={colors[index]} height="7" rx="3.5" width={type === "funnel" ? 92-index*18 : type === "pyramid" ? width*.75 : width} x={type === "funnel" ? 14+index*9 : 5} y={7+index*16}/></g>)}</svg>; }
function ColumnThumbnail({ colors, type }: { colors:string[]; type:ChartType }) { return <svg className="h-full w-full" viewBox="0 0 120 72"><path d="M5 65h110" stroke="#33404a"/>{[32,55,42,62].map((height,index)=><g key={index}>{type === "lollipop" ? <><line stroke={colors[index]} strokeWidth="2" x1={20+index*27} x2={20+index*27} y1={65} y2={65-height}/><circle cx={20+index*27} cy={65-height} fill={colors[index]} r="5"/></> : <rect fill={colors[index]} height={height} rx="3" width="13" x={13+index*27} y={65-height}/>}</g>)}</svg>; }
function WaterfallThumbnail({ colors }: { colors: string[] }) { return <svg className="h-full w-full" viewBox="0 0 120 72"><path d="M5 65h110" stroke="#33404a"/><path d="M25 43H35M53 31H63M81 44H91" stroke="#64727b" strokeDasharray="2 2"/><rect fill={colors[0]} height="22" rx="2" width="15" x="10" y="43"/><rect fill={colors[1]} height="18" rx="2" width="15" x="35" y="25"/><rect fill={colors[2]} height="13" rx="2" width="15" x="63" y="31"/><rect fill={colors[3]} height="26" rx="2" width="15" x="91" y="18"/><text fill="#d8e1e5" fontSize="6" textAnchor="middle" x="17.5" y="39">50</text><text fill="#d8e1e5" fontSize="6" textAnchor="middle" x="42.5" y="21">+30</text><text fill="#d8e1e5" fontSize="6" textAnchor="middle" x="70.5" y="57">−25</text><text fill="#d8e1e5" fontSize="6" textAnchor="middle" x="98.5" y="14">80</text></svg>; }
function LineThumbnail({ colors, type }: { colors:string[]; type:ChartType }) { return <svg className="h-full w-full" viewBox="0 0 120 72">{type === "area"?<path d="M6 58 28 28 52 42 78 19 112 30V65H6Z" fill={colors[1]} opacity=".18"/>:null}<polyline fill="none" points="6,58 28,28 52,42 78,19 112,30" stroke={colors[0]} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/>{type!=="sparkline"?["6,58","28,28","52,42","78,19","112,30"].map((point)=><circle cx={point.split(",")[0]} cy={point.split(",")[1]} fill={colors[1]} key={point} r="3"/>):null}</svg>; }
function RadialThumbnail({ colors, type }: { colors:string[]; type:ChartType }) { if(type==="gauge") return <svg className="h-full w-full" viewBox="0 0 120 72">{[38,30,22,14].map((radius,index)=><g key={radius}><path d={`M${60-radius} 58a${radius} ${radius} 0 0 1 ${radius*2} 0`} fill="none" stroke="#263038" strokeLinecap="round" strokeWidth="4"/><path d={`M${60-radius} 58a${radius} ${radius} 0 0 1 ${radius*1.35} -${radius*.72}`} fill="none" stroke={colors[index]} strokeLinecap="round" strokeWidth="4"/></g>)}<line x1="60" y1="58" x2="78" y2="28" stroke="#d7e0e4" strokeWidth="2"/></svg>; return <div className="mx-auto h-full aspect-square rounded-full" style={{background:`conic-gradient(${colors[0]} 0 34%,${colors[1]} 34% 58%,${colors[2]} 58% 79%,${colors[3]} 79%)`, boxShadow:type==="donut"?"inset 0 0 0 18px #0f1419":"none"}}/>; }
function TileThumbnail({ colors, type }: { colors:string[]; type:ChartType }) { return <div className={`grid h-full gap-1 ${type==="heatmap"?"grid-cols-4":"grid-cols-3"}`}>{Array.from({length:type==="heatmap"?12:7},(_,index)=><i className="rounded-sm" key={index} style={{background:colors[index%colors.length],opacity:.35+(index%4)*.2,gridColumn:type==="treemap"&&index===0?"span 2":undefined,gridRow:type==="treemap"&&index===0?"span 2":undefined}}/>)}</div>; }
function ScatterThumbnail({ colors, type }: { colors:string[]; type:ChartType }) { return <svg className="h-full w-full" viewBox="0 0 120 72"><path d="M8 5v60h108" fill="none" stroke="#33404a"/>{[[22,52],[44,39],[65,44],[82,22],[105,29]].map((point,index)=><circle cx={point[0]} cy={point[1]} fill={colors[index%4]} key={index} opacity=".9" r={type==="bubble"?5+index*1.5:3}/>)}</svg>; }
function TimelineThumbnail({ colors }: { colors:string[] }) { return <svg className="h-full w-full" viewBox="0 0 120 72"><path d="M8 36h104" stroke="#33404a" strokeWidth="2"/>{[18,45,73,101].map((x,index)=><g key={x}><circle cx={x} cy="36" fill={colors[index]} r="5"/><rect fill="#33404a" height="3" rx="1" width="16" x={x-8} y={index%2?48:21}/></g>)}</svg>; }
function RadarThumbnail() { return <svg className="h-full w-full" viewBox="0 0 120 72"><path d="M60 5 103 28 88 66 32 66 17 28Z" fill="none" stroke="#33404a"/><path d="M60 13 90 31 80 57 38 58 28 31Z" fill="#8cc9db" fillOpacity=".18" stroke="#8cc9db" strokeWidth="2"/></svg>; }
