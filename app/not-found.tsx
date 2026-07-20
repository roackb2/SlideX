import type { Metadata } from "next";
import { SiteNotFound } from "@/common/ui";

export const metadata: Metadata = {
  title: "Page not found"
};

export default function NotFound() {
  return <SiteNotFound />;
}
