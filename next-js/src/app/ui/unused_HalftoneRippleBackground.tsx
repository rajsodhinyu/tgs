"use client";
import p5 from "p5";
import P5Background from "./P5Background";

// Locked brand palette.
const BG: [number, number, number] = [61, 53, 100]; // tgs-dark-purple
const PINK: [number, number, number] = [237, 157, 249]; // tgs-pink
const PURPLE: [number, number, number] = [108, 92, 190]; // tgs-purple
const LIGHT_PINK: [number, number, number] = [250, 200, 255]; // ripple crest

// Matches the shape every sketch caches on the <audio> element. We only rely on
// these fields; the live freq buffer is kept locally (see below) so we never
// depend on a tap created by another sketch carrying a freqData field.
type AudioTap = {
  ctx: AudioContext;
  analyser: AnalyserNode;
  timeData: Uint8Array;
  audio: HTMLAudioElement;
};

// The shared tap is cached on the <audio> element under this key (set up once,
// reused by every background sketch). We read/write it via a cast rather than a
// `declare global` augmentation so we don't collide with other sketches that
// declare the same property with a structurally-different local `AudioTap`.
type TappedAudio = HTMLAudioElement & { __tgsAudioTap?: AudioTap };

function getAudioTap(): AudioTap | null {
  if (typeof window === "undefined") return null;
  const audio = document.getElementById("myAudio") as TappedAudio | null;
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

// Halftone Ripple-on-Beat: a riso-style dot grid with a quiet perlin shimmer at
// rest. Bass onsets (beats) fire expanding rings; dots near a ring's current
// radius get fattened and brightened to light-pink — a moving crest band that
// fades as the ring grows. Without audio, gentle auto-ripples keep it alive.
type Ripple = {
  active: boolean;
  x: number;
  y: number;
  radius: number; // current ring radius in px
  speed: number; // px per frame
  power: number; // 0..1 starting amplitude
  maxRadius: number; // ring dies past this
};

export const halftoneRippleSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  // Grid spacing — smaller cell = denser dots.
  const cell = 18;
  // Max dot radius as a fraction of cell so neighbors just barely kiss.
  const maxR = cell * 0.55;
  // Width of the bright crest band around a ring's radius (px).
  const bandWidth = cell * 2.6;

  let tap: AudioTap | null = null;
  // Local frequency buffer, allocated lazily to match the tap's analyser. Kept
  // here (not on the shared tap) so we never depend on another sketch's tap.
  let freqData: Uint8Array | null = null;

  // Beat detection state.
  let smoothedBass = 0; // fast-following bass energy
  let prevBass = 0; // last frame's fast energy (for spectral flux)
  let bassThreshold = 0; // slow-following moving threshold
  let beatCooldown = 0; // refractory frames remaining
  // Tracks how much real bass signal we're actually getting. If a live tap
  // keeps returning ~0 (e.g. CORS-silent analyser), we treat it as no-audio
  // and fall back to auto-ripples so the sketch is never dead-still.
  let bassActivity = 0;

  // Auto-ripple fallback timer (used when no live audio).
  let nextAutoRippleAt = 0;

  // Fixed pool of ripples — reused, never grows.
  const POOL = 10;
  const ripples: Ripple[] = Array.from({ length: POOL }, () => ({
    active: false,
    x: 0,
    y: 0,
    radius: 0,
    speed: 0,
    power: 0,
    maxRadius: 0,
  }));

  const spawnRipple = (power: number, centered = false) => {
    const slot = ripples.find((r) => !r.active);
    if (!slot) return;
    const diag = Math.hypot(width, height);
    if (centered) {
      slot.x = width * 0.5;
      slot.y = height * 0.5;
    } else {
      // Bias toward the center third so rings stay visible.
      slot.x = width * s.random(0.25, 0.75);
      slot.y = height * s.random(0.25, 0.75);
    }
    slot.radius = 0;
    slot.speed = diag * s.random(0.004, 0.006);
    slot.power = power;
    slot.maxRadius = diag * 0.85;
    slot.active = true;
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
    nextAutoRippleAt = s.frameCount + 30;
  };

  // Bass energy from the low frequency bins (0..1). 0 if no live audio.
  const sampleBass = (): number => {
    if (!tap || tap.ctx.state !== "running" || tap.audio.paused) return 0;
    if (!freqData || freqData.length !== tap.analyser.frequencyBinCount) {
      freqData = new Uint8Array(tap.analyser.frequencyBinCount);
    }
    tap.analyser.getByteFrequencyData(freqData);
    // Low end ~ first ~8% of bins.
    const lowBins = Math.max(1, Math.floor(freqData.length * 0.08));
    let sum = 0;
    for (let i = 0; i < lowBins; i++) sum += freqData[i];
    return sum / (lowBins * 255);
  };

  s.draw = () => {
    s.background(BG[0], BG[1], BG[2]);

    const tapRunning =
      !!tap && tap.ctx.state === "running" && !tap.audio.paused;

    // --- Beat detection ---
    const bass = sampleBass();
    // Fast follower tracks transients closely (less smoothing = punchier beats).
    prevBass = smoothedBass;
    smoothedBass += (bass - smoothedBass) * 0.55;
    // Slow follower forms the adaptive threshold floor.
    bassThreshold += (smoothedBass - bassThreshold) * 0.04;
    // Spectral flux: how much energy rose since last frame (onsets are positive).
    const flux = Math.max(0, smoothedBass - prevBass);
    // Track whether the live tap is actually delivering bass energy.
    bassActivity += (smoothedBass - bassActivity) * 0.02;

    // Only trust live audio if it's genuinely producing signal — otherwise a
    // CORS-silent analyser would leave us with no ripples at all.
    const audioLive = tapRunning && bassActivity > 0.01;

    if (beatCooldown > 0) beatCooldown -= 1;

    if (audioLive) {
      // Fire on a clear onset: energy above the moving floor AND rising.
      const overFloor = smoothedBass > bassThreshold * 1.18 + 0.015;
      const rising = flux > 0.012;
      if ((overFloor || rising) && beatCooldown <= 0) {
        const power = Math.min(1, 0.5 + smoothedBass * 1.1 + flux * 4);
        spawnRipple(power, s.random() < 0.35);
        beatCooldown = 7; // refractory ~115ms at 60fps
      }
    } else {
      // No usable live audio — gentle auto-ripples so it's never static.
      if (s.frameCount >= nextAutoRippleAt) {
        spawnRipple(s.random(0.5, 0.8), s.random() < 0.5);
        nextAutoRippleAt = s.frameCount + Math.floor(s.random(70, 130));
      }
    }

    // --- Advance ripples & precompute live band data for the inner loop ---
    type LiveRipple = { x: number; y: number; radius: number; amp: number };
    const live: LiveRipple[] = [];
    for (const r of ripples) {
      if (!r.active) continue;
      r.radius += r.speed;
      if (r.radius >= r.maxRadius) {
        r.active = false;
        continue;
      }
      // Amplitude decays as the ring expands outward.
      const ageK = r.radius / r.maxRadius;
      const amp = r.power * (1 - ageK) * (1 - ageK);
      if (amp <= 0.01) continue;
      live.push({ x: r.x, y: r.y, radius: r.radius, amp });
    }

    // Audio punch nudges baseline shimmer brightness too.
    const punch = 1 + smoothedBass * 1.2;
    const t = s.frameCount * 0.006;
    const invBand = 1 / bandWidth;

    // --- Halftone dot grid ---
    for (let py = cell / 2; py < height; py += cell) {
      for (let px = cell / 2; px < width; px += cell) {
        // Quiet perlin baseline so the grid shimmers gently at rest.
        const rawN = s.noise(px * 0.005 + t, py * 0.005 - t * 0.7);
        const baseline = (0.32 + rawN * 0.5) * punch;

        // Accumulate crest contribution from every live ripple band.
        let crest = 0;
        for (const r of live) {
          const dx = px - r.x;
          const dy = py - r.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const off = Math.abs(dist - r.radius);
          if (off >= bandWidth) continue;
          const fall = 1 - off * invBand; // 1 at ring, 0 at band edge
          crest += fall * fall * r.amp;
        }
        if (crest > 1) crest = 1;

        const intensity = Math.min(1, baseline * 0.6 + crest * 1.1);
        if (intensity < 0.06) continue;

        const r = intensity * maxR * 2;

        // Color: drift pink<->purple by baseline noise; crest pulls to
        // light-pink so beat bands pop bright.
        const hue = rawN; // 0..1
        let cr = PURPLE[0] + (PINK[0] - PURPLE[0]) * hue;
        let cg = PURPLE[1] + (PINK[1] - PURPLE[1]) * hue;
        let cb = PURPLE[2] + (PINK[2] - PURPLE[2]) * hue;
        const mix = Math.min(1, crest);
        cr += (LIGHT_PINK[0] - cr) * mix;
        cg += (LIGHT_PINK[1] - cg) * mix;
        cb += (LIGHT_PINK[2] - cb) * mix;

        s.fill(cr, cg, cb);
        s.ellipse(px, py, r, r);
      }
    }
  };

  // Custom teardown — p5.remove() calls this, where we detach our listeners.
  // Note: the shared AudioTap is cached on the <audio> element and reused by
  // other sketches, so we deliberately do NOT close its AudioContext here.
  const cleanup = () => {
    window.removeEventListener("pointerdown", resumeCtx);
    window.removeEventListener("keydown", resumeCtx);
  };
  const origRemove = s.remove.bind(s);
  s.remove = () => {
    cleanup();
    origRemove();
  };
};

const HalftoneRippleBackground = () => {
  return <P5Background sketch={halftoneRippleSketch} />;
};

export default HalftoneRippleBackground;
