"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [61, 53, 100];
const PINK: [number, number, number] = [237, 157, 249];
const PURPLE: [number, number, number] = [108, 92, 190];
const LIGHT_PINK: [number, number, number] = [250, 200, 255];

type AudioTap = {
  ctx: AudioContext;
  analyser: AnalyserNode;
  timeData: Uint8Array;
  audio: HTMLAudioElement;
};

// MediaElementAudioSourceNode can only be created once per <audio> element —
// cache on the element itself so remounts (navigation, hot reload) reuse it.
declare global {
  interface HTMLAudioElement {
    __tgsAudioTap?: AudioTap;
  }
}

function getAudioTap(): AudioTap | null {
  if (typeof window === "undefined") return null;
  const audio = document.getElementById("myAudio") as HTMLAudioElement | null;
  if (!audio) return null;
  if (audio.__tgsAudioTap) return audio.__tgsAudioTap;

  // Without CORS, createMediaElementSource would permanently reroute the audio
  // element's output through Web Audio but return silence — breaking playback.
  // Skip the tap entirely unless the element is explicitly CORS-opted-in.
  if (!audio.crossOrigin) return null;

  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const tap: AudioTap = {
      ctx,
      analyser,
      timeData: new Uint8Array(analyser.fftSize),
      audio,
    };
    audio.__tgsAudioTap = tap;
    return tap;
  } catch {
    return null;
  }
}

// CRT "Static-to-Signal": a retro TV tube on dark purple. Audio level is the
// signal strength — silence = heavy random snow (no station tuned in); the
// louder the SOTD plays, the more the snow resolves into a clean picture:
// crisp scanlines + a soft glowing waveform across the middle, with a slow
// vertical hold-sync "roll" bar and RGB-split on peaks. No audio / CORS-blocked
// falls back to a gentle procedural sine at medium clarity so it's never just
// dead snow forever.
export const crtSignalSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;

  // Offscreen snow field — regenerated coarsely (chunky CRT pixels) and copied
  // back scaled up, far cheaper than per-pixel noise on the main canvas.
  let snow: p5.Graphics;
  const SNOW_SCALE = 4; // each snow "pixel" is SNOW_SCALE px on screen
  let snowW = 0;
  let snowH = 0;

  const buildSnow = () => {
    snowW = Math.max(1, Math.ceil(width / SNOW_SCALE));
    snowH = Math.max(1, Math.ceil(height / SNOW_SCALE));
    snow = s.createGraphics(snowW, snowH);
    snow.noStroke();
    snow.pixelDensity(1);
  };

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    buildSnow();
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.background(BG[0], BG[1], BG[2]);
    buildSnow();
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
  };

  // RMS level of the audio in [0,1], or -1 when no live audio is available
  // (so the caller can decide to run the procedural fallback instead).
  const sampleLevel = (): number => {
    if (!tap || tap.ctx.state !== "running" || tap.audio.paused) return -1;
    tap.analyser.getByteTimeDomainData(tap.timeData);
    let sumSq = 0;
    for (let i = 0; i < tap.timeData.length; i++) {
      const v = (tap.timeData[i] - 128) / 128;
      sumSq += v * v;
    }
    return Math.sqrt(sumSq / tap.timeData.length);
  };

  // Repaint the chunky snow buffer. The static is ALWAYS heavy; `energy`
  // (audio-driven, 0..1) makes it denser, brighter and sparklier on loud parts.
  const drawSnow = (energy: number) => {
    snow.background(BG[0], BG[1], BG[2]);

    const total = snowW * snowH;
    // Heavy baseline density, pushed harder by audio energy.
    const count = Math.floor(total * (0.22 + energy * 0.55));
    // Loud audio lowers the hot-speck threshold -> more bright white-pink sparks.
    const hotThresh = 0.93 - energy * 0.22;
    const specAlpha = 150 + energy * 90;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() * snowW) | 0;
      const y = (Math.random() * snowH) | 0;
      const b = Math.random();
      if (b > hotThresh) {
        // Hot white-pink spark.
        snow.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], 180 + energy * 75);
      } else {
        const g = 80 + b * 140;
        snow.fill(g, g * 0.7 + 30, g * 0.85 + 30, specAlpha);
      }
      snow.rect(x, y, 1, 1);
    }
  };

  s.draw = () => {
    const level = sampleLevel();
    const live = level >= 0;
    // No live audio -> a low idle energy so it's still a lively heavy static.
    const lv = live ? level : 0.05;
    // Slower follower = calmer, less twitchy response.
    smoothedLevel += (lv - smoothedLevel) * 0.1;
    // Audio energy 0..1 (RMS is small, so scale it up and clamp). Lower scale =
    // less sensitive: it takes a louder signal to push the static fully wild.
    const energy = s.constrain(smoothedLevel * 2.6, 0, 1);

    // --- base tube ---
    s.background(BG[0], BG[1], BG[2]);

    // --- snow layer (always heavy; reacts via `energy`) ---
    drawSnow(energy);

    // Chroma split: on loud parts, lay pink/purple-tinted copies of the snow
    // offset left/right so the static shimmers with color and "buzzes" harder.
    const split = energy * 9;
    if (split > 0.5) {
      s.push();
      s.blendMode(s.SCREEN);
      s.tint(PINK[0], PINK[1], PINK[2], 70 + energy * 90);
      s.image(snow, -split, 0, width, height);
      s.tint(PURPLE[0], PURPLE[1], PURPLE[2], 60 + energy * 80);
      s.image(snow, split, 0, width, height);
      s.pop();
    }
    // The base (un-split) static pass.
    s.push();
    s.tint(255, 255, 255, 200 + energy * 55);
    s.image(snow, 0, 0, width, height);
    s.pop();

    // --- sync tear: on energy peaks, shove a few horizontal bands sideways ---
    if (energy > 0.35) {
      const tears = 1 + Math.floor(energy * 3);
      for (let i = 0; i < tears; i++) {
        const ty = (Math.random() * height) | 0;
        const th = 6 + (Math.random() * 26 * energy) | 0;
        const shift = (Math.random() - 0.5) * 60 * energy;
        // Copy a strip of the snow buffer back onto itself, displaced.
        const sy = (ty / height) * snowH;
        const sh = (th / height) * snowH;
        s.copy(
          snow,
          0,
          sy | 0,
          snowW,
          Math.max(1, sh | 0),
          shift | 0,
          ty,
          width,
          th,
        );
      }
    }

    // --- slow vertical hold-sync roll bar (always present, hotter when loud) ---
    const rollSpeed = 0.8 + energy * 2.4;
    const rollY = (s.frameCount * rollSpeed) % (height + 160) - 80;
    const rollH = 80 + energy * 70;
    s.noStroke();
    for (let i = 0; i < rollH; i++) {
      const a = Math.sin((i / rollH) * Math.PI);
      s.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], a * (14 + energy * 30));
      s.rect(0, rollY + i, width, 1);
    }

    // --- faint scanline overlay (always present, CRT texture) ---
    s.noStroke();
    for (let y = 0; y < height; y += 3) {
      s.fill(0, 0, 0, 26);
      s.rect(0, y + 1, width, 1);
    }

    // --- vignette / rounded-corner tube darkening (always present) ---
    drawVignette();
  };

  // Soft radial-ish darkening at the edges + corner blocks for the CRT bezel.
  const drawVignette = () => {
    s.noStroke();
    const edge = Math.min(width, height) * 0.16;
    const steps = 22;
    for (let i = 0; i < steps; i++) {
      const f = i / steps;
      const a = (1 - f) * 16;
      const inset = edge * f;
      s.fill(0, 0, 0, a);
      // top / bottom / left / right bands
      s.rect(0, inset, width, 2);
      s.rect(0, height - inset - 2, width, 2);
      s.rect(inset, 0, 2, height);
      s.rect(width - inset - 2, 0, 2, height);
    }
    // Knock the four corners back a touch harder for the tube curve — feathered
    // with a soft radial falloff so they read as curvature, not pasted squares.
    const cs = edge * 1.1;
    const csteps = 16;
    const corners: [number, number][] = [
      [0, 0],
      [width, 0],
      [0, height],
      [width, height],
    ];
    for (const [cx, cy] of corners) {
      for (let i = 0; i < csteps; i++) {
        const f = i / csteps; // 0 at corner ... 1 at inner edge
        const rad = cs * (1 - f);
        if (rad <= 0) continue;
        // Stronger at the very corner, fading to nothing inward.
        s.fill(0, 0, 0, (1 - f) * 7);
        s.ellipse(cx, cy, rad * 2, rad * 2);
      }
    }
  };
};

const CRTSignalBackground = () => {
  return <P5Background sketch={crtSignalSketch} />;
};

export default CRTSignalBackground;
