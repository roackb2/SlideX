"use client";

import {
  elementAnimationPresets,
  normalizeEnterAnimation,
  type EnterAnimation
} from "@/features/pitch/application/motionPresets";
import type { MotionDocProps } from "@/core/motion-doc/domain/motionDocTypes";
import { applyElementAnimationProps } from "@/features/pitch/application/motionModel";
import { autoSizeTextFrameProps } from "@/features/pitch/application/textFrameSizing";
import { ColorControl, NumberInput, type BlockFieldProps } from "@/features/pitch/ui/inspector/InspectorControls";
import { AccordionSection } from "@/features/pitch/ui/inspector/controls/AccordionSection";
import { MotionThumbnailGrid } from "@/features/pitch/ui/inspector/controls/MotionThumbnailGrid";

export function MotionFields({
  block,
  inheritedBackgroundColor,
  inheritedTextColor,
  isTextType,
  selectedBlockIndex,
  textValue,
  updateBlock
}: BlockFieldProps & {
  inheritedBackgroundColor: string;
  inheritedTextColor: string;
  isTextType: boolean;
  textValue: string;
}) {
  const updateProps = (nextProps: typeof block.props, options?: { resizeTextFrame?: boolean }) => {
    const resolvedProps = options?.resizeTextFrame && isTextType
      ? autoSizeTextFrameProps(block, textValue, { props: nextProps })
      : nextProps;

    updateBlock(selectedBlockIndex, resolvedProps, isTextType ? textValue : undefined);
  };
  
  const updateOptionalProp = (key: string, value: string, aliases: string[] = []) => {
    const nextProps: MotionDocProps = { ...block.props };

    delete nextProps[key];
    aliases.forEach((alias) => delete nextProps[alias]);

    if (value.trim()) {
      nextProps[key] = value.trim();
    }

    updateProps(nextProps);
  };
  


  const hasCustomBackground = Boolean(block.props.background ?? block.props.backgroundColor ?? block.props.bg);
  const selectedAnimation = normalizeEnterAnimation(block.props.enter);

  function updateAnimation(value: EnterAnimation) {
    updateProps(applyElementAnimationProps(block.props, value));
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Visuals & Geometry Accordion */}
      <AccordionSection title="Visuals & Geometry" defaultOpen={true}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
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
              label={block.type === "ImageBlock" ? "Frame background" : "Background"}
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
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <NumberInput prefix={<span className="text-[10px] font-semibold w-3">X</span>} min="0" max="100" onChange={(value) => updateProps({ ...block.props, x: value })} placeholder="10" step="0.5" suffix="%" value={block.props.x ?? ""} />
              <NumberInput prefix={<span className="text-[10px] font-semibold w-3">Y</span>} min="0" max="100" onChange={(value) => updateProps({ ...block.props, y: value })} placeholder="20" step="0.5" suffix="%" value={block.props.y ?? ""} />
              <NumberInput prefix={<span className="text-[10px] font-semibold w-3">W</span>} min="8" max="100" onChange={(value) => updateProps({ ...block.props, w: value })} placeholder="42" step="0.5" suffix="%" value={block.props.w ?? ""} />
              <NumberInput prefix={<span className="text-[10px] font-semibold w-3">H</span>} min="6" max="100" onChange={(value) => updateProps({ ...block.props, h: value })} placeholder="18" step="0.5" suffix="%" value={block.props.h ?? ""} />
            </div>
          </div>



          {!isTextType ? (
            <div className="flex flex-col gap-1.5">
              <NumberInput
                prefix={<span className="text-[10px] font-semibold text-neutral-500">Radius</span>}
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
            </div>
          ) : null}
        </div>
      </AccordionSection>

      {/* Motion Effects Accordion */}
      <AccordionSection title="Motion & Transition" defaultOpen={true}>
        <div className="flex flex-col gap-5">
          {selectedAnimation !== "none" ? (
            <div className="grid grid-cols-2 gap-1.5">
              <NumberInput prefix={<span className="text-[10px] font-semibold text-neutral-500 w-9">Delay</span>} min="0" onChange={(value) => updateProps({ ...block.props, delay: value })} placeholder="0" step="0.1" suffix="s" value={block.props.delay ?? ""} />
              <NumberInput prefix={<span className="text-[10px] font-semibold text-neutral-500 w-11">Duration</span>} min="0.1" onChange={(value) => updateProps({ ...block.props, duration: value === "" ? "" : value })} placeholder="0.6" step="0.1" suffix="s" value={block.props.duration ?? ""} />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-neutral-500">Animation Style</span>
            <MotionThumbnailGrid
              label=""
              onChange={updateAnimation}
              options={elementAnimationPresets}
              value={selectedAnimation}
            />
          </div>
        </div>
      </AccordionSection>
    </div>
  );
}



function defaultRadius(type: string) {
  if (type === "ImageBlock") return 16;
  if (type === "Card" || type === "Metric") return 16;

  return 0;
}
