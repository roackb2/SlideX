"use client";

import type { ReactNode } from "react";
import { CardFields } from "@/features/pitch/ui/inspector/CardFields";
import { ChartFields } from "@/features/pitch/ui/inspector/ChartFields";
import { IconFields } from "@/features/pitch/ui/inspector/IconFields";
import { ImageFields } from "@/features/pitch/ui/inspector/ImageFields";
import { MetricFields } from "@/features/pitch/ui/inspector/MetricFields";
import { ShapeFields } from "@/features/pitch/ui/inspector/ShapeFields";
import { StackFields } from "@/features/pitch/ui/inspector/StackFields";
import { VideoFields } from "@/features/pitch/ui/inspector/VideoFields";
import type { BlockFieldProps } from "@/features/pitch/ui/inspector/InspectorControls";

type BlockFieldRegistryContext = BlockFieldProps & {
  uploadImageForBlock: (blockIndex: number, file: File | undefined) => void;
  uploadVideoForBlock: (blockIndex: number, file: File | undefined) => void;
};

type BlockFieldRegistryEntry = {
  render: (context: BlockFieldRegistryContext) => ReactNode;
  title: string;
};

const blockFieldRegistry: Record<string, BlockFieldRegistryEntry> = {
  Card: {
    render: (context) => <CardFields {...context} />,
    title: "Card properties"
  },
  Chart: {
    render: (context) => <ChartFields {...context} />,
    title: "Chart properties"
  },
  Icon: {
    render: (context) => <IconFields {...context} />,
    title: "Icon properties"
  },
  ImageBlock: {
    render: (context) => <ImageFields {...context} uploadImageForBlock={context.uploadImageForBlock} />,
    title: "Image properties"
  },
  Metric: {
    render: (context) => <MetricFields {...context} />,
    title: "Metric properties"
  },
  Shape: {
    render: (context) => <ShapeFields {...context} />,
    title: "Shape properties"
  },
  Stack: {
    render: (context) => <StackFields {...context} />,
    title: "Stack properties"
  },
  VideoBlock: {
    render: (context) => <VideoFields {...context} uploadVideoForBlock={context.uploadVideoForBlock} />,
    title: "Video properties"
  }
};

export function getBlockFieldRegistryEntry(type: string) {
  return blockFieldRegistry[type] ?? null;
}
