import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMotionDocHtml,
  buildMotionDocPngSvg,
  buildMotionDocRasterHtml,
  slugifyFilename
} from "@/core/motion-doc/infrastructure/export/motionDocExport";

const source = `# Export verification

<Slide duration={7} theme="light">
  <Title x={8} y={10} w={84} h={14}>Hello export</Title>
  <Text x={8} y={28} w={84} h={12}>World</Text>
  <Table rows={2} columns={2} cells="A|B;1|2" x={8} y={45} w={84} h={35} />
</Slide>`;

test("interactive HTML export embeds source, runtime and rendered blocks", () => {
  const html = buildMotionDocHtml(source, "Export test");

  assert.match(html, /<title>Export test<\/title>/);
  assert.match(html, /id="slidex-motion-doc-source"/);
  assert.match(html, /Hello export/);
  assert.match(html, /class="block-table"/);
  assert.match(html, /__motionDocExport/);
});

test("raster HTML and SVG exports use a fixed 16:9 canvas", () => {
  const rasterHtml = buildMotionDocRasterHtml(source, "Raster test", [0]);
  const svg = buildMotionDocPngSvg(source, 0, "PNG test");

  assert.match(rasterHtml, /data-export-mode="raster"/);
  assert.match(rasterHtml, /width: 1024px/);
  assert.match(svg, /width="1024" height="576"/);
  assert.match(svg, /Hello export/);
});

test("export filenames are portable", () => {
  assert.equal(slugifyFilename("  Q3 / Product: Review  "), "q3-product-review");
});
