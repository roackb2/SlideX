import assert from "node:assert/strict";
import test from "node:test";
import {
  parsePresentationImageUploadFormData,
  presentationImageUploadRequestByteLimit
} from "@/features/pitch/application/presentationImageUpload";
import { pitchAssetLimits } from "@/features/pitch/application/pitchAssetPolicy";

const presentationId = "7cf4f11e-00e1-4c29-a8cb-fca54f5549d2";

test("parses a valid presentation image upload form", () => {
  const formData = new FormData();
  const file = new File(["image"], "image.png", { type: "image/png" });
  formData.set("file", file);
  formData.set("presentationId", presentationId);

  const result = parsePresentationImageUploadFormData(formData);

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.file, file);
  assert.equal(result.data.presentationId, presentationId);
});

test("rejects a missing file or invalid presentation id", () => {
  const missingFile = new FormData();
  missingFile.set("presentationId", presentationId);
  assert.equal(parsePresentationImageUploadFormData(missingFile).success, false);

  const invalidPresentation = new FormData();
  invalidPresentation.set("file", new File(["image"], "image.png", { type: "image/png" }));
  invalidPresentation.set("presentationId", "not-a-presentation-id");
  assert.equal(parsePresentationImageUploadFormData(invalidPresentation).success, false);
});

test("allows multipart overhead without relaxing the image size limit", () => {
  assert.equal(presentationImageUploadRequestByteLimit, pitchAssetLimits.image + 512 * 1024);
});
