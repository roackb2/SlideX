import assert from "node:assert/strict";
import test from "node:test";

import { safeMcpOperationErrorCode } from "@/mcp/operationActivity";

test("MCP activity errors are reduced to bounded safe codes", () => {
  assert.equal(
    safeMcpOperationErrorCode(new Error("The presentation changed. Current revision is 92.")),
    "revision_conflict"
  );
  assert.equal(
    safeMcpOperationErrorCode(new Error("Presentation not found or not accessible for alice@example.com")),
    "inaccessible"
  );
  assert.equal(
    safeMcpOperationErrorCode(new Error("secret raw provider failure with user-authored text")),
    "operation_failed"
  );
});
