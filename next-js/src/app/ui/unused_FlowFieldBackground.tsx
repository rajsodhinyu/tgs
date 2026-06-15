"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [61, 53, 100];

const PARTICLE_COLORS: [number, number, number][] = [
  [237, 157, 249], // tgs-pink
  [108, 92, 190], // tgs-purple
  [250, 200, 255], // light pink accent
];

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

// Flow-Field Drift: a Perlin-noise vector field steers hundreds of small
// particles. Instead of clearing each frame we paint a low-alpha dark-purple
// rect over everything, so particles leave fading trails — the signature look.
// The field's noise z-axis advances over time so the whole field slowly churns.
// Light audio reactivity: louder audio bumps particle speed + field evolution.
interface Particle {
  x: number;
  y: number;
  px: number; // previous position, for trail line segments
  py: number;
  speed: number;
  color: [number, number, number];
  weight: number;
  life: number; // frames remaining before respawn
  maxLife: number;
}

export const flowFieldSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  // Spatial frequency of the field and how many full turns the noise maps to.
  const FIELD_SCALE = 0.0016;
  const TURNS = 2.0;

  const particles: Particle[] = [];

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;
  // Noise z / time axis — advances every frame so the field evolves.
  let fieldZ = 0;

  function randomColor(): [number, number, number] {
    return PARTICLE_COLORS[Math.floor(s.random(PARTICLE_COLORS.length))];
  }

  // Recycle an existing particle in place (no allocation) to a fresh spawn.
  function resetParticle(p: Particle) {
    p.x = s.random(width);
    p.y = s.random(height);
    p.px = p.x;
    p.py = p.y;
    p.speed = s.random(0.6, 1.8);
    p.color = randomColor();
    p.weight = s.random(0.8, 2.4);
    p.maxLife = s.random(180, 520);
    p.life = p.maxLife;
  }

  function targetCount(): number {
    // Scale with area; clamp so we stay in the hundreds at 60fps.
    return Math.max(150, Math.min(700, Math.floor((width * height) / 4200)));
  }

  function seed() {
    const count = targetCount();
    // Grow or shrink the fixed pool to the new target, recycling existing.
    while (particles.length < count) {
      const p: Particle = {
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        speed: 1,
        color: PARTICLE_COLORS[0],
        weight: 1,
        life: 0,
        maxLife: 1,
      };
      resetParticle(p);
      particles.push(p);
    }
    if (particles.length > count) particles.length = count;
  }

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.background(BG[0], BG[1], BG[2]);
    s.noiseDetail(3, 0.5);
    seed();
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    s.background(BG[0], BG[1], BG[2]);
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
    // Motion-blur trail: low-alpha dark-purple wash instead of a hard clear.
    // rectMode is CORNER here (the square loop below switches to CENTER, so we
    // must reset it or this wash only covers the top-left quadrant).
    s.rectMode(s.CORNER);
    s.noStroke();
    s.fill(BG[0], BG[1], BG[2], 26);
    s.rect(0, 0, width, height);

    const level = sampleLevel();
    smoothedLevel += (level - smoothedLevel) * 0.12;
    // Louder -> faster particles + faster field churn; calm when silent.
    const audioBoost = 1 + smoothedLevel * 1.4;

    // Advance the field's time axis (evolves slowly, a bit faster with audio).
    fieldZ += 0.0025 * audioBoost;

    s.rectMode(s.CENTER);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Field angle at this particle's position.
      const angle =
        s.noise(p.x * FIELD_SCALE, p.y * FIELD_SCALE, fieldZ) *
        s.TWO_PI *
        TURNS;

      const v = p.speed * audioBoost;
      p.px = p.x;
      p.py = p.y;
      p.x += Math.cos(angle) * v;
      p.y += Math.sin(angle) * v;

      // Wrap around edges — keep px/py in sync so wrap doesn't streak across.
      let wrapped = false;
      if (p.x < -2) {
        p.x += width + 4;
        wrapped = true;
      } else if (p.x > width + 2) {
        p.x -= width + 4;
        wrapped = true;
      }
      if (p.y < -2) {
        p.y += height + 4;
        wrapped = true;
      } else if (p.y > height + 2) {
        p.y -= height + 4;
        wrapped = true;
      }
      if (wrapped) {
        p.px = p.x;
        p.py = p.y;
      }

      // Fade in/out over lifespan so respawns aren't abrupt.
      p.life -= 1;
      const lifeFrac = p.life / p.maxLife;
      const fade =
        lifeFrac > 0.85
          ? (1 - lifeFrac) / 0.15
          : lifeFrac < 0.15
            ? lifeFrac / 0.15
            : 1;
      const alpha = 70 + 150 * fade;

      // Draw a small square at the particle, rotated to face the field flow.
      const size = 4 + p.weight * 3.5;
      s.push();
      s.translate(p.x, p.y);
      s.rotate(angle);
      s.noStroke();
      s.fill(p.color[0], p.color[1], p.color[2], alpha);
      s.rect(0, 0, size, size);
      s.pop();

      if (p.life <= 0) resetParticle(p);
    }
  };
};

const FlowFieldBackground = () => {
  return <P5Background sketch={flowFieldSketch} />;
};

export default FlowFieldBackground;
