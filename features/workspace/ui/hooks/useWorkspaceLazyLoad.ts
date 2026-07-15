"use client";

import { useEffect, useRef } from "react";

type UseWorkspaceLazyLoadOptions = {
  enabled: boolean;
  isLoading: boolean;
  onLoadMore: () => Promise<void> | void;
};

export function useWorkspaceLazyLoad({
  enabled,
  isLoading,
  onLoadMore
}: UseWorkspaceLazyLoadOptions) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!enabled || isLoading || typeof IntersectionObserver === "undefined") return;
    const trigger = triggerRef.current;
    if (!trigger) return;

    hasRequestedRef.current = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || hasRequestedRef.current) return;
      hasRequestedRef.current = true;
      void onLoadMore();
    }, { rootMargin: "600px 0px" });

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [enabled, isLoading, onLoadMore]);

  return triggerRef;
}
