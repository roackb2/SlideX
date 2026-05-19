"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Code2, X } from "lucide-react";
import { LayerSidebar } from "@/components/studio/LayerSidebar";
import { getCodeCursor, MdxEditorPane } from "@/components/studio/MdxEditorPane";
import { PreviewCanvas } from "@/components/studio/PreviewCanvas";
import { StudioInspector } from "@/components/studio/StudioInspector";
import { type AddBlockType } from "@/components/studio/studioOptions";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { TemplateModal } from "@/components/studio/TemplateModal";
import { downloadFile } from "@/lib/browserFile";
import { defaultMdx } from "@/lib/defaultMdx";
import { buildMotionDocHtml, slugifyFilename } from "@/lib/motionDocExport";
import { createMotionDocBlock } from "@/lib/motionDocBlockFactory";
import { materializeFreeformSource } from "@/lib/motionDocFreeform";
import { cloneBlock, generateSlideString, getSelectionMdx, getSlideTitle, replaceSlideContent, replaceSlideOpeningTag } from "@/lib/motionDocSerialize";
import { getMotionDocStats } from "@/lib/mdxStats";
import { parseMotionDoc, type MotionDocBlock, type MotionDocScene } from "@/lib/motionDocParser";
import { defaultTemplate, motionTemplates } from "@/lib/templates";
import { stringValue } from "@/lib/valueUtils";

export function MotionDocApp() {
  const [source, setSource] = useState(defaultMdx);
  const [replayNonce, setReplayNonce] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [notice, setNotice] = useState("Ready");
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState<number | null>(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [selectedBlockIndices, setSelectedBlockIndices] = useState<number[]>([]);
  const [copiedBlock, setCopiedBlock] = useState<MotionDocBlock | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isCanvasGridVisible, setIsCanvasGridVisible] = useState(false);
  const [codeScroll, setCodeScroll] = useState({ left: 0, top: 0 });
  const [codeCursor, setCodeCursor] = useState({ line: 1, column: 1 });
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const undoStackRef = useRef<string[]>([]);

  /* ─── Mobile panel states ─── */
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);

  const canvasSource = useMemo(() => materializeFreeformSource(source), [source]);
  const stats = useMemo(() => getMotionDocStats(canvasSource), [canvasSource]);
  const sliderDocument = useMemo(() => parseMotionDoc(canvasSource), [canvasSource]);
  const activeSlide = sliderDocument.scenes[activeSlideIndex] ?? sliderDocument.scenes[0];
  const activeSlideBackground = stringValue(activeSlide?.props.background) ?? "#0f172a";
  const activeSlideAccent = stringValue(activeSlide?.props.accent) ?? "#7c3aed";
  const activeSlideTheme = stringValue(activeSlide?.props.theme) ?? "dark";
  const activeSlideLayout = stringValue(activeSlide?.props.layout) ?? "default";
  const activeSlideAlignX = stringValue(activeSlide?.props.alignX) ?? "left";
  const activeSlideAlignY = stringValue(activeSlide?.props.alignY) ?? "center";
  const activeSlideCardFlow = stringValue(activeSlide?.props.cardFlow) ?? "stack";
  const activeSlideMetricFlow = stringValue(activeSlide?.props.metricFlow ?? activeSlide?.props.cardFlow) ?? "stack";
  const activeSlideChartFlow = stringValue(activeSlide?.props.chartFlow) ?? "stack";
  const activeSlideCardGap = numberValue(activeSlide?.props.cardGap) ?? 3;
  const activeSlideChartGap = numberValue(activeSlide?.props.chartGap) ?? 3;
  const activeSlideMetricGap = numberValue(activeSlide?.props.metricGap) ?? 3;
  const activeSlideTextColor = stringValue(activeSlide?.props.textColor ?? activeSlide?.props.foreground ?? activeSlide?.props.color) ?? "";
  const activeSlideMutedColor = stringValue(activeSlide?.props.mutedColor) ?? "";
  const selectionMdx = useMemo(
    () => getSelectionMdx(activeSlide, selectedBlockIndex, activeSlideIndex),
    [activeSlide, activeSlideIndex, selectedBlockIndex]
  );
  const slideRows = useMemo(
    () =>
      sliderDocument.scenes.map((slide, index) => ({
        index,
        duration: slide.duration,
        title: getSlideTitle(slide.blocks, index),
        layers: slide.blocks.length
      })),
    [sliderDocument.scenes]
  );

  useEffect(() => {
    setActiveSlideIndex((current) => {
      const maxIndex = Math.max(sliderDocument.scenes.length - 1, 0);
      return Math.min(current, maxIndex);
    });
  }, [sliderDocument.scenes.length]);

  useEffect(() => {
    setSelectedBlockIndices((current) => current.filter((index) => index >= 0 && index < (activeSlide?.blocks.length ?? 0)));
    setSelectedBlockIndex((current) => {
      if (current === null || current < (activeSlide?.blocks.length ?? 0)) {
        return current;
      }

      return null;
    });
  }, [activeSlide?.blocks.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!isExportMenuOpen) {
        return;
      }

      if (exportMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsExportMenuOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isExportMenuOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;

      // Handle Escape globally but respect inputs
      if (event.key === "Escape") {
        if (isCodeEditorOpen) {
          event.preventDefault();
          setIsCodeEditorOpen(false);
          return;
        }
        if (isExportMenuOpen) {
          event.preventDefault();
          setIsExportMenuOpen(false);
          return;
        }
        if (isTemplateModalOpen) {
          event.preventDefault();
          setIsTemplateModalOpen(false);
          return;
        }
        if (isMobileSidebarOpen) {
          event.preventDefault();
          setIsMobileSidebarOpen(false);
          return;
        }
        if (isMobileInspectorOpen) {
          event.preventDefault();
          setIsMobileInspectorOpen(false);
          return;
        }
      }

      // Skip shortcuts when typing in inputs
      if (tagName === "TEXTAREA" || tagName === "INPUT" || tagName === "SELECT") {
        return;
      }

      if (isCodeEditorOpen || isExportMenuOpen || isTemplateModalOpen || isMobileSidebarOpen || isMobileInspectorOpen) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
        copySelectedBlock();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undoLastChange();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteCopiedBlock();
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && (selectedBlockIndex !== null || selectedBlockIndices.length > 0)) {
        event.preventDefault();
        deleteSelectedBlocks();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSlide(activeSlideIndex);
        return;
      }

      if (isArrowKey(event.key) && (selectedBlockIndex !== null || selectedBlockIndices.length > 0)) {
        event.preventDefault();
        nudgeSelectedBlocks(arrowDelta(event.key, event.shiftKey, event.altKey));
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "<") {
        event.preventDefault();
        goToPreviousSlide();
      }

      if (event.key === "ArrowRight" || event.key === ">") {
        event.preventDefault();
        goToNextSlide();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // The shortcut handler intentionally reads the current editor state from this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCodeEditorOpen, isExportMenuOpen, isTemplateModalOpen, isMobileSidebarOpen, isMobileInspectorOpen, activeSlideIndex, selectedBlockIndex, selectedBlockIndices, source, copiedBlock]);

  function pushUndoSnapshot(snapshot = source) {
    const undoStack = undoStackRef.current;

    if (undoStack[undoStack.length - 1] === snapshot) {
      return;
    }

    undoStackRef.current = [...undoStack.slice(-79), snapshot];
  }

  function commitSource(nextSource: string | ((current: string) => string)) {
    setSource((current) => {
      const resolvedSource = typeof nextSource === "function" ? nextSource(current) : nextSource;

      if (resolvedSource !== current) {
        pushUndoSnapshot(current);
      }

      return resolvedSource;
    });
  }

  function undoLastChange() {
    const previousSource = undoStackRef.current.pop();

    if (!previousSource) {
      setNotice("Nothing to undo");
      return;
    }

    setSource(previousSource);
    setReplayNonce((value) => value + 1);
    setSelectedBlockIndex(null);
    setSelectedBlockIndices([]);
    setNotice("Undo");
  }

  function selectSingleBlock(index: number | null) {
    setSelectedBlockIndex(index);
    setSelectedBlockIndices(index === null ? [] : [index]);
  }

  function clearBlockSelection() {
    selectSingleBlock(null);
  }

  function selectBlock(index: number, options: { additive?: boolean; range?: boolean } = {}) {
    if (options.range && selectedBlockIndex !== null) {
      const start = Math.min(selectedBlockIndex, index);
      const end = Math.max(selectedBlockIndex, index);
      const range = Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
      setSelectedBlockIndices(range);
      setSelectedBlockIndex(index);
      return;
    }

    if (options.additive) {
      setSelectedBlockIndices((current) => {
        const nextSelection = current.includes(index)
          ? current.filter((item) => item !== index)
          : [...current, index].sort((a, b) => a - b);

        setSelectedBlockIndex(nextSelection.includes(index) ? index : nextSelection[nextSelection.length - 1] ?? null);
        return nextSelection;
      });
      return;
    }

    selectSingleBlock(index);
  }

  function selectBlocks(indices: number[], options: { additive?: boolean } = {}) {
    const uniqueIndices = indices
      .filter((index, offset, items) => items.indexOf(index) === offset)
      .sort((a, b) => a - b);

    if (options.additive) {
      setSelectedBlockIndices((current) => {
        const nextSelection = [...new Set([...current, ...uniqueIndices])].sort((a, b) => a - b);
        setSelectedBlockIndex(nextSelection[nextSelection.length - 1] ?? null);
        return nextSelection;
      });
      return;
    }

    setSelectedBlockIndices(uniqueIndices);
    setSelectedBlockIndex(uniqueIndices[uniqueIndices.length - 1] ?? null);
  }

  function selectBlockFromLayer(index: number, event: ReactMouseEvent<HTMLDivElement>) {
    selectBlock(index, {
      additive: event.metaKey || event.ctrlKey,
      range: event.shiftKey
    });
  }

  function beginBlockTransform() {
    pushUndoSnapshot();
  }

  function applyTemplate(templateId: string) {
    const template = motionTemplates.find((item) => item.id === templateId) ?? defaultTemplate;
    setSelectedTemplateId(template.id);
    commitSource(materializeFreeformSource(template.source));
    setActiveSlideIndex(0);
    selectSingleBlock(null);
    setIsTemplateModalOpen(false);
    setReplayNonce((value) => value + 1);
    setNotice(`${template.name} loaded`);
  }

  function insertSnippet(code: string) {
    commitSource((current) => `${current.trimEnd()}\n\n${code}`);
    setReplayNonce((value) => value + 1);
    setNotice("Block inserted");
  }

  function addSlide() {
    const theme = activeSlideTheme;
    const background = activeSlideBackground;
    const accent = activeSlideAccent;

    commitSource((current) => `${current.trimEnd()}\n\n<Slide duration={5} theme="${theme}" background="${background}" accent="${accent}">\n</Slide>`);
    setActiveSlideIndex(sliderDocument.scenes.length);
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Blank slide added");
  }

  function deleteSlide(slideIndex: number) {
    if (sliderDocument.scenes.length <= 1) {
      setNotice("Cannot delete last slide");
      return;
    }
    const pattern = /<(Slide|Scene)\b[^>]*>([\s\S]*?)<\/\1>/g;
    let currentIndex = 0;
    let nextSource = source;

    for (const match of source.matchAll(pattern)) {
      if (currentIndex === slideIndex && match.index !== undefined) {
        nextSource = source.slice(0, match.index) + source.slice(match.index + match[0].length);
        break;
      }
      currentIndex += 1;
    }

    commitSource(nextSource.replace(/\n{3,}/g, '\n\n').trim());
    setActiveSlideIndex((current) => Math.min(current, sliderDocument.scenes.length - 2));
    setReplayNonce((value) => value + 1);
    setNotice("Slide deleted");
  }

  function deleteBlock(blockIndex: number) {
    if (!activeSlide) return;
    const newBlocks = [...activeSlide.blocks];
    newBlocks.splice(blockIndex, 1);
    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice("Layer deleted");
  }

  function deleteSelectedBlocks() {
    if (!activeSlide) return;

    const indices = (selectedBlockIndices.length > 0 ? selectedBlockIndices : selectedBlockIndex === null ? [] : [selectedBlockIndex])
      .filter((index, offset, items) => items.indexOf(index) === offset)
      .sort((a, b) => b - a);

    if (indices.length === 0) {
      return;
    }

    const newBlocks = [...activeSlide.blocks];
    for (const index of indices) {
      newBlocks.splice(index, 1);
    }

    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    selectSingleBlock(null);
    setReplayNonce((value) => value + 1);
    setNotice(indices.length > 1 ? "Layers deleted" : "Layer deleted");
  }

  function moveBlock(blockIndex: number, direction: -1 | 1) {
    if (!activeSlide) return;
    const newIndex = blockIndex + direction;
    if (newIndex < 0 || newIndex >= activeSlide.blocks.length) return;
    
    const newBlocks = [...activeSlide.blocks];
    const temp = newBlocks[blockIndex];
    newBlocks[blockIndex] = newBlocks[newIndex];
    newBlocks[newIndex] = temp;
    
    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    setReplayNonce((value) => value + 1);
    setNotice("Layer reordered");
  }

  function copySelectedBlock() {
    if (!activeSlide || selectedBlockIndex === null) {
      return;
    }

    const block = activeSlide.blocks[selectedBlockIndex];

    if (!block) {
      return;
    }

    setCopiedBlock(cloneBlock(block));
    setNotice("Layer copied");
  }

  function pasteCopiedBlock() {
    if (!activeSlide || !copiedBlock) {
      return;
    }

    const nextBlocks = [...activeSlide.blocks];
    const insertIndex =
      selectedBlockIndex === null
        ? nextBlocks.length
        : Math.min(selectedBlockIndex + 1, nextBlocks.length);

    nextBlocks.splice(insertIndex, 0, cloneBlock(copiedBlock));

    const nextSlide: MotionDocScene = { ...activeSlide, blocks: nextBlocks };
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    selectSingleBlock(insertIndex);
    setReplayNonce((value) => value + 1);
    setNotice("Layer pasted");
  }

  function reorderBlock(fromIndex: number, toIndex: number) {
    if (!activeSlide || fromIndex === toIndex) return;
    const newBlocks = [...activeSlide.blocks];
    const [movedItem] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedItem);
    
    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    setReplayNonce((value) => value + 1);
    setNotice("Layer reordered");
  }

  function addBlockToActiveSlide(type: AddBlockType) {
    if (!activeSlide) return;
    const newBlocks = [...activeSlide.blocks];
    const newBlock = createMotionDocBlock(type);

    newBlocks.push(newBlock);
    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    selectSingleBlock(newBlocks.length - 1);
    setReplayNonce((value) => value + 1);
    setNotice(`${type} added`);
  }

  function addTextAtPosition(position: { x: number; y: number }) {
    if (!activeSlide) return;

    const newBlocks = [...activeSlide.blocks];
    const newBlock: MotionDocBlock = {
      type: "Text",
      props: {
        enter: "fadeIn",
        fontSize: 24,
        radius: 0,
        x: Math.min(Math.max(position.x, 0), 70),
        y: Math.min(Math.max(position.y, 0), 88),
        w: 30
      },
      text: "Double-click text"
    };

    newBlocks.push(newBlock);
    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    selectSingleBlock(newBlocks.length - 1);
    setReplayNonce((value) => value + 1);
    setNotice("Text added");
  }

  function updatePositionedBlockFrames(updates: Array<{ blockIndex: number; frame: { h?: number; w?: number; x?: number; y?: number } }>, commit = false) {
    if (!activeSlide) return;

    const newBlocks = [...activeSlide.blocks];

    for (const { blockIndex, frame } of updates) {
      const currentBlock = newBlocks[blockIndex];

      if (!currentBlock || !("props" in currentBlock)) {
        continue;
      }

      newBlocks[blockIndex] = {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          w: currentBlock.props.w ?? defaultBlockWidth(currentBlock.type),
          h: currentBlock.props.h ?? defaultBlockHeight(currentBlock.type),
          ...frame
        }
      };
    }

    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    setSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));

    if (commit) {
      setNotice(updates.length > 1 ? "Layers updated" : "Layer updated");
    }
  }

  function nudgeSelectedBlocks(delta: { x: number; y: number }) {
    if (!activeSlide) return;

    const indices = (selectedBlockIndices.length > 0 ? selectedBlockIndices : selectedBlockIndex === null ? [] : [selectedBlockIndex])
      .filter((index, offset, items) => items.indexOf(index) === offset);

    if (indices.length === 0) {
      return;
    }

    const newBlocks = [...activeSlide.blocks];
    let didMove = false;

    for (const blockIndex of indices) {
      const currentBlock = newBlocks[blockIndex];

      if (!currentBlock || !("props" in currentBlock)) {
        continue;
      }

      const w = percentFrameValue(currentBlock.props.w, defaultBlockWidth(currentBlock.type));
      const h = percentFrameValue(currentBlock.props.h, defaultBlockHeight(currentBlock.type));
      const x = percentFrameValue(currentBlock.props.x, defaultBlockX(currentBlock.type));
      const y = percentFrameValue(currentBlock.props.y, defaultBlockY(currentBlock.type));

      newBlocks[blockIndex] = {
        ...currentBlock,
        props: {
          ...currentBlock.props,
          h: currentBlock.props.h ?? h,
          w: currentBlock.props.w ?? w,
          x: clampFramePosition(x + delta.x, w),
          y: clampFramePosition(y + delta.y, h)
        }
      } as MotionDocBlock;
      didMove = true;
    }

    if (!didMove) {
      return;
    }

    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    setNotice(indices.length > 1 ? "Layers nudged" : "Layer nudged");
  }

  function updateActiveSlideStyle(updates: Record<string, string | number>) {
    if (!activeSlide) {
      return;
    }

    const nextProps = {
      ...activeSlide.props,
      duration: activeSlide.duration,
      ...updates
    };

    commitSource((current) => replaceSlideOpeningTag(current, activeSlideIndex, nextProps));
    setReplayNonce((value) => value + 1);
    setNotice("Slide style updated");
  }

  function updateAllSlidesStyle(updates: Record<string, string | number>) {
    if (sliderDocument.scenes.length === 0) {
      return;
    }

    commitSource((current) =>
      sliderDocument.scenes.reduce((nextSource, slide, index) => {
        const nextProps = {
          ...slide.props,
          duration: slide.duration,
          ...updates
        };

        return replaceSlideOpeningTag(nextSource, index, nextProps);
      }, current)
    );
    setReplayNonce((value) => value + 1);
    setNotice("Theme applied to all slides");
  }

  function updateBlockGroupFlow(blockType: "Card" | "Chart" | "Metric", flow: string, gap?: number) {
    if (!activeSlide) {
      return;
    }

    const flowProp = blockType === "Card" ? "cardFlow" : blockType === "Chart" ? "chartFlow" : "metricFlow";
    const gapProp = blockType === "Card" ? "cardGap" : blockType === "Chart" ? "chartGap" : "metricGap";
    const resolvedGap = gap ?? numberValue(activeSlide.props[gapProp]) ?? 3;
    const blocksWithLayout = activeSlide.blocks
      .map((block, index) => ({ block, index }))
      .filter(({ block }) => block.type === blockType && "props" in block);
    const nextBlocks = [...activeSlide.blocks];
    const nextProps = { ...activeSlide.props, [flowProp]: flow, [gapProp]: resolvedGap };

    blocksWithLayout.forEach(({ block, index }, order) => {
      if (!("props" in block)) {
        return;
      }

      nextBlocks[index] = {
        ...block,
        props: {
          ...block.props,
          ...groupFrameFor(blockType, flow, resolvedGap, order, blocksWithLayout.length, block.props)
        }
      } as MotionDocBlock;
    });

    const nextSlide: MotionDocScene = { ...activeSlide, blocks: nextBlocks, props: nextProps };
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    setReplayNonce((value) => value + 1);
    setNotice(flow === "stack" ? "Group stacked" : "Group arranged");
  }

  function updateBlock(blockIndex: number, newProps: Record<string, string | number>, newText?: string) {
    if (!activeSlide) return;

    const newBlocks = [...activeSlide.blocks];
    const currentBlock = newBlocks[blockIndex];

    if (!currentBlock) return;

    if (currentBlock.type === "Title" || currentBlock.type === "Text" || currentBlock.type === "heading") {
      newBlocks[blockIndex] = {
        type: currentBlock.type,
        props: newProps,
        text: newText ?? ("text" in currentBlock ? currentBlock.text : "")
      } as MotionDocBlock;
    } else {
      newBlocks[blockIndex] = {
        type: currentBlock.type,
        props: newProps
      } as MotionDocBlock;
    }

    const nextSlide: MotionDocScene = {
      ...activeSlide,
      blocks: newBlocks
    };

    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    setReplayNonce((value) => value + 1);
    setNotice("Block updated");
  }

  function uploadImageForBlock(blockIndex: number, file: File | undefined) {
    if (!activeSlide || !file) {
      return;
    }

    const block = activeSlide.blocks[blockIndex];

    if (!block || block.type !== "ImageBlock") {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setNotice("Choose an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setNotice("Image upload failed");
        return;
      }

      updateBlock(blockIndex, {
        ...block.props,
        alt: stringValue(block.props.alt) || file.name,
        fit: stringValue(block.props.fit) || "cover",
        src: reader.result
      });
      setNotice("Local image loaded");
    };
    reader.onerror = () => setNotice("Image upload failed");
    reader.readAsDataURL(file);
  }

  function goToPreviousSlide() {
    setActiveSlideIndex((current) => Math.max(current - 1, 0));
    setReplayNonce((value) => value + 1);
  }

  function goToNextSlide() {
    setActiveSlideIndex((current) => Math.min(current + 1, Math.max(sliderDocument.scenes.length - 1, 0)));
    setReplayNonce((value) => value + 1);
  }

  async function copySource() {
    if (!navigator.clipboard) {
      setNotice("Clipboard unavailable");
      return;
    }

    await navigator.clipboard.writeText(canvasSource);
    setNotice("Source copied");
  }

  function exportMdxFile() {
    const title = sliderDocument.title || "slidesx-deck";
    downloadFile(`${slugifyFilename(title)}.mdx`, canvasSource, "text/markdown;charset=utf-8");
    setIsExportMenuOpen(false);
    setNotice("MDX exported");
  }

  function exportHtmlFile() {
    const title = sliderDocument.title || "slidesx-deck";
    downloadFile(`${slugifyFilename(title)}.html`, buildMotionDocHtml(canvasSource), "text/html;charset=utf-8");
    setIsExportMenuOpen(false);
    setNotice("HTML exported");
  }

  const updateCodeCursor = useCallback((selectionStart: number, cursorSource = source) => {
    setCodeCursor(getCodeCursor(cursorSource, selectionStart));
  }, [source]);

  function updateSelectionMdx(value: string) {
    if (!activeSlide) {
      return;
    }

    if (selectedBlockIndex === null) {
      const parsed = parseMotionDoc(value);
      const nextSlide = parsed.scenes[0];

      if (!nextSlide) {
        setNotice("Selection MDX needs one Slide");
        return;
      }

      commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
      setReplayNonce((current) => current + 1);
      setNotice("Scene MDX updated");
      return;
    }

    const parsed = parseMotionDoc(`<Slide duration={5}>\n${value}\n</Slide>`);
    const nextBlock = parsed.scenes[0]?.blocks[0];

    if (!nextBlock) {
      setNotice("Selection MDX needs one layer");
      return;
    }

    const nextBlocks = [...activeSlide.blocks];
    nextBlocks[selectedBlockIndex] = nextBlock;
    commitSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString({ ...activeSlide, blocks: nextBlocks })));
    setReplayNonce((current) => current + 1);
    setNotice("Layer MDX updated");
  }

  function defaultBlockWidth(type: MotionDocBlock["type"]) {
    if (type === "Title") return 52;
    if (type === "Text") return 42;
    if (type === "Metric") return 32;
    if (type === "Chart") return 70;
    if (type === "ImageBlock") return 80;

    return 40;
  }

  function defaultBlockHeight(type: MotionDocBlock["type"]) {
    if (type === "Title") return 18;
    if (type === "Text") return 16;
    if (type === "Metric") return 36;
    if (type === "Chart") return 42;
    if (type === "ImageBlock") return 54;

    return 32;
  }

  function defaultBlockX(type: MotionDocBlock["type"]) {
    if (type === "ImageBlock" || type === "Chart") return 10;

    return 8;
  }

  function defaultBlockY(type: MotionDocBlock["type"]) {
    if (type === "Title") return 12;
    if (type === "Chart") return 36;
    if (type === "ImageBlock") return 20;

    return 38;
  }

  function groupFrameFor(
    type: "Card" | "Chart" | "Metric",
    flow: string,
    gap: number,
    index: number,
    count: number,
    props: Record<string, string | number>
  ) {
    const defaultW = defaultBlockWidth(type);
    const defaultH = defaultBlockHeight(type);
    const currentW = percentFrameValue(props.w, defaultW);
    const currentH = percentFrameValue(props.h, defaultH);

    if (flow === "row") {
      const normalizedGap = Math.min(Math.max(gap, 0), 16);
      const width = Math.max((84 - normalizedGap * Math.max(count - 1, 0)) / Math.max(count, 1), 8);
      const groupWidth = Math.min(width * count + normalizedGap * Math.max(count - 1, 0), 96);
      return {
        h: roundFrameValue(currentH),
        w: roundFrameValue(width),
        x: roundFrameValue((100 - groupWidth) / 2 + index * (width + normalizedGap)),
        y: type === "Chart" ? 34 : 38
      };
    }

    const stackWidth = type === "Chart" ? Math.max(currentW, 64) : Math.max(currentW, defaultW);
    const stackHeight = Math.min(currentH, type === "Chart" ? 42 : defaultH);

    return {
      h: roundFrameValue(stackHeight),
      w: roundFrameValue(stackWidth),
      x: type === "Chart" ? 10 : 8,
      y: clampFramePosition((type === "Chart" ? 28 : 30) + index * (stackHeight + 4), stackHeight)
    };
  }

  return (
    <main className="flex h-screen flex-col bg-black text-neutral-300 font-sans overflow-hidden">
      <StudioHeader
        exportMenuRef={exportMenuRef}
        isExportMenuOpen={isExportMenuOpen}
        isMobileInspectorOpen={isMobileInspectorOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        notice={notice}
        onExportHtml={exportHtmlFile}
        onExportMdx={exportMdxFile}
        onReplay={() => setReplayNonce((value) => value + 1)}
        onUndo={undoLastChange}
        onToggleInspector={() => {
          setIsMobileInspectorOpen((v) => !v);
          setIsMobileSidebarOpen(false);
        }}
        onToggleSidebar={() => {
          setIsMobileSidebarOpen((v) => !v);
          setIsMobileInspectorOpen(false);
        }}
        setIsExportMenuOpen={setIsExportMenuOpen}
      />

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden flex bg-black relative" id="workspace-v4">
        {/* Desktop sidebar */}
        <div className="hidden md:flex h-full">
          <LayerSidebar
            activeSlideCardFlow={activeSlideCardFlow}
            activeSlideChartFlow={activeSlideChartFlow}
            activeSlideIndex={activeSlideIndex}
            activeSlideMetricFlow={activeSlideMetricFlow}
            deleteBlock={deleteBlock}
            deleteSlide={deleteSlide}
            draggedBlockIndex={draggedBlockIndex}
            dragOverBlockIndex={dragOverBlockIndex}
            isTemplateModalOpen={isTemplateModalOpen}
            moveBlock={moveBlock}
            onSelectBlock={selectBlockFromLayer}
            onSelectBlocks={selectBlocks}
            onOpenTemplates={() => setIsTemplateModalOpen(true)}
            onSelectSlide={(index) => {
              setActiveSlideIndex(index);
              selectSingleBlock(null);
              setReplayNonce((value) => value + 1);
            }}
            reorderBlock={reorderBlock}
            scenes={sliderDocument.scenes}
            selectedBlockIndex={selectedBlockIndex}
            selectedBlockIndices={selectedBlockIndices}
            setDraggedBlockIndex={setDraggedBlockIndex}
            setDragOverBlockIndex={setDragOverBlockIndex}
            slideRows={slideRows}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="md:hidden fixed inset-y-0 left-0 z-40 w-[260px] sm:w-[280px] flex flex-col border-r border-white/[0.12] bg-[#0a0a0a] shadow-2xl">
              <LayerSidebar
                activeSlideCardFlow={activeSlideCardFlow}
                activeSlideChartFlow={activeSlideChartFlow}
                activeSlideIndex={activeSlideIndex}
                activeSlideMetricFlow={activeSlideMetricFlow}
                deleteBlock={deleteBlock}
                deleteSlide={deleteSlide}
                draggedBlockIndex={draggedBlockIndex}
                dragOverBlockIndex={dragOverBlockIndex}
                isTemplateModalOpen={isTemplateModalOpen}
                moveBlock={moveBlock}
                onSelectBlock={selectBlockFromLayer}
                onSelectBlocks={selectBlocks}
                onOpenTemplates={() => setIsTemplateModalOpen(true)}
                onSelectSlide={(index) => {
                  setActiveSlideIndex(index);
                  selectSingleBlock(null);
                  setReplayNonce((value) => value + 1);
                  setIsMobileSidebarOpen(false);
                }}
                reorderBlock={reorderBlock}
                scenes={sliderDocument.scenes}
                selectedBlockIndex={selectedBlockIndex}
                selectedBlockIndices={selectedBlockIndices}
                setDraggedBlockIndex={setDraggedBlockIndex}
                setDragOverBlockIndex={setDragOverBlockIndex}
                slideRows={slideRows}
              />
            </div>
          </>
        )}

        <PreviewCanvas
          activeSlide={activeSlide}
          activeSlideIndex={activeSlideIndex}
          isGridVisible={isCanvasGridVisible}
          onAddBlock={addBlockToActiveSlide}
          onAddTextAtPosition={addTextAtPosition}
          onBeginBlockTransform={beginBlockTransform}
          onClearSelection={clearBlockSelection}
          onSelectBlock={selectBlock}
          onSelectBlocks={selectBlocks}
          onUpdateBlockFrames={updatePositionedBlockFrames}
          onNextSlide={goToNextSlide}
          onPreviousSlide={goToPreviousSlide}
          onSelectSlide={setActiveSlideIndex}
          replayNonce={replayNonce}
          sceneCount={sliderDocument.scenes.length}
          selectedBlockIndex={selectedBlockIndex}
          selectedBlockIndices={selectedBlockIndices}
          slideRows={slideRows}
          source={canvasSource}
          totalDuration={stats.totalDuration}
        />

        {/* Desktop inspector */}
        <div className="hidden md:flex h-full">
          <StudioInspector
            activeSlide={activeSlide}
            activeSlideAccent={activeSlideAccent}
            activeSlideAlignX={activeSlideAlignX}
            activeSlideAlignY={activeSlideAlignY}
            activeSlideBackground={activeSlideBackground}
            activeSlideCardFlow={activeSlideCardFlow}
            activeSlideCardGap={activeSlideCardGap}
            activeSlideChartFlow={activeSlideChartFlow}
            activeSlideChartGap={activeSlideChartGap}
            activeSlideLayout={activeSlideLayout}
            activeSlideMetricFlow={activeSlideMetricFlow}
            activeSlideMetricGap={activeSlideMetricGap}
            activeSlideMutedColor={activeSlideMutedColor}
            activeSlideTextColor={activeSlideTextColor}
            activeSlideTheme={activeSlideTheme}
            isGridVisible={isCanvasGridVisible}
            onOpenMdxEditor={() => setIsCodeEditorOpen(true)}
            selectedBlockIndex={selectedBlockIndex}
            setSelectedBlockIndex={selectSingleBlock}
            setIsGridVisible={setIsCanvasGridVisible}
            updateAllSlidesStyle={updateAllSlidesStyle}
            updateActiveSlideStyle={updateActiveSlideStyle}
            updateBlockGroupFlow={updateBlockGroupFlow}
            updateBlock={updateBlock}
            uploadImageForBlock={uploadImageForBlock}
          />
        </div>

        {/* Mobile inspector overlay */}
        {isMobileInspectorOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileInspectorOpen(false)}
            />
            <div className="md:hidden fixed inset-y-0 right-0 z-40 w-[260px] sm:w-[280px] flex flex-col border-l border-white/[0.12] bg-[#0a0a0a] shadow-2xl">
              <StudioInspector
                activeSlide={activeSlide}
                activeSlideAccent={activeSlideAccent}
                activeSlideAlignX={activeSlideAlignX}
                activeSlideAlignY={activeSlideAlignY}
                activeSlideBackground={activeSlideBackground}
                activeSlideCardFlow={activeSlideCardFlow}
                activeSlideCardGap={activeSlideCardGap}
                activeSlideChartFlow={activeSlideChartFlow}
                activeSlideChartGap={activeSlideChartGap}
                activeSlideLayout={activeSlideLayout}
                activeSlideMetricFlow={activeSlideMetricFlow}
                activeSlideMetricGap={activeSlideMetricGap}
                activeSlideMutedColor={activeSlideMutedColor}
                activeSlideTextColor={activeSlideTextColor}
                activeSlideTheme={activeSlideTheme}
                isGridVisible={isCanvasGridVisible}
                onOpenMdxEditor={() => {
                  setIsMobileInspectorOpen(false);
                  setIsCodeEditorOpen(true);
                }}
                selectedBlockIndex={selectedBlockIndex}
                setSelectedBlockIndex={(idx) => {
                  selectSingleBlock(idx);
                  if (idx !== null) setIsMobileInspectorOpen(false);
                }}
                updateAllSlidesStyle={updateAllSlidesStyle}
                updateActiveSlideStyle={updateActiveSlideStyle}
                updateBlockGroupFlow={updateBlockGroupFlow}
                updateBlock={updateBlock}
                setIsGridVisible={setIsCanvasGridVisible}
                uploadImageForBlock={uploadImageForBlock}
              />
            </div>
          </>
        )}
      </div>

      {isCodeEditorOpen && (
        <div className="fixed inset-0 z-[90] bg-black/25 backdrop-blur-[1px]" onMouseDown={() => setIsCodeEditorOpen(false)}>
          <div
            className="absolute inset-y-0 right-0 flex w-full md:max-w-[820px] flex-col border-l border-neutral-800 bg-[#070707] shadow-2xl shadow-black/50"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-neutral-400" />
                <span className="text-[12px] font-semibold text-white">MDX Editor</span>
              </div>
              <button
                aria-label="Close MDX editor"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                onClick={() => setIsCodeEditorOpen(false)}
                type="button"
              >
                <X size={14} />
              </button>
            </div>
            <MdxEditorPane
              codeCursor={codeCursor}
              codeScroll={codeScroll}
              copySource={copySource}
              insertSnippet={insertSnippet}
              sceneCount={sliderDocument.scenes.length}
              selectionLabel={selectionMdx.label}
              selectionSource={selectionMdx.source}
              setCodeScroll={setCodeScroll}
              source={source}
              updateCodeCursor={updateCodeCursor}
              onSelectionSourceChange={updateSelectionMdx}
              onSourceChange={(value) => {
                pushUndoSnapshot();
                setSource(value);
              }}
            />
          </div>
        </div>
      )}

      {isTemplateModalOpen && (
        <TemplateModal
          onAddBlankSlide={() => {
            addSlide();
            setIsTemplateModalOpen(false);
          }}
          onApplyTemplate={applyTemplate}
          onClose={() => setIsTemplateModalOpen(false)}
          selectedTemplateId={selectedTemplateId}
        />
      )}

      {/* Global Styles for Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #262626; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #404040; }
      `}} />
    </main>
  );
}

function isArrowKey(key: string) {
  return key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown";
}

function arrowDelta(key: string, isLargeStep: boolean, isFineStep: boolean) {
  const step = isFineStep ? 0.2 : isLargeStep ? 5 : 1;

  if (key === "ArrowLeft") return { x: -step, y: 0 };
  if (key === "ArrowRight") return { x: step, y: 0 };
  if (key === "ArrowUp") return { x: 0, y: -step };

  return { x: 0, y: step };
}

function percentFrameValue(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 0), 100);
}

function numberValue(value: string | number | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function clampFramePosition(value: number, size: number) {
  return Math.round(Math.min(Math.max(value, 0), Math.max(100 - size, 0)) * 10) / 10;
}

function roundFrameValue(value: number) {
  return Math.round(Math.min(Math.max(value, 0), 100) * 10) / 10;
}
