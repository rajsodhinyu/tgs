#!/usr/bin/env node
/**
 * Capture 10s of EVERY background at 540x960 ProRes 4444, no audio.
 * Edits next-js/src/app/page.tsx between iterations to swap the dynamic import,
 * relies on Next HMR to pick up the change, then drives Puppeteer + ffmpeg.
 *
 * Requires dev server already running at http://localhost:3000.
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

const fps = arg("--fps") ? Number(arg("--fps")) : 60;
const seconds = arg("--seconds") ? Number(arg("--seconds")) : 10;
const baseUrl = arg("--url") || "http://localhost:3000";
const WIDTH = 540, HEIGHT = 960;

const PAGE_FILE = path.resolve(__dirname, "../next-js/src/app/page.tsx");
const OUT_DIR = path.join(__dirname, "captures");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Order chosen to surface anything broken early.
const ALL_BACKGROUNDS = [
  "Backround",
  "CheckerboardBackground",
  "CheckerboardStaticBackground",
  "DiscoBallsBackground",
  "FireBackground",
  "FireworksBackground",
  "GlitchBackground",
  "HalftoneBackground",
  "LeavesBackground",
  "LeavesBackgroundRandom",
  "PurpleSeaBackground",
  "ShinyNotesBackground",
  "SpiralBackground",
  "WaveformBackground",
  "ZebraStripesBackground",
];
const onlyArg = arg("--only");
const BACKGROUNDS = onlyArg ? onlyArg.split(",") : ALL_BACKGROUNDS;

function setImport(name) {
  const src = fs.readFileSync(PAGE_FILE, "utf8");
  const re = /\(\) => import\("\.\/ui\/[A-Za-z]+"\)/;
  if (!re.test(src)) throw new Error("Could not find dynamic import line in page.tsx");
  const next = src.replace(re, `() => import("./ui/${name}")`);
  if (next !== src) fs.writeFileSync(PAGE_FILE, next);
}

async function captureOne(page, name) {
  const outMov = path.join(OUT_DIR, `${name}-${seconds}s-540.mov`);
  console.log(`\n=== ${name} → ${path.basename(outMov)} ===`);

  setImport(name);
  // Give HMR a moment to recompile + the page to re-render the new sketch.
  await new Promise((r) => setTimeout(r, 2500));

  const captureUrl = `${baseUrl}/?capture=1&clean=1&disc=0`;
  await page.goto(captureUrl, { waitUntil: "networkidle2", timeout: 60_000 });
  // Most backgrounds use p5 → wait for canvas. Pure-CSS ones (e.g. Zebra)
  // don't have one — fall back to a short settle delay.
  await page.waitForSelector("canvas", { timeout: 5_000 }).catch(() => {});
  await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve());
  await page.evaluate(() => new Promise((r) => {
    let n = 0;
    const tick = () => (++n >= 30 ? r() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  }));

  const ffmpeg = spawn("ffmpeg", [
    "-y",
    "-f", "image2pipe",
    "-framerate", String(fps),
    "-i", "pipe:0",
    "-t", String(seconds),
    "-an",
    "-c:v", "prores_ks",
    "-profile:v", "4",
    "-qscale:v", "5",
    "-pix_fmt", "yuv444p10le",
    "-vendor", "apl0",
    outMov,
  ], { stdio: ["pipe", "ignore", "ignore"] });

  const done = new Promise((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`)));
  });
  ffmpeg.stdin.on("error", (e) => { if (e.code !== "EPIPE") console.error("  [stdin]", e.message); });

  const cdp = await page.createCDPSession();
  let frames = 0;
  cdp.on("Page.screencastFrame", async ({ data, sessionId }) => {
    try {
      const buf = Buffer.from(data, "base64");
      const ok = ffmpeg.stdin.write(buf);
      if (!ok) await new Promise((r) => ffmpeg.stdin.once("drain", r));
      frames++;
    } catch {}
    try { await cdp.send("Page.screencastFrameAck", { sessionId }); } catch {}
  });

  await cdp.send("Page.startScreencast", {
    format: "png",
    maxWidth: WIDTH,
    maxHeight: HEIGHT,
    everyNthFrame: 1,
  });

  await new Promise((r) => setTimeout(r, seconds * 1000));

  await cdp.send("Page.stopScreencast").catch(() => {});
  ffmpeg.stdin.end();
  await done;
  await cdp.detach().catch(() => {});

  const stat = fs.statSync(outMov);
  console.log(`  ✓ ${frames} frames, ${(stat.size / 1_000_000).toFixed(1)} MB`);
}

(async () => {
  // Sanity check dev server.
  try {
    const res = await fetch(baseUrl, { method: "HEAD" });
    if (!res.ok && res.status !== 405) throw new Error(`status ${res.status}`);
  } catch (e) {
    console.error(`✗ Dev server not reachable at ${baseUrl}: ${e.message}`);
    process.exit(1);
  }

  console.log(`→ Launching headless browser at ${WIDTH}x${HEIGHT}…`);
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
    args: [
      "--hide-scrollbars",
      "--mute-audio",
      "--force-device-scale-factor=1",
      "--high-dpi-support=0",
      "--autoplay-policy=no-user-gesture-required",
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  page.on("console", (m) => {
    if (m.type() === "error") console.error(`  [page] ${m.text()}`);
  });

  const failures = [];
  try {
    for (const name of BACKGROUNDS) {
      try {
        await captureOne(page, name);
      } catch (e) {
        console.error(`  ✗ ${name}: ${e.message}`);
        failures.push(name);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nDone. ${BACKGROUNDS.length - failures.length}/${BACKGROUNDS.length} captured.`);
  if (failures.length) {
    console.log(`Failures: ${failures.join(", ")}`);
    process.exit(2);
  }
})();
