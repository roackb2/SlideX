"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appRoutes, isMarketingHomePath } from "@/common/lib/appRoutes";
import { SiteHomeSkeleton } from "@/common/ui/SiteHomeSkeleton";
import { useAuthSession } from "@/features/auth/ui/useAuthSession";

type AuthenticatedHomeRedirectProps = {
  children: ReactNode;
};

export function AuthenticatedHomeRedirect({ children }: AuthenticatedHomeRedirectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, session } = useAuthSession();
  const isHomePath = isMarketingHomePath(pathname);

  useEffect(() => {
    if (isHomePath && isReady && session) {
      router.replace(appRoutes.workspace);
    }
  }, [isHomePath, isReady, router, session]);

  if (isHomePath && (!isReady || session)) {
    return <SiteHomeSkeleton />;
  }

  return children;
}
