"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [61, 53, 100];
const PINK: [number, number, number] = [237, 157, 249];
const PURPLE: [number, number, number] = [108, 92, 190];
const HILITE: [number, number, number] = [255, 235, 255];

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

// "Beat Rings" — one square ring spawns per detected beat and expands from the
// center behind the disc. Radii are quantized to a 16px grid so the rings read
// as pixel art rather than smooth circles. Every 4th beat is accented: pink and
// thicker instead of purple. A sparse dot lattice fills the empty space.
type Ring = {
  r: number; // true radius (unquantized)
  c: [number, number, number];
  w: number; // stroke weight at full opacity
  life: number; // 1 (fresh) .. 0 (reached the corner)
};

export const beatRingsSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  const STEP = 16; // radius quantization + dot lattice pitch

  const rings: Ring[] = [];
  let beatIdx = 0;

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;
  let slowLevel = 0;
  let kickCooldown = 0;

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.rectMode(s.CENTER);
    s.noFill();
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
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
    smoothedLevel += (level - smoothedLevel) * 0.15;
    slowLevel += (level - slowLevel) * 0.02;

    s.background(BG[0], BG[1], BG[2]);

    // Beat = transient above the long-run average, rate-limited so a single
    // hit can't spawn a burst of rings on consecutive frames.
    if (kickCooldown > 0) kickCooldown--;
    if (kickCooldown === 0 && level > slowLevel * 1.35 + 0.04) {
      kickCooldown = 10;
      const accent = beatIdx % 4 === 0;
      rings.push({
        r: 40,
        c: accent ? PINK : PURPLE,
        w: accent ? 12 : 6,
        life: 1,
      });
      beatIdx++;
      if (rings.length > 26) rings.shift();
    }

    const maxR = Math.sqrt(width * width + height * height) / 2;
    s.noFill();
    for (const ring of rings) {
      ring.r += 3.4 + smoothedLevel * 5;
      ring.life = 1 - ring.r / maxR;
      if (ring.life <= 0) continue;
      const q = Math.round(ring.r / STEP) * STEP;
      s.stroke(ring.c[0], ring.c[1], ring.c[2], 230 * ring.life);
      s.strokeWeight(ring.w * (0.4 + ring.life * 0.6));
      s.rect(width / 2, height / 2, q * 2, q * 2);
    }
    // Rings are pushed in order, so the oldest expire first — drop from the front.
    while (rings.length && rings[0].life <= 0) rings.shift();

    // Static dot lattice for texture.
    s.noStroke();
    s.fill(HILITE[0], HILITE[1], HILITE[2], 26);
    for (let y = STEP / 2; y < height; y += STEP * 2) {
      for (let x = STEP / 2; x < width; x += STEP * 2) s.rect(x, y, 2, 2);
    }
  };
};

const BeatRingsBackground = () => {
  return <P5Background sketch={beatRingsSketch} />;
};

export default BeatRingsBackground;
