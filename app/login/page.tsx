import { Suspense } from "react";
import { LoginPage as LoginFeaturePage } from "@/features/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-[100dvh] bg-[#111111]" />}>
      <LoginFeaturePage />
    </Suspense>
  );
}
