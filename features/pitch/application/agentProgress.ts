import type { AgentActivity } from "@/features/pitch/domain/agentRun";

export type PitchAgentMessage =
  | {
    id: string;
    role: "user" | "assistant";
    content: string;
  }
  | {
    id: string;
    role: "reasoning" | "commentary";
    content: string;
    done: boolean;
  };

/**
 * Projects Heddle's two user-visible progress channels into transient UI rows.
 *
 * `reasoning.summary` is provider-generated reasoning summary text, while
 * `assistant.commentary` is assistant-authored work narration. Neither is a
 * terminal answer, and both remain separate so the panel owns their labels and
 * presentation.
 */
export function applyAgentProgress(
  messages: PitchAgentMessage[],
  runId: string,
  activity: AgentActivity
): PitchAgentMessage[] {
  if (activity.type === "reasoning.summary" && activity.text) {
    return upsertProgress(
      removeRunPlaceholder(messages, runId),
      {
        id: `reasoning:${runId}`,
        role: "reasoning",
        content: activity.text,
        done: activity.done === true
      }
    );
  }

  if (
    activity.type === "assistant.commentary"
    && activity.messageId
    && activity.text
  ) {
    return upsertProgress(
      removeRunPlaceholder(messages, runId),
      {
        id: `commentary:${runId}:${activity.messageId}`,
        role: "commentary",
        content: activity.text,
        done: activity.done === true
      }
    );
  }

  return messages;
}

export function ensureAgentProgressPlaceholder(
  messages: PitchAgentMessage[],
  runId: string
): PitchAgentMessage[] {
  const id = placeholderId(runId);
  return messages.some((message) => message.id === id)
    ? messages
    : [...messages, {
      id,
      role: "commentary",
      content: "",
      done: false
    }];
}

export function reconcileAgentProgress(
  messages: PitchAgentMessage[],
  runId: string,
  durableMessages: PitchAgentMessage[]
): PitchAgentMessage[] {
  const progress = messages.filter((message) => (
    message.id === `reasoning:${runId}`
    || message.id.startsWith(`commentary:${runId}:`)
  ));
  const terminalIndex = durableMessages.findLastIndex(({ role }) => (
    role === "assistant"
  ));
  if (progress.length === 0 || terminalIndex < 0) {
    return durableMessages;
  }

  return [
    ...durableMessages.slice(0, terminalIndex),
    ...progress,
    ...durableMessages.slice(terminalIndex)
  ];
}

function removeRunPlaceholder(
  messages: PitchAgentMessage[],
  runId: string
): PitchAgentMessage[] {
  const id = placeholderId(runId);
  return messages.filter((message) => message.id !== id);
}

function upsertProgress(
  messages: PitchAgentMessage[],
  progress: Extract<PitchAgentMessage, { role: "reasoning" | "commentary" }>
): PitchAgentMessage[] {
  const index = messages.findIndex(({ id }) => id === progress.id);
  return index < 0
    ? [...messages, progress]
    : messages.map((message, messageIndex) => (
      messageIndex === index ? progress : message
    ));
}

function placeholderId(runId: string): string {
  return `progress:${runId}`;
}
