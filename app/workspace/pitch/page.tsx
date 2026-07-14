"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appRoutes, loginPath } from "@/common/lib/appRoutes";
import { MotionDocApp } from "@/features/pitch";
import { useLocalPitchPresentation } from "@/features/workspace";

function LocalPitchWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessMode, isReady, presentation, save } = useLocalPitchPresentation();
  const resumeIntent = searchParams.get("intent") === "export"
    ? "export"
    : searchParams.get("view") === "preview"
      ? "preview"
      : undefined;

  useEffect(() => {
    if (!isReady || !presentation || resumeIntent !== "export" || accessMode !== "authenticated") return;
    router.replace(`${appRoutes.pitch}?presentation=${encodeURIComponent(presentation.id)}`, { scroll: false });
  }, [accessMode, isReady, presentation, resumeIntent, router]);

  if (!isReady || !presentation) {
    return <main className="min-h-[100dvh] bg-[#050505]" />;
  }

  return (
    <MotionDocApp
      accessMode={accessMode}
      initialProject={{
        name: presentation.title,
        source: presentation.source,
        templateId: presentation.templateId
      }}
      initialResumeIntent={resumeIntent}
      onSignInRequested={(intent) => {
        const nextPath = `${appRoutes.liveDemo}&intent=${intent}`;
        router.push(loginPath(nextPath));
      }}
      onProjectSourceChange={save}
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
