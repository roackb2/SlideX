import type { Metadata } from "next";
import { BrieflyBuilder } from "@/features/briefly";

export const metadata: Metadata = {
  title: "SlideX Briefly Workspace",
  description:
    "Create a structured project brief, preview it as a polished document, and export it as MDX, HTML, or PDF."
};

export default function BrieflyWorkspacePage() {
  return <BrieflyBuilder />;
}
