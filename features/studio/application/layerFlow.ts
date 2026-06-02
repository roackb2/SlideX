import { stringValue } from "@/common/util/valueUtils";
import type { MotionDocBlock } from "@/core/motion-doc/domain/motionDocParser";

export function normalizeLayerFlowProps(block: MotionDocBlock) {
  if (!("props" in block) || (block.type !== "Card" && block.type !== "Metric" && block.type !== "Chart")) {
    return { block, flowUpdates: {} };
  }

  const flowValue = stringValue(
    block.props.flow ??
    block.props.groupFlow ??
    block.props.cardFlow ??
    block.props.metricFlow ??
    block.props.chartFlow
  );
  const { cardFlow, chartFlow, flow, groupFlow, metricFlow, ...nextProps } = block.props;
  void cardFlow;
  void chartFlow;
  void flow;
  void groupFlow;
  void metricFlow;

  if (!flowValue) {
    return {
      block: { ...block, props: nextProps } as MotionDocBlock,
      flowUpdates: {}
    };
  }

  const flowProp = block.type === "Card" ? "cardFlow" : block.type === "Metric" ? "metricFlow" : "chartFlow";

  return {
    block: { ...block, props: nextProps } as MotionDocBlock,
    flowUpdates: { [flowProp]: flowValue }
  };
}
