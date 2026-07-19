"use client";

import { Bot, CheckCircle2, CircleAlert } from "lucide-react";

import { remoteMcpOperationAction } from "@/features/pitch/application/remoteMcpOperation";
import type { RemoteMcpOperation } from "@/features/pitch/domain/remoteMcpOperation";
import { usePitchI18n } from "@/features/pitch/ui/pitchI18n";

export function RemoteMcpActivityRail({ activities }: { activities: readonly RemoteMcpOperation[] }) {
  const { locale } = usePitchI18n();
  if (activities.length === 0) return null;

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-[60] flex max-w-[min(360px,70vw)] flex-col items-end gap-1.5 sm:right-5 sm:top-4">
      {activities.slice(0, 3).map((activity) => (
        <div className={`flex max-w-full items-center gap-2 rounded-[7px] border border-[#8b5cf6]/55 bg-[#1f123d]/92 px-2.5 py-1.5 text-[11px] text-[#ede9fe] shadow-[0_10px_35px_rgba(46,16,101,0.28)] backdrop-blur-md ${activity.status === "running" ? "" : "motion-safe:animate-[mcp-activity-settle_6s_ease-out_forwards]"} ${activity.status === "failed" ? "border-dashed" : ""}`} key={activity.id}>
          {activity.status === "running" ? <Bot className="h-3.5 w-3.5 shrink-0 motion-safe:animate-pulse" /> : activity.status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <CircleAlert className="h-3.5 w-3.5 shrink-0" />}
          <span className="truncate font-semibold">AI · {activity.clientName}</span>
          <span className="truncate text-[#ddd6fe]/68">{remoteMcpOperationAction(activity, locale)}</span>
        </div>
      ))}
    </div>
  );
}
