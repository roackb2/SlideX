import { redirect } from "next/navigation";
import { appRoutes } from "@/common/lib/appRoutes";

export default function ComingSoonRoutePage() {
  redirect(appRoutes.login);
}
