import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your SlideX presentation workspace."
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
