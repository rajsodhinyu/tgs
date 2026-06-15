"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [61, 53, 100];
const PINK: [number, number, number] = [237, 157, 249];
const PURPLE: [number, number, number] = [108, 92, 190];
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

// "Bitcount Rain" — Matrix-style cascading glyphs in the TGS palette. Each
// column of a monospace grid falls at its own speed with a light-pink "head"
// glyph leading a tail that fades pink → purple → transparent. The dark-purple
// background is repainted each frame at low alpha so trails persist and decay.
// Audio level (smoothed RMS) speeds up the fall and spawns more heads on loud
// passages; near-silence is a calm, slow drizzle.

// Brand-flavored charset: fragments of "THATGOODSHT", digits, and a few
// pixel/music symbols. One shared immutable array, indexed at random per cell.
const CHARSET =
  "THATGOODSHT0123456789◆◇♪♫█▓▒░/\\.:".split("");

const randChar = (s: p5): string =>
  CHARSET[Math.floor(s.random(CHARSET.length))];

type Column = {
  x: number; // px, left edge of the column
  head: number; // current head row (fractional), grows downward
  speed: number; // rows per frame
  cells: string[]; // glyph per row, length = rows
  active: boolean; // whether this column is currently raining
  tail: number; // visible tail length in rows
};

export const bitcountRainSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  // Monospace cell metrics. cellW drives column count; cellH drives row count.
  const cellH = 22;
  const cellW = 16;
  const fontSize = 18;

  const MAX_COLS = 220; // hard cap for performance on ultra-wide screens

  let cols: number;
  let rows: number;
  let columns: Column[] = [];

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  const makeColumn = (i: number): Column => {
    const cells: string[] = new Array(rows);
    for (let r = 0; r < rows; r++) cells[r] = randChar(s);
    return {
      x: i * cellW,
      head: s.random(-rows, 0),
      speed: s.random(0.25, 0.9),
      cells,
      active: s.random() > 0.45,
      tail: Math.floor(s.random(6, rows * 0.7)),
    };
  };

  const buildGrid = () => {
    cols = Math.min(MAX_COLS, Math.ceil(width / cellW));
    rows = Math.ceil(height / cellH) + 2;
    columns = new Array(cols);
    for (let i = 0; i < cols; i++) columns[i] = makeColumn(i);
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    buildGrid();
    s.background(BG[0], BG[1], BG[2]);
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.background(BG[0], BG[1], BG[2]);
    s.textFont("monospace");
    s.textSize(fontSize);
    s.textAlign(s.LEFT, s.TOP);
    s.noStroke();
    buildGrid();
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
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
    // Low-alpha repaint: the higher the alpha, the faster trails fade. Loud
    // audio fades a touch quicker so the rain feels snappier.
    const level = sampleLevel();
    smoothedLevel += (level - smoothedLevel) * 0.15;
    const punch = smoothedLevel; // 0 (silence) .. ~1 (loud)

    const fadeAlpha = 38 + punch * 22;
    s.fill(BG[0], BG[1], BG[2], fadeAlpha);
    s.rect(0, 0, width, height);

    // Global speed/spawn modulation from audio.
    const speedScale = 0.6 + punch * 1.8; // slow drizzle .. fast downpour
    const spawnChance = 0.004 + punch * 0.05; // dormant columns reactivating

    for (let i = 0; i < cols; i++) {
      const col = columns[i];

      // Re-activate dormant columns more often when the music is loud.
      if (!col.active) {
        if (s.random() < spawnChance) {
          col.active = true;
          col.head = -s.random(0, rows * 0.4);
          col.speed = s.random(0.25, 0.9);
          col.tail = Math.floor(s.random(6, rows * 0.7));
        }
        continue;
      }

      col.head += col.speed * speedScale;

      // Occasionally flicker a random already-passed cell in this column.
      if (s.random() < 0.08 + punch * 0.12) {
        const fr = Math.floor(s.random(rows));
        col.cells[fr] = randChar(s);
      }

      const headRow = Math.floor(col.head);

      // Draw the visible tail: from the head upward for `tail` rows.
      for (let k = 0; k < col.tail; k++) {
        const r = headRow - k;
        if (r < 0 || r >= rows) continue;

        const y = r * cellH;
        const ch = col.cells[r];

        if (k === 0) {
          // Leading head glyph — brightest, light pink with a faint glow rect.
          s.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], 60);
          s.rect(col.x, y, cellW, cellH);
          s.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], 255);
        } else {
          // Tail fade: pink → purple as we go up, alpha falls toward the tip.
          const f = k / col.tail; // 0 (near head) .. 1 (tip)
          const cr = PINK[0] + (PURPLE[0] - PINK[0]) * f;
          const cg = PINK[1] + (PURPLE[1] - PINK[1]) * f;
          const cb = PINK[2] + (PURPLE[2] - PINK[2]) * f;
          const a = 235 * (1 - f) * (1 - f);
          if (a < 6) continue;
          s.fill(cr, cg, cb, a);
        }

        s.text(ch, col.x, y);
      }

      // Once the head (and its tail) has fully cleared the bottom, retire the
      // column so it can respawn — keeps the field varied and avoids unbroken
      // streams.
      if (headRow - col.tail > rows) {
        col.active = false;
      }
    }
  };
};

const BitcountRainBackground = () => {
  return <P5Background sketch={bitcountRainSketch} />;
};

export default BitcountRainBackground;
