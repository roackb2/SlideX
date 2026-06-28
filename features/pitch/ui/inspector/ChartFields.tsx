"use client";

import { Field, NativeSelect, NumberInput, TextInput, type BlockFieldProps } from "@/features/pitch/ui/inspector/InspectorControls";

const chartTypeOptions = [
  { label: "Bar", value: "bar" },
  { label: "Line", value: "line" },
  { label: "Area", value: "area" },
  { label: "Pie", value: "pie" },
  { label: "Donut", value: "donut" }
] as const;

export function ChartFields({ block, selectedBlockIndex, updateBlock }: BlockFieldProps) {
  const chartType = typeof block.props.chartType === "string" ? block.props.chartType : "bar";

  return (
    <>
      <Field label="Chart type">
        <NativeSelect
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, chartType: value })}
          options={chartTypeOptions}
          value={chartType === "line" || chartType === "area" || chartType === "pie" || chartType === "donut" ? chartType : "bar"}
        />
      </Field>
      <Field label="Chart height">
        <NumberInput
          max="320"
          min="80"
          onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, height: value === "" ? "" : value })}
          placeholder="144"
          step="8"
          suffix="px"
          value={block.props.height ?? ""}
        />
      </Field>
      <TextInput label="Title" placeholder="Chart title" value={block.props.title ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, title: value })} />
      <TextInput label="Labels" placeholder="Q1,Q2,Q3,Q4" value={block.props.labels ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, labels: value })} />
      <TextInput label="Values" placeholder="42,58,73,91" value={block.props.values ?? ""} onChange={(value) => updateBlock(selectedBlockIndex, { ...block.props, values: value })} />
    </>
  );
}
