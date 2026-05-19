"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { ColorControl, Field, IconSegmentedControl, NativeSelect, NumberInput, type BlockFieldProps, type PropRecord } from "@/components/studio/inspector/InspectorControls";

export function MotionFields({
  block,
  inheritedBackgroundColor,
  inheritedMutedColor,
  inheritedTextColor,
  isTextType,
  selectedBlockIndex,
  textValue,
  updateBlock
}: BlockFieldProps & {
  inheritedBackgroundColor: string;
  inheritedMutedColor: string;
  inheritedTextColor: string;
  isTextType: boolean;
  textValue: string;
}) {
  const updateProps = (nextProps: typeof block.props) => {
    updateBlock(selectedBlockIndex, nextProps, isTextType ? textValue : undefined);
  };
  const updateOptionalProp = (key: string, value: string, aliases: string[] = []) => {
    const nextProps: PropRecord = { ...block.props };

    delete nextProps[key];
    aliases.forEach((alias) => delete nextProps[alias]);

    if (value.trim()) {
      nextProps[key] = value.trim();
    }

    updateProps(nextProps);
  };
  const hasCustomBackground = Boolean(block.props.background ?? block.props.backgroundColor ?? block.props.bg);

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {isTextType ? (
          <ColorControl
            displayValue={inheritedTextColor}
            label="Text color"
            onChange={(value) => updateOptionalProp("color", value, ["textColor"])}
            placeholder={inheritedTextColor || "#ffffff"}
            value={block.props.color ?? block.props.textColor}
          />
        ) : null}
        <ColorControl
          displayValue={hasCustomBackground ? undefined : inheritedBackgroundColor}
          label={block.type === "ImageBlock" ? "Frame background" : "Background color"}
          onChange={(value) => updateOptionalProp("background", value, ["backgroundColor", "bg"])}
          placeholder={inheritedBackgroundColor || (block.type === "ImageBlock" ? "rgba(255,255,255,0.08)" : "transparent")}
          value={block.props.background ?? block.props.backgroundColor ?? block.props.bg}
        />
        {block.type !== "ImageBlock" && !isTextType ? (
          <ColorControl
            displayValue={inheritedTextColor}
            label="Text color"
            onChange={(value) => updateOptionalProp("color", value, ["textColor"])}
            placeholder={inheritedTextColor || "#ffffff"}
            value={block.props.color ?? block.props.textColor}
          />
        ) : null}
        {block.type === "Card" || block.type === "Metric" || block.type === "Chart" ? (
          <ColorControl
            displayValue={inheritedMutedColor}
            label="Secondary text color"
            onChange={(value) => updateOptionalProp("mutedColor", value)}
            placeholder={inheritedMutedColor || "#cbd5e1"}
            value={block.props.mutedColor}
          />
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="X">
          <NumberInput min="0" max="100" onChange={(value) => updateProps({ ...block.props, x: value })} placeholder="10" step="0.5" suffix="%" value={block.props.x ?? ""} />
        </Field>
        <Field label="Y">
          <NumberInput min="0" max="100" onChange={(value) => updateProps({ ...block.props, y: value })} placeholder="20" step="0.5" suffix="%" value={block.props.y ?? ""} />
        </Field>
        <Field label="Width">
          <NumberInput min="8" max="100" onChange={(value) => updateProps({ ...block.props, w: value })} placeholder="42" step="0.5" suffix="%" value={block.props.w ?? ""} />
        </Field>
        <Field label="Height">
          <NumberInput min="6" max="100" onChange={(value) => updateProps({ ...block.props, h: value })} placeholder="18" step="0.5" suffix="%" value={block.props.h ?? ""} />
        </Field>
      </div>
      {isTextType && (
        <>
          <IconSegmentedControl
            label="Text align"
            onChange={(value) => updateProps({ ...block.props, textAlign: value })}
            options={textAlignOptions}
            value={String(block.props.textAlign ?? "left")}
          />
          <Field label="Font size">
            <NumberInput min="8" max="180" onChange={(value) => updateProps({ ...block.props, fontSize: value === "" ? "" : value })} placeholder={block.type === "Title" ? "72" : "24"} step="1" suffix="px" value={block.props.fontSize ?? ""} />
          </Field>
        </>
      )}
      <Field label="Corner radius">
        <NumberInput
          min="0"
          max="120"
          onChange={(value) => {
            const { borderRadius, ...nextProps } = block.props;
            void borderRadius;
            updateProps({ ...nextProps, radius: value === "" ? "" : value });
          }}
          placeholder={String(defaultRadius(block.type))}
          step="1"
          suffix="px"
          value={block.props.radius ?? block.props.borderRadius ?? ""}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Delay">
          <NumberInput min="0" onChange={(value) => updateProps({ ...block.props, delay: value })} placeholder="0" step="0.1" suffix="s" value={block.props.delay ?? ""} />
        </Field>
        <Field label="Duration">
          <NumberInput min="0.1" onChange={(value) => updateProps({ ...block.props, duration: value === "" ? "" : value })} placeholder="0.6" step="0.1" suffix="s" value={block.props.duration ?? ""} />
        </Field>
      </div>
      <Field label="Animation">
        <NativeSelect
          onChange={(value) => updateProps({ ...block.props, enter: value })}
          options={[
            { label: "None", value: "" },
            { label: "Fade Up", value: "fadeUp" },
            { label: "Fade In", value: "fadeIn" },
            { label: "Zoom In", value: "zoomIn" },
            { label: "Slide Left", value: "slideLeft" }
          ]}
          value={String(block.props.enter ?? "")}
        />
      </Field>
    </>
  );
}

const textAlignOptions = [
  { icon: <AlignLeft size={14} />, label: "Align left", value: "left" },
  { icon: <AlignCenter size={14} />, label: "Align center", value: "center" },
  { icon: <AlignRight size={14} />, label: "Align right", value: "right" }
];

function defaultRadius(type: string) {
  if (type === "ImageBlock") return 16;
  if (type === "Card" || type === "Metric" || type === "Chart") return 16;

  return 0;
}
