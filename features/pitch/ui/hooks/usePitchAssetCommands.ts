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
import {
  normalizeAbsolutePitchImageSource,
  normalizeDirectPitchImageSource
} from "@/features/pitch/application/pitchAssetPolicy";
import {
  presentationImageReferenceCount,
  presentationImageSource,
  presentationImageStoragePathFromSource
} from "@/features/pitch/application/presentationImagePath";
import { PitchAssetFileError } from "@/features/pitch/infrastructure/pitchAssetFiles";
import {
  deletePresentationImageViaApi,
  PresentationImageAuthenticationRequiredError,
  uploadPresentationImageViaApi
} from "@/features/pitch/infrastructure/supabasePresentationAssets";
import { stringValue } from "@/common/util/valueUtils";

type UsePitchAssetCommandsArgs = {
  activeSlide: MotionDocScene | undefined;
  activeSlideIndex: number;
  commitSource: (nextSource: string | ((current: string) => string)) => void;
  onImageUploadAuthRequired: () => void;
  onImageRemovalAuthRequired: () => void;
  presentationId?: string;
  scenes: MotionDocScene[];
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
  onImageUploadAuthRequired,
  onImageRemovalAuthRequired,
  presentationId,
  scenes,
  selectedBlockIndex,
  selectSingleBlock,
  setNotice,
  setReplayNonce,
  updateBlock
}: UsePitchAssetCommandsArgs) {
  function requestImageUpload() {
    if (presentationId) return true;
    onImageUploadAuthRequired();
    return false;
  }

  function requestImageRemoval() {
    if (presentationId) return true;
    onImageRemovalAuthRequired();
    return false;
  }

  async function uploadPresentationImage(file: File) {
    if (!presentationId) {
      throw new PitchAssetFileError("Sign in and open a saved presentation before uploading images");
    }

    const uploadedImage = await uploadPresentationImageViaApi(file, presentationId);
    return {
      ...uploadedImage,
      url: presentationImageSource(uploadedImage.path)
    };
  }

  async function pasteImageFile(file: File) {
    if (!activeSlide || !file.type.startsWith("image/")) return;
    if (!requestImageUpload()) return;

    try {
      setNotice("Uploading image...");
      const preparedAsset = await uploadPresentationImage(file);
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
        setNotice(preparedAsset.optimized ? "Image optimized, uploaded, and pasted into selected layer" : "Image uploaded and pasted into selected layer");
        return;
      }

      const { blockIndex, slide } = appendBlockToSlide(activeSlide, "Image", {
        props: { alt: file.name || "Pasted image", fit: "contain", src: preparedAsset.url }
      });
      commitSource((current) => replaceSlideSource(current, activeSlideIndex, slide));
      selectSingleBlock(blockIndex);
      setReplayNonce((value) => value + 1);
      setNotice(preparedAsset.optimized ? "Image optimized, uploaded, and pasted" : "Image uploaded and pasted");
    } catch (error) {
      if (error instanceof PresentationImageAuthenticationRequiredError) {
        onImageUploadAuthRequired();
      }
      setNotice(error instanceof Error ? error.message : "Unable to paste image");
    }
  }

  async function uploadImageForBlock(blockIndex: number, file: File | undefined) {
    if (!activeSlide || !file) return;
    if (!requestImageUpload()) return;
    const block = activeSlide.blocks[blockIndex];
    if (!block || block.type !== "ImageBlock") return;
    if (!file.type.startsWith("image/")) {
      setNotice("Choose an image file");
      return;
    }

    try {
      setNotice("Uploading image...");
      const preparedAsset = await uploadPresentationImage(file);
      const imageProps = omitMotionDocProps(block.props, ["sourceUrl"]);
      updateBlock(blockIndex, {
        ...imageProps,
        alt: stringValue(block.props.alt) || file.name,
        fit: stringValue(block.props.fit) || "cover",
        src: preparedAsset.url
      });
      setNotice(preparedAsset.optimized ? "Image optimized and uploaded" : "Image uploaded");
    } catch (error) {
      if (error instanceof PresentationImageAuthenticationRequiredError) {
        onImageUploadAuthRequired();
      }
      setNotice(error instanceof Error ? error.message : "Failed to upload image");
    }
  }

  function importImageUrlForBlock(blockIndex: number, source: string) {
    if (!activeSlide) return false;
    const block = activeSlide.blocks[blockIndex];
    if (!block || block.type !== "ImageBlock") return false;

    const directSource = presentationId
      ? normalizeDirectPitchImageSource(source)
      : normalizeAbsolutePitchImageSource(source);
    if (!directSource) {
      setNotice(
        presentationId
          ? "Enter a valid https URL or image path"
          : "Guests must use a complete https:// image URL"
      );
      return false;
    }

    const imageProps = omitMotionDocProps(block.props, ["sourceUrl"]);
    updateBlock(blockIndex, { ...imageProps, src: directSource });
    setNotice("Image path loaded");
    return true;
  }

  async function removeImageForBlock(blockIndex: number) {
    if (!activeSlide) return;
    if (!requestImageRemoval()) return;
    const block = activeSlide.blocks[blockIndex];
    if (!block || block.type !== "ImageBlock") return;

    const source = stringValue(block.props.src)?.trim() ?? "";
    if (!source) return;

    const storagePath = presentationImageStoragePathFromSource(source);
    try {
      const referenceCount = presentationImageReferenceCount(scenes, source);
      if (storagePath && referenceCount <= 1) {
        if (!presentationId) {
          throw new PitchAssetFileError("Sign in before removing uploaded images");
        }
        await deletePresentationImageViaApi({ path: storagePath });
      }

      const imageProps = omitMotionDocProps(block.props, ["sourceUrl"]);
      updateBlock(blockIndex, { ...imageProps, src: "" });
      setNotice(
        storagePath && referenceCount <= 1
          ? "Image removed from Supabase"
          : storagePath
            ? "Image removed from this layer; the shared Supabase file was kept"
            : "Image removed from this layer"
      );
    } catch (error) {
      if (error instanceof PresentationImageAuthenticationRequiredError) {
        onImageRemovalAuthRequired();
      }
      setNotice(error instanceof Error ? error.message : "Failed to remove image");
    }
  }

  return {
    importImageUrlForBlock,
    imageSourceRequiresAbsoluteUrl: !presentationId,
    pasteImageFile,
    removeImageForBlock,
    requestImageRemoval,
    requestImageUpload,
    uploadImageForBlock
  };
}
