import { Suspense } from "react";
import { LoginPage as LoginFeaturePage, LoginPageSkeleton } from "@/features/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginFeaturePage />
    </Suspense>
  );
}
