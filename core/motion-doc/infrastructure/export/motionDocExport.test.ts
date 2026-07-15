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

test("static export waits for Paper shaders before freezing their canvases", () => {
  const rasterHtml = buildMotionDocRasterHtml(`<Slide shader="paper-texture">
    <ImageBlock src="data:image/png;base64,AAAA" filter="dithering" />
  </Slide>`);

  assert.match(rasterHtml, /renderedFrames: 0/);
  assert.match(rasterHtml, /requestFreshShaderFrame\(state\)/);
  assert.match(rasterHtml, /await waitForRenderedShaders\(canvases\)/);
  assert.match(rasterHtml, /await Promise\.all\(canvases\.map\(freezeCanvas\)\)/);
  assert.match(rasterHtml, /await image\.decode\(\)/);
});

test("export filenames are portable", () => {
  assert.equal(slugifyFilename("  Q3 / Product: Review  "), "q3-product-review");
});

test("HTML exports escape arbitrary markup and include a restrictive CSP", () => {
  const html = buildMotionDocHtml(`<Slide><script>alert(1)</script><Text>Safe</Text></Slide>`);

  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /script-src 'nonce-slidex-[0-9a-f-]+'/);
});

test("HTML exports preserve image data and video paths without empty media loads", () => {
  const html = buildMotionDocHtml(`<Slide>
    <ImageBlock src="data:image/webp;base64,AAAA" alt="Embedded image" />
    <VideoBlock src="/media/demo.mp4" muted={true} />
    <VideoBlock src="data:video/mp4;base64,AAAA" muted={true} />
    <VideoBlock src="" muted={true} />
  </Slide>`);

  assert.match(html, /img src="data:image\/webp;base64,AAAA"/);
  assert.match(html, /video src="\/media\/demo.mp4"/);
  assert.match(html, /video src="data:video\/mp4;base64,AAAA"/);
  assert.match(html, /media-src https: blob: data:/);
  assert.doesNotMatch(html, /(?:img|video|iframe) src=""/);
});

test("HTML exports position the full image before clipping cropped media", () => {
  const html = buildMotionDocHtml(`<Slide>
    <ImageBlock src="/images/team.webp" cropX={0} cropY={43.8} scaleX={1} scaleY={1} fit="cover" />
  </Slide>`);

  assert.match(html, /data-exact-image-raster="true"/);
  assert.match(html, /class="block-image__crop-media"/);
  assert.match(html, /data-image-crop-y="43\.8"/);
  assert.match(html, /class="block-image__crop-image"/);
  assert.doesNotMatch(html, /class="block-image__crop-image"[^>]*style=/);
  assert.match(html, /function layoutCroppedImages\(/);
  assert.match(html, /clampCroppedImagePosition\(cropY, dimensions\.height \* scaleY\)/);
});
