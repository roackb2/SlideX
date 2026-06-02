import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const iconDir = path.join(root, "src-tauri", "icons");
const iconsetDir = path.join(iconDir, "SlideX.iconset");
const docIconsetDir = path.join(iconDir, "SlideXProject.iconset");
const appTiff = path.join(iconDir, "slidex-app-icon.tiff");
const docTiff = path.join(iconDir, "slidex-project-icon.tiff");

fs.mkdirSync(iconDir, { recursive: true });
fs.rmSync(iconsetDir, { recursive: true, force: true });
fs.rmSync(docIconsetDir, { recursive: true, force: true });
fs.mkdirSync(iconsetDir, { recursive: true });
fs.mkdirSync(docIconsetDir, { recursive: true });

const appSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="128" y1="80" x2="912" y2="944" gradientUnits="userSpaceOnUse">
      <stop stop-color="#171B26"/>
      <stop offset="1" stop-color="#05070D"/>
    </linearGradient>
    <linearGradient id="strokeA" x1="242" y1="232" x2="782" y2="792" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F8FFF9"/>
      <stop offset="0.46" stop-color="#7EF2C6"/>
      <stop offset="1" stop-color="#2CB795"/>
    </linearGradient>
    <linearGradient id="strokeB" x1="792" y1="226" x2="232" y2="808" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F8FBFF"/>
      <stop offset="0.5" stop-color="#93A2FF"/>
      <stop offset="1" stop-color="#5664E5"/>
    </linearGradient>
    <linearGradient id="core" x1="410" y1="406" x2="616" y2="616" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF4A8"/>
      <stop offset="1" stop-color="#FF8A4D"/>
    </linearGradient>
    <filter id="shadow" x="132" y="118" width="760" height="794" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="34" stdDeviation="44" flood-color="#000000" flood-opacity="0.46"/>
    </filter>
  </defs>
  <rect x="64" y="64" width="896" height="896" rx="206" fill="url(#bg)"/>
  <rect x="83" y="83" width="858" height="858" rx="188" stroke="white" stroke-opacity="0.08" stroke-width="38"/>
  <g filter="url(#shadow)">
    <path d="M285 248C308.8 224.2 347.4 224.2 371.2 248L512 388.8L652.8 248C676.6 224.2 715.2 224.2 739 248L774.4 283.4C798.2 307.2 798.2 345.8 774.4 369.6L633.6 510.4L779 655.8C802.8 679.6 802.8 718.2 779 742L743.6 777.4C719.8 801.2 681.2 801.2 657.4 777.4L512 632L366.6 777.4C342.8 801.2 304.2 801.2 280.4 777.4L245 742C221.2 718.2 221.2 679.6 245 655.8L390.4 510.4L249.6 369.6C225.8 345.8 225.8 307.2 249.6 283.4L285 248Z" fill="#070A10"/>
    <path d="M326 279L512 465L698 279" stroke="url(#strokeB)" stroke-width="106" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M326 746L512 560L698 746" stroke="url(#strokeA)" stroke-width="106" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="442" y="442" width="140" height="140" rx="38" fill="url(#core)" transform="rotate(45 512 512)"/>
  </g>
</svg>`;

const docSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="paper" x1="264" y1="116" x2="760" y2="908" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FBFCFF"/>
      <stop offset="1" stop-color="#DCE4EE"/>
    </linearGradient>
    <linearGradient id="fold" x1="650" y1="108" x2="814" y2="272" gradientUnits="userSpaceOnUse">
      <stop stop-color="#C6D1DF"/>
      <stop offset="1" stop-color="#EEF3F8"/>
    </linearGradient>
    <linearGradient id="slide" x1="314" y1="354" x2="718" y2="736" gradientUnits="userSpaceOnUse">
      <stop stop-color="#121722"/>
      <stop offset="1" stop-color="#070A10"/>
    </linearGradient>
    <linearGradient id="xA" x1="352" y1="382" x2="672" y2="620" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7EF2CD"/>
      <stop offset="1" stop-color="#7D8BFF"/>
    </linearGradient>
    <linearGradient id="xB" x1="668" y1="386" x2="352" y2="620" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF0A5"/>
      <stop offset="1" stop-color="#FF8A4D"/>
    </linearGradient>
    <filter id="shadow" x="164" y="74" width="696" height="882" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="26" stdDeviation="34" flood-color="#000000" flood-opacity="0.30"/>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <path d="M242 136C242 109.49 263.49 88 290 88H632L800 256V846C800 872.51 778.51 894 752 894H290C263.49 894 242 872.51 242 846V136Z" fill="url(#paper)"/>
    <path d="M632 88V228C632 254.51 653.49 276 680 276H800L632 88Z" fill="url(#fold)"/>
    <rect x="322" y="376" width="380" height="244" rx="34" fill="url(#slide)"/>
    <rect x="352" y="406" width="320" height="184" rx="20" stroke="white" stroke-opacity="0.11" stroke-width="14"/>
    <path d="M400 432L624 564" stroke="url(#xA)" stroke-width="56" stroke-linecap="round"/>
    <path d="M624 432L400 564" stroke="url(#xB)" stroke-width="56" stroke-linecap="round"/>
    <circle cx="512" cy="498" r="32" fill="#F8F4B4"/>
    <rect x="326" y="684" width="244" height="26" rx="13" fill="#8390A3" fill-opacity="0.55"/>
    <rect x="326" y="734" width="312" height="26" rx="13" fill="#8390A3" fill-opacity="0.42"/>
  </g>
</svg>`;

await fs.promises.writeFile(path.join(iconDir, "slidex-app-icon.svg"), appSvg.trim());
await fs.promises.writeFile(path.join(iconDir, "slidex-project-icon.svg"), docSvg.trim());

const appBuffer = Buffer.from(appSvg);
const docBuffer = Buffer.from(docSvg);

async function render(source, target, size) {
  await sharp(source).resize(size, size).png().toFile(target);
}

await render(appBuffer, path.join(iconDir, "icon.png"), 1024);
await render(appBuffer, path.join(iconDir, "32x32.png"), 32);
await render(appBuffer, path.join(iconDir, "128x128.png"), 128);
await render(appBuffer, path.join(iconDir, "128x128@2x.png"), 256);
await render(appBuffer, path.join(iconDir, "Square30x30Logo.png"), 30);
await render(appBuffer, path.join(iconDir, "Square44x44Logo.png"), 44);
await render(appBuffer, path.join(iconDir, "Square71x71Logo.png"), 71);
await render(appBuffer, path.join(iconDir, "Square89x89Logo.png"), 89);
await render(appBuffer, path.join(iconDir, "Square107x107Logo.png"), 107);
await render(appBuffer, path.join(iconDir, "Square142x142Logo.png"), 142);
await render(appBuffer, path.join(iconDir, "Square150x150Logo.png"), 150);
await render(appBuffer, path.join(iconDir, "Square284x284Logo.png"), 284);
await render(appBuffer, path.join(iconDir, "Square310x310Logo.png"), 310);
await render(appBuffer, path.join(iconDir, "StoreLogo.png"), 50);
await render(docBuffer, path.join(iconDir, "slidex-project.png"), 1024);

const iconsetSizes = [
  ["icon_16x16.png", 16],
  ["icon_16x16@2x.png", 32],
  ["icon_32x32.png", 32],
  ["icon_32x32@2x.png", 64],
  ["icon_128x128.png", 128],
  ["icon_128x128@2x.png", 256],
  ["icon_256x256.png", 256],
  ["icon_256x256@2x.png", 512],
  ["icon_512x512.png", 512],
  ["icon_512x512@2x.png", 1024]
];

for (const [filename, size] of iconsetSizes) {
  await render(appBuffer, path.join(iconsetDir, filename), size);
  await render(docBuffer, path.join(docIconsetDir, filename), size);
}

execFileSync("/usr/bin/sips", [
  "-s",
  "format",
  "tiff",
  path.join(iconDir, "icon.png"),
  "--out",
  appTiff
]);
execFileSync("/usr/bin/sips", [
  "-s",
  "format",
  "tiff",
  path.join(iconDir, "slidex-project.png"),
  "--out",
  docTiff
]);
execFileSync("/usr/bin/tiff2icns", [appTiff, path.join(iconDir, "icon.icns")]);
execFileSync("/usr/bin/tiff2icns", [docTiff, path.join(iconDir, "slidex-project.icns")]);

fs.rmSync(iconsetDir, { recursive: true, force: true });
fs.rmSync(docIconsetDir, { recursive: true, force: true });
fs.rmSync(appTiff, { force: true });
fs.rmSync(docTiff, { force: true });

const tauriBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "tauri.cmd" : "tauri");
if (fs.existsSync(tauriBin)) {
  execFileSync(tauriBin, ["icon", path.join(iconDir, "icon.png")], { stdio: "inherit" });

  const projectIconOutput = fs.mkdtempSync(path.join(os.tmpdir(), "slidex-project-icons-"));
  execFileSync(tauriBin, ["icon", path.join(iconDir, "slidex-project.png"), "-o", projectIconOutput], {
    stdio: "inherit"
  });
  fs.copyFileSync(path.join(projectIconOutput, "icon.icns"), path.join(iconDir, "slidex-project.icns"));
  fs.rmSync(projectIconOutput, { recursive: true, force: true });
}
