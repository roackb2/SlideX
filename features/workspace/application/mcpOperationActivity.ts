import type { McpOperationActivity } from "@/features/workspace/domain/mcpOperationActivity";

const runningVisualLifetimeMs = 10 * 60_000;
const settledVisualLifetimeMs = 6_000;

const toolActions: Record<string, { en: string; "zh-TW": string }> = {
  slidex_add_block: { en: "Adding an object", "zh-TW": "新增物件" },
  slidex_add_slide_from_layout: { en: "Adding a slide", "zh-TW": "新增投影片" },
  slidex_apply_shader_preset: { en: "Applying a shader", "zh-TW": "套用 Shader" },
  slidex_delete_block: { en: "Deleting an object", "zh-TW": "刪除物件" },
  slidex_duplicate_block: { en: "Duplicating an object", "zh-TW": "複製物件" },
  slidex_finalize_presentation_image_upload: { en: "Finalizing an image", "zh-TW": "完成圖片上傳" },
  slidex_prepare_presentation_image_upload: { en: "Preparing an image", "zh-TW": "準備圖片上傳" },
  slidex_reorder_block: { en: "Reordering objects", "zh-TW": "調整物件順序" },
  slidex_replace_slide_with_layout: { en: "Applying a layout", "zh-TW": "套用版面" },
  slidex_save_presentation: { en: "Saving the presentation", "zh-TW": "儲存整份簡報" },
  slidex_update_block: { en: "Editing an object", "zh-TW": "修改物件" },
  slidex_update_canvas_node: { en: "Moving an object", "zh-TW": "調整物件位置" }
};

export function mcpOperationAction(
  activity: Pick<McpOperationActivity, "errorCode" | "status" | "toolName">,
  locale: "en" | "zh-TW"
) {
  if (activity.status === "failed") {
    if (activity.errorCode === "revision_conflict") {
      return locale === "zh-TW" ? "版本衝突，未覆蓋內容" : "Revision conflict; nothing overwritten";
    }
    return locale === "zh-TW" ? "操作未完成" : "Operation not completed";
  }

  const action = toolActions[activity.toolName]?.[locale]
    ?? (locale === "zh-TW" ? "修改簡報" : "Editing presentation");
  if (activity.status === "completed") {
    return locale === "zh-TW" ? `${action}完成` : `${action} complete`;
  }
  return action;
}

export function mcpOperationVisualDeadline(activity: McpOperationActivity) {
  const base = activity.status === "running" ? activity.createdAt : activity.completedAt ?? activity.updatedAt;
  const lifetime = activity.status === "running" ? runningVisualLifetimeMs : settledVisualLifetimeMs;
  return new Date(base).getTime() + lifetime;
}

export function isMcpOperationVisuallyActive(activity: McpOperationActivity, now = Date.now()) {
  const deadline = mcpOperationVisualDeadline(activity);
  return Number.isFinite(deadline) && deadline > now && new Date(activity.expiresAt).getTime() > now;
}

export function latestMcpOperationForPresentation(
  activities: readonly McpOperationActivity[],
  presentationId: string,
  now = Date.now()
) {
  return activities.find(
    (activity) => activity.presentationId === presentationId && isMcpOperationVisuallyActive(activity, now)
  );
}
