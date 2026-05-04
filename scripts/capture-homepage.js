#!/usr/bin/env node
/**
 * Capture the TGS homepage (waveform + disc + DOM overlays + audio) to a 1080x1920 mp4.
 *
 * Requires the dev server running at http://localhost:3000 (pnpm dev in next-js/).
 *
 * Usage:
 *   node capture-homepage.js                    # today's SOTD → captures/<YYYY-MM-DD>.mp4
 *   node capture-homepage.js --clean            # also hide the title card
 *   node capture-homepage.js --logo             # show the TGS logo top-left
 *   node capture-homepage.js --no-disc          # hide the spinning disc
 *   node capture-homepage.js --seconds 10       # cap recording at 10s
 *   node capture-homepage.js --fps 30           # frame rate (default 60)
 *   node capture-homepage.js --out path.mp4     # custom output path
 *   node capture-homepage.js --url http://...   # custom base URL
 *
 * Implementation: CDP Page.startScreencast emits JPEG frames of the full viewport
 * (canvas + DOM overlays). Frames are piped to ffmpeg, audio is fetched separately
 * from the dev server, and ffmpeg muxes them into an mp4 via h264_videotoolbox.
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const clean = flag("--clean");
const logo = flag("--logo");
const noDisc = flag("--no-disc");
const maxSeconds = arg("--seconds") ? Number(arg("--seconds")) : null;
const fps = arg("--fps") ? Number(arg("--fps")) : 60;
const baseUrl = arg("--url") || "http://localhost:3000";
const today = new Date().toISOString().slice(0, 10);
const outDir = path.join(__dirname, "captures");
const suffix = `${clean ? "-clean" : ""}${logo ? "-logo" : ""}${noDisc ? "-nodisc" : ""}${maxSeconds ? `-${maxSeconds}s` : ""}`;
const outMp4 =
  arg("--out") || path.join(outDir, `${today}${suffix}.mp4`);
const tmpAudio = path.join(outDir, `tmp-audio-${process.pid}`);

// Output video dimensions (1080x1920, 9:16). The browser renders at a
// mobile-sized CSS viewport (CSS_W x CSS_H) and `deviceScaleFactor` upsamples
// to the output dimensions — so the page sees a phone-shaped layout (mobile
// Tailwind breakpoints, normal-size assets) instead of a 1080-wide desktop
// where everything looks tiny in the 9:16 frame.
const WIDTH = 1080;
const HEIGHT = 1920;
const CSS_W = 360;
const CSS_H = 640;
const DPR = WIDTH / CSS_W; // = 3

async function checkDevServer() {
  try {
    const res = await fetch(baseUrl, { method: "HEAD" });
    if (!res.ok && res.status !== 405) throw new Error(`status ${res.status}`);
  } catch (err) {
    console.error(
      `\n✗ Dev server not reachable at ${baseUrl}. Run \`pnpm dev\` in next-js/ first.\n   (${err.message})\n`,
    );
    process.exit(1);
  }
}

async function downloadAudio(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`audio fetch failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return dest;
}

(async () => {
  await checkDevServer();
  fs.mkdirSync(outDir, { recursive: true });

  const params = new URLSearchParams({ capture: "1" });
  if (clean) params.set("clean", "1");
  if (logo) params.set("logo", "1");
  if (noDisc) params.set("disc", "0");
  const captureUrl = `${baseUrl}/?${params.toString()}`;
  console.log(`→ Launching headless browser at ${WIDTH}x${HEIGHT}…`);

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: CSS_W, height: CSS_H, deviceScaleFactor: DPR },
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--hide-scrollbars",
      "--mute-audio=false",
      `--window-size=${WIDTH},${HEIGHT}`,
    ],
  });

  let ffmpeg;
  let audioPath;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: CSS_W, height: CSS_H, deviceScaleFactor: DPR });
    page.on("console", (m) => {
      if (m.type() === "error") console.error(`  [page error] ${m.text()}`);
    });

    console.log(`→ Loading ${captureUrl}…`);
    await page.goto(captureUrl, { waitUntil: "networkidle2", timeout: 60_000 });

    // Resolve audio metadata + URL inside the page
    const audioInfo = await page.evaluate(async () => {
      const audio = document.getElementById("myAudio");
      if (!audio) throw new Error("no #myAudio");
      if (!audio.duration || isNaN(audio.duration)) {
        await new Promise((r) => {
          if (audio.readyState >= 1) return r();
          audio.addEventListener("loadedmetadata", r, { once: true });
        });
      }
      return { src: audio.currentSrc || audio.src, duration: audio.duration };
    });

    const recordSeconds = maxSeconds
      ? Math.min(maxSeconds, audioInfo.duration)
      : audioInfo.duration;
    console.log(
      `→ Audio duration: ${audioInfo.duration.toFixed(1)}s. Recording ${recordSeconds.toFixed(1)}s @ ${fps}fps.`,
    );

    // Download audio (resolve relative URL against baseUrl)
    const audioUrl = audioInfo.src.startsWith("http")
      ? audioInfo.src
      : `${baseUrl}${audioInfo.src.startsWith("/") ? "" : "/"}${audioInfo.src}`;
    console.log(`→ Downloading audio…`);
    audioPath = await downloadAudio(audioUrl, tmpAudio);

    // Spawn ffmpeg: JPEG frames on stdin, audio from file, mp4 out
    console.log(`→ Starting ffmpeg encoder (h264_videotoolbox)…`);
    ffmpeg = spawn(
      "ffmpeg",
      [
        "-y",
        // video input: jpeg frames piped on stdin
        "-f", "image2pipe",
        "-framerate", String(fps),
        "-i", "pipe:0",
        // audio input
        "-i", audioPath,
        // duration cap
        "-t", String(recordSeconds),
        // video encode
        "-c:v", "h264_videotoolbox",
        "-b:v", "10M",
        "-tag:v", "avc1",
        "-pix_fmt", "yuv420p",
        // audio encode
        "-c:a", "aac",
        "-b:a", "256k",
        "-movflags", "+faststart",
        "-shortest",
        outMp4,
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
      // EPIPE happens if ffmpeg exits early; surfaced via ffmpegDone instead.
      if (e.code !== "EPIPE") console.error("  [ffmpeg stdin]", e.message);
    });

    // Start CDP screencast
    const cdp = await page.createCDPSession();
    let frameCount = 0;
    cdp.on("Page.screencastFrame", async ({ data, sessionId }) => {
      try {
        const buf = Buffer.from(data, "base64");
        const ok = ffmpeg.stdin.write(buf);
        if (!ok) await new Promise((r) => ffmpeg.stdin.once("drain", r));
        frameCount++;
      } catch (e) {
        // ffmpeg may have closed; ignore
      }
      try {
        await cdp.send("Page.screencastFrameAck", { sessionId });
      } catch (e) {}
    });

    // Reset audio to 0, disable looping, then play
    await page.evaluate(() => {
      const a = document.getElementById("myAudio");
      a.pause();
      a.currentTime = 0;
      a.loop = false;
      return a.play().catch(() => {});
    });

    await cdp.send("Page.startScreencast", {
      format: "jpeg",
      quality: 90,
      everyNthFrame: 1,
    });

    console.log(`→ Recording ${recordSeconds.toFixed(1)}s…`);
    await new Promise((r) => setTimeout(r, recordSeconds * 1000));

    await cdp.send("Page.stopScreencast").catch(() => {});
    console.log(`→ Captured ${frameCount} frames. Closing pipe to ffmpeg…`);
    ffmpeg.stdin.end();

    await ffmpegDone;
  } finally {
    await browser.close();
    if (audioPath) {
      try { fs.unlinkSync(audioPath); } catch (e) {}
    }
  }

  const stat = fs.statSync(outMp4);
  console.log(
    `\n✓ ${outMp4} (${(stat.size / 1_000_000).toFixed(1)} MB)\n`,
  );
})().catch((err) => {
  console.error("\n✗ Capture failed:", err);
  try { fs.existsSync(tmpAudio) && fs.unlinkSync(tmpAudio); } catch (e) {}
  process.exit(1);
});
