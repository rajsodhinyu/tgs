"use client";
import p5 from "p5";
import P5Background from "./P5Background";

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

// "VHS" — rows of pink/purple blocks sheared sideways by a noise field, read
// as tape tracking error. A bright "roll" band sweeps down the screen washing
// the rows it crosses toward white; every kick tears one random row with a
// hard random shear. A 4px scanline veil sits over the whole thing.
export const vhsSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  const ROW = 14; // row height in px

  let roll = 0; // y position of the sweeping bright band
  let tap: AudioTap | null = null;
  let smoothedLevel = 0;
  let slowLevel = 0;
  let kickCooldown = 0;
  // The row currently being torn, and how many frames the tear lasts.
  let glitchRow = -1;
  let glitchLife = 0;

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
    s.noiseDetail(2, 0.5);
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
    smoothedLevel += (level - smoothedLevel) * 0.25;
    slowLevel += (level - slowLevel) * 0.02;

    if (kickCooldown > 0) kickCooldown--;
    const hit = kickCooldown === 0 && level > slowLevel * 1.4 + 0.05;
    if (hit) kickCooldown = 9;

    s.background(DEEP[0], DEEP[1], DEEP[2]);

    // Band sweeps past the bottom by 260px before wrapping, so there's a gap.
    roll = (roll + 1.2 + smoothedLevel * 4) % (height + 260);

    if (hit && glitchLife <= 0) {
      glitchRow = Math.floor(s.random(height / ROW));
      glitchLife = 8;
    }
    if (glitchLife > 0) glitchLife--;

    const rows = Math.ceil(height / ROW);
    for (let r = 0; r < rows; r++) {
      const y = r * ROW;
      const n = s.noise(r * 0.07, s.frameCount * 0.006);
      let shear = (n - 0.5) * (60 + smoothedLevel * 180);
      if (glitchLife > 0 && Math.abs(r - glitchRow) < 3) {
        shear += s.random(-90, 90);
      }
      // Per-row segment width, also from noise — keeps the blocks irregular.
      const seg = 46 + n * 90;

      const bandDist = Math.abs(y - (roll - 130));
      const inBand = bandDist < 90 ? 1 - bandDist / 90 : 0;

      // Overdraw by one segment each side so sheared rows still cover the edges.
      for (let x = -seg; x < width + seg; x += seg) {
        const k = Math.floor((x + r * 31) / seg);
        if ((k + r) % 3 === 0) continue; // punch holes for a dropout look
        const base = (k + r) % 2 === 0 ? PINK : PURPLE;
        const c: [number, number, number] = [
          base[0] + (HILITE[0] - base[0]) * inBand,
          base[1] + (HILITE[1] - base[1]) * inBand,
          base[2] + (HILITE[2] - base[2]) * inBand,
        ];
        s.fill(c[0], c[1], c[2], 190 + inBand * 65);
        s.rect(x + shear, y, seg - 4, ROW - 3);
      }
    }

    // Scanline veil.
    s.fill(0, 0, 0, 46);
    for (let y = 0; y < height; y += 4) s.rect(0, y, width, 2);
  };
};

const VHSBackground = () => {
  return <P5Background sketch={vhsSketch} />;
};

export default VHSBackground;
