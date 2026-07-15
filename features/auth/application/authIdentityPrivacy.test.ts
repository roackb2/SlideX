import assert from "node:assert/strict";
import test from "node:test";
import {
  getProtectedAuthIdentity,
  getSettingsAuthIdentity,
  getSidebarAuthIdentity,
  partiallyMaskEmail
} from "@/features/auth/application/authIdentityPrivacy";

test("provides fixed-length account placeholders that cannot leak identity length", () => {
  assert.deepEqual(getProtectedAuthIdentity(), {
    displayName: "••••••",
    email: "••••••@••••••"
  });
});

test("partially masks only the email local part", () => {
  assert.equal(partiallyMaskEmail("zhang@example.com"), "zh***@example.com");
  assert.equal(partiallyMaskEmail("z@example.com"), "z***@example.com");
  assert.equal(partiallyMaskEmail("invalid"), "••••••@••••••");
});

test("shows a name and partially masked email in the sidebar when privacy mode is off", () => {
  assert.deepEqual(
    getSidebarAuthIdentity({ displayName: "Jane Example", email: "jane@example.com" }, false),
    { displayName: "Jane Example", email: "ja***@example.com" }
  );
});

test("shows full settings details only when privacy mode is off", () => {
  const user = { displayName: "Jane Example", email: "jane@example.com" };
  assert.deepEqual(getSettingsAuthIdentity(user, false), user);
  assert.deepEqual(getSettingsAuthIdentity(user, true), getProtectedAuthIdentity());
  assert.deepEqual(getSidebarAuthIdentity(user, true), getProtectedAuthIdentity());
});
