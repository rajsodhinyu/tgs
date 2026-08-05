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

// next/font hashes its family names, so canvas text can't reference the
// bitcount-filled face by the name layout.tsx uses. Register the same ttf under
// a stable family instead — same trick as playlists/export/artistCardCanvas.ts.
// (public/fonts/bitcount-prop-single.ttf is byte-identical to font_title.ttf.)
const MARQUEE_FONT_FAMILY = "TGS Marquee Bitcount";
let fontPromise: Promise<void> | null = null;

function ensureFont(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (fontPromise) return fontPromise;
  fontPromise = (async () => {
    try {
      const face = new FontFace(
        MARQUEE_FONT_FAMILY,
        "url(/fonts/bitcount-prop-single.ttf) format('truetype')",
      );
      await face.load();
      document.fonts.add(face);
    } catch {
      // fall back to monospace silently
    }
  })();
  return fontPromise;
}

// "Marquee" — stacked "THAT GOOD SH*T" tickers in the bitcount-filled face,
// alternating scroll direction row to row. Each row repeats the phrase across
// one phrase-width so the scroll is seamless, and sine-wobbles vertically. Audio
// drives scroll speed; each kick nudges the type size so the whole wall breathes.
type Row = {
  y: number;
  size: number;
  dir: 1 | -1;
  off: number; // scroll offset in px
  speed: number;
  c: [number, number, number];
};

const PHRASE = "THAT GOOD SH*T • ";

export const marqueeSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  let rows: Row[] = [];

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;
  let slowLevel = 0;
  let kick = 0;
  let kickCooldown = 0;

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  const build = () => {
    rows = [];
    // ~11 rows tall whatever the viewport, clamped so it stays readable.
    const size = Math.max(34, Math.min(76, height / 11));
    const gap = size * 1.32;
    const n = Math.ceil(height / gap) + 2;
    for (let i = 0; i < n; i++) {
      rows.push({
        y: i * gap,
        size,
        dir: i % 2 === 0 ? 1 : -1,
        off: s.random(1000),
        speed: 0.5 + (i % 3) * 0.22,
        c: i % 3 === 0 ? PINK : i % 3 === 1 ? PURPLE : HILITE,
      });
    }
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
    s.textFont("monospace");
    // Swap to the display face once the ttf is decoded; until then rows draw in
    // monospace rather than blocking the first frames.
    ensureFont().then(() => s.textFont(MARQUEE_FONT_FAMILY));
    s.textAlign(s.LEFT, s.CENTER);
    build();
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    build();
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
    smoothedLevel += (level - smoothedLevel) * 0.18;
    slowLevel += (level - slowLevel) * 0.02;

    if (kickCooldown > 0) kickCooldown--;
    if (kickCooldown === 0 && level > slowLevel * 1.35 + 0.04) {
      kick = 1;
      kickCooldown = 9;
    }
    kick *= 0.82;

    const t = s.millis() / 1000;
    s.background(BG[0], BG[1], BG[2]);

    for (const r of rows) {
      s.textSize(r.size * (1 + kick * 0.06));
      const unit = s.textWidth(PHRASE);
      if (!unit) continue; // font not ready yet — skip this frame
      r.off += r.dir * (r.speed + smoothedLevel * 2.6);
      // Fold the offset into (-unit, 0] so the repeat loop always covers x = 0.
      const start = -((r.off % unit) + unit) % unit;
      const wob = Math.sin(t * 0.9 + r.y * 0.01) * 6 * (0.4 + smoothedLevel);
      const a = 150 + 90 * (0.5 + 0.5 * Math.sin(t * 0.8 + r.y * 0.02));
      s.fill(r.c[0], r.c[1], r.c[2], a);
      for (let x = start; x < width + unit; x += unit) {
        s.text(PHRASE, x, r.y + wob);
      }
    }

    // Deep-purple veil knocks the type back so foreground content stays legible.
    s.fill(DEEP[0], DEEP[1], DEEP[2], 60);
    s.rect(0, 0, width, height);
  };
};

const MarqueeBackground = () => {
  return <P5Background sketch={marqueeSketch} />;
};

export default MarqueeBackground;
