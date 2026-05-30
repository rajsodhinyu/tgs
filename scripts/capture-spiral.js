#!/usr/bin/env node
/**
 * Capture 10s of the spiral background at native 1080x1920, no audio, ProRes 4444.
 * Requires dev server at http://localhost:3000 and the homepage set to SpiralBackground.
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const fps = arg("--fps") ? Number(arg("--fps")) : 60;
const seconds = arg("--seconds") ? Number(arg("--seconds")) : 10;
const baseUrl = arg("--url") || "http://localhost:3000";
const outDir = path.join(__dirname, "captures");
const outMov = arg("--out") || path.join(outDir, `spiral-${seconds}s-540.mov`);

// Native 1080x1920 — no CSS-px upsampling.
const WIDTH = 540;
const HEIGHT = 960;

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const captureUrl = `${baseUrl}/?capture=1&clean=1&disc=0`;
  console.log(`→ Launching headless browser at ${WIDTH}x${HEIGHT}…`);

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
    args: [
      "--hide-scrollbars",
      "--mute-audio",
      "--force-device-scale-factor=1",
      "--high-dpi-support=0",
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
  });

  let ffmpeg;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    page.on("console", (m) => {
      if (m.type() === "error") console.error(`  [page error] ${m.text()}`);
    });

    console.log(`→ Loading ${captureUrl}…`);
    await page.goto(captureUrl, { waitUntil: "networkidle2", timeout: 60_000 });

    console.log(`→ Starting ffmpeg (prores_ks 4444, lossless visual quality)…`);
    ffmpeg = spawn(
      "ffmpeg",
      [
        "-y",
        "-f", "image2pipe",
        "-framerate", String(fps),
        "-i", "pipe:0",
        "-t", String(seconds),
        "-an",
        "-c:v", "prores_ks",
        "-profile:v", "4",     // 4444
        "-qscale:v", "5",      // very high quality (lower = better; 4-5 is near-lossless for 4444)
        "-pix_fmt", "yuv444p10le",
        "-vendor", "apl0",
        outMov,
      ],
      { stdio: ["pipe", "inherit", "inherit"] },
    );

    const ffmpegDone = new Promise((resolve, reject) => {
      ffmpeg.on("error", reject);
      ffmpeg.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)),
      );
    });
    ffmpeg.stdin.on("error", (e) => {
      if (e.code !== "EPIPE") console.error("  [ffmpeg stdin]", e.message);
    });

    // Warmup
    await page.waitForSelector("canvas", { timeout: 10_000 });
    await page.evaluate(() =>
      document.fonts ? document.fonts.ready : Promise.resolve(),
    );
    await page.evaluate(
      () =>
        new Promise((r) => {
          let n = 0;
          const tick = () => (++n >= 30 ? r() : requestAnimationFrame(tick));
          requestAnimationFrame(tick);
        }),
    );

    const cdp = await page.createCDPSession();
    let frameCount = 0;
    cdp.on("Page.screencastFrame", async ({ data, sessionId }) => {
      try {
        const buf = Buffer.from(data, "base64");
        const ok = ffmpeg.stdin.write(buf);
        if (!ok) await new Promise((r) => ffmpeg.stdin.once("drain", r));
        frameCount++;
      } catch (e) {}
      try {
        await cdp.send("Page.screencastFrameAck", { sessionId });
      } catch (e) {}
    });

    // PNG screencast = lossless frames into ffmpeg.
    await cdp.send("Page.startScreencast", {
      format: "png",
      maxWidth: WIDTH,
      maxHeight: HEIGHT,
      everyNthFrame: 1,
    });

    console.log(`→ Recording ${seconds}s @ ${fps}fps…`);
    await new Promise((r) => setTimeout(r, seconds * 1000));

    await cdp.send("Page.stopScreencast").catch(() => {});
    console.log(`→ Captured ${frameCount} frames. Closing pipe to ffmpeg…`);
    ffmpeg.stdin.end();

    await ffmpegDone;
  } finally {
    await browser.close();
  }

  const stat = fs.statSync(outMov);
  console.log(
    `\n✓ ${outMov} (${(stat.size / 1_000_000).toFixed(1)} MB)\n`,
  );
})().catch((err) => {
  console.error("\n✗ Capture failed:", err);
  process.exit(1);
});
