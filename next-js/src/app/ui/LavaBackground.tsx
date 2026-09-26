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
  timeData: Uint8Array<ArrayBuffer>;
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

  const CELL = 7; // field sample + fill size in px
  const blobs: Blob[] = [];

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  // One blob per this much canvas area, so a narrow phone viewport gets a few
  // well-spaced blobs instead of the same 7 crammed together. A fixed count was
  // what made the vertical form factor read as mostly white: overlapping fields
  // sum, so packing them tight pushes f past the top (HILITE) threshold nearly
  // everywhere.
  const AREA_PER_BLOB = 62000;
  // Centers must sit at least this multiple of their combined radii apart.
  const SEPARATION = 1.15;

  // Toroidal separation — must match the wrapped metric used in draw().
  const tooClose = (x: number, y: number, r: number) =>
    blobs.some((b) => {
      let dx = Math.abs(x - b.x);
      if (dx > width / 2) dx = width - dx;
      let dy = Math.abs(y - b.y);
      if (dy > height / 2) dy = height - dy;
      const min = (r + b.r) * SEPARATION;
      return dx * dx + dy * dy < min * min;
    });

  const seed = () => {
    blobs.length = 0;
    const count = Math.max(
      3,
      Math.min(8, Math.round((width * height) / AREA_PER_BLOB)),
    );
    for (let i = 0; i < count; i++) {
      const r = s.random(45, 105);
      let x = 0;
      let y = 0;
      // Rejection-sample a spot that clears the blobs already placed. Give up
      // after a bounded number of tries so a crowded canvas can't spin here.
      for (let attempt = 0; attempt < 120; attempt++) {
        x = s.random(width);
        y = s.random(height);
        if (!tooClose(x, y, r)) break;
      }
      blobs.push({
        x,
        y,
        vx: s.random(-0.35, 0.35),
        vy: s.random(-0.3, 0.3),
        r,
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
    const prevW = width;
    const prevH = height;
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    // Remap the existing blobs into the new box rather than reseeding. Mobile
    // browsers fire resize every time the address bar shows/hides while
    // scrolling, and a reseed would reshuffle the whole field each time.
    if (prevW > 0 && prevH > 0) {
      const sx = width / prevW;
      const sy = height / prevH;
      for (const b of blobs) {
        b.x *= sx;
        b.y *= sy;
      }
    }
    if (!blobs.length) seed();
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
      // Keep centers inside [0,w) x [0,h) and let the field itself wrap, below.
      b.x = (((b.x + b.vx) % width) + width) % width;
      b.y = (((b.y + b.vy) % height) + height) % height;
      b.cur =
        b.r * (1 + 0.12 * Math.sin(t * 0.6 + b.ph) + smoothedLevel * 0.22);
    }

    for (let y = 0; y < height; y += CELL) {
      for (let x = 0; x < width; x += CELL) {
        let f = 0;
        for (const b of blobs) {
          // Toroidal distance: measure to the nearest copy of the blob across
          // the seam, so a blob leaving one edge is already bleeding in at the
          // opposite one. Wrapping the center is then invisible — teleporting
          // it at one radius off-screen popped, because a blob's visible reach
          // is ~1.5r, so it still lit the edge as it jumped.
          let dx = Math.abs(x + CELL / 2 - b.x);
          if (dx > width / 2) dx = width - dx;
          let dy = Math.abs(y + CELL / 2 - b.y);
          if (dy > height / 2) dy = height - dy;
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
