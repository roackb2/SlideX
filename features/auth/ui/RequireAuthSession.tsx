"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/common/lib/appRoutes";
import { useLocalAuthSession } from "@/features/auth/ui/useLocalAuthSession";

type RequireAuthSessionProps = {
  children: ReactNode;
};

export function RequireAuthSession({ children }: RequireAuthSessionProps) {
  const router = useRouter();
  const { isReady, session } = useLocalAuthSession();

  useEffect(() => {
    if (isReady && !session) {
      router.replace(appRoutes.login);
    }
  }, [isReady, router, session]);

  if (!isReady || !session) {
    return <main aria-busy="true" className="min-h-[100dvh] bg-[#171717]" />;
  }

  return children;
}
