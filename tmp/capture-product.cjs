const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");

const BASE = "http://localhost:3000";
const OUT_DIR = "public/marketing";

const shots = [
  { name: "editor", path: "/workspace/pitch?demo=1" },
  { name: "preview", path: "/workspace/pitch?demo=1&view=preview" }
];
const locales = ["en", "zh-TW"];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const locale of locales) {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: 2
    });
    await context.addInitScript((value) => {
      window.localStorage.setItem("slidex-locale", value);
    }, locale);

    const page = await context.newPage();

    for (const shot of shots) {
      const tmpPath = `/tmp/cap-${shot.name}-${locale}.png`;
      await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle", timeout: 120000 });
      await page.waitForTimeout(3500);
      await page.screenshot({ path: tmpPath });
      console.log("captured", shot.name, locale);

      const outPath = `${OUT_DIR}/${shot.name}-${locale}.webp`;
      await sharp(tmpPath)
        .resize({ width: 1920 })
        .webp({ quality: 88 })
        .toFile(outPath);
      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log("->", outPath, kb + "KB");
    }

    await context.close();
  }

  await browser.close();
})();
