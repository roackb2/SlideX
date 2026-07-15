import assert from "node:assert/strict";
import test from "node:test";
import {
  isPresentationImageStoragePath,
  presentationImageReferenceCount,
  presentationImageStoragePathFromSource,
  presentationImageSource
} from "@/features/pitch/application/presentationImagePath";

const validPath = "11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/33333333-3333-4333-8333-333333333333.webp";

test("presentation image paths use the immutable Supabase object shape", () => {
  assert.equal(isPresentationImageStoragePath(validPath), true);
  assert.equal(
    presentationImageSource(validPath),
    `/api/presentation-images/${validPath}`
  );
});

test("presentation image paths reject traversal and untrusted extensions", () => {
  assert.equal(isPresentationImageStoragePath(`../${validPath}`), false);
  assert.equal(isPresentationImageStoragePath(validPath.replace(".webp", ".svg")), false);
  assert.throws(() => presentationImageSource("not/a/storage/path"), /Invalid presentation image path/);
});

test("presentation image sources recover their Supabase Storage path", () => {
  assert.equal(presentationImageStoragePathFromSource(presentationImageSource(validPath)), validPath);
  assert.equal(presentationImageStoragePathFromSource("https://cdn.example.com/image.webp"), null);
  assert.equal(presentationImageStoragePathFromSource("/api/presentation-images/not-valid.svg"), null);
});

test("presentation image references include blocks and slide backgrounds", () => {
  const source = presentationImageSource(validPath);
  assert.equal(presentationImageReferenceCount([
    {
      blocks: [
        { type: "ImageBlock", props: { src: source } },
        { type: "ImageBlock", props: { src: "https://cdn.example.com/other.webp" } }
      ],
      duration: 5,
      props: { backgroundImage: source }
    }
  ], source), 2);
});
