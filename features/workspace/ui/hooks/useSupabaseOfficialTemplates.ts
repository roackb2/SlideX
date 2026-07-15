"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  launchDeckPresentationId,
  launchDeckPresentationSource
} from "@/core/motion-doc/presets/launchDeck";
import {
  welcomePresentationId,
  welcomePresentationSource
} from "@/core/motion-doc/presets/welcomeToSlideX";
import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import type { OfficialTemplate } from "@/features/workspace/domain/officialTemplate";
import { listSupabaseOfficialTemplates } from "@/features/workspace/infrastructure/supabaseOfficialTemplateRepository";

const bundledOfficialTemplateSources = new Map<string, string>([
  [welcomePresentationId, welcomePresentationSource],
  [launchDeckPresentationId, launchDeckPresentationSource]
]);

export function useSupabaseOfficialTemplates(userId?: string) {
  const [templates, setTemplates] = useState<OfficialTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadGenerationRef = useRef(0);

  const reload = useCallback(async () => {
    if (!userId) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    const generation = ++loadGenerationRef.current;
    setError(null);
    setIsLoading(true);
    try {
      const metadata = await listSupabaseOfficialTemplates(createSupabaseBrowserClient());
      const nextTemplates = metadata.flatMap((template) => {
        const source = bundledOfficialTemplateSources.get(template.id);
        return source ? [{ ...template, source }] : [];
      });

      if (loadGenerationRef.current === generation) setTemplates(nextTemplates);
    } catch {
      if (loadGenerationRef.current === generation) {
        setError("Official templates could not be loaded from Supabase.");
      }
    } finally {
      if (loadGenerationRef.current === generation) setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
    return () => {
      loadGenerationRef.current += 1;
    };
  }, [reload]);

  return { error, isLoading, reload, templates };
}
