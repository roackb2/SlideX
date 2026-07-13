import Image from "next/image";
import Link from "next/link";
import { Clock3, Files, Home, LogOut, Settings } from "lucide-react";
import { appRoutes } from "@/common/lib/appRoutes";
import type { AuthSession } from "@/features/auth/domain/authSession";

type WorkspaceSidebarProps = {
  activeView: WorkspaceView;
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

export function WorkspaceSidebar({ activeView, onNavigate, onSignOut, session }: WorkspaceSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] flex-col border-r border-white/[0.075] bg-[#1b1b1b] md:flex">
      <div className="flex h-[72px] items-center border-b border-white/[0.065] px-5">
        <Link aria-label="SlideX workspace home" href={appRoutes.workspace}>
          <Image alt="SlideX" className="h-auto w-[88px] object-contain" height={72} priority src="/logo.png" width={260} />
        </Link>
      </div>

      <nav aria-label="Workspace navigation" className="space-y-1 px-3 py-5">
        {workspaceNavigation.map(({ icon: Icon, id, label }) => (
          <button
            aria-current={activeView === id ? "page" : undefined}
            className={`flex h-10 w-full items-center gap-3 rounded-[6px] px-3 text-left text-[14px] leading-5 transition-colors ${activeView === id ? "bg-white/[0.09] font-medium text-white" : "text-white/56 hover:bg-white/[0.055] hover:text-white/86"}`}
            key={id}
            onClick={() => onNavigate(id)}
            type="button"
          >
            <Icon className="h-4 w-4" strokeWidth={1.65} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/[0.065] p-3">
        <div className="flex items-center gap-3 rounded-[7px] px-2.5 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#f1f0eb] text-[11px] font-semibold uppercase text-[#191919]">
            {session.user.displayName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium leading-5 text-white/82">{session.user.displayName}</p>
            <p className="truncate text-[11px] leading-4 text-white/38">{session.user.email}</p>
          </div>
          <button aria-label="Sign out" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-white/30 transition hover:bg-white/[0.06] hover:text-white" onClick={onSignOut} type="button">
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </aside>
  );
}
