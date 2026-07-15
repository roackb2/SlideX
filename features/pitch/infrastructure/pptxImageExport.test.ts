import assert from "node:assert/strict";
import test from "node:test";
import { parseMotionDoc } from "@/core/motion-doc/domain/motionDocParser";
import { pptxRasterRequirements } from "@/features/pitch/infrastructure/editablePptxExport";
import {
  fittedRasterPlacement,
  fittedRasterSize
} from "@/features/pitch/infrastructure/pptxImageExport";

test("cover preserves a portrait image ratio while covering a landscape frame", () => {
  const size = fittedRasterSize(900, 1600, 1600, 900, "cover");

  assert.equal(size.width, 1600);
  assert.equal(size.height, 2844);
  assert.ok(Math.abs(size.width / size.height - 900 / 1600) < 0.001);
});

test("contain preserves a landscape image ratio inside a portrait frame", () => {
  const size = fittedRasterSize(1600, 900, 900, 1600, "contain");

  assert.equal(size.width, 900);
  assert.equal(size.height, 506);
  assert.ok(Math.abs(size.width / size.height - 1600 / 900) < 0.01);
});

test("fill intentionally matches the frame dimensions", () => {
  assert.deepEqual(fittedRasterSize(900, 1600, 1600, 900, "fill"), {
    height: 900,
    width: 1600
  });
});

test("cover centers the oversized raster so the exported frame crops without stretching", () => {
  assert.deepEqual(fittedRasterPlacement(900, 1600, 1600, 900, "cover"), {
    height: 2844,
    width: 1600,
    x: 0,
    y: -972
  });
});

test("contain centers the fitted raster inside the exported frame", () => {
  assert.deepEqual(fittedRasterPlacement(1600, 900, 900, 1600, "contain"), {
    height: 506,
    width: 900,
    x: 0,
    y: 547
  });
});

test("cropped images request an exact block raster for editable PowerPoint", () => {
  const document = parseMotionDoc(`<Slide>
    <ImageBlock src="/images/portrait.jpg" fit="cover" cropX={0} cropY={43.8} scaleX={1} scaleY={1} x={0} y={0} w={100} h={100} />
  </Slide>`);

  assert.deepEqual(pptxRasterRequirements(document), {
    captureFilteredImagesBySlide: [true],
    captureSlideBackgroundsBySlide: [false],
    slideCount: 1,
    slideIndices: [0]
  });
});

test("Paper image filters and slide shaders request their selective PowerPoint rasters", () => {
  const document = parseMotionDoc(`<Slide>
    <ImageBlock src="/images/portrait.jpg" filter="halftone-dots" x={10} y={10} w={80} h={80} />
  </Slide>
  <Slide shader="paper-texture">
    <Title>Paper background</Title>
  </Slide>`);

  assert.deepEqual(pptxRasterRequirements(document), {
    captureFilteredImagesBySlide: [true, false],
    captureSlideBackgroundsBySlide: [false, true],
    slideCount: 2,
    slideIndices: [0, 1]
  });
});
