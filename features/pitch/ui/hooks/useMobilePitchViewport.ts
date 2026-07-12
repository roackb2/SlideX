"use client";

import { useEffect, useState } from "react";

export function useMobilePitchViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const syncViewport = () => setIsMobileViewport(query.matches);

    syncViewport();
    query.addEventListener("change", syncViewport);
    return () => query.removeEventListener("change", syncViewport);
  }, []);

  return isMobileViewport;
}
