import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "工作區",
  description: "建立並開啟 SlideX 簡報。"
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
