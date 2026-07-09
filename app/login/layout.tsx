import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in to SlideX",
  description: "Sign in to your SlideX workspace."
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
