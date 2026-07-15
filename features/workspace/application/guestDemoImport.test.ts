import assert from "node:assert/strict";
import test from "node:test";
import {
  parseGuestDemoImportInput,
  presentationSourceByteLimit
} from "@/features/workspace/application/guestDemoImport";

const validInput = {
  importId: "9a3a1bb6-79f5-4dfe-90c2-c9b821165dbc",
  source: "# Launch deck",
  templateId: "launch-deck",
  title: "Launch Deck"
};

test("accepts and normalizes a valid guest demo import", () => {
  const result = parseGuestDemoImportInput({
    ...validInput,
    editorTemplateId: "blank:basic-white",
    title: "  Launch Deck  "
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.editorTemplateId, "blank:basic-white");
    assert.equal(result.data.title, "Launch Deck");
  }
});

test("rejects system fields and malformed import IDs", () => {
  const result = parseGuestDemoImportInput({
    ...validInput,
    created_at: "2000-01-01T00:00:00Z",
    importId: "not-a-uuid"
  });
  assert.equal(result.success, false);
});

test("measures the source limit in bytes", () => {
  const result = parseGuestDemoImportInput({
    ...validInput,
    source: "界".repeat(Math.floor(presentationSourceByteLimit / 3) + 1)
  });
  assert.equal(result.success, false);
});
