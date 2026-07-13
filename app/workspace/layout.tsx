import type { Metadata } from "next";
import { RequireAuthSession } from "@/features/auth";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Create and open SlideX presentations."
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuthSession>{children}</RequireAuthSession>;
}
