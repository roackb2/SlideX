const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

  const errors = [];
  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push("console: " + msg.text());
  });

  const shots = [
    ["/en", "/tmp/shot-home-en-v2.png"],
    ["/zh-TW", "/tmp/shot-home-zh-v2.png"]
  ];

  for (const [path, file] of shots) {
    const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: file });
    console.log(path, "->", res.status(), file);
  }

  console.log("errors:", errors.length ? errors.join("\n") : "none");
  await browser.close();
})();
