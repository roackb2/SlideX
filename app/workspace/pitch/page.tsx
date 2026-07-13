"use client";

import { Suspense } from "react";
import { MotionDocApp } from "@/features/pitch";
import { useLocalPitchPresentation } from "@/features/workspace";

function LocalPitchWorkspace() {
  const { isReady, presentation, save } = useLocalPitchPresentation();

  if (!isReady || !presentation) {
    return <main className="min-h-[100dvh] bg-[#050505]" />;
  }

  return (
    <MotionDocApp
      initialProject={{
        name: presentation.title,
        source: presentation.source,
        templateId: presentation.templateId
      }}
      key={presentation.id}
      onProjectSourceChange={save}
      presentationId={presentation.id}
    />
  );
}

export default function PitchWorkspacePage() {
  return (
    <Suspense fallback={<main className="min-h-[100dvh] bg-[#050505]" />}>
      <LocalPitchWorkspace />
    </Suspense>
  );
}
