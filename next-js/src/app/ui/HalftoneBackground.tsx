"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [61, 53, 100];
const PINK: [number, number, number] = [237, 157, 249];
const LIGHT_PINK: [number, number, number] = [250, 200, 255];

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

// Riso-poster halftone: a dot grid where each dot's radius is driven by an
// underlying scalar field. Field = scrolling perlin noise + intermittent
// "camera flash" pops at random positions — sharp attack, quick decay, like
// paparazzi bulbs going off across a poster. Audio level, if available,
// makes flashes punchier.
type Flash = {
  x: number;
  y: number;
  age: number; // frames since spawn
  attack: number; // frames to reach peak
  decay: number; // frames from peak to gone
  reach: number; // px radius at peak
  power: number; // 0..1 peak intensity
};

export const halftoneSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  // Grid spacing — smaller cell = denser dots = heavier paint job.
  const cell = 18;
  // Max dot radius as a fraction of cell so neighbors just barely kiss.
  const maxR = cell * 0.55;

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;
  const flashes: Flash[] = [];
  let nextFlashAt = 0;

  const spawnFlash = () => {
    const reach = Math.min(width, height) * s.random(0.25, 0.55);
    flashes.push({
      x: s.random(width),
      y: s.random(height),
      age: 0,
      attack: s.random(2, 5),
      decay: s.random(18, 32),
      reach,
      power: s.random(0.8, 1.1),
    });
  };

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.background(BG[0], BG[1], BG[2]);
    s.noStroke();
    s.noiseDetail(3, 0.55);
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
    nextFlashAt = s.frameCount + 20;
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
    s.background(BG[0], BG[1], BG[2]);

    const level = sampleLevel();
    smoothedLevel += (level - smoothedLevel) * 0.15;
    const audioPunch = 1 + smoothedLevel * 1.5;

    const t = s.frameCount * 0.006;

    // Spawn new flashes at random intervals; sometimes a quick double-pop.
    if (s.frameCount >= nextFlashAt) {
      spawnFlash();
      if (s.random() > 0.7) spawnFlash();
      // Faster cadence when audio is loud.
      const baseGap = s.random(35, 110);
      nextFlashAt = s.frameCount + Math.floor(baseGap / audioPunch);
    }

    // Advance flashes; compute current power (attack ramp → decay).
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      f.age += 1;
      if (f.age > f.attack + f.decay) flashes.splice(i, 1);
    }

    // Precompute each flash's current intensity & squared reach so the inner
    // loop stays tight.
    const liveFlashes = flashes.map((f) => {
      const a =
        f.age < f.attack
          ? f.age / f.attack
          : 1 - (f.age - f.attack) / f.decay;
      const intensity = Math.max(0, a) * f.power * audioPunch;
      return {
        x: f.x,
        y: f.y,
        r2: f.reach * f.reach,
        intensity,
      };
    });

    for (let py = cell / 2; py < height; py += cell) {
      for (let px = cell / 2; px < width; px += cell) {
        // Scrolling noise field — drifts diagonally over time. Floored so
        // every cell keeps a visible baseline dot; the noise modulates
        // brightness but never erases it.
        const rawN = s.noise(px * 0.005 + t, py * 0.005 - t * 0.7);
        const n = 0.35 + rawN * 0.65;

        // Sum contributions from all active flashes.
        let hot = 0;
        for (const f of liveFlashes) {
          if (f.intensity <= 0) continue;
          const dx = px - f.x;
          const dy = py - f.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= f.r2) continue;
          const fall = 1 - d2 / f.r2;
          hot += fall * fall * f.intensity;
        }
        if (hot > 1) hot = 1;

        const intensity = Math.min(1, n * 0.6 + hot * 0.9);
        if (intensity < 0.08) continue;

        const r = intensity * maxR * 2;
        // Brighter near the flash core, regular pink elsewhere.
        const mix = Math.min(1, hot);
        const cr = PINK[0] + (LIGHT_PINK[0] - PINK[0]) * mix;
        const cg = PINK[1] + (LIGHT_PINK[1] - PINK[1]) * mix;
        const cb = PINK[2] + (LIGHT_PINK[2] - PINK[2]) * mix;

        s.fill(cr, cg, cb);
        s.ellipse(px, py, r, r);
      }
    }
  };
};

const HalftoneBackground = () => {
  return <P5Background sketch={halftoneSketch} />;
};

export default HalftoneBackground;
