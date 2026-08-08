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

// "Pixel Warp" — a square starfield warping outward past the spinning disc.
// Each star lives in normalized depth z (1 = far, 0 = at the viewer); every
// frame z shrinks, so the star's screen radius from center grows and its square
// gets bigger and brighter. Depth speed tracks the smoothed audio level, and
// each kick both accelerates the field and momentarily fattens every square.
type Star = {
  a: number; // angle from center
  z: number; // depth, 1 (far) .. 0 (past the viewer)
  spin: number; // slight angular drift as it approaches
  c: [number, number, number];
};

export const pixelWarpSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  const stars: Star[] = [];

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;
  // Onset tracking: `slowLevel` is the long-run average the transient is
  // measured against; `kick` is a fast-decaying spike per detected hit.
  let slowLevel = 0;
  let kick = 0;
  let kickCooldown = 0;

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  // `near` spreads the initial pool through the whole depth range so the first
  // frame is already full; respawns come back at the far plane instead.
  const spawn = (st: Star, near: boolean) => {
    st.a = s.random(s.TWO_PI);
    st.z = near ? s.random(0.05, 1) : 1;
    st.spin = s.random(-0.4, 0.4);
    st.c = s.random() < 0.22 ? HILITE : s.random() < 0.5 ? PINK : PURPLE;
  };

  const seed = () => {
    const count = Math.max(
      120,
      Math.min(420, Math.floor((width * height) / 6000)),
    );
    while (stars.length < count) {
      const st: Star = { a: 0, z: 1, spin: 0, c: PINK };
      spawn(st, true);
      stars.push(st);
    }
    if (stars.length > count) stars.length = count;
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
    s.rectMode(s.CENTER);
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
    smoothedLevel += (level - smoothedLevel) * 0.2;
    slowLevel += (level - slowLevel) * 0.02;

    // Transient detection: a jump well above the long-run average is a hit.
    if (kickCooldown > 0) kickCooldown--;
    if (kickCooldown === 0 && level > slowLevel * 1.35 + 0.04) {
      kick = 1;
      kickCooldown = 9;
    }
    kick *= 0.82;

    // Low-alpha wash instead of a clear, so stars leave short warp trails.
    s.rectMode(s.CORNER);
    s.noStroke();
    s.fill(BG[0], BG[1], BG[2], 46);
    s.rect(0, 0, width, height);

    s.rectMode(s.CENTER);
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const speed = 0.0055 + smoothedLevel * 0.014 + kick * 0.01;

    for (const st of stars) {
      st.z -= speed;
      if (st.z <= 0.02) spawn(st, false);

      const r = (1 - st.z) * maxR * 1.05;
      const ang = st.a + st.spin * (1 - st.z);
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r;
      const size = 2 + (1 - st.z) * (14 + kick * 10);
      const alpha = Math.min(255, 40 + (1 - st.z) * 260);

      s.push();
      s.translate(x, y);
      s.rotate(ang + s.frameCount * 0.01);
      s.fill(st.c[0], st.c[1], st.c[2], alpha);
      s.rect(0, 0, size, size);
      s.pop();
    }
  };
};

const PixelWarpBackground = () => {
  return <P5Background sketch={pixelWarpSketch} />;
};

export default PixelWarpBackground;
