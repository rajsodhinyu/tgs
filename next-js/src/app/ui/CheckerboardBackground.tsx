"use client";
import p5 from "p5";
import P5Background from "./P5Background";

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

export const checkerboardSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  let gridSize = 60;
  let cols = width / gridSize;
  let rows = height / gridSize;
  const baseElasticity = 0;
  const audioBoost = -1000;
  let smoothedLevel = 0;
  let phase = 0;
  let freezeFrames = 0;
  const peakThreshold = 0.1; // raw level must exceed smoothed by this to count as a peak
  const freezeDuration = 8; // frames to hold the wobble still after a peak
  let tap: AudioTap | null = null;

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    cols = width / gridSize;
    rows = height / gridSize;
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.background(0);
    s.noStroke();
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
  };

  const sampleLevel = (): number => {
    if (!tap || tap.ctx.state !== "running" || tap.audio.paused) return 0;
    tap.analyser.getByteTimeDomainData(tap.timeData);
    let sumSq = 0;
    for (let i = 0; i < tap.timeData.length; i++) {
      const v = (tap.timeData[i] - 70) / 70;
      sumSq += v * v;
    }
    return Math.sqrt(sumSq / tap.timeData.length);
  };

  s.draw = () => {
    s.background(61, 53, 100);

    const level = sampleLevel();
    // Detect a peak BEFORE smoothing absorbs it
    if (level - smoothedLevel > peakThreshold) freezeFrames = freezeDuration;
    smoothedLevel += (level - smoothedLevel) * 0.18;
    const elasticity = baseElasticity + smoothedLevel * audioBoost;

    // Advance the wobble phase only when not frozen on a peak
    if (freezeFrames > 0) freezeFrames--;
    else phase += 0.01;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * gridSize;
        let y = j * gridSize;

        let dist = s.sqrt(x * x + y * y);

        let offsetX = s.cos(phase + dist * 0.6) * elasticity;
        let offsetY = s.cos(phase + dist * 0.6) * elasticity;

        if ((i + j) % 2 === 0) {
          s.fill(237, 157, 249); // Pink
        } else {
          s.fill(108, 92, 190); // Purple
        }

        s.rect(x + offsetX, y + offsetY, gridSize, gridSize);
      }
    }
  };
};

const CheckerboardBackground = () => {
  return <P5Background sketch={checkerboardSketch} />;
};

export default CheckerboardBackground;
