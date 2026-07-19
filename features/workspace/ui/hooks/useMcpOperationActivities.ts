"use client";

import { useCallback, useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/common/lib/supabase/browserClient";
import type { McpOperationActivity } from "@/features/workspace/domain/mcpOperationActivity";
import {
  listSupabaseMcpOperationActivities,
  parseSupabaseMcpOperationRealtimeChange
} from "@/features/workspace/infrastructure/supabaseMcpOperationActivityRepository";

export function useMcpOperationActivities(userId?: string, presentationId?: string) {
  const [activities, setActivities] = useState<McpOperationActivity[]>([]);
  const [connectionWarning, setConnectionWarning] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setActivities([]);
      return;
    }
    const next = await listSupabaseMcpOperationActivities(createSupabaseBrowserClient(), {
      presentationId
    });
    setActivities(next);
  }, [presentationId, userId]);

  useEffect(() => {
    let isCancelled = false;
    void reload().catch(() => {
      if (!isCancelled) setConnectionWarning("MCP activity is temporarily unavailable.");
    });
    return () => {
      isCancelled = true;
    };
  }, [reload]);

  useEffect(() => {
    if (!userId) return;

    const client = createSupabaseBrowserClient();
    let channel: ReturnType<typeof client.channel> | null = null;
    let isCancelled = false;

    void client.realtime.setAuth().then(() => {
      if (isCancelled) return;
      channel = client
        .channel(`mcp-operation-events:${userId}`, { config: { private: true } })
        .on("broadcast", { event: "*" }, (message) => {
          const change = parseSupabaseMcpOperationRealtimeChange(message, userId);
          if (!change || (presentationId && change.activity.presentationId !== presentationId)) return;
          setActivities((current) => {
            if (change.event === "DELETE") {
              return current.filter((activity) => activity.id !== change.activity.id);
            }
            const next = [change.activity, ...current.filter((activity) => activity.id !== change.activity.id)];
            return next
              .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
              .slice(0, 50);
          });
        })
        .subscribe((status) => {
          if (isCancelled) return;
          if (status === "SUBSCRIBED") {
            setConnectionWarning(null);
            void reload().catch(() => {
              if (!isCancelled) setConnectionWarning("MCP activity reconnected, but recent operations could not be verified.");
            });
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setConnectionWarning("MCP activity is temporarily unavailable.");
          }
        });
    }).catch(() => {
      if (!isCancelled) setConnectionWarning("MCP activity is temporarily unavailable.");
    });

    return () => {
      isCancelled = true;
      if (channel) void client.removeChannel(channel);
    };
  }, [presentationId, reload, userId]);

  return { activities, connectionWarning };
}
