"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [61, 53, 100];
const PINK: [number, number, number] = [237, 157, 249];
const PURPLE: [number, number, number] = [108, 92, 190];
const HILITE: [number, number, number] = [255, 235, 255];
const DEEP: [number, number, number] = [28, 20, 60];

type AudioTap = {
  ctx: AudioContext;
  analyser: AnalyserNode;
  timeData: Uint8Array;
  audio: HTMLAudioElement;
};

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

// "Lava" — a slow ambient metaball field. Seven drifting blobs contribute an
// inverse-square field; the field is sampled on a coarse 10px grid and each
// cell is filled with whichever of four brand colors its field strength falls
// into. The hard thresholds (rather than a gradient) are what make it read as
// pixel-banded lava instead of a blur. Audio only breathes the blob radii, so
// this one stays calm — it's the ambient option.
type Blob = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number; // base radius
  ph: number; // phase offset for the idle breathing wobble
  cur: number; // radius this frame (base * wobble * audio)
};

export const lavaSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  const CELL = 10; // field sample + fill size in px
  const blobs: Blob[] = [];

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  const seed = () => {
    blobs.length = 0;
    for (let i = 0; i < 7; i++) {
      blobs.push({
        x: s.random(width),
        y: s.random(height),
        vx: s.random(-0.35, 0.35),
        vy: s.random(-0.3, 0.3),
        r: s.random(90, 210),
        ph: s.random(s.TWO_PI),
        cur: 0,
      });
    }
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
    seed();
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    seed();
  };

  const sampleLevel = (): number => {
    if (!tap || tap.ctx.state !== "running" || tap.audio.paused) return 0;
    tap.analyser.getByteTimeDomainData(tap.timeData);
    let sumSq = 0;
    for (let i = 0; i < tap.timeData.length; i++) {
      const v = (tap.timeData[i] - 128) / 128;
      sumSq += v * v;
    }
    return Math.sqrt(sumSq / tap.timeData.length);
  };

  s.draw = () => {
    const level = sampleLevel();
    // Very slow follow — the point is ambient drift, not beat response.
    smoothedLevel += (level - smoothedLevel) * 0.06;
    const t = s.millis() / 1000;

    s.background(DEEP[0], DEEP[1], DEEP[2]);

    for (const b of blobs) {
      b.x += b.vx;
      b.y += b.vy;
      // Wrap with a full radius of margin so blobs don't pop at the edges.
      if (b.x < -b.r) b.x = width + b.r;
      if (b.x > width + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = height + b.r;
      if (b.y > height + b.r) b.y = -b.r;
      b.cur =
        b.r * (1 + 0.12 * Math.sin(t * 0.6 + b.ph) + smoothedLevel * 0.22);
    }

    for (let y = 0; y < height; y += CELL) {
      for (let x = 0; x < width; x += CELL) {
        let f = 0;
        for (const b of blobs) {
          const dx = x + CELL / 2 - b.x;
          const dy = y + CELL / 2 - b.y;
          f += (b.cur * b.cur) / (dx * dx + dy * dy + 1);
        }
        if (f < 0.55) continue; // outside the field — leave the deep backdrop
        let c: [number, number, number];
        let a: number;
        if (f > 1.9) {
          c = HILITE;
          a = 235;
        } else if (f > 1.25) {
          c = PINK;
          a = 225;
        } else if (f > 0.85) {
          c = PURPLE;
          a = 215;
        } else {
          c = BG;
          a = 200;
        }
        s.fill(c[0], c[1], c[2], a);
        s.rect(x, y, CELL - 1, CELL - 1);
      }
    }
  };
};

const LavaBackground = () => {
  return <P5Background sketch={lavaSketch} />;
};

export default LavaBackground;
