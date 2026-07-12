"use client";

import { Plus, Trash2 } from "lucide-react";
import { addChartDatum, applyChartPalette, chartDataFromProps, chartDefaultProps, chartPalettes, removeChartDatum, updateChartDatum } from "@/core/motion-doc/application/chartBlock";
import { chartDefinition, chartHasCartesianAxes, normalizeChartType, type ChartDataMode } from "@/core/motion-doc/domain/chartCatalog";
import { normalizeChartValueFormat, type ChartValueFormat } from "@/core/motion-doc/domain/chartValue";
import { ChartTypePicker } from "@/features/pitch/ui/inspector/ChartTypePicker";
import { NumberInput, OptionButtons, TextInput, type BlockFieldProps, type ControlOption } from "@/features/pitch/ui/inspector/InspectorControls";

const valueFormatOptions = [
  { label: "Number", value: "number" },
  { label: "Percentage", value: "percentage" }
] as const satisfies ReadonlyArray<ControlOption<ChartValueFormat>>;

export function ChartFields({ block, selectedBlockIndex, updateBlock }: BlockFieldProps) {
  const chartType = normalizeChartType(block.props.chartType);
  const dataMode = chartDefinition(chartType).dataMode;
  const data = chartDataFromProps(block.props);
  const valueFormat = normalizeChartValueFormat(block.props.valueFormat);
  const update = (props: typeof block.props) => updateBlock(selectedBlockIndex, props);
  const updateAxisStep = (key: "xAxisStep" | "yAxisStep", value: number | "") => {
    const nextProps = { ...block.props };
    if (value === "" || value <= 0) delete nextProps[key];
    else nextProps[key] = value;
    update(nextProps);
  };

  return (
    <div className="space-y-5">
      <section className="space-y-2"><div><p className="text-xs font-semibold text-neutral-200">Chart type</p><p className="mt-0.5 text-[10px] text-neutral-600">Choose by what you want to communicate</p></div><ChartTypePicker value={chartType} onChange={(value) => { const nextMode = chartDefinition(value).dataMode; update(nextMode === dataMode ? { ...block.props, chartType: value } : { ...block.props, ...chartDefaultProps(value) }); }} /></section>
      <TextInput label="Title" placeholder="Chart title" value={block.props.title ?? ""} onChange={(value) => update({ ...block.props, title: value })} />
      <OptionButtons label="Value format" onChange={(value) => update({ ...block.props, valueFormat: value })} options={valueFormatOptions} value={valueFormat} />

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-neutral-200">Colors</p>
          <p className="mt-0.5 text-[10px] text-neutral-600">Apply a palette or edit each data color below</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {chartPalettes.map((palette) => (
            <button
              className="group rounded-xl border border-white/[0.055] bg-[#18181b] p-2 text-left transition-all hover:border-white/10 hover:bg-white/[0.055] active:scale-[0.98]"
              key={palette.id}
              onClick={() => update(applyChartPalette(block.props, palette.colors))}
              type="button"
            >
              <span className="mb-2 flex h-2 overflow-hidden rounded-full">
                {palette.colors.slice(0, 5).map((color, index) => <i className="h-full flex-1" key={`${palette.id}-${index}`} style={{ background: color }} />)}
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 transition-colors group-hover:text-neutral-200">{palette.label}</span>
            </button>
          ))}
        </div>
      </section>

      {chartHasCartesianAxes(chartType) ? (
        <section className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div><p className="text-xs font-semibold text-neutral-200">Axis intervals</p><p className="mt-0.5 text-[10px] text-neutral-600">Leave blank for automatic tick spacing</p></div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput min="0" onChange={(value) => updateAxisStep("xAxisStep", value)} placeholder="Auto" prefix={<span className="text-[10px] font-semibold">X</span>} step="1" value={block.props.xAxisStep ?? ""} />
            <NumberInput min="0" onChange={(value) => updateAxisStep("yAxisStep", value)} placeholder="Auto" prefix={<span className="text-[10px] font-semibold">Y</span>} step="1" value={block.props.yAxisStep ?? ""} />
          </div>
        </section>
      ) : null}

      <section className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex items-center justify-between">
          <div><p className="text-xs font-semibold text-neutral-200">Data</p><p className="mt-0.5 text-[10px] text-neutral-600">Edit each item directly</p></div>
          <button className="flex h-7 items-center gap-1 rounded-md bg-white/[0.06] px-2 text-[11px] text-neutral-300 hover:bg-white/[0.1]" onClick={() => update(addChartDatum(block.props))} type="button"><Plus size={12} /> Add</button>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => <ChartDataRow dataMode={dataMode} index={index} item={item} key={`${index}-${item.label}`} onChange={(patch) => update(updateChartDatum(block.props, index, patch))} onRemove={() => update(removeChartDatum(block.props, index))} valueFormat={valueFormat} />)}
        </div>
      </section>
    </div>
  );
}

function ChartDataRow({ dataMode, index, item, onChange, onRemove, valueFormat }: { dataMode: ChartDataMode; index: number; item: ReturnType<typeof chartDataFromProps>[number]; onChange: (patch: Partial<typeof item>) => void; onRemove: () => void; valueFormat: ChartValueFormat }) {
  return <div className="space-y-2 rounded-lg bg-black/20 p-2.5">
    <div className="grid grid-cols-[26px_minmax(0,1fr)_24px] items-center gap-2">
      <label className="relative h-6 w-6 overflow-hidden rounded-md border border-white/10" title={`Color for ${item.label}`}><input className="absolute inset-0 cursor-pointer opacity-0" type="color" value={item.color} onChange={(event) => onChange({ color: event.target.value })} /><span className="block h-full w-full" style={{ background: item.color }} /></label>
      <input aria-label={`Label ${index + 1}`} className="min-w-0 rounded-md bg-white/[0.04] px-2 py-1.5 text-xs text-neutral-200 outline-none focus:ring-1 focus:ring-white/15" value={item.label} onChange={(event) => onChange({ label: event.target.value })} />
      <button aria-label={`Remove ${item.label}`} className="grid h-6 w-6 place-items-center rounded text-neutral-600 hover:bg-red-500/10 hover:text-red-400" onClick={onRemove} type="button"><Trash2 size={12} /></button>
    </div>
    <div className={`grid gap-2 ${dataMode === "xyz" ? "grid-cols-3" : dataMode === "xy" ? "grid-cols-2" : "grid-cols-1"}`}>
      {dataMode === "xy" || dataMode === "xyz" ? <DatumNumber label="X" value={item.x} onChange={(x) => onChange({ x })} /> : null}
      <DatumNumber label={`${dataMode === "delta" ? "Change (+/−)" : dataMode === "xy" || dataMode === "xyz" ? "Y" : "Value"}${valueFormat === "percentage" ? " (%)" : ""}`} value={item.value} onChange={(value) => onChange({ value: dataMode === "delta" ? value : Math.max(value, 0) })} />
      {dataMode === "xyz" ? <DatumNumber label="Size" value={item.size} onChange={(size) => onChange({ size: Math.max(size, 1) })} /> : null}
    </div>
  </div>;
}

function DatumNumber({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) {
  return <label className="space-y-1"><span className="block text-[9px] font-medium uppercase tracking-wide text-neutral-600">{label}</span><input className="w-full min-w-0 rounded-md bg-white/[0.04] px-2 py-1.5 text-right font-mono text-xs text-neutral-200 outline-none focus:ring-1 focus:ring-white/15" inputMode="decimal" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} /></label>;
}
