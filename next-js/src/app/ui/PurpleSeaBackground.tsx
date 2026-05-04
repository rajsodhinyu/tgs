"use client";
import p5 from "p5";
import P5Background from "./P5Background";

// Top-down purple sea: looking straight down at the water. Layered sine waves
// produce an even surface across the whole canvas with shimmering specular
// highlights — no horizon, no perspective.
export const purpleSeaSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  // Spacing of the dot grid — smaller = denser, prettier, more expensive.
  const cell = 6;

  // Wave layers (frequency x, frequency y, time speed, amplitude, phase).
  // Mixing axis-aligned and diagonal directions keeps the surface from
  // looking like a single ripple.
  const waves = [
    { fx: 0.014, fy: 0.011, sp: 0.018, amp: 1.0, ph: 0.0 },
    { fx: -0.009, fy: 0.022, sp: -0.013, amp: 0.85, ph: 1.7 },
    { fx: 0.028, fy: -0.018, sp: 0.024, amp: 0.7, ph: 3.1 },
    { fx: 0.04, fy: 0.045, sp: -0.03, amp: 0.45, ph: 4.4 },
    { fx: -0.06, fy: 0.05, sp: 0.04, amp: 0.3, ph: 5.9 },
  ];

  let t = 0;

  // Brand colors as RGB.
  const deep: [number, number, number] = [28, 20, 60]; // near-black purple (troughs)
  const mid: [number, number, number] = [61, 53, 100]; // tgs-dark-purple (base)
  const bright: [number, number, number] = [108, 92, 190]; // tgs-purple (peaks)
  const glint: [number, number, number] = [237, 157, 249]; // tgs-pink (shimmer)

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
  };

  // Sample wave height at world coordinates (x, y).
  const waveAt = (x: number, y: number): number => {
    let h = 0;
    for (const w of waves) {
      h += Math.sin(x * w.fx + y * w.fy + t * w.sp + w.ph) * w.amp;
    }
    return h; // roughly in [-3.3, 3.3]
  };

  const lerpColor = (
    a: [number, number, number],
    b: [number, number, number],
    k: number,
  ): [number, number, number] => [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ];

  s.draw = () => {
    // Solid base — covers any gaps between dots.
    s.background(mid[0], mid[1], mid[2]);
    s.noStroke();

    for (let py = 0; py < height; py += cell) {
      for (let px = 0; px < width; px += cell) {
        const h = waveAt(px, py);

        // Normalize to [-1, 1] for color mixing.
        const n = h / 3.3;
        const peak = Math.max(0, n); // 0..1 on crests
        const trough = Math.max(0, -n); // 0..1 in dips
        const shinePow = Math.pow(peak, 3); // sharp glints

        let c = lerpColor(mid, deep, trough * 0.85);
        c = lerpColor(c, bright, peak * 0.65);
        c = lerpColor(c, glint, shinePow * 0.85);

        const size = 1.6 + peak * 1.6 + shinePow * 2.4;

        s.fill(c[0], c[1], c[2]);
        s.ellipse(px, py, size, size);
      }
    }

    // Drifting pink glints — sun-on-water highlights that flare on crests.
    for (let i = 0; i < 22; i++) {
      const gx = (Math.sin(t * 0.07 + i * 1.3) * 0.5 + 0.5) * width;
      const gy = (Math.cos(t * 0.05 + i * 0.7) * 0.5 + 0.5) * height;
      const h = waveAt(gx, gy);
      const peak = Math.max(0, h / 3.3);
      if (peak > 0.7) {
        const a = (peak - 0.7) / 0.3;
        s.fill(glint[0], glint[1], glint[2], 200 * a);
        const r = 4 + a * 8;
        s.ellipse(gx, gy, r, r);
      }
    }

    t += 1;
  };
};

const PurpleSeaBackground = () => {
  return <P5Background sketch={purpleSeaSketch} />;
};

export default PurpleSeaBackground;
