import { Roboto } from "next/font/google";
import { WorkspacePage as WorkspaceFeaturePage } from "@/features/workspace";

const workspaceFont = Roboto({
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export default function WorkspacePage() {
  return <div className={workspaceFont.className}><WorkspaceFeaturePage /></div>;
}
