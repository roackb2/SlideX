"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [copiedBlock, setCopiedBlock] = useState<MotionDocBlock | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [codeScroll, setCodeScroll] = useState({ left: 0, top: 0 });
  const [codeCursor, setCodeCursor] = useState({ line: 1, column: 1 });
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  /* ─── Mobile panel states ─── */
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);

  const stats = useMemo(() => getMotionDocStats(source), [source]);
  const sliderDocument = useMemo(() => parseMotionDoc(source), [source]);
  const activeSlide = sliderDocument.scenes[activeSlideIndex] ?? sliderDocument.scenes[0];
  const activeSlideBackground = stringValue(activeSlide?.props.background) ?? "#0f172a";
  const activeSlideAccent = stringValue(activeSlide?.props.accent) ?? "#7c3aed";
  const activeSlideTheme = stringValue(activeSlide?.props.theme) ?? "dark";
  const activeSlideLayout = stringValue(activeSlide?.props.layout) ?? "default";
  const activeSlideAlignX = stringValue(activeSlide?.props.alignX) ?? "left";
  const activeSlideAlignY = stringValue(activeSlide?.props.alignY) ?? "center";
  const activeSlideTextAlign = stringValue(activeSlide?.props.textAlign) ?? "left";
  const activeSlideCardFlow = stringValue(activeSlide?.props.cardFlow) ?? "stack";
  const activeSlideMetricFlow = stringValue(activeSlide?.props.metricFlow ?? activeSlide?.props.cardFlow) ?? "stack";
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

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
        copySelectedBlock();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteCopiedBlock();
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
  }, [isCodeEditorOpen, isExportMenuOpen, isTemplateModalOpen, isMobileSidebarOpen, isMobileInspectorOpen, activeSlideIndex, selectedBlockIndex, source, copiedBlock]);

  function applyTemplate(templateId: string) {
    const template = motionTemplates.find((item) => item.id === templateId) ?? defaultTemplate;
    setSelectedTemplateId(template.id);
    setSource(template.source);
    setActiveSlideIndex(0);
    setSelectedBlockIndex(null);
    setIsTemplateModalOpen(false);
    setReplayNonce((value) => value + 1);
    setNotice(`${template.name} loaded`);
  }

  function insertSnippet(code: string) {
    setSource((current) => `${current.trimEnd()}\n\n${code}`);
    setReplayNonce((value) => value + 1);
    setNotice("Block inserted");
  }

  function addSlide() {
    const theme = activeSlideTheme;
    const background = activeSlideBackground;
    const accent = activeSlideAccent;

    setSource((current) => `${current.trimEnd()}\n\n<Slide duration={5} theme="${theme}" background="${background}" accent="${accent}">\n  <Title enter="fadeUp" mb={16}>Next slide</Title>\n  <Text enter="fadeUp" delay={0.25}>\n    Continue the presentation here.\n  </Text>\n</Slide>`);
    setActiveSlideIndex(sliderDocument.scenes.length);
    setReplayNonce((value) => value + 1);
    setNotice("Slide added");
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

    setSource(nextSource.replace(/\n{3,}/g, '\n\n').trim());
    setActiveSlideIndex((current) => Math.min(current, sliderDocument.scenes.length - 2));
    setReplayNonce((value) => value + 1);
    setNotice("Slide deleted");
  }

  function deleteBlock(blockIndex: number) {
    if (!activeSlide) return;
    const newBlocks = [...activeSlide.blocks];
    newBlocks.splice(blockIndex, 1);
    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    setSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    setReplayNonce((value) => value + 1);
    setNotice("Layer deleted");
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
    setSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
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
    setSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    setSelectedBlockIndex(insertIndex);
    setReplayNonce((value) => value + 1);
    setNotice("Layer pasted");
  }

  function reorderBlock(fromIndex: number, toIndex: number) {
    if (!activeSlide || fromIndex === toIndex) return;
    const newBlocks = [...activeSlide.blocks];
    const [movedItem] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedItem);
    
    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    setSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    setReplayNonce((value) => value + 1);
    setNotice("Layer reordered");
  }

  function addBlockToActiveSlide(type: AddBlockType) {
    if (!activeSlide) return;
    const newBlocks = [...activeSlide.blocks];
    const newBlock = createMotionDocBlock(type);

    newBlocks.push(newBlock);
    const nextSlide: MotionDocScene = { ...activeSlide, blocks: newBlocks };
    setSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
    setReplayNonce((value) => value + 1);
    setNotice(`${type} added`);
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

    setSource((current) => replaceSlideOpeningTag(current, activeSlideIndex, nextProps));
    setReplayNonce((value) => value + 1);
    setNotice("Slide style updated");
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

    setSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
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

    await navigator.clipboard.writeText(source);
    setNotice("Source copied");
  }

  function exportMdxFile() {
    const title = sliderDocument.title || "slidesx-deck";
    downloadFile(`${slugifyFilename(title)}.mdx`, source, "text/markdown;charset=utf-8");
    setIsExportMenuOpen(false);
    setNotice("MDX exported");
  }

  function exportHtmlFile() {
    const title = sliderDocument.title || "slidesx-deck";
    downloadFile(`${slugifyFilename(title)}.html`, buildMotionDocHtml(source), "text/html;charset=utf-8");
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

      setSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString(nextSlide)));
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
    setSource((current) => replaceSlideContent(current, activeSlideIndex, generateSlideString({ ...activeSlide, blocks: nextBlocks })));
    setReplayNonce((current) => current + 1);
    setNotice("Layer MDX updated");
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
            activeSlideIndex={activeSlideIndex}
            activeSlideMetricFlow={activeSlideMetricFlow}
            deleteBlock={deleteBlock}
            deleteSlide={deleteSlide}
            draggedBlockIndex={draggedBlockIndex}
            dragOverBlockIndex={dragOverBlockIndex}
            isTemplateModalOpen={isTemplateModalOpen}
            moveBlock={moveBlock}
            onOpenTemplates={() => setIsTemplateModalOpen(true)}
            onSelectSlide={(index) => {
              setActiveSlideIndex(index);
              setSelectedBlockIndex(null);
              setReplayNonce((value) => value + 1);
            }}
            reorderBlock={reorderBlock}
            scenes={sliderDocument.scenes}
            selectedBlockIndex={selectedBlockIndex}
            setDraggedBlockIndex={setDraggedBlockIndex}
            setDragOverBlockIndex={setDragOverBlockIndex}
            setSelectedBlockIndex={setSelectedBlockIndex}
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
                activeSlideIndex={activeSlideIndex}
                activeSlideMetricFlow={activeSlideMetricFlow}
                deleteBlock={deleteBlock}
                deleteSlide={deleteSlide}
                draggedBlockIndex={draggedBlockIndex}
                dragOverBlockIndex={dragOverBlockIndex}
                isTemplateModalOpen={isTemplateModalOpen}
                moveBlock={moveBlock}
                onOpenTemplates={() => setIsTemplateModalOpen(true)}
                onSelectSlide={(index) => {
                  setActiveSlideIndex(index);
                  setSelectedBlockIndex(null);
                  setReplayNonce((value) => value + 1);
                  setIsMobileSidebarOpen(false);
                }}
                reorderBlock={reorderBlock}
                scenes={sliderDocument.scenes}
                selectedBlockIndex={selectedBlockIndex}
                setDraggedBlockIndex={setDraggedBlockIndex}
                setDragOverBlockIndex={setDragOverBlockIndex}
                setSelectedBlockIndex={setSelectedBlockIndex}
                slideRows={slideRows}
              />
            </div>
          </>
        )}

        <PreviewCanvas
          activeSlideIndex={activeSlideIndex}
          onAddBlock={addBlockToActiveSlide}
          onNextSlide={goToNextSlide}
          onPreviousSlide={goToPreviousSlide}
          onSelectSlide={setActiveSlideIndex}
          replayNonce={replayNonce}
          sceneCount={sliderDocument.scenes.length}
          slideRows={slideRows}
          source={source}
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
            activeSlideLayout={activeSlideLayout}
            activeSlideMetricFlow={activeSlideMetricFlow}
            activeSlideTextAlign={activeSlideTextAlign}
            activeSlideTheme={activeSlideTheme}
            onOpenMdxEditor={() => setIsCodeEditorOpen(true)}
            selectedBlockIndex={selectedBlockIndex}
            setSelectedBlockIndex={setSelectedBlockIndex}
            updateActiveSlideStyle={updateActiveSlideStyle}
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
                activeSlideLayout={activeSlideLayout}
                activeSlideMetricFlow={activeSlideMetricFlow}
                activeSlideTextAlign={activeSlideTextAlign}
                activeSlideTheme={activeSlideTheme}
                onOpenMdxEditor={() => {
                  setIsMobileInspectorOpen(false);
                  setIsCodeEditorOpen(true);
                }}
                selectedBlockIndex={selectedBlockIndex}
                setSelectedBlockIndex={(idx) => {
                  setSelectedBlockIndex(idx);
                  if (idx !== null) setIsMobileInspectorOpen(false);
                }}
                updateActiveSlideStyle={updateActiveSlideStyle}
                updateBlock={updateBlock}
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
              onSourceChange={setSource}
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
