"use client";

import { useRef, useState } from "react";
import { defaultCanvasTool, type CanvasTool } from "@/features/pitch/application/canvasTools";
import type { GuestSignInIntent } from "@/features/pitch/ui/GuestSignInDialog";

export type PitchFileModalMode = "export" | "import";

export function usePitchWorkspaceViewState(initialResumeIntent?: "export" | "preview") {
  const [activeCanvasTool, setActiveCanvasTool] = useState<CanvasTool>(defaultCanvasTool);
  const [fileModalMode, setFileModalMode] = useState<PitchFileModalMode>("export");
  const [guestSignInIntent, setGuestSignInIntent] = useState<GuestSignInIntent | null>(null);
  const [isCanvasGridVisible, setIsCanvasGridVisible] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(initialResumeIntent === "export");
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPresentationPreviewOpen, setIsPresentationPreviewOpen] = useState(initialResumeIntent === "preview");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [notice, setNotice] = useState("Ready");
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  return {
    activeCanvasTool,
    exportMenuRef,
    fileModalMode,
    guestSignInIntent,
    isCanvasGridVisible,
    isCodeEditorOpen,
    isExporting,
    isExportMenuOpen,
    isMobileInspectorOpen,
    isMobileSidebarOpen,
    isPresentationPreviewOpen,
    isTemplateModalOpen,
    notice,
    replayNonce: 0,
    setActiveCanvasTool,
    setFileModalMode,
    setGuestSignInIntent,
    setIsCanvasGridVisible,
    setIsCodeEditorOpen,
    setIsExporting,
    setIsExportMenuOpen,
    setIsMobileInspectorOpen,
    setIsMobileSidebarOpen,
    setIsPresentationPreviewOpen,
    setIsTemplateModalOpen,
    setNotice
  };
}
