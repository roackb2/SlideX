import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登入",
  description: "登入 SlideX 簡報工作區。"
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
