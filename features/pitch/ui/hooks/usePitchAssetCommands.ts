"use client";

import type { Dispatch, SetStateAction } from "react";
import type { MotionDocScene } from "@/core/motion-doc/domain/motionDocTypes";
import { omitMotionDocProps } from "@/core/motion-doc/application/motionDocProps";
import {
  appendBlockToSlide,
  replaceSlideSource,
  updateBlockInSlide
} from "@/features/pitch/application/motionDocCommands";
import type { BlockUpdater } from "@/features/pitch/application/pitchCommandTypes";
import { PitchAssetFileError } from "@/features/pitch/infrastructure/pitchAssetFiles";
import {
  prepareAndRegisterPitchLocalFile,
  prepareAndRegisterPitchRemoteImage
} from "@/features/pitch/infrastructure/pitchLocalAssets";
import { stringValue } from "@/common/util/valueUtils";

type UsePitchAssetCommandsArgs = {
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  commitSource: (nextSource: string | ((current: string) => string)) => void;
  selectedBlockIndex: number | null;
  selectSingleBlock: (index: number | null) => void;
  setNotice: Dispatch<SetStateAction<string>>;
  setReplayNonce: Dispatch<SetStateAction<number>>;
  updateBlock: BlockUpdater;
};

export function usePitchAssetCommands({
  activeSlide,
  activeSlideIndex,
  commitSource,
  selectedBlockIndex,
  selectSingleBlock,
  setNotice,
  setReplayNonce,
  updateBlock
}: UsePitchAssetCommandsArgs) {
  async function pasteImageFile(file: File) {
    if (!activeSlide || !file.type.startsWith("image/")) return;

    try {
      const preparedAsset = await prepareAndRegisterPitchLocalFile(file);
      const selectedBlock = selectedBlockIndex === null ? undefined : activeSlide.blocks[selectedBlockIndex];

      if (selectedBlockIndex !== null && selectedBlock?.type === "ImageBlock") {
        const selectedImageProps = omitMotionDocProps(selectedBlock.props, ["sourceUrl"]);
        const slide = updateBlockInSlide(activeSlide, selectedBlockIndex, {
          ...selectedImageProps,
          alt: file.name || "Pasted image",
          fit: selectedBlock.props.fit || "contain",
          src: preparedAsset.url
        });
        if (!slide) return;
        commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
        setReplayNonce((value) => value + 1);
        setNotice(preparedAsset.optimized ? "Image optimized and pasted into selected layer" : "Image pasted into selected layer");
        return;
      }

      const { blockIndex, slide } = appendBlockToSlide(activeSlide, "Image", {
        props: { alt: file.name || "Pasted image", fit: "contain", src: preparedAsset.url }
      });
      commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
      selectSingleBlock(blockIndex);
      setReplayNonce((value) => value + 1);
      setNotice(preparedAsset.optimized ? "Image optimized and pasted" : "Image pasted");
    } catch (error) {
      setNotice(error instanceof PitchAssetFileError ? error.message : "Unable to paste image");
    }
  }

  async function uploadImageForBlock(blockIndex: number, file: File | undefined) {
    if (!activeSlide || !file) return;
    const block = activeSlide.blocks[blockIndex];
    if (!block || block.type !== "ImageBlock") return;
    if (!file.type.startsWith("image/")) {
      setNotice("Choose an image file");
      return;
    }

    try {
      const preparedAsset = await prepareAndRegisterPitchLocalFile(file);
      const imageProps = omitMotionDocProps(block.props, ["sourceUrl"]);
      updateBlock(blockIndex, {
        ...imageProps,
        alt: stringValue(block.props.alt) || file.name,
        fit: stringValue(block.props.fit) || "cover",
        src: preparedAsset.url
      });
      setNotice(preparedAsset.optimized ? "Image optimized and loaded" : "Local image loaded");
    } catch (error) {
      setNotice(error instanceof PitchAssetFileError ? error.message : "Failed to load local image");
    }
  }

  async function importImageUrlForBlock(blockIndex: number, source: string) {
    if (!activeSlide) return;
    const block = activeSlide.blocks[blockIndex];
    if (!block || block.type !== "ImageBlock") return;

    setNotice("Importing and optimizing image...");
    try {
      const preparedAsset = await prepareAndRegisterPitchRemoteImage(
        source,
        stringValue(block.props.alt) || undefined
      );
      updateBlock(blockIndex, {
        ...block.props,
        sourceUrl: source.trim(),
        src: preparedAsset.url
      });
      setNotice(preparedAsset.optimized ? "External image imported and optimized" : "External image imported locally");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to import external image");
    }
  }

  async function uploadVideoForBlock(blockIndex: number, file: File | undefined) {
    if (!activeSlide || !file) return;
    const block = activeSlide.blocks[blockIndex];
    if (!block || block.type !== "VideoBlock") return;
    if (!file.type.startsWith("video/")) {
      setNotice("Choose a video file");
      return;
    }

    try {
      setNotice("Loading video...");
      const preparedAsset = await prepareAndRegisterPitchLocalFile(file);
      updateBlock(blockIndex, {
        ...block.props,
        controls: stringValue(block.props.controls) || "true",
        fit: stringValue(block.props.fit) || "cover",
        src: preparedAsset.url
      });
      setNotice("Local video loaded");
    } catch (error) {
      setNotice(error instanceof PitchAssetFileError ? error.message : "Failed to load local video");
    }
  }

  return { importImageUrlForBlock, pasteImageFile, uploadImageForBlock, uploadVideoForBlock };
}
