"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [61, 53, 100];
const PINK: [number, number, number] = [237, 157, 249];
const PURPLE: [number, number, number] = [108, 92, 190];
const LIGHT_PINK: [number, number, number] = [250, 200, 255];

// Shape of the per-element cached tap. Kept structurally identical to the
// `declare global` augmentations in the sibling audio sketches (Waveform /
// Halftone) — they all cache on the same `#myAudio` element, and TS merges the
// global declarations, so the type must match exactly. This sketch reads
// frequency data via its own buffer (see `freqData` in the sketch closure)
// rather than caching it here.
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
    analyser.smoothingTimeConstant = 0.82;
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

// Spectrum Skyline: FFT frequency bins (bass → treble) are grouped into a row
// of vertical, blocky bars along the bottom — a pixel-art "city skyline" whose
// building heights track the spectrum. Bins are log-spaced so bass isn't
// cramped. Heights ease toward target (fast rise, slow fall) with peak markers
// that hang and drop. No audio → gentle Perlin animation so it's never static.
export const spectrumSkylineSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;
  let tap: AudioTap | null = null;
  // Owned frequency buffer (sized to the shared analyser once it's available).
  let freqData: Uint8Array = new Uint8Array(0);

  const NUM_BARS = 52; // grouped display bars across the width
  const BLOCK = 16; // pixel-grid: building "window" block size (px)

  // Per-bar smoothed state.
  const heights = new Float32Array(NUM_BARS); // current eased magnitude 0..1
  const peaks = new Float32Array(NUM_BARS); // hanging peak markers 0..1
  const peakVel = new Float32Array(NUM_BARS); // peak fall velocity

  // Log-spaced bin ranges per bar, computed once we know the analyser size.
  let binRanges: Array<[number, number]> = [];

  const buildBinRanges = (binCount: number) => {
    binRanges = [];
    // Skip bin 0 (DC). Use a usable upper portion of the spectrum — the very
    // top bins are mostly empty for music, so cap at ~75% of the range.
    const minBin = 1;
    const maxBin = Math.max(minBin + NUM_BARS, Math.floor(binCount * 0.75));
    const logMin = Math.log(minBin);
    const logMax = Math.log(maxBin);
    let prev = minBin;
    for (let i = 0; i < NUM_BARS; i++) {
      const t = (i + 1) / NUM_BARS;
      const next = Math.max(prev + 1, Math.round(Math.exp(logMin + (logMax - logMin) * t)));
      binRanges.push([prev, Math.min(next, maxBin)]);
      prev = next;
    }
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
    s.noStroke();
    s.noiseDetail(3, 0.5);
    tap = getAudioTap();
    if (tap) {
      freqData = new Uint8Array(tap.analyser.frequencyBinCount);
      buildBinRanges(tap.analyser.frequencyBinCount);
    }
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
  };

  // Fill `targets` (0..1 per bar) from audio if playing, else Perlin noise.
  const targets = new Float32Array(NUM_BARS);
  const computeTargets = () => {
    const playing =
      tap && tap.ctx.state === "running" && !tap.audio.paused;

    if (playing && tap && binRanges.length === NUM_BARS) {
      tap.analyser.getByteFrequencyData(freqData);
      for (let i = 0; i < NUM_BARS; i++) {
        const [lo, hi] = binRanges[i];
        let sum = 0;
        let count = 0;
        for (let b = lo; b < hi; b++) {
          sum += freqData[b];
          count++;
        }
        const avg = count > 0 ? sum / count / 255 : 0;
        // Mild perceptual boost on the high end so treble bars stay visible.
        const tilt = 1 + (i / NUM_BARS) * 0.6;
        targets[i] = Math.min(1, Math.pow(avg, 0.85) * tilt);
      }
    } else {
      // Idle skyline: slow rolling Perlin hills so it breathes.
      const t = s.frameCount * 0.012;
      for (let i = 0; i < NUM_BARS; i++) {
        const x = i / NUM_BARS;
        const n =
          s.noise(x * 2.4, t) * 0.7 + s.noise(x * 6.0, t * 0.6 + 11) * 0.3;
        targets[i] = Math.min(1, n * 0.55 + 0.05);
      }
    }
  };

  const drawBar = (
    i: number,
    barX: number,
    barW: number,
    baseY: number,
    h01: number,
    maxBarH: number,
  ) => {
    // Quantize height to whole blocks so buildings read as stacked windows.
    const rawH = h01 * maxBarH;
    const blocks = Math.max(0, Math.round(rawH / BLOCK));
    if (blocks <= 0 && peaks[i] <= 0.001) return;

    const gap = Math.max(1, Math.floor(barW * 0.12));
    const x = barX + gap / 2;
    const w = barW - gap;

    // Draw stacked square "window" blocks; color by stack height.
    for (let bk = 0; bk < blocks; bk++) {
      const frac = blocks > 1 ? bk / (blocks - 1) : 1; // 0 bottom → 1 top
      // low (bottom) = purple, mid = pink, peak (top) = light-pink.
      let col: [number, number, number];
      if (frac < 0.5) col = lerp3(PURPLE, PINK, frac / 0.5);
      else col = lerp3(PINK, LIGHT_PINK, (frac - 0.5) / 0.5);

      const by = baseY - (bk + 1) * BLOCK;
      s.fill(col[0], col[1], col[2]);
      s.rect(x, by + 1, w, BLOCK - 2);
    }

    const topY = baseY - blocks * BLOCK;

    // Light-pink glow + fading dot-halftone halo above tall buildings.
    if (h01 > 0.55) {
      const glow = (h01 - 0.55) / 0.45;
      // Soft glow cap.
      s.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], 60 * glow);
      s.rect(x - 1, topY - 3, w + 2, 4);
      // Dotted halftone rising above the peak.
      const cx = x + w / 2;
      for (let d = 0; d < 4; d++) {
        const dy = topY - 8 - d * 9;
        const a = 90 * glow * (1 - d / 4);
        const r = (w * 0.28) * (1 - d / 5);
        if (a < 3 || r < 0.5) continue;
        s.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], a);
        s.ellipse(cx, dy, r, r);
      }
    }

    // Hanging peak marker — a thin light-pink bar at the recent max.
    if (peaks[i] > 0.001) {
      const peakBlocks = Math.max(0, Math.round((peaks[i] * maxBarH) / BLOCK));
      const py = baseY - peakBlocks * BLOCK - 3;
      s.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], 200);
      s.rect(x, py, w, 2);
    }
  };

  s.draw = () => {
    s.background(BG[0], BG[1], BG[2]);

    computeTargets();

    const baseY = height; // buildings rest on the bottom edge
    const maxBarH = height * 0.7; // tallest a building can reach
    const barW = width / NUM_BARS;

    for (let i = 0; i < NUM_BARS; i++) {
      const target = targets[i];
      // Fast rise, slow fall — classic spectrum-analyzer decay.
      if (target > heights[i]) heights[i] += (target - heights[i]) * 0.6;
      else heights[i] += (target - heights[i]) * 0.12;

      // Peak markers: jump up instantly, then drop under gravity.
      if (heights[i] >= peaks[i]) {
        peaks[i] = heights[i];
        peakVel[i] = 0;
      } else {
        peakVel[i] += 0.0009; // gravity
        peaks[i] -= peakVel[i];
        if (peaks[i] < heights[i]) {
          peaks[i] = heights[i];
          peakVel[i] = 0;
        }
        if (peaks[i] < 0) peaks[i] = 0;
      }

      drawBar(i, i * barW, barW, baseY, heights[i], maxBarH);
    }
  };
};

const SpectrumSkylineBackground = () => (
  <P5Background sketch={spectrumSkylineSketch} />
);

export default SpectrumSkylineBackground;
