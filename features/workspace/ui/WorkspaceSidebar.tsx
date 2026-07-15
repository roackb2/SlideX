import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Clock3, Files, Home, Settings } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import { getSettingsAuthIdentity, getSidebarAuthIdentity } from "@/features/auth/application/authIdentityPrivacy";
import type { AuthSession } from "@/features/auth/domain/authSession";
import { AccountAvatar } from "@/features/auth/ui/AccountAvatar";
import { useWorkspaceI18n } from "@/features/workspace/ui/workspaceI18n";

type WorkspaceSidebarProps = {
  activeView: WorkspaceView;
  isPrivacyModeEnabled: boolean;
  onNavigate: (view: WorkspaceView) => void;
  onSignOut: () => void;
  session: AuthSession;
};

export type WorkspaceView = "home" | "presentations" | "recent" | "settings";

const workspaceNavigation = [
  { icon: Home, id: "home", label: "Home" },
  { icon: Files, id: "presentations", label: "Presentations" },
  { icon: Clock3, id: "recent", label: "Recents" },
  { icon: Settings, id: "settings", label: "Settings" }
] as const;

export function WorkspaceSidebar({ activeView, isPrivacyModeEnabled, onNavigate, onSignOut, session }: WorkspaceSidebarProps) {
  const { tx } = useWorkspaceI18n();
  const sidebarIdentity = getSidebarAuthIdentity(session.user, isPrivacyModeEnabled);
  const menuIdentity = getSettingsAuthIdentity(session.user, isPrivacyModeEnabled);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] flex-col border-r border-white/[0.075] bg-[#1b1b1b] md:flex">
      <div className="flex h-[72px] items-center border-b border-white/[0.065] px-5">
        <Link aria-label="SlideX workspace home" href={appRoutes.workspace}>
          <Image alt="SlideX" className="h-auto w-[88px] object-contain" height={72} loading="eager" priority src="/logo.png" width={260} />
        </Link>
      </div>

      <nav aria-label={tx("Workspace navigation")} className="space-y-1 px-3 py-5">
        {workspaceNavigation.map(({ icon: Icon, id, label }) => (
          <button
            aria-current={activeView === id ? "page" : undefined}
            className={`flex h-10 w-full items-center gap-3 rounded-[6px] px-3 text-left text-[14px] leading-5 transition-colors ${activeView === id ? "bg-white/[0.09] font-medium text-white" : "text-white/56 hover:bg-white/[0.055] hover:text-white/86"}`}
            key={id}
            onClick={() => onNavigate(id)}
            type="button"
          >
            <Icon className="h-4 w-4" strokeWidth={1.65} />
            {tx(label)}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/[0.065] p-3">
        <details className="group relative">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-[7px] border border-white/[0.075] bg-white/[0.045] px-2.5 text-white/72 transition hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white [&::-webkit-details-marker]:hidden">
            <AccountAvatar avatarUrl={isPrivacyModeEnabled ? undefined : session.user.avatarUrl} displayName={sidebarIdentity.displayName} size="small" />
            <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium leading-5">{sidebarIdentity.displayName}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/34 transition-transform group-open:rotate-180" strokeWidth={1.7} />
          </summary>

          <div className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-[10px] border border-white/[0.13] bg-[#252525] shadow-[0_14px_40px_rgba(0,0,0,0.38)]">
            <div className="px-3 py-2.5">
              <p className="text-[11px] leading-4 text-white/42">{tx("Signed in as")}</p>
              <p className="mt-0.5 truncate text-[12px] leading-5 text-white/78">{menuIdentity.email}</p>
            </div>
            <div className="border-t border-white/[0.09] p-1">
              <button className="flex h-8 w-full items-center rounded-[6px] px-2 text-left text-[12px] text-white/68 transition hover:bg-white/[0.07] hover:text-white" onClick={onSignOut} type="button">
                {tx("Log out")}
              </button>
            </div>
          </div>
        </details>
      </div>
    </aside>
  );
}
