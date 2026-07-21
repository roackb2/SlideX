import assert from "node:assert/strict";
import test from "node:test";
import {
  applyAgentProgress,
  ensureAgentProgressPlaceholder,
  reconcileAgentProgress,
  type PitchAgentMessage
} from "./agentProgress";

const userMessage: PitchAgentMessage = {
  id: "user-1",
  role: "user",
  content: "Improve the deck"
};

test("replaces a run placeholder with cumulative reasoning summary progress", () => {
  const pending = ensureAgentProgressPlaceholder([userMessage], "run-1");
  const partial = applyAgentProgress(pending, "run-1", {
    type: "reasoning.summary",
    text: "Inspecting the deck",
    done: false
  });
  const complete = applyAgentProgress(partial, "run-1", {
    type: "reasoning.summary",
    text: "Inspecting the deck before choosing a layout.",
    done: true
  });

  assert.deepEqual(complete, [
    userMessage,
    {
      id: "reasoning:run-1",
      role: "reasoning",
      content: "Inspecting the deck before choosing a layout.",
      done: true
    }
  ]);
});

test("keeps each commentary message distinct and updates it by provider id", () => {
  const first = applyAgentProgress([userMessage], "run-1", {
    type: "assistant.commentary",
    messageId: "message-1",
    text: "I found the current layout.",
    done: true
  });
  const secondPartial = applyAgentProgress(first, "run-1", {
    type: "assistant.commentary",
    messageId: "message-2",
    text: "Next I’m checking",
    done: false
  });
  const secondComplete = applyAgentProgress(secondPartial, "run-1", {
    type: "assistant.commentary",
    messageId: "message-2",
    text: "Next I’m checking the available slide presets.",
    done: true
  });

  assert.deepEqual(secondComplete.slice(1), [
    {
      id: "commentary:run-1:message-1",
      role: "commentary",
      content: "I found the current layout.",
      done: true
    },
    {
      id: "commentary:run-1:message-2",
      role: "commentary",
      content: "Next I’m checking the available slide presets.",
      done: true
    }
  ]);
});

test("scopes transient progress ids to the active run", () => {
  const firstRun = applyAgentProgress([userMessage], "run-1", {
    type: "reasoning.summary",
    text: "Inspecting the first request.",
    done: true
  });
  const secondRun = applyAgentProgress(firstRun, "run-2", {
    type: "reasoning.summary",
    text: "Inspecting the follow-up request.",
    done: false
  });

  assert.deepEqual(
    secondRun.filter(({ role }) => role === "reasoning").map(({ id }) => id),
    ["reasoning:run-1", "reasoning:run-2"]
  );
});

test("keeps current-run progress immediately before the durable terminal answer", () => {
  const progress = applyAgentProgress([userMessage], "run-1", {
    type: "assistant.commentary",
    messageId: "message-1",
    text: "I checked the available slide layouts.",
    done: true
  });
  const durableMessages: PitchAgentMessage[] = [
    userMessage,
    {
      id: "assistant-1",
      role: "assistant",
      content: "Added the requested slide."
    }
  ];

  assert.deepEqual(
    reconcileAgentProgress(progress, "run-1", durableMessages),
    [
      userMessage,
      {
        id: "commentary:run-1:message-1",
        role: "commentary",
        content: "I checked the available slide layouts.",
        done: true
      },
      durableMessages[1]
    ]
  );
});

test("does not retain an empty progress placeholder after completion", () => {
  const pending = ensureAgentProgressPlaceholder([userMessage], "run-1");
  const durableMessages: PitchAgentMessage[] = [
    userMessage,
    {
      id: "assistant-1",
      role: "assistant",
      content: "No deck change was needed."
    }
  ];

  assert.deepEqual(
    reconcileAgentProgress(pending, "run-1", durableMessages),
    durableMessages
  );
});
