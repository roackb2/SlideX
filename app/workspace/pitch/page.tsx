"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appRoutes, loginPath } from "@/common/lib/appRoutes";
import { MotionDocApp } from "@/features/pitch";
import { useLocalPitchPresentation } from "@/features/workspace";

function LocalPitchWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessMode, error, isReady, presentation, save } = useLocalPitchPresentation();
  const resumeIntent = searchParams.get("intent") === "export"
    ? "export"
    : searchParams.get("view") === "preview"
      ? "preview"
      : undefined;

  useEffect(() => {
    if (!isReady || !presentation || resumeIntent !== "export" || accessMode !== "authenticated") return;
    router.replace(`${appRoutes.pitch}?presentation=${encodeURIComponent(presentation.id)}`, { scroll: false });
  }, [accessMode, isReady, presentation, resumeIntent, router]);

  if (!isReady) {
    return <main className="min-h-[100dvh] bg-[#050505]" />;
  }

  if (error || !presentation) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#111] px-6 text-center text-white">
        <div className="max-w-lg">
          <h1 className="text-xl font-semibold">Presentation unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">{error ?? "This presentation could not be opened."}</p>
          <button className="mt-6 rounded-md bg-white px-4 py-2 text-sm font-medium text-black" onClick={() => router.refresh()} type="button">Retry</button>
        </div>
      </main>
    );
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
