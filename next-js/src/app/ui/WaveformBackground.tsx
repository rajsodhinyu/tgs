"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [26, 27, 35];
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
    analyser.smoothingTimeConstant = 0.75;
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

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export const waveformSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;
  let tap: AudioTap | null = null;

  const HISTORY = 90;
  const SAMPLES = 400;
  const history: Float32Array[] = [];

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
    s.noFill();
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
  };

  const sampleFrame = (): Float32Array => {
    const out = new Float32Array(SAMPLES);
    if (tap && tap.ctx.state === "running" && !tap.audio.paused) {
      tap.analyser.getByteTimeDomainData(tap.timeData);
      const step = tap.timeData.length / SAMPLES;
      for (let i = 0; i < SAMPLES; i++) {
        out[i] = (tap.timeData[Math.floor(i * step)] - 128) / 128;
      }
    } else {
      const t = s.frameCount * 0.015;
      for (let i = 0; i < SAMPLES; i++) {
        const x = i / SAMPLES;
        out[i] =
          Math.sin(x * 9 + t) * 0.25 +
          Math.sin(x * 21 + t * 1.4) * 0.12 +
          (s.noise(x * 4, t * 0.4) - 0.5) * 0.35;
      }
    }
    return out;
  };

  const drawTrace = (
    f: Float32Array,
    yCenter: number,
    amp: number,
    mirror: boolean,
  ) => {
    s.beginShape();
    for (let i = 0; i < f.length; i++) {
      const x = (i / (f.length - 1)) * width;
      const v = mirror ? -f[i] : f[i];
      s.vertex(x, yCenter + v * amp);
    }
    s.endShape();
  };

  s.draw = () => {
    s.background(BG[0], BG[1], BG[2], 10);

    const frame = sampleFrame();
    history.unshift(frame);
    if (history.length > HISTORY) history.length = HISTORY;

    const midY = height / 2;
    const amp = height * 0.14;
    const driftMax = height * 0.6;

    // Upward-drifting echoes (pink → purple as they age)
    for (let h = history.length - 1; h >= 0; h -= 2) {
      const age = h / HISTORY;
      const alpha = (1 - age) * (1 - age) * 140;
      if (alpha < 2) continue;
      const color = lerp3(PINK, PURPLE, age);
      s.stroke(color[0], color[1], color[2], alpha);
      s.strokeWeight(1 + (1 - age) * 1.5);
      drawTrace(
        history[h],
        midY - age * driftMax,
        amp * (1 - age * 0.3),
        false,
      );
    }

    // Mirrored downward-drifting echoes (softer, lighter)
    for (let h = history.length - 1; h >= 0; h -= 3) {
      const age = h / HISTORY;
      const alpha = (1 - age) * (1 - age) * 80;
      if (alpha < 2) continue;
      const color = lerp3(LIGHT_PINK, PURPLE, age);
      s.stroke(color[0], color[1], color[2], alpha);
      s.strokeWeight(1 + (1 - age) * 1);
      drawTrace(history[h], midY + age * driftMax, amp * (1 - age * 0.3), true);
    }

    // Current waveform — glow pass then crisp core
    const cur = history[0];
    for (let g = 0; g < 1; g++) {
      s.stroke(PINK[0], PINK[1], PINK[2], 55 - g * 14);
      s.strokeWeight(10 - g * 2.5);
      drawTrace(cur, midY, amp, false);
    }
    s.stroke(255, 255, 255, 230);
    s.strokeWeight(1.1);
    drawTrace(cur, midY, amp, false);
  };
};

const WaveformBackground = () => <P5Background sketch={waveformSketch} />;

export default WaveformBackground;
